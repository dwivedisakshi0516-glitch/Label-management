import logging
import asyncio
import os
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from pymongo import MongoClient
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class FallbackAsyncCollection:
    """File-backed async fallback collection if MongoDB daemon is unreachable."""
    def __init__(self, name: str, owner: "Database"):
        self.name = name
        self._owner = owner
        self._data: List[Dict[str, Any]] = owner._fallback_data.setdefault(name, [])

    def _matches(self, item: Dict[str, Any], filter_query: Dict[str, Any]) -> bool:
        for key, value in filter_query.items():
            if key == "$or" and isinstance(value, list):
                if not any(self._matches(item, condition) for condition in value):
                    return False
                continue
            if isinstance(value, dict) and "$regex" in value:
                import re
                flags = re.IGNORECASE if value.get("$options") == "i" else 0
                if not re.search(value["$regex"], str(item.get(key, "")), flags):
                    return False
                continue
            if key == "_id":
                if str(item.get("_id")) != str(value) and str(item.get("id")) != str(value):
                    return False
                continue
            if item.get(key) != value:
                return False
        return True

    def _set_nested(self, item: Dict[str, Any], key: str, value: Any) -> None:
        parts = key.split(".")
        target = item
        for part in parts[:-1]:
            child = target.get(part)
            if not isinstance(child, dict):
                child = {}
                target[part] = child
            target = child
        target[parts[-1]] = value

    def _unset_nested(self, item: Dict[str, Any], key: str) -> None:
        parts = key.split(".")
        target = item
        for part in parts[:-1]:
            target = target.get(part)
            if not isinstance(target, dict):
                return
        target.pop(parts[-1], None)

    def _pull_nested(self, item: Dict[str, Any], key: str, condition: Any) -> None:
        parts = key.split(".")
        target = item
        for part in parts[:-1]:
            target = target.get(part)
            if not isinstance(target, dict):
                return
        current = target.get(parts[-1])
        if not isinstance(current, list):
            return
        if isinstance(condition, dict):
            target[parts[-1]] = [
                value for value in current
                if not (isinstance(value, dict) and all(value.get(k) == v for k, v in condition.items()))
            ]
        else:
            target[parts[-1]] = [value for value in current if value != condition]

    def _apply_update(self, item: Dict[str, Any], update_query: Dict[str, Any]) -> None:
        if "$set" in update_query:
            for key, value in update_query["$set"].items():
                self._set_nested(item, key, value)
        if "$unset" in update_query:
            for key in update_query["$unset"].keys():
                self._unset_nested(item, key)
        if "$pull" in update_query:
            for key, condition in update_query["$pull"].items():
                self._pull_nested(item, key, condition)

    async def find_one(self, filter_query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        for item in self._data:
            if self._matches(item, filter_query):
                return dict(item)
        return None

    def find(self, filter_query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        filter_query = filter_query or {}
        class AsyncCursor:
            def __init__(self, data: List[Dict[str, Any]]):
                self._data = data
                self._index = 0

            def sort(self, key_or_list, direction=1):
                if isinstance(key_or_list, list) and len(key_or_list) > 0:
                    key, dir_val = key_or_list[0]
                elif isinstance(key_or_list, str):
                    key, dir_val = key_or_list, direction
                else:
                    return self
                reverse = (dir_val == -1)
                self._data.sort(key=lambda x: str(x.get(key, "")), reverse=reverse)
                return self

            def limit(self, count: int):
                self._data = self._data[:count]
                return self

            def skip(self, count: int):
                self._data = self._data[count:]
                return self

            def __aiter__(self):
                return self

            async def __anext__(self):
                if self._index < len(self._data):
                    val = self._data[self._index]
                    self._index += 1
                    return dict(val)
                raise StopAsyncIteration

            async def to_list(self, length: Optional[int] = None):
                res = [dict(x) for x in self._data]
                if length is not None:
                    return res[:length]
                return res

        filtered = []
        for item in self._data:
            if self._matches(item, filter_query):
                filtered.append(item)
        return AsyncCursor(filtered)

    async def insert_one(self, document: Dict[str, Any]):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        self._data.append(doc_copy)
        self._owner._save_fallback_data()
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def update_one(self, filter_query: Dict[str, Any], update_query: Dict[str, Any]):
        for item in self._data:
            if self._matches(item, filter_query):
                self._apply_update(item, update_query)
                self._owner._save_fallback_data()
                class UpdateResult:
                    matched_count = 1
                    modified_count = 1
                return UpdateResult()
        class UpdateResult:
            matched_count = 0
            modified_count = 0
        return UpdateResult()

    async def update_many(self, filter_query: Dict[str, Any], update_query: Dict[str, Any]):
        matched_count = 0
        for item in self._data:
            if self._matches(item, filter_query):
                self._apply_update(item, update_query)
                matched_count += 1
        if matched_count:
            self._owner._save_fallback_data()
        class UpdateResult:
            def __init__(self, count: int):
                self.matched_count = count
                self.modified_count = count
        return UpdateResult(matched_count)

    async def delete_one(self, filter_query: Dict[str, Any]):
        for idx, item in enumerate(self._data):
            if self._matches(item, filter_query):
                self._data.pop(idx)
                self._owner._save_fallback_data()
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    async def count_documents(self, filter_query: Optional[Dict[str, Any]] = None) -> int:
        filter_query = filter_query or {}
        cursor = self.find(filter_query)
        res = await cursor.to_list(None)
        return len(res)

class SyncAsyncCollection:
    """Async-shaped wrapper around PyMongo for serverless-safe request handling."""
    def __init__(self, collection):
        self._collection = collection

    async def find_one(self, filter_query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        return self._collection.find_one(filter_query, projection)

    def find(self, filter_query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        cursor = self._collection.find(filter_query or {}, projection)

        class AsyncCursor:
            def __init__(self, pymongo_cursor):
                self._cursor = pymongo_cursor

            def sort(self, key_or_list, direction=1):
                self._cursor = self._cursor.sort(key_or_list, direction)
                return self

            def limit(self, count: int):
                self._cursor = self._cursor.limit(count)
                return self

            def skip(self, count: int):
                self._cursor = self._cursor.skip(count)
                return self

            def __aiter__(self):
                self._iterator = iter(self._cursor)
                return self

            async def __anext__(self):
                try:
                    return next(self._iterator)
                except StopIteration:
                    raise StopAsyncIteration

            async def to_list(self, length: Optional[int] = None):
                if length is None:
                    return list(self._cursor)
                return list(self._cursor.limit(length))

        return AsyncCursor(cursor)

    async def insert_one(self, document: Dict[str, Any]):
        return self._collection.insert_one(document)

    async def update_one(self, filter_query: Dict[str, Any], update_query: Dict[str, Any]):
        return self._collection.update_one(filter_query, update_query)

    async def update_many(self, filter_query: Dict[str, Any], update_query: Dict[str, Any]):
        return self._collection.update_many(filter_query, update_query)

    async def delete_one(self, filter_query: Dict[str, Any]):
        return self._collection.delete_one(filter_query)

    async def count_documents(self, filter_query: Optional[Dict[str, Any]] = None) -> int:
        return self._collection.count_documents(filter_query or {})

class Database:
    client: Optional[MongoClient] = None
    db: Any = None
    is_fallback: bool = False
    connection_error: Optional[str] = None
    _fallback_collections: Dict[str, FallbackAsyncCollection] = {}
    _live_collections: Dict[str, SyncAsyncCollection] = {}
    _connect_lock: Optional[asyncio.Lock] = None
    _fallback_path: Path = Path(".data") / "fallback_db.json"
    _fallback_data: Dict[str, List[Dict[str, Any]]] = {}

    def _load_fallback_data(self):
        if self._fallback_data:
            return
        try:
            if self._fallback_path.exists():
                self._fallback_data = json.loads(self._fallback_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Could not load fallback database file (%s). Starting with an empty fallback store.", exc)
            self._fallback_data = {}

    def _save_fallback_data(self):
        self._fallback_path.parent.mkdir(parents=True, exist_ok=True)
        self._fallback_path.write_text(json.dumps(self._fallback_data, ensure_ascii=False, indent=2), encoding="utf-8")

    def get_collection(self, name: str):
        if not self.is_fallback and self.db is not None:
            if name not in self._live_collections:
                self._live_collections[name] = SyncAsyncCollection(self.db[name])
            return self._live_collections[name]
        if name not in self._fallback_collections:
            self._load_fallback_data()
            self._fallback_collections[name] = FallbackAsyncCollection(name, self)
        return self._fallback_collections[name]

    async def ensure_connected(self):
        if self.db is not None or self.is_fallback:
            return
        if self._connect_lock is None:
            self._connect_lock = asyncio.Lock()
        async with self._connect_lock:
            if self.db is None and not self.is_fallback:
                await connect_to_mongo()

db_manager = Database()

async def connect_to_mongo():
    mongo_target = settings.MONGODB_URL.split("@")[-1] if "@" in settings.MONGODB_URL else settings.MONGODB_URL
    logger.info("Connecting to MongoDB target %s...", mongo_target)
    try:
        if os.getenv("VERCEL") and settings.MONGODB_URL == "mongodb://localhost:27017":
            raise RuntimeError("MONGODB_URL is not configured for Vercel production.")
        client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Verify connection
        client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.DATABASE_NAME]
        db_manager.is_fallback = False
        db_manager.connection_error = None
        db_manager._live_collections = {}
        logger.info("Successfully connected to live MongoDB (%s)!", settings.DATABASE_NAME)
    except Exception as e:
        logger.warning("Could not connect to live MongoDB daemon (%s). Initializing high-performance asynchronous internal document store.", e)
        db_manager.connection_error = str(e)
        db_manager.is_fallback = True
        db_manager.db = None

async def close_mongo_connection():
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()

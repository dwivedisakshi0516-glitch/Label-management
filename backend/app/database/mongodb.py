import logging
import asyncio
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class FallbackAsyncCollection:
    """In-memory async fallback collection if MongoDB daemon is unreachable."""
    def __init__(self, name: str):
        self.name = name
        self._data: List[Dict[str, Any]] = []

    async def find_one(self, filter_query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        for item in self._data:
            match = True
            for k, v in filter_query.items():
                if k == "_id" and str(item.get("_id")) != str(v) and str(item.get("id")) != str(v):
                    match = False
                    break
                elif k != "_id" and item.get(k) != v:
                    match = False
                    break
            if match:
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
            match = True
            for k, v in filter_query.items():
                if k == "$or" and isinstance(v, list):
                    or_match = False
                    for condition in v:
                        cond_ok = True
                        for ck, cv in condition.items():
                            if isinstance(cv, dict) and "$regex" in cv:
                                import re
                                regex_val = cv["$regex"]
                                flags = re.IGNORECASE if cv.get("$options") == "i" else 0
                                if not re.search(regex_val, str(item.get(ck, "")), flags):
                                    cond_ok = False
                                    break
                            elif item.get(ck) != cv:
                                cond_ok = False
                                break
                        if cond_ok:
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                elif isinstance(v, dict) and "$regex" in v:
                    import re
                    regex_val = v["$regex"]
                    flags = re.IGNORECASE if v.get("$options") == "i" else 0
                    if not re.search(regex_val, str(item.get(k, "")), flags):
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                filtered.append(item)
        return AsyncCursor(filtered)

    async def insert_one(self, document: Dict[str, Any]):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        self._data.append(doc_copy)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def update_one(self, filter_query: Dict[str, Any], update_query: Dict[str, Any]):
        doc = await self.find_one(filter_query)
        if doc:
            for item in self._data:
                if (filter_query.get("_id") and (str(item.get("_id")) == str(filter_query["_id"]) or str(item.get("id")) == str(filter_query["_id"]))) or \
                   (filter_query.get("id") and item.get("id") == filter_query["id"]):
                    if "$set" in update_query:
                        item.update(update_query["$set"])
                    class UpdateResult:
                        matched_count = 1
                        modified_count = 1
                    return UpdateResult()
        class UpdateResult:
            matched_count = 0
            modified_count = 0
        return UpdateResult()

    async def delete_one(self, filter_query: Dict[str, Any]):
        for idx, item in enumerate(self._data):
            match = True
            for k, v in filter_query.items():
                if k == "_id" and str(item.get("_id")) != str(v) and str(item.get("id")) != str(v):
                    match = False
                    break
                elif k != "_id" and item.get(k) != v:
                    match = False
                    break
            if match:
                self._data.pop(idx)
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

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Any = None
    is_fallback: bool = False
    _fallback_collections: Dict[str, FallbackAsyncCollection] = {}

    def get_collection(self, name: str):
        if not self.is_fallback and self.db is not None:
            return self.db[name]
        if name not in self._fallback_collections:
            self._fallback_collections[name] = FallbackAsyncCollection(name)
        return self._fallback_collections[name]

db_manager = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB at %s...", settings.MONGODB_URL)
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Verify connection
        await asyncio.wait_for(client.admin.command('ping'), timeout=2.5)
        db_manager.client = client
        db_manager.db = client[settings.DATABASE_NAME]
        db_manager.is_fallback = False
        logger.info("Successfully connected to live MongoDB (%s)!", settings.DATABASE_NAME)
    except Exception as e:
        logger.warning("Could not connect to live MongoDB daemon (%s). Initializing high-performance asynchronous internal document store.", e)
        db_manager.is_fallback = True
        db_manager.db = None

async def close_mongo_connection():
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()

import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
async def list_categories(search: Optional[str] = Query(None)):
    coll = db_manager.get_collection("categories")
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"default_generic_name": {"$regex": search, "$options": "i"}}
            ]
        }
    cursor = coll.find(query)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(CategoryResponse(
            id=d.get("id") or str(d.get("_id")),
            name=d.get("name", ""),
            description=d.get("description", ""),
            default_warranty=d.get("default_warranty", "1 Year"),
            default_generic_name=d.get("default_generic_name", ""),
            default_country_of_origin=d.get("default_country_of_origin", "India"),
            default_net_qty=d.get("default_net_qty", "1 N"),
            default_pack_contents=d.get("default_pack_contents", ""),
            created_at=d.get("created_at"),
            updated_at=d.get("updated_at")
        ))
    return results

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(cat: CategoryCreate):
    coll = db_manager.get_collection("categories")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    doc = {
        "id": doc_id,
        "name": cat.name.strip(),
        "description": cat.description or "",
        "default_warranty": cat.default_warranty or "1 Year",
        "default_generic_name": cat.default_generic_name or "",
        "default_country_of_origin": cat.default_country_of_origin or "India",
        "default_net_qty": cat.default_net_qty or "1 N",
        "default_pack_contents": cat.default_pack_contents or "",
        "created_at": now,
        "updated_at": now
    }
    await coll.insert_one(doc)
    return CategoryResponse(**doc)

@router.put("/{cat_id}", response_model=CategoryResponse)
async def update_category(cat_id: str, cat_update: CategoryUpdate):
    coll = db_manager.get_collection("categories")
    existing = await coll.find_one({"$or": [{"id": cat_id}, {"_id": cat_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in cat_update.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    await coll.update_one({"$or": [{"id": cat_id}, {"_id": cat_id}]}, {"$set": update_data})
    updated_doc = await coll.find_one({"$or": [{"id": cat_id}, {"_id": cat_id}]})
    return CategoryResponse(
        id=updated_doc.get("id") or str(updated_doc.get("_id")),
        name=updated_doc.get("name", ""),
        description=updated_doc.get("description", ""),
        default_warranty=updated_doc.get("default_warranty", "1 Year"),
        default_generic_name=updated_doc.get("default_generic_name", ""),
        default_country_of_origin=updated_doc.get("default_country_of_origin", "India"),
        default_net_qty=updated_doc.get("default_net_qty", "1 N"),
        default_pack_contents=updated_doc.get("default_pack_contents", ""),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )

@router.delete("/{cat_id}")
async def delete_category(cat_id: str):
    coll = db_manager.get_collection("categories")
    res = await coll.delete_one({"$or": [{"id": cat_id}, {"_id": cat_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

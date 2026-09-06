import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.warranty import WarrantyCreate, WarrantyUpdate, WarrantyResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/warranties", tags=["Warranties"])

@router.get("", response_model=List[WarrantyResponse])
async def list_warranties(search: Optional[str] = Query(None)):
    coll = db_manager.get_collection("warranties")
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"duration": {"$regex": search, "$options": "i"}}
            ]
        }
    cursor = coll.find(query)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(WarrantyResponse(
            id=d.get("id") or str(d.get("_id")),
            name=d.get("name", ""),
            duration=d.get("duration", ""),
            created_at=d.get("created_at"),
            updated_at=d.get("updated_at")
        ))
    return results

@router.post("", response_model=WarrantyResponse, status_code=status.HTTP_201_CREATED)
async def create_warranty(w: WarrantyCreate):
    coll = db_manager.get_collection("warranties")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    doc = {
        "id": doc_id,
        "name": w.name.strip(),
        "duration": w.duration.strip(),
        "created_at": now,
        "updated_at": now
    }
    await coll.insert_one(doc)
    return WarrantyResponse(**doc)

@router.put("/{w_id}", response_model=WarrantyResponse)
async def update_warranty(w_id: str, w_update: WarrantyUpdate):
    coll = db_manager.get_collection("warranties")
    existing = await coll.find_one({"$or": [{"id": w_id}, {"_id": w_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Warranty not found")
    
    update_data = {k: v for k, v in w_update.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    await coll.update_one({"$or": [{"id": w_id}, {"_id": w_id}]}, {"$set": update_data})
    updated_doc = await coll.find_one({"$or": [{"id": w_id}, {"_id": w_id}]})
    return WarrantyResponse(
        id=updated_doc.get("id") or str(updated_doc.get("_id")),
        name=updated_doc.get("name", ""),
        duration=updated_doc.get("duration", ""),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )

@router.delete("/{w_id}")
async def delete_warranty(w_id: str):
    coll = db_manager.get_collection("warranties")
    res = await coll.delete_one({"$or": [{"id": w_id}, {"_id": w_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Warranty not found")
    return {"message": "Warranty deleted successfully"}

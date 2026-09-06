import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.manufacturer import ManufacturerCreate, ManufacturerUpdate, ManufacturerResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/manufacturers", tags=["Manufacturers"])

@router.get("", response_model=List[ManufacturerResponse])
async def list_manufacturers(search: Optional[str] = Query(None)):
    coll = db_manager.get_collection("manufacturers")
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"address": {"$regex": search, "$options": "i"}},
                {"city": {"$regex": search, "$options": "i"}},
                {"state": {"$regex": search, "$options": "i"}}
            ]
        }
    cursor = coll.find(query)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(ManufacturerResponse(
            id=d.get("id") or str(d.get("_id")),
            name=d.get("name", ""),
            address=d.get("address", ""),
            city=d.get("city", ""),
            state=d.get("state", ""),
            pincode=d.get("pincode", ""),
            country=d.get("country", "India"),
            phone=d.get("phone", ""),
            email=d.get("email", ""),
            created_at=d.get("created_at"),
            updated_at=d.get("updated_at")
        ))
    return results

@router.post("", response_model=ManufacturerResponse, status_code=status.HTTP_201_CREATED)
async def create_manufacturer(mfg: ManufacturerCreate):
    coll = db_manager.get_collection("manufacturers")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    doc = {
        "id": doc_id,
        "name": mfg.name.strip(),
        "address": mfg.address.strip(),
        "city": mfg.city or "",
        "state": mfg.state or "",
        "pincode": mfg.pincode or "",
        "country": mfg.country or "India",
        "phone": mfg.phone or "",
        "email": mfg.email or "",
        "created_at": now,
        "updated_at": now
    }
    await coll.insert_one(doc)
    return ManufacturerResponse(**doc)

@router.put("/{mfg_id}", response_model=ManufacturerResponse)
async def update_manufacturer(mfg_id: str, mfg_update: ManufacturerUpdate):
    coll = db_manager.get_collection("manufacturers")
    existing = await coll.find_one({"$or": [{"id": mfg_id}, {"_id": mfg_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    
    update_data = {k: v for k, v in mfg_update.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    await coll.update_one({"$or": [{"id": mfg_id}, {"_id": mfg_id}]}, {"$set": update_data})
    updated_doc = await coll.find_one({"$or": [{"id": mfg_id}, {"_id": mfg_id}]})
    return ManufacturerResponse(
        id=updated_doc.get("id") or str(updated_doc.get("_id")),
        name=updated_doc.get("name", ""),
        address=updated_doc.get("address", ""),
        city=updated_doc.get("city", ""),
        state=updated_doc.get("state", ""),
        pincode=updated_doc.get("pincode", ""),
        country=updated_doc.get("country", "India"),
        phone=updated_doc.get("phone", ""),
        email=updated_doc.get("email", ""),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )

@router.delete("/{mfg_id}")
async def delete_manufacturer(mfg_id: str):
    coll = db_manager.get_collection("manufacturers")
    res = await coll.delete_one({"$or": [{"id": mfg_id}, {"_id": mfg_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    return {"message": "Manufacturer deleted successfully"}

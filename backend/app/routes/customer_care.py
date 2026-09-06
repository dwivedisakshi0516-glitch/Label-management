import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.customer_care import CustomerCareCreate, CustomerCareUpdate, CustomerCareResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/customer-care", tags=["Customer Care"])

@router.get("", response_model=List[CustomerCareResponse])
async def list_customer_care(search: Optional[str] = Query(None)):
    coll = db_manager.get_collection("customer_care")
    query = {}
    if search:
        query = {
            "$or": [
                {"profile_name": {"$regex": search, "$options": "i"}},
                {"complaint_text": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"telephone": {"$regex": search, "$options": "i"}},
                {"whatsapp_number": {"$regex": search, "$options": "i"}}
            ]
        }
    cursor = coll.find(query)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(CustomerCareResponse(
            id=d.get("id") or str(d.get("_id")),
            profile_name=d.get("profile_name", ""),
            complaint_text=d.get("complaint_text", "Customer Care"),
            complaint_address=d.get("complaint_address", ""),
            email=d.get("email", ""),
            telephone=d.get("telephone", ""),
            toll_free_number=d.get("toll_free_number", ""),
            whatsapp_number=d.get("whatsapp_number", ""),
            website=d.get("website", ""),
            created_at=d.get("created_at"),
            updated_at=d.get("updated_at")
        ))
    return results

@router.post("", response_model=CustomerCareResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_care(cc: CustomerCareCreate):
    coll = db_manager.get_collection("customer_care")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    doc = {
        "id": doc_id,
        "profile_name": cc.profile_name.strip(),
        "complaint_text": cc.complaint_text or "Customer Care",
        "complaint_address": cc.complaint_address or "",
        "email": cc.email or "",
        "telephone": cc.telephone or "",
        "toll_free_number": cc.toll_free_number or "",
        "whatsapp_number": cc.whatsapp_number or "",
        "website": cc.website or "",
        "created_at": now,
        "updated_at": now
    }
    await coll.insert_one(doc)
    return CustomerCareResponse(**doc)

@router.put("/{cc_id}", response_model=CustomerCareResponse)
async def update_customer_care(cc_id: str, cc_update: CustomerCareUpdate):
    coll = db_manager.get_collection("customer_care")
    existing = await coll.find_one({"$or": [{"id": cc_id}, {"_id": cc_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Customer Care profile not found")
    
    update_data = {k: v for k, v in cc_update.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    await coll.update_one({"$or": [{"id": cc_id}, {"_id": cc_id}]}, {"$set": update_data})
    updated_doc = await coll.find_one({"$or": [{"id": cc_id}, {"_id": cc_id}]})
    return CustomerCareResponse(
        id=updated_doc.get("id") or str(updated_doc.get("_id")),
        profile_name=updated_doc.get("profile_name", ""),
        complaint_text=updated_doc.get("complaint_text", "Customer Care"),
        complaint_address=updated_doc.get("complaint_address", ""),
        email=updated_doc.get("email", ""),
        telephone=updated_doc.get("telephone", ""),
        toll_free_number=updated_doc.get("toll_free_number", ""),
        whatsapp_number=updated_doc.get("whatsapp_number", ""),
        website=updated_doc.get("website", ""),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )

@router.delete("/{cc_id}")
async def delete_customer_care(cc_id: str):
    coll = db_manager.get_collection("customer_care")
    res = await coll.delete_one({"$or": [{"id": cc_id}, {"_id": cc_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer Care profile not found")
    return {"message": "Customer Care profile deleted successfully"}

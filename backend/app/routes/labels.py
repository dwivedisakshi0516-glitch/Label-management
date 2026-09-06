import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.label import LabelCreate, LabelResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/labels", tags=["Labels"])

@router.get("", response_model=List[LabelResponse])
async def list_labels(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None)
):
    coll = db_manager.get_collection("labels")
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"product_name": {"$regex": search, "$options": "i"}},
            {"category_name": {"$regex": search, "$options": "i"}},
            {"month": {"$regex": search, "$options": "i"}},
            {"year": {"$regex": search, "$options": "i"}}
        ]
    cursor = coll.find(query).sort("created_at", -1)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(LabelResponse(
            id=d.get("id") or str(d.get("_id")),
            category_id=d.get("category_id", ""),
            category_name=d.get("category_name", ""),
            product_id=d.get("product_id", ""),
            product_name=d.get("product_name", ""),
            template_id=d.get("template_id", ""),
            month=d.get("month", ""),
            year=str(d.get("year", "")),
            mrp=float(d.get("mrp", 0.0)),
            copies=int(d.get("copies", 1)),
            snapshot=d.get("snapshot", {}),
            created_by=d.get("created_by", "Admin"),
            created_at=d.get("created_at")
        ))
    return results

@router.get("/{lbl_id}", response_model=LabelResponse)
async def get_label(lbl_id: str):
    coll = db_manager.get_collection("labels")
    d = await coll.find_one({"$or": [{"id": lbl_id}, {"_id": lbl_id}]})
    if not d:
        raise HTTPException(status_code=404, detail="Label not found")
    return LabelResponse(
        id=d.get("id") or str(d.get("_id")),
        category_id=d.get("category_id", ""),
        category_name=d.get("category_name", ""),
        product_id=d.get("product_id", ""),
        product_name=d.get("product_name", ""),
        template_id=d.get("template_id", ""),
        month=d.get("month", ""),
        year=str(d.get("year", "")),
        mrp=float(d.get("mrp", 0.0)),
        copies=int(d.get("copies", 1)),
        snapshot=d.get("snapshot", {}),
        created_by=d.get("created_by", "Admin"),
        created_at=d.get("created_at")
    )

@router.post("", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
async def create_label(lbl: LabelCreate):
    coll = db_manager.get_collection("labels")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    
    # Resolve names if missing
    cat_name = lbl.category_name
    prod_name = lbl.product_name
    if not cat_name and lbl.category_id:
        cat_coll = db_manager.get_collection("categories")
        c = await cat_coll.find_one({"$or": [{"id": lbl.category_id}, {"_id": lbl.category_id}]})
        if c:
            cat_name = c.get("name", "")
            
    if not prod_name and lbl.product_id:
        p_coll = db_manager.get_collection("products")
        p = await p_coll.find_one({"$or": [{"id": lbl.product_id}, {"_id": lbl.product_id}]})
        if p:
            prod_name = p.get("name", "")

    doc = {
        "id": doc_id,
        "category_id": lbl.category_id,
        "category_name": cat_name,
        "product_id": lbl.product_id,
        "product_name": prod_name,
        "template_id": lbl.template_id or "",
        "month": lbl.month,
        "year": str(lbl.year),
        "mrp": float(lbl.mrp),
        "copies": int(lbl.copies or 1),
        "snapshot": lbl.snapshot or {},
        "created_by": "Admin",
        "created_at": now
    }
    await coll.insert_one(doc)
    return LabelResponse(**doc)

@router.delete("/{lbl_id}")
async def delete_label(lbl_id: str):
    coll = db_manager.get_collection("labels")
    res = await coll.delete_one({"$or": [{"id": lbl_id}, {"_id": lbl_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Label not found")
    return {"message": "Label deleted successfully"}

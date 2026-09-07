import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/templates", tags=["Templates"])

@router.get("", response_model=List[TemplateResponse])
async def list_templates(category_id: Optional[str] = Query(None)):
    coll = db_manager.get_collection("label_templates")
    query = {}
    if category_id:
        query = {"$or": [{"category_id": category_id}, {"category_id": ""}, {"is_default": True}]}
    cursor = coll.find(query)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(TemplateResponse(
            id=d.get("id") or str(d.get("_id")),
            name=d.get("name", ""),
            category_id=d.get("category_id", ""),
            category_name=d.get("category_name", ""),
            width_mm=float(d.get("width_mm", 100.0)),
            height_mm=float(d.get("height_mm", 150.0)),
            fields=d.get("fields", []),
            layout_style=d.get("layout_style", "standard"),
            is_default=bool(d.get("is_default", False)),
            created_at=d.get("created_at"),
            updated_at=d.get("updated_at")
        ))
    return results

@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(tpl: TemplateCreate):
    coll = db_manager.get_collection("label_templates")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    doc_data = tpl.model_dump()
    doc_data["id"] = doc_id
    doc_data["created_at"] = now
    doc_data["updated_at"] = now
    await coll.insert_one(doc_data)
    return TemplateResponse(**doc_data)

@router.put("/{tpl_id}", response_model=TemplateResponse)
async def update_template(tpl_id: str, tpl_update: TemplateUpdate):
    coll = db_manager.get_collection("label_templates")
    update_data = {k: v for k, v in tpl_update.model_dump(exclude_unset=True).items() if v is not None}
    lookup = {"$or": [{"id": tpl_id}]}
    if update_data.get("name"):
        lookup["$or"].append({"name": update_data["name"]})
    existing = await coll.find_one(lookup)
    if not existing:
        now = datetime.datetime.utcnow().isoformat()
        doc_data = {
            **update_data,
            "id": tpl_id,
            "created_at": now,
            "updated_at": now
        }
        await coll.insert_one(doc_data)
        return TemplateResponse(**doc_data)

    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()

    await coll.update_one({"id": existing.get("id")}, {"$set": update_data})
    updated_doc = await coll.find_one({"id": existing.get("id")})
    return TemplateResponse(
        id=updated_doc.get("id") or str(updated_doc.get("_id")),
        name=updated_doc.get("name", ""),
        category_id=updated_doc.get("category_id", ""),
        category_name=updated_doc.get("category_name", ""),
        width_mm=float(updated_doc.get("width_mm", 100.0)),
        height_mm=float(updated_doc.get("height_mm", 150.0)),
        fields=updated_doc.get("fields", []),
        layout_style=updated_doc.get("layout_style", "standard"),
        is_default=bool(updated_doc.get("is_default", False)),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )

@router.delete("/{tpl_id}")
async def delete_template(tpl_id: str):
    coll = db_manager.get_collection("label_templates")
    res = await coll.delete_one({"$or": [{"id": tpl_id}, {"_id": tpl_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template deleted successfully"}

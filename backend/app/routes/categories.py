import uuid
import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/categories", tags=["Categories"])

async def _product_counts_by_category() -> dict:
    products_coll = db_manager.get_collection("products")
    products = await products_coll.find({}).to_list(1000)
    counts = {}
    for product in products:
        if product.get("category_id"):
            counts[product["category_id"]] = counts.get(product["category_id"], 0) + 1
        if product.get("category_name"):
            key = product["category_name"].lower()
            counts[key] = counts.get(key, 0) + 1
    return counts

def _category_response_from_doc(d: dict, product_counts: Optional[dict] = None) -> CategoryResponse:
    product_counts = product_counts or {}
    return CategoryResponse(
        id=d.get("id") or str(d.get("_id")),
        name=d.get("name", ""),
        description=d.get("description", ""),
        default_warranty=d.get("default_warranty", "1 Year"),
        default_generic_name=d.get("default_generic_name", ""),
        default_country_of_origin=d.get("default_country_of_origin", "India"),
        default_net_qty=d.get("default_net_qty", "1 N"),
        default_pack_contents=d.get("default_pack_contents", ""),
        product_count=product_counts.get(d.get("id"), product_counts.get(str(d.get("_id")), product_counts.get(str(d.get("name", "")).lower(), 0))),
        created_at=d.get("created_at"),
        updated_at=d.get("updated_at")
    )

@router.get("")
async def list_categories(
    search: Optional[str] = Query(None),
    page: Optional[int] = Query(None, ge=1),
    page_size: Optional[int] = Query(None, ge=1, le=50),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc")
):
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

    allowed_sort_fields = {
        "name": "name",
        "description": "description",
        "default_generic_name": "default_generic_name",
        "default_warranty": "default_warranty",
        "default_country_of_origin": "default_country_of_origin",
        "default_net_qty": "default_net_qty",
        "created_at": "created_at",
        "updated_at": "updated_at",
    }
    product_counts = await _product_counts_by_category()
    sort_direction = -1 if sort_order.lower() == "desc" else 1

    if page is None and page_size is None:
        sort_field = allowed_sort_fields.get(sort_by, "name")
        cursor = coll.find(query).sort(sort_field, sort_direction)
        docs = await cursor.to_list(1000)
        if sort_by == "product_count":
            docs.sort(
                key=lambda doc: product_counts.get(doc.get("id"), product_counts.get(str(doc.get("_id")), product_counts.get(str(doc.get("name", "")).lower(), 0))),
                reverse=sort_direction == -1
            )
        return [_category_response_from_doc(d, product_counts).model_dump() for d in docs]

    resolved_page = page or 1
    resolved_page_size = min(page_size or 50, 50)
    total = await coll.count_documents(query)
    total_pages = max(1, (total + resolved_page_size - 1) // resolved_page_size)
    if resolved_page > total_pages:
        resolved_page = total_pages

    if sort_by == "product_count":
        docs = await coll.find(query).to_list(1000)
        docs.sort(
            key=lambda doc: product_counts.get(doc.get("id"), product_counts.get(str(doc.get("_id")), product_counts.get(str(doc.get("name", "")).lower(), 0))),
            reverse=sort_direction == -1
        )
        start_index = (resolved_page - 1) * resolved_page_size
        docs = docs[start_index:start_index + resolved_page_size]
    else:
        sort_field = allowed_sort_fields.get(sort_by, "name")
        cursor = (
            coll.find(query)
            .sort(sort_field, sort_direction)
            .skip((resolved_page - 1) * resolved_page_size)
            .limit(resolved_page_size)
        )
        docs = await cursor.to_list(resolved_page_size)
    return {
        "items": [_category_response_from_doc(d, product_counts).model_dump() for d in docs],
        "total": total,
        "page": resolved_page,
        "page_size": resolved_page_size,
        "total_pages": total_pages,
        "sort_by": sort_by if sort_by in {**allowed_sort_fields, "product_count": "product_count"} else "name",
        "sort_order": "desc" if sort_direction == -1 else "asc",
    }

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

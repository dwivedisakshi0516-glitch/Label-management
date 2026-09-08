import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/products", tags=["Products"])

async def _enrich_product_names(data: dict) -> dict:
    # Resolve category name
    if data.get("category_id") and not data.get("category_name"):
        cat_coll = db_manager.get_collection("categories")
        cat = await cat_coll.find_one({"$or": [{"id": data["category_id"]}, {"_id": data["category_id"]}]})
        if cat:
            data["category_name"] = cat.get("name", "")

    # Resolve manufacturer name
    if data.get("manufacturer_id") and not data.get("manufacturer_name"):
        mfg_coll = db_manager.get_collection("manufacturers")
        mfg = await mfg_coll.find_one({"$or": [{"id": data["manufacturer_id"]}, {"_id": data["manufacturer_id"]}]})
        if mfg:
            data["manufacturer_name"] = mfg.get("name", "")

    # Resolve customer care name
    if data.get("customer_care_id") and not data.get("customer_care_name"):
        cc_coll = db_manager.get_collection("customer_care")
        cc = await cc_coll.find_one({"$or": [{"id": data["customer_care_id"]}, {"_id": data["customer_care_id"]}]})
        if cc:
            data["customer_care_name"] = cc.get("profile_name", "")

    # Resolve warranty name
    if data.get("warranty_id") and not data.get("warranty_name"):
        w_coll = db_manager.get_collection("warranties")
        w = await w_coll.find_one({"$or": [{"id": data["warranty_id"]}, {"_id": data["warranty_id"]}]})
        if w:
            data["warranty_name"] = w.get("name", "")

    return data

@router.get("", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    category_name: Optional[str] = Query(None)
):
    coll = db_manager.get_collection("products")
    query = {}
    if category_id:
        query["category_id"] = category_id
    elif category_name:
        query["category_name"] = category_name

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"product_number": {"$regex": search, "$options": "i"}},
            {"category_name": {"$regex": search, "$options": "i"}},
            {"manufacturer_name": {"$regex": search, "$options": "i"}}
        ]

    cursor = coll.find(query)
    docs = await cursor.to_list(1000)
    results = []
    for d in docs:
        results.append(ProductResponse(
            id=d.get("id") or str(d.get("_id")),
            name=d.get("name", ""),
            category_id=d.get("category_id", ""),
            category_name=d.get("category_name", ""),
            brand=d.get("brand", ""),
            product_number=d.get("product_number", ""),
            manufacturer_id=d.get("manufacturer_id", ""),
            manufacturer_name=d.get("manufacturer_name", ""),
            manufacturer_address=d.get("manufacturer_address", ""),
            importer_name=d.get("importer_name", ""),
            imported_in=d.get("imported_in", ""),
            customer_care_other_numbers=d.get("customer_care_other_numbers", ""),
            recycling_information=d.get("recycling_information", ""),
            customer_care_id=d.get("customer_care_id", ""),
            customer_care_name=d.get("customer_care_name", ""),
            warranty_id=d.get("warranty_id", ""),
            warranty_name=d.get("warranty_name", ""),
            country_of_origin=d.get("country_of_origin", "India"),
            generic_name=d.get("generic_name", ""),
            net_quantity=d.get("net_quantity", "1 N"),
            default_mrp=float(d.get("default_mrp", 0.0)),
            tax_text=d.get("tax_text", "Incl. of all Taxes"),
            pack_contents=d.get("pack_contents", ""),
            status=d.get("status", "Active"),
            created_at=d.get("created_at"),
            updated_at=d.get("updated_at")
        ))
    return results

@router.get("/{prod_id}", response_model=ProductResponse)
async def get_product(prod_id: str):
    coll = db_manager.get_collection("products")
    d = await coll.find_one({"$or": [{"id": prod_id}, {"_id": prod_id}]})
    if not d:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse(
        id=d.get("id") or str(d.get("_id")),
        name=d.get("name", ""),
        category_id=d.get("category_id", ""),
        category_name=d.get("category_name", ""),
        brand=d.get("brand", ""),
        product_number=d.get("product_number", ""),
        manufacturer_id=d.get("manufacturer_id", ""),
        manufacturer_name=d.get("manufacturer_name", ""),
        manufacturer_address=d.get("manufacturer_address", ""),
        importer_name=d.get("importer_name", ""),
        imported_in=d.get("imported_in", ""),
        customer_care_other_numbers=d.get("customer_care_other_numbers", ""),
        recycling_information=d.get("recycling_information", ""),
        customer_care_id=d.get("customer_care_id", ""),
        customer_care_name=d.get("customer_care_name", ""),
        warranty_id=d.get("warranty_id", ""),
        warranty_name=d.get("warranty_name", ""),
        country_of_origin=d.get("country_of_origin", "India"),
        generic_name=d.get("generic_name", ""),
        net_quantity=d.get("net_quantity", "1 N"),
        default_mrp=float(d.get("default_mrp", 0.0)),
        tax_text=d.get("tax_text", "Incl. of all Taxes"),
        pack_contents=d.get("pack_contents", ""),
        status=d.get("status", "Active"),
        created_at=d.get("created_at"),
        updated_at=d.get("updated_at")
    )

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(prod: ProductCreate):
    coll = db_manager.get_collection("products")
    doc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    doc_data = prod.model_dump()
    doc_data = await _enrich_product_names(doc_data)
    doc_data["id"] = doc_id
    doc_data["created_at"] = now
    doc_data["updated_at"] = now
    await coll.insert_one(doc_data)
    return ProductResponse(**doc_data)

@router.put("/{prod_id}", response_model=ProductResponse)
async def update_product(prod_id: str, prod_update: ProductUpdate):
    coll = db_manager.get_collection("products")
    existing = await coll.find_one({"$or": [{"id": prod_id}, {"_id": prod_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in prod_update.model_dump(exclude_unset=True).items() if v is not None}
    update_data = await _enrich_product_names(update_data)
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    await coll.update_one({"$or": [{"id": prod_id}, {"_id": prod_id}]}, {"$set": update_data})
    updated_doc = await coll.find_one({"$or": [{"id": prod_id}, {"_id": prod_id}]})
    return ProductResponse(
        id=updated_doc.get("id") or str(updated_doc.get("_id")),
        name=updated_doc.get("name", ""),
        category_id=updated_doc.get("category_id", ""),
        category_name=updated_doc.get("category_name", ""),
        brand=updated_doc.get("brand", ""),
        product_number=updated_doc.get("product_number", ""),
        manufacturer_id=updated_doc.get("manufacturer_id", ""),
        manufacturer_name=updated_doc.get("manufacturer_name", ""),
        manufacturer_address=updated_doc.get("manufacturer_address", ""),
        importer_name=updated_doc.get("importer_name", ""),
        imported_in=updated_doc.get("imported_in", ""),
        customer_care_other_numbers=updated_doc.get("customer_care_other_numbers", ""),
        recycling_information=updated_doc.get("recycling_information", ""),
        customer_care_id=updated_doc.get("customer_care_id", ""),
        customer_care_name=updated_doc.get("customer_care_name", ""),
        warranty_id=updated_doc.get("warranty_id", ""),
        warranty_name=updated_doc.get("warranty_name", ""),
        country_of_origin=updated_doc.get("country_of_origin", "India"),
        generic_name=updated_doc.get("generic_name", ""),
        net_quantity=updated_doc.get("net_quantity", "1 N"),
        default_mrp=float(updated_doc.get("default_mrp", 0.0)),
        tax_text=updated_doc.get("tax_text", "Incl. of all Taxes"),
        pack_contents=updated_doc.get("pack_contents", ""),
        status=updated_doc.get("status", "Active"),
        created_at=updated_doc.get("created_at"),
        updated_at=updated_doc.get("updated_at")
    )

@router.delete("/{prod_id}")
async def delete_product(prod_id: str):
    coll = db_manager.get_collection("products")
    res = await coll.delete_one({"$or": [{"id": prod_id}, {"_id": prod_id}]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

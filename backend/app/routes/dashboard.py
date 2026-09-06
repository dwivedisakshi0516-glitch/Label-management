from fastapi import APIRouter
from backend.app.schemas.dashboard import DashboardStatsResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats():
    cat_coll = db_manager.get_collection("categories")
    prod_coll = db_manager.get_collection("products")
    mfg_coll = db_manager.get_collection("manufacturers")
    tpl_coll = db_manager.get_collection("label_templates")
    lbl_coll = db_manager.get_collection("labels")

    total_categories = await cat_coll.count_documents({})
    total_products = await prod_coll.count_documents({})
    total_manufacturers = await mfg_coll.count_documents({})
    total_templates = await tpl_coll.count_documents({})
    total_labels = await lbl_coll.count_documents({})

    cursor = lbl_coll.find({}).sort("created_at", -1).limit(5)
    recent_labels = await cursor.to_list(5)
    formatted_recent = []
    for r in recent_labels:
        formatted_recent.append({
            "id": r.get("id") or str(r.get("_id")),
            "product_name": r.get("product_name", "Product"),
            "category_name": r.get("category_name", ""),
            "month": r.get("month", ""),
            "year": r.get("year", ""),
            "mrp": float(r.get("mrp", 0.0)),
            "created_at": r.get("created_at", "")
        })

    return DashboardStatsResponse(
        total_categories=total_categories,
        total_products=total_products,
        total_manufacturers=total_manufacturers,
        total_templates=total_templates,
        total_labels_created=total_labels,
        recent_labels=formatted_recent
    )

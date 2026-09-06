import datetime
from fastapi import APIRouter
from backend.app.schemas.settings import SettingsUpdate, SettingsResponse
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
async def get_settings():
    coll = db_manager.get_collection("settings")
    s = await coll.find_one({"id": "default_settings"})
    if not s:
        default_data = {
            "id": "default_settings",
            "app_name": "RIT",
            "company_name": "RIT Precision Suite Pvt. Ltd.",
            "logo_url": "/rit-logo.svg",
            "default_currency": "₹",
            "default_country": "India",
            "default_label_width": 100.0,
            "default_label_height": 150.0,
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        await coll.insert_one(default_data)
        return SettingsResponse(**default_data)
    return SettingsResponse(
        id="default_settings",
        app_name=s.get("app_name", "RIT"),
        company_name=s.get("company_name", "RIT Precision Suite Pvt. Ltd."),
        logo_url=s.get("logo_url", "/rit-logo.svg"),
        default_currency=s.get("default_currency", "₹"),
        default_country=s.get("default_country", "India"),
        default_label_width=float(s.get("default_label_width", 100.0)),
        default_label_height=float(s.get("default_label_height", 150.0)),
        updated_at=s.get("updated_at")
    )

@router.put("", response_model=SettingsResponse)
async def update_settings(update_data: SettingsUpdate):
    coll = db_manager.get_collection("settings")
    doc = update_data.model_dump()
    doc["id"] = "default_settings"
    doc["updated_at"] = datetime.datetime.utcnow().isoformat()
    await coll.update_one({"id": "default_settings"}, {"$set": doc})
    return SettingsResponse(**doc)

from pydantic import BaseModel
from typing import Optional

class SettingsBase(BaseModel):
    app_name: str = "RIT"
    company_name: str = "RIT Solutions Pvt. Ltd."
    logo_url: Optional[str] = ""
    default_currency: str = "₹"
    default_country: str = "India"
    default_label_width: float = 100.0
    default_label_height: float = 150.0

class SettingsUpdate(SettingsBase):
    pass

class SettingsResponse(SettingsBase):
    id: str = "default_settings"
    updated_at: Optional[str] = None

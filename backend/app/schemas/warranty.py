from pydantic import BaseModel, Field
from typing import Optional

class WarrantyBase(BaseModel):
    name: str = Field(..., min_length=1)
    duration: str = Field(..., min_length=1) # e.g. "1 Year", "3 Years", "5 Years"

class WarrantyCreate(WarrantyBase):
    pass

class WarrantyUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[str] = None

class WarrantyResponse(WarrantyBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

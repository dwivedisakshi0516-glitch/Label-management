from pydantic import BaseModel, Field
from typing import Optional

class ManufacturerBase(BaseModel):
    name: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    country: Optional[str] = "India"
    phone: Optional[str] = ""
    email: Optional[str] = ""

class ManufacturerCreate(ManufacturerBase):
    pass

class ManufacturerUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class ManufacturerResponse(ManufacturerBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

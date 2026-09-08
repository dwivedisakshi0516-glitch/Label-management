from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = ""
    default_warranty: Optional[str] = "1 Year"
    default_generic_name: Optional[str] = ""
    default_country_of_origin: Optional[str] = "India"
    default_net_qty: Optional[str] = "1 N"
    default_pack_contents: Optional[str] = ""

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    default_warranty: Optional[str] = None
    default_generic_name: Optional[str] = None
    default_country_of_origin: Optional[str] = None
    default_net_qty: Optional[str] = None
    default_pack_contents: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    product_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

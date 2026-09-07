from pydantic import BaseModel, Field
from typing import Optional, List

class TemplateField(BaseModel):
    key: str # e.g. 'manufactured_by', 'manufactured_for', 'for_complaints', 'email', 'telephone', 'whatsapp', 'month_year', 'mrp', 'product_number', 'country_of_origin', 'generic_name', 'net_quantity', 'pack_contents', 'warranty'
    label: str
    default_value: Optional[str] = ""
    enabled: bool = True
    font_size: int = 11
    bold: bool = False
    alignment: str = "left" # left, center, right
    order: int = 0

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1)
    category_id: Optional[str] = ""
    category_name: Optional[str] = ""
    width_mm: float = Field(100.0, gt=0.0)
    height_mm: float = Field(150.0, gt=0.0)
    fields: List[TemplateField] = []
    layout_style: Optional[str] = "standard"
    is_default: bool = False

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    fields: Optional[List[TemplateField]] = None
    layout_style: Optional[str] = None
    is_default: Optional[bool] = None

class TemplateResponse(TemplateBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

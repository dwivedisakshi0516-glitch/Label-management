from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class LabelCreate(BaseModel):
    category_id: str = Field(..., min_length=1)
    category_name: str = ""
    product_id: str = Field(..., min_length=1)
    product_name: str = ""
    template_id: Optional[str] = ""
    month: str = Field(..., min_length=1)
    year: str = Field(..., min_length=1)
    mrp: float = Field(..., ge=0.0)
    copies: int = Field(1, ge=1)
    snapshot: Dict[str, Any] = {}

class LabelResponse(BaseModel):
    id: str
    category_id: str
    category_name: str
    product_id: str
    product_name: str
    template_id: Optional[str] = ""
    month: str
    year: str
    mrp: float
    copies: int = 1
    snapshot: Dict[str, Any] = {}
    created_by: Optional[str] = "Admin"
    created_at: Optional[str] = None

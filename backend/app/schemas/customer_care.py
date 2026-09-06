from pydantic import BaseModel, Field
from typing import Optional

class CustomerCareBase(BaseModel):
    profile_name: str = Field(..., min_length=1)
    complaint_text: Optional[str] = "Customer Care"
    complaint_address: Optional[str] = ""
    email: Optional[str] = ""
    telephone: Optional[str] = ""
    toll_free_number: Optional[str] = ""
    whatsapp_number: Optional[str] = ""
    website: Optional[str] = ""

class CustomerCareCreate(CustomerCareBase):
    pass

class CustomerCareUpdate(BaseModel):
    profile_name: Optional[str] = None
    complaint_text: Optional[str] = None
    complaint_address: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    toll_free_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    website: Optional[str] = None

class CustomerCareResponse(CustomerCareBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

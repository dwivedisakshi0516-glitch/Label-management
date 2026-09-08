from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    category_id: str = Field(..., min_length=1)
    category_name: Optional[str] = ""
    brand: Optional[str] = ""
    product_number: Optional[str] = ""
    manufacturer_id: str = Field(..., min_length=1)
    manufacturer_name: Optional[str] = ""
    manufacturer_address: Optional[str] = ""
    importer_name: Optional[str] = ""
    imported_in: Optional[str] = ""
    customer_care_other_numbers: Optional[str] = ""
    recycling_information: Optional[str] = ""
    customer_care_id: Optional[str] = ""
    customer_care_name: Optional[str] = ""
    warranty_id: Optional[str] = ""
    warranty_name: Optional[str] = ""
    country_of_origin: Optional[str] = "India"
    generic_name: Optional[str] = ""
    net_quantity: Optional[str] = "1 N"
    default_mrp: float = Field(0.0, ge=0.0)
    tax_text: Optional[str] = "Incl. of all Taxes"
    pack_contents: Optional[str] = ""
    status: Optional[str] = "Active" # Active, Inactive

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    brand: Optional[str] = None
    product_number: Optional[str] = None
    manufacturer_id: Optional[str] = None
    manufacturer_name: Optional[str] = None
    manufacturer_address: Optional[str] = None
    importer_name: Optional[str] = None
    imported_in: Optional[str] = None
    customer_care_other_numbers: Optional[str] = None
    recycling_information: Optional[str] = None
    customer_care_id: Optional[str] = None
    customer_care_name: Optional[str] = None
    warranty_id: Optional[str] = None
    warranty_name: Optional[str] = None
    country_of_origin: Optional[str] = None
    generic_name: Optional[str] = None
    net_quantity: Optional[str] = None
    default_mrp: Optional[float] = None
    tax_text: Optional[str] = None
    pack_contents: Optional[str] = None
    status: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

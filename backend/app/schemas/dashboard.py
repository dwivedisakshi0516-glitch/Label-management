from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardStatsResponse(BaseModel):
    total_categories: int
    total_products: int
    total_manufacturers: int
    total_templates: int
    total_labels_created: int
    recent_labels: List[Dict[str, Any]]

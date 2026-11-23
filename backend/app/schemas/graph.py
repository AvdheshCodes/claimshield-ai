from typing import List, Dict, Any, Optional
from pydantic import BaseModel, computed_field

class GraphNode(BaseModel):
    id: str
    label: str # Customer, Claim, Vehicle, Garage, Hospital, Phone
    name: str
    group: str
    properties: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    from_node: str
    to_node: str
    label: str # SUBMITTED, OWNS, REPAIRED_AT, SHARES_CONTACT, LINKED_TO
    properties: Dict[str, Any] = {}

    @computed_field(alias="from")
    @property
    def edge_from(self) -> str:
        return self.from_node

    @computed_field(alias="to")
    @property
    def edge_to(self) -> str:
        return self.to_node

    model_config = {
        "populate_by_name": True
    }

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    suspicious_clusters_detected: int = 0
    summary: Optional[str] = None

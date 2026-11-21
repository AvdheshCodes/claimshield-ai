from typing import List, Dict, Any, Optional
from pydantic import BaseModel

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

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    suspicious_clusters_detected: int = 0
    summary: Optional[str] = None

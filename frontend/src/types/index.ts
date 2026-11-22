export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'INVESTIGATOR' | 'CUSTOMER';
  phone_number?: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  customer_id: string;
  policy_number?: string;
  claimant_name?: string;
  category: 'MOTOR' | 'HEALTH' | 'PROPERTY';
  status: string;
  incident_date: string;
  incident_description: string;
  claimed_amount: number;
  approved_amount?: number;
  vehicle_registration?: string;
  hospital_name?: string;
  garage_name?: string;
  risk_score?: number;
  risk_band?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  findings?: FraudFinding[];
  created_at: string;
}

export interface Document {
  id: string;
  claim_id: string;
  document_type: string;
  original_filename: string;
  file_size_bytes: number;
  ocr_status: string;
  has_tampering_indicators: boolean;
  forensic_details?: Record<string, any>;
  extracted_metadata?: Record<string, any>;
  created_at: string;
}

export interface FraudFinding {
  id: string;
  claim_id: string;
  rule_id: string;
  rule_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  points: number;
  observation: string;
  evidence_document_id?: string;
  evidence_page_number?: number;
  evidence_snippet?: string;
  potential_alternative_explanation?: string;
  recommended_action?: string;
  investigator_feedback: 'VERIFIED' | 'UNRESOLVED' | 'DISMISSED';
}

export interface GraphNode {
  id: string;
  label: string;
  name: string;
  group: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  from_node: string;
  to_node: string;
  label: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  suspicious_clusters_detected: number;
  summary?: string;
}

export interface CopilotResponse {
  answer: string;
  citations: Array<{
    document_type?: string;
    page_number?: number;
    source_reference?: string;
    snippet?: string;
  }>;
  investigation_suggestions: string[];
  disclaimer: string;
}

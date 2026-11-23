# InsureGuard AI — Final System Architecture Specification

**Document Version:** 3.0 (Master Blueprint)  
**System Type:** Decoupled Intelligence & Forensic Platform  
**Target:** Modular Independent Development with Seamless Mainline Integration  

---

## 1. High-Level Modular Architecture

```mermaid
flowchart TD
    subgraph UI_Layer ["Frontend Application (React 18 + TypeScript + Vite)"]
        CustomerPortal["Customer Transparency Portal\n- Safe Milestones Timeline\n- Document Upload Wizard\n- Human Review Appeal"]
        InvestigatorWorkspace["Investigator Command Center\n- Queue & Filter\n- 'Why Suspicious?' Panel\n- Vis-Network Graph View\n- AI Copilot Interface"]
        AdminConsole["Admin Console\n- Fraud Rule Config\n- System Audit Logs"]
    end

    subgraph API_Gateway ["API Gateway & Core Application (Python FastAPI)"]
        AuthMiddleware["JWT Authentication & RBAC Middleware"]
        Router["API v1 Routers (/auth, /claims, /documents, /fraud, /graph, /copilot, /customer)"]
        PIIMasker["Privacy Engine (PII Masking Pipeline)"]
    end

    subgraph Intelligence_Pipeline ["Specialized Feature Engines"]
        ForensicsEngine["Document Forensics Module\n- PyMuPDF Metadata Analyzer\n- OpenCV Error Level Analysis (ELA)\n- Compression Anomaly Scanner"]
        FraudEngine["Explainable Fraud Engine ('Why Suspicious?')\n- Deterministic 10-Rule Evaluator\n- 0-100 Score & Band Classifier\n- Alternative Explanation Generator"]
        GraphEngine["Relationship Graph Engine\n- Neo4j Cypher Query Builder\n- Shared Contact / Recycled Vehicle Rings\n- Vis-Network Formatter"]
        CopilotRAG["AI Copilot Module\n- Grounded RAG with Document Citations\n- Prompt Injection Shield\n- Google Gemini 1.5 Flash / Local Ollama"]
    end

    subgraph Persistence_Layer ["Data & Storage Layer"]
        PostgreSQL[("PostgreSQL 16 + pgvector\n- Relational Claims, Users, Findings\n- Vector Embeddings for RAG")]
        Neo4j[("Neo4j 5.19 Graph Database\n- Customer, Claim, Vehicle, Garage, Phone\n- Graph Data Science (GDS)")]
        FileStorage[("Secure Document Storage\n/uploads/:claim_id/")]
    end

    UI_Layer -->|HTTP / REST JSON| AuthMiddleware
    AuthMiddleware --> Router
    Router --> PIIMasker
    Router --> Persistence_Layer
    
    Router --> ForensicsEngine
    Router --> FraudEngine
    Router --> GraphEngine
    Router --> CopilotRAG

    ForensicsEngine --> FileStorage
    FraudEngine --> PostgreSQL
    GraphEngine --> Neo4j
    CopilotRAG --> PostgreSQL
```

---

## 2. Special Features: Data Pipelines & Sequence

### 2.1 The "Why Suspicious?" Evaluation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Claims Investigator
    participant API as FastAPI Server
    participant DB as PostgreSQL
    participant Fraud as Fraud Detection Engine
    participant Forensics as Forensics Service

    Officer->>API: POST /api/v1/claims/{id}/analyze
    API->>DB: Fetch Claim Record & Extracted Document Metadata
    API->>Forensics: Inspect Files for ELA variance & Metadata flags
    Forensics-->>API: Forensic Indicators (Tampering Boolean + Flags)
    API->>DB: Check Historical Invoice # & SHA-256 Duplicates
    DB-->>API: Duplicate Matches
    API->>Fraud: Evaluate 10 Deterministic Rules
    Fraud->>Fraud: Compute Capped Score (0-100) & Assign Band (Low/Med/High/Very High)
    Fraud-->>API: Itemized Findings (Observation, Evidence, Explanations, Actions)
    API->>DB: Persist Findings to fraud_findings table
    API-->>Officer: Return Complete Why Suspicious Report
```

---

### 2.2 The Fraud Relationship Graph Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Claims Investigator
    participant API as FastAPI Server
    participant Neo4j as Neo4j Graph DB
    participant Formatter as Graph Formatter

    Officer->>API: GET /api/v1/claims/{id}/graph
    API->>Neo4j: Execute 2-Hop Neighborhood Cypher Query ($claim_number)
    Neo4j->>Neo4j: Traverse: Claim -> Customer -> Phone/Address -> Other Claims
    Neo4j->>Neo4j: Traverse: Claim -> Garage / Vehicle -> Other Claims
    Neo4j-->>API: Raw Cypher Record Stream
    API->>Formatter: Map entities to vis-network format (Nodes, Edges, Groups)
    Formatter->>Formatter: Detect Syndicates (Shared Phones / Garage Funneling)
    Formatter-->>API: Formatted Graph Payload
    API-->>Officer: Interactive Canvas Render
```

---

### 2.3 The Privacy-First AI Copilot Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Claims Investigator
    participant API as FastAPI Server
    participant DB as PostgreSQL
    participant PII as PII Sanitizer
    participant Gemini as Google Gemini / Ollama

    Officer->>API: POST /api/v1/copilot/chat { claim_id, question }
    API->>DB: Retrieve Verified Claim & Findings Records
    API->>PII: Sanitize Claim Context (Mask Aadhaar, Phone, Bank, Email)
    PII-->>API: Safe Fact-Constrained Context
    API->>Gemini: Send Prompt (Safe Facts + Question + Strict Citation Instruction)
    Gemini-->>API: Structured Response (Answer Text + Citations)
    API->>API: Attach Verified Evidence Document & Page References
    API-->>Officer: Return Grounded Response with Citations & Action Steps
```

---

## 3. Database Entity Relationship (PostgreSQL)

```mermaid
erDiagram
    USERS ||--o{ CLAIMS : "submits"
    USERS ||--o{ POLICIES : "owns"
    POLICIES ||--o{ CLAIMS : "covers"
    CLAIMS ||--o{ DOCUMENTS : "attaches"
    CLAIMS ||--o{ FRAUD_FINDINGS : "generates"
    CLAIMS ||--o{ INVESTIGATION_CASES : "initiates"
    INVESTIGATION_CASES ||--o{ CASE_NOTES : "contains"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    USERS {
        uuid id PK
        string email UK
        string full_name
        string role "ADMIN | INVESTIGATOR | CUSTOMER"
        string phone_number
        boolean is_active
    }

    CLAIMS {
        uuid id PK
        string claim_number UK
        uuid customer_id FK
        uuid policy_id FK
        string category "MOTOR | HEALTH | PROPERTY"
        string status
        datetime incident_date
        decimal claimed_amount
        string vehicle_registration
        string garage_name
        int risk_score
        string risk_band
    }

    DOCUMENTS {
        uuid id PK
        uuid claim_id FK
        string document_type
        string original_filename
        string sha256_hash
        jsonb extracted_metadata
        boolean has_tampering_indicators
        jsonb forensic_details
        vector embedding
    }

    FRAUD_FINDINGS {
        uuid id PK
        uuid claim_id FK
        string rule_id
        string rule_name
        string severity
        int points
        text observation
        text potential_alternative_explanation
        text recommended_action
        string investigator_feedback
    }
```

---

## 4. Neo4j Graph Model Definition

### Nodes:
- `(:Customer {id, name, risk_tag})`
- `(:Claim {claim_number, amount, date, status, risk_score})`
- `(:Vehicle {registration, make, model})`
- `(:Garage {name, license, location})`
- `(:Hospital {name, registration})`
- `(:Phone {number})`

### Edges:
- `(:Customer)-[:SUBMITTED]->(:Claim)`
- `(:Customer)-[:OWNS]->(:Vehicle)`
- `(:Claim)-[:INVOLVES_VEHICLE]->(:Vehicle)`
- `(:Claim)-[:REPAIRED_AT]->(:Garage)`
- `(:Claim)-[:TREATED_AT]->(:Hospital)`
- `(:Customer)-[:SHARES_CONTACT]->(:Phone)`

---

## 5. Security & Isolation Architecture

1. **Token Authentication:** Bearer JWT with HMAC-SHA256. Roles enforced on FastAPI routers via `get_current_user` dependency.
2. **Customer Isolation:** Customer endpoints query solely by `WHERE customer_id == current_user.id`.
3. **Data Masking Layer:** Centralized in `app.services.privacy.pii.PIIMasker`.
4. **Audit Logging:** Every status change and officer finding modification writes an immutable record to `audit_logs`.

# ClaimShield AI — System Architecture & Design Specification

> **Event:** Visionet Techthon 2026 — Round 2  
> **Team:** Avdhesh (Backend Lead), Ayush (Frontend Lead), Manaswi (AI Lead)  
> **Target:** Intelligent Insurance Claims Processing and Explainable Fraud Detection  

---

## 1. High-Level System Architecture

ClaimShield AI follows an integrated, decoupled MERN architecture augmented with document intelligence and deterministic explainability engines.

```mermaid
flowchart TD
    subgraph ClientLayer ["Digital Experience Layer (React 18 + Tailwind CSS)"]
        ApplicantUI["Applicant Portal\n- Claim Submission Form\n- Document Uploader"]
        OfficerUI["Claims Officer Dashboard\n- Real-time Analytics\n- Risk Gauge & Evidence Panel\n- AI Investigation Summary\n- Audit History & Decisions"]
    end

    subgraph APILayer ["API Gateway & Application Server (Express.js / Node.js)"]
        AuthMiddleware["JWT Auth & RBAC Middleware"]
        Router["RESTful Route Handlers\n- /api/auth\n- /api/claims\n- /api/documents\n- /api/dashboard"]
        MulterHandler["Multer Storage Engine\n(Type & Size Validation)"]
    end

    subgraph DataLayer ["Data & Persistence Layer"]
        MongoDB[("MongoDB Database\n- Users\n- Claims\n- Documents\n- RiskAssessments\n- InvestigationReports\n- AuditLogs")]
        LocalStorage[("Secure File Storage\n/uploads/:claimId/")]
    end

    subgraph IntelligenceLayer ["Intelligence & Validation Pipeline"]
        CryptoService["SHA-256 Hashing\n(Duplicate Document Detection)"]
        OCREngine["Document Intelligence Engine\n- pdf-parse (Text Extraction)\n- Tesseract.js (Optical Character Recognition)"]
        FieldParser["Structured Field Parser\n(Regex & Heuristic Entity Extraction)"]
        CrossValidator["Cross-Document Validation Engine\n(Deterministic Discrepancy Checks)"]
        RiskEngine["Explainable Risk Engine\n(Configurable Rule Weighting 0-100)"]
        AIAssistant["AI Investigation Assistant\n(Google Gemini 1.5 Flash Grounded LLM)"]
    end

    ApplicantUI -->|Submit Claim & Upload Files| AuthMiddleware
    OfficerUI -->|Review, Assess & Adjudicate| AuthMiddleware
    AuthMiddleware --> Router
    Router --> MulterHandler
    MulterHandler --> LocalStorage
    MulterHandler --> CryptoService
    Router --> MongoDB

    Router -->|1. Process Docs| OCREngine
    OCREngine --> FieldParser
    FieldParser -->|Extracted JSON| MongoDB
    
    Router -->|2. Validate & Score| CrossValidator
    CrossValidator --> RiskEngine
    CryptoService --> RiskEngine
    RiskEngine -->|Score + Evidence Breakdown| MongoDB

    Router -->|3. Generate Report| AIAssistant
    MongoDB -->|Structured Facts Only| AIAssistant
    AIAssistant -->|Evidence-Grounded Summary| MongoDB

    OfficerUI -.->|Review Evidence & Action| Router
```

---

## 2. End-to-End Data Processing Workflow

The pipeline transforms unstructured claim documents into actionable, evidence-backed decision support:

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Claims Officer
    participant Frontend as React Client
    participant API as Express API Server
    participant Storage as File Storage / DB
    participant OCR as OCR & Field Parser
    participant Engine as Risk & Validation Engine
    participant Gemini as Gemini AI Assistant

    Officer->>Frontend: Select Claim for Processing
    Frontend->>API: POST /api/documents/:id/process
    API->>Storage: Retrieve Document Binary
    API->>OCR: Extract Text & Parse Structured Entities
    OCR-->>API: Return Standardized Fields & Confidence
    API->>Storage: Save extractedFields & Update Status
    API-->>Frontend: Display Extracted Metadata

    Officer->>Frontend: Click "Assess Risk"
    Frontend->>API: POST /api/claims/:id/assess-risk
    API->>Storage: Load Claim + All Extracted Document Entities
    API->>Engine: Run Cross-Validation & Duplicate Check
    Engine->>Engine: Calculate Weighted Deterministic Score (0-100)
    Engine-->>API: Return Score, Triggered Rules, Evidence & Duplicates
    API->>Storage: Persist RiskAssessment Record
    API-->>Frontend: Render Radial Gauge & Evidence Panels

    Officer->>Frontend: Click "Generate AI Report"
    Frontend->>API: POST /api/claims/:id/generate-report
    API->>Storage: Fetch Structured Findings (Score, Flags, Mismatches)
    API->>Gemini: Send Strict Fact-Constrained Prompt
    Gemini-->>API: Return Narrative Investigation Summary
    API->>Storage: Store InvestigationReport
    API-->>Frontend: Display Structured AI Summary with Disclaimer

    Officer->>Frontend: Submit Action (Approve / Reject / Investigate)
    Frontend->>API: PATCH /api/claims/:id/status
    API->>Storage: Update Claim Status & Append to AuditLog
    API-->>Frontend: Confirmation & Updated Audit Timeline
```

---

## 3. Logical AI Agent & Component Architecture

In compliance with Visionet Techthon Round 2 guidelines, we explain the discrete responsibilities of each intelligence component, the tools they use, and how they communicate:

| Component | Nature | Primary Responsibility | Input | Tools & Frameworks | Output |
|---|---|---|---|---|---|
| **1. Document Intelligence Engine** | Algorithmic + ML | Extracts text and parses key-value entities from diverse file formats. | Raw PDF / Image files | `pdf-parse`, `tesseract.js`, Regex Heuristics | Structured JSON with confidence metrics |
| **2. Deduplication Module** | Cryptographic & Database | Identifies identical files and recycled invoice numbers across all historical claims. | File buffers, parsed invoice numbers | Node.js `crypto` (SHA-256), MongoDB indexed queries | Matching document/claim references |
| **3. Cross-Document Validation Engine** | Deterministic Rule-Based | Compares key entities across documents (e.g. Policyholder, Registration, Dates, Amounts). | Extracted fields from all attached documents | Deterministic validation algorithms | List of pass/fail/warning checks with evidence |
| **4. Explainable Risk Scoring Engine** | Deterministic Formula | Calculates reproducible risk scores (0-100) and categorizes claim priority. | Triggered rules, mismatch details, duplicate records | Weighted scoring matrix, threshold classifiers | Risk score, category, itemized rule breakdown |
| **5. AI Investigation Assistant** | Generative LLM | Synthesizes complex validation results into an executive investigation brief for humans. | Structured JSON findings ONLY (no raw hallucinated inputs) | Google Gemini 1.5 Flash (`@google/generative-ai`) | 7-part structured narrative summary |
| **6. Human Review & Audit Layer** | Decision Support | Enables human-in-the-loop oversight and maintains immutable historical logs. | Officer notes and final disposition | Mongoose `AuditLog` schema | Auditable chronological record |

---

## 4. Key Architectural Decisions & Trade-Offs

1. **Why Deterministic Scoring over Pure Machine Learning for Risk:**
   - *Insurance Regulation & Explainability:* Insurance compliance mandates explainability. A "black-box" neural network cannot tell a claims officer or regulatory auditor exactly which document discrepancy caused a claim to be flagged.
   - *Deterministic Reproducibility:* The exact same claim documents will always produce the exact same score and evidence breakdown.

2. **Why Constrained Prompting for Gemini AI:**
   - The LLM is strictly prohibited from making fraud verdicts or creating independent assertions.
   - It acts purely as a narrative assistant, summarizing verified mathematical and rule-based findings into human-readable briefs.

3. **Stateless Authentication:**
   - JWT tokens with 7-day expiry and bcrypt password hashing ensure compatibility with scalable serverless or containerized cloud deployments (e.g., Render, AWS ECS, Vercel).

# ClaimShield AI — Team Ownership & Contribution Matrix

> **Event:** Visionet Techthon 2026 — Round 2  
> **Team Structure:** 3 Members  
> **Evaluation Alignment:** Criterion 6 — *Impact & Team Ownership*  

---

## 1. Team Ownership Overview

| Member | Designated Role | Primary Ownership Areas | Core Deliverables |
|---|---|---|---|
| **Avdhesh Ghansela** | Backend Lead & System Integration Architect | REST APIs, MongoDB Database Schemas, Authentication, Role-Based Access Control, Multer File Pipeline, Audit Logging, GitHub Integration & Release Management | 17 Express Endpoints, Database Schemas, JWT Auth Middleware, Audit Service, Seeders, Deployment Scripts |
| **Ayush** | Frontend Lead & UX Experience Specialist | React 18 Application, Tailwind CSS Design System, Responsive Claims Dashboard, Submission Workflow, Evidence Display Panels, Recharts Visualizations | Officer Dashboard, Multi-Step Claim Submission Form, Interactive Claim Detail View, Radial Risk Gauge, Audit Trail UI |
| **Manaswi** | AI Engineer & Document Intelligence Lead | OCR Text Extraction Pipeline, Entity Parsing Heuristics, Duplicate File & Invoice Detection, Deterministic Rule Engine, Gemini 1.5 Flash Prompt Engineering | Document OCR Service (pdf-parse + Tesseract.js), Cross-Document Validation Engine, Deterministic Risk Scoring Module, Evidence Summarizer |

---

## 2. Detailed Member Breakdown

### Member 1: Avdhesh Ghansela
**Role:** Backend Engineering & Architecture Lead
- **Technical Responsibilities:**
  - Designed the 6 Mongoose data models (`User`, `Claim`, `Document`, `RiskAssessment`, `InvestigationReport`, `AuditLog`).
  - Implemented JWT token issuance, verification, and role-based route protection (`applicant`, `officer`, `admin`).
  - Configured secure file storage with Multer handling mime-type enforcement and 10MB limits.
  - Developed end-to-end audit logging ensuring full transparency of officer status updates.
  - Built database seeder creating demo accounts and representative claims for Scenarios A, B, and C.
- **Visionet Reviewer Q&A Readiness:**
  - Can explain backend schema relationships, indexing strategies for fast lookups, JWT lifecycle, rate-limiting security mechanisms, and how Express controllers coordinate between file storage and AI services.

---

### Member 2: Ayush
**Role:** Frontend Engineering & Digital Experience Lead
- **Technical Responsibilities:**
  - Created modern, accessible UI using React 18, Vite, and Tailwind CSS following enterprise BFSI aesthetics (Deep Navy `#1a2a6c`, Slate, and Emerald accents).
  - Built the interactive Claims Officer Dashboard showcasing key KPIs, status breakdowns, and recent submissions.
  - Developed the 2-step Claim Submission workflow allowing policyholders to submit accident details and drag-and-drop supporting documents.
  - Designed the comprehensive **Claim Detail View** displaying:
    - Extracted document metadata with confidence scores.
    - RadialBar risk gauge chart.
    - Expandable triggered rule cards showing Expected vs. Found evidence.
    - Color-coded validation checks (Pass / Fail / Warning).
    - Formatted AI investigation brief with regulatory disclaimer.
    - Officer action controls (Approve, Reject, Investigate, Request Info).
- **Visionet Reviewer Q&A Readiness:**
  - Can demo the user experience, explain client-side state management in `AuthContext`, showcase API integration with Axios interceptors, and describe responsiveness across viewport sizes.

---

### Member 3: Manaswi
**Role:** AI Engineering & Document Intelligence Lead
- **Technical Responsibilities:**
  - Engineered the document processing pipeline using `pdf-parse` for text PDFs and `tesseract.js` for scanned images.
  - Authored regex and heuristic entity extraction patterns extracting policy numbers, dates, vehicle registrations, and invoice amounts.
  - Implemented SHA-256 cryptographic hashing to detect duplicate document submissions.
  - Built the cross-document validation engine comparing parsed data points against each other and against the submitted claim.
  - Implemented the deterministic 8-rule weighted risk scoring engine (capped at 100).
  - Designed the structured prompt for Google Gemini 1.5 Flash to synthesize facts into an executive summary without hallucinating verdicts.
- **Visionet Reviewer Q&A Readiness:**
  - Can explain how OCR handles noisy documents, the reason for deterministic scoring over black-box ML in regulated insurance, how duplicate invoices are indexed, and the strict prompt boundaries applied to the LLM.

---

## 3. Collaborative Commit & Review Rules
1. Every team member works on feature branches (`feature/avdhesh-*`, `feature/ayush-*`, `feature/manaswi-*`).
2. Pull requests require review before merging into `development`.
3. Code merged to `main` must pass all 3 synthetic scenario tests.

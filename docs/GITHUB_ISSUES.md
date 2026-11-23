# ClaimShield AI — GitHub Issue Tracking Board

> This document defines all development tasks, assigned owners, priorities, and acceptance criteria for the team.

---

## Milestone 1: Foundation & Authentication (Nov 21)

### Issue #1: User Authentication & Role-Based Access Control
- **Assignee:** Avdhesh
- **Labels:** `backend`, `security`, `p0-critical`
- **Description:** Implement JWT-based authentication system supporting `applicant`, `officer`, and `admin` roles.
- **Acceptance Criteria:**
  - [x] User model with encrypted password storage (bcrypt salt rounds = 12).
  - [x] `POST /api/auth/register` creates applicant accounts.
  - [x] `POST /api/auth/login` issues signed JWT tokens (expires in 7 days).
  - [x] `GET /api/auth/me` validates token and returns sanitized user profile.
  - [x] Authorization middleware blocks unauthorized role access.

### Issue #2: Frontend Application Shell & Auth Context
- **Assignee:** Ayush
- **Labels:** `frontend`, `ux`, `p0-critical`
- **Description:** Initialize React + Vite application with Tailwind CSS, global AuthContext, and protected route wrappers.
- **Acceptance Criteria:**
  - [x] Responsive layout with enterprise BFSI sidebar navigation.
  - [x] Login page with demo account shortcuts (Admin, Officer, Applicant).
  - [x] `AuthContext` managing token storage and authenticated user state.
  - [x] Protected routes redirecting unauthenticated users to `/login`.

---

## Milestone 2: Core Claims & Document Workflow (Nov 22)

### Issue #3: Claim Submission & Query APIs
- **Assignee:** Avdhesh
- **Labels:** `backend`, `claims`, `p0-critical`
- **Description:** Develop REST endpoints to create, retrieve, filter, and paginate insurance claims.
- **Acceptance Criteria:**
  - [x] Claim Mongoose model with auto-incrementing `CS-YYYY-XXXXX` format.
  - [x] `POST /api/claims` accepts structured accident and policy data.
  - [x] `GET /api/claims` supports search (by policy, registration, claimant name) and status filtering.
  - [x] `GET /api/claims/:id` aggregates claim, documents, risk, and report.

### Issue #4: Document Upload & Storage Engine
- **Assignee:** Avdhesh
- **Labels:** `backend`, `documents`, `p0-critical`
- **Description:** Integrate Multer file storage with SHA-256 cryptographic hashing on upload.
- **Acceptance Criteria:**
  - [x] Accepts PDF, JPG, and PNG formats up to 10MB.
  - [x] Stores files in organized subdirectories (`/uploads/:claimId/`).
  - [x] Calculates and stores SHA-256 file hash in `Document` record.
  - [x] Records upload event in `AuditLog`.

### Issue #5: Claim Submission & Document Upload UI
- **Assignee:** Ayush
- **Labels:** `frontend`, `claims`, `p1-high`
- **Description:** Build intuitive 2-step submission wizard for applicants and officers.
- **Acceptance Criteria:**
  - [x] Step 1: Claim detail form with validation on amounts and dates.
  - [x] Step 2: Multi-document upload component with document type selector.
  - [x] Visual upload progress, file size display, and success confirmations.

---

## Milestone 3: Intelligence, OCR & Risk Engine (Nov 23)

### Issue #6: Document OCR & Entity Extraction Pipeline
- **Assignee:** Manaswi
- **Labels:** `ai`, `ocr`, `p0-critical`
- **Description:** Implement text extraction for PDFs and images, plus heuristic key-value entity extraction.
- **Acceptance Criteria:**
  - [x] `pdf-parse` extracts raw text from PDF claim documents.
  - [x] `tesseract.js` performs OCR on invoice and damage photos.
  - [x] Regex parser extracts: Policy #, Vehicle Reg, Invoice #, Invoice Amount, Accident Date.
  - [x] Calculates extraction confidence score based on populated fields.

### Issue #7: Duplicate Document & Recycled Invoice Detection
- **Assignee:** Manaswi
- **Labels:** `ai`, `fraud-detection`, `p0-critical`
- **Description:** Implement cross-claim duplicate detection using SHA-256 file hashes and invoice numbers.
- **Acceptance Criteria:**
  - [x] Identifies duplicate file uploads across different claims.
  - [x] Detects identical repair invoice numbers submitted previously.
  - [x] Returns matched claim numbers and document IDs as verifiable evidence.

### Issue #8: Deterministic Explainable Risk Scoring Engine
- **Assignee:** Manaswi
- **Labels:** `ai`, `risk-engine`, `p0-critical`
- **Description:** Build transparent rule-based scoring module with configurable weights.
- **Acceptance Criteria:**
  - [x] Evaluates 8 discrete rules (Duplicate invoice, Duplicate file, Policy mismatch, Vehicle mismatch, Date conflict, Amount anomaly, Missing docs, Repeated submission).
  - [x] Capped 0-100 score mapped to 4 risk bands (Low, Standard, Enhanced, High Priority).
  - [x] Generates structured evidence object (`expected`, `found`, `sourceDocuments`, `explanation`, `recommendedAction`) for every triggered rule.

### Issue #9: Claim Detail View & Risk Visualization UI
- **Assignee:** Ayush
- **Labels:** `frontend`, `visualization`, `p1-high`
- **Description:** Render comprehensive decision-support interface for claims officers.
- **Acceptance Criteria:**
  - [x] Recharts radial score gauge with color thresholds (Green/Yellow/Orange/Red).
  - [x] Extracted document fields panel with confidence tags.
  - [x] Validation check status list (Pass / Fail / Warning).
  - [x] Expandable evidence cards for triggered risk rules.

---

## Milestone 4: AI Assistant, Review & Dashboard (Nov 24)

### Issue #10: Gemini AI Grounded Investigation Assistant
- **Assignee:** Manaswi (Prompt & API) + Avdhesh (Integration)
- **Labels:** `ai`, `llm`, `p1-high`
- **Description:** Integrate Google Gemini 1.5 Flash to synthesize structured risk findings into an executive brief.
- **Acceptance Criteria:**
  - [x] Strict fact-constrained prompt preventing hallucinated assertions.
  - [x] Generates 7-part structured brief (Summary, Flags Explained, Evidence, Missing Info, Verification Steps, Priority, Disclaimer).
  - [x] Robust fallback generation if Gemini API key is missing or quota exceeded.

### Issue #11: Human Adjudication & Audit Trail Module
- **Assignee:** Avdhesh (Backend) + Ayush (UI)
- **Labels:** `fullstack`, `audit`, `p1-high`
- **Description:** Enable claims officers to approve, reject, or flag claims with immutable audit logging.
- **Acceptance Criteria:**
  - [x] Action buttons (Approve, Reject, Investigate, Request Additional Info).
  - [x] Mandatory officer note recording in `AuditLog`.
  - [x] Chronological audit timeline showing user, action, and timestamp.

### Issue #12: Claims Dashboard & Analytics
- **Assignee:** Ayush
- **Labels:** `frontend`, `analytics`, `p1-high`
- **Description:** Aggregate claims metrics and render risk distribution charts.
- **Acceptance Criteria:**
  - [x] KPI summary cards (Total, Pending, High Priority, Approved).
  - [x] Bar chart of risk category distribution.
  - [x] Quick-action recent claims table.

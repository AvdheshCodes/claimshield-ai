# InsureGuard AI â€” Master Development & Modification Log

> **File Purpose:** Comprehensive, immutable tracker of all codebase updates, architectural changes, additions, modifications, reversions, and subagent assignments.  
> **Repository:** `claimshield-ai` (Transitioning to InsureGuard AI v2.0)  
> **Master Coordinator:** Antigravity Senior Technical Lead & Master Agent  
> **Last Updated:** 2026-11-22T02:45:00+05:30  

---

## ðŸ“Œ Change Log Convention
Every entry must document:
- **Timestamp (ISO / Local):** When the modification occurred.
- **Author / Agent:** Who executed the change (`Master Agent`, `Backend Lead`, `Frontend Lead`, `AI & Forensics Lead`).
- **Category:** `ADDITION`, `MODIFICATION`, `REVERSION`, `REFACTOR`, `DEPRECATION`, `CONFIGURATION`.
- **Files Affected:** Explicit list of file paths.
- **Description & Rationale:** Why the change was made and what was modified.
- **Rollback / Reversion Instructions:** How to revert the change if required.

---

## ðŸ“œ Chronological Log

### [Entry 001] â€” 2026-11-21 â€” Baseline v1.0 Foundation
- **Author:** Master Agent (Avdhesh, Ayush, Manaswi roles)
- **Category:** `ADDITION`
- **Files Affected:**
  - `server/` (Node.js/Express, Mongoose models, JWT auth, OCR service, Risk Engine, Gemini AI service)
  - `client/` (React 18 + Vite, Tailwind CSS, Recharts)
  - `sample-data/` (Scenarios A, B, C synthetic JSON claims and mock documents)
  - `docs/` (`PROJECT_STATUS.md`, `ARCHITECTURE.md`, `API_CONTRACTS.md`, `TEAM_CONTRIBUTIONS.md`, `GITHUB_ISSUES.md`)
- **Description:** Complete initial MERN prototype scaffolded, committed to Git (`a0082c1`, `52c5cdf`), and pushed to GitHub (`main`, `development`).
- **Status:** Baseline active and stable on GitHub.

---

### [Entry 002] â€” 2026-11-22 02:45 â€” Adoption of PRD v2.0 (InsureGuard AI) & Multi-Agent Architecture
- **Author:** Master Agent
- **Category:** `CONFIGURATION` & `ARCHITECTURE`
- **Files Affected:**
  - `docs/DEVELOPMENT_LOG.md` (Created)
  - `docs/PRD_v2.0.md` (Created to store full approved PRD)
- **Description:** 
  - Approved transition from ClaimShield v1.0 (motor insurance MERN MVP) to InsureGuard AI v2.0 (enterprise fraud detection, document forensics, Neo4j relationship graph, grounded AI copilot, customer transparency portal, FastAPI/PostgreSQL/Neo4j architecture).
  - Established Master Agent and Subagent operational hierarchy with automated cross-communication and audit tracking.
- **Rollback:** Revert to branch `development` at commit `52c5cdf`.

---

### [Entry 003] â€” 2026-11-22 02:50 â€” Subagents Definition & Coordination Protocol
- **Author:** Master Agent
- **Category:** `CONFIGURATION`
- **Subagents Registered:**
  1. `backend-specialist`: Owns Python/FastAPI backend, PostgreSQL/pgvector, Neo4j graph schemas, authentication, and REST APIs.
  2. `frontend-specialist`: Owns React + TypeScript frontend, tri-portal architecture (Customer, Investigator, Admin), vis-network relationship graph, and copilot UI.
  3. `ai-forensics-specialist`: Owns document intelligence, PaddleOCR, image forensics (ELA, compression analysis), rule engine, and Gemini/Ollama RAG copilot.
- **Documentation Created:** `docs/AGENT_COORDINATION.md` detailing communication protocols and review steps.

---

### [Entry 004] â€” 2026-11-22 03:00 â€” InsureGuard AI v2.0 Full Stack Implementation
- **Author:** Master Agent (incorporating Backend, Frontend, and AI Leads)
- **Category:** `ADDITION`
- **Files Created:**
  - `docker-compose.yml`: Multi-container infrastructure (pgvector, Neo4j, Redis, Backend, Frontend).
  - `database/postgres/init.sql`: 8 PostgreSQL tables with pgvector extension.
  - `database/neo4j/schema.cypher`: Constraints, indexes, and synthetic fraud syndicate seeds.
  - `backend/requirements.txt`: Python dependencies.
  - `backend/app/core/`: `config.py`, `security.py`, `database.py`, `neo4j_client.py`.
  - `backend/app/models/`: `user.py`, `policy.py`, `claim.py`, `document.py`, `finding.py`, `case.py`, `audit.py`.
  - `backend/app/schemas/`: `user.py`, `claim.py`, `document.py`, `finding.py`, `copilot.py`, `graph.py`.
  - `backend/app/services/`:
    - `privacy/pii.py`: PII masking (Aadhaar, phone, bank account).
    - `document_forensics/forensics.py`: Error Level Analysis (ELA) and PDF metadata analysis.
    - `fraud_detection/engine.py`: Explainable deterministic 10-rule scoring engine (0-100 score).
    - `relationship_graph/graph_service.py`: Neo4j query builder & synthetic graph generator.
    - `copilot/rag_service.py`: Grounded RAG Copilot with citations and prompt injection defense.
  - `backend/app/api/v1/`: Endpoints for `auth`, `claims`, `documents`, `fraud`, `graph`, `copilot`, `customer`.
  - `backend/app/main.py`: FastAPI application entry point.
  - `frontend/`: React 18 + TypeScript, Tailwind CSS, typed Axios API client.
  - `frontend/src/pages/`:
    - `investigator/InvestigatorDashboard.tsx`
    - `investigator/WhySuspiciousView.tsx` (Evidence-backed indicators, page citations, alternative explanations)
    - `investigator/RelationshipGraphView.tsx` (Vis-network entity graph)
    - `investigator/CopilotChatView.tsx` (Grounded AI copilot chat with citations)
    - `customer/CustomerPortal.tsx` (Customer-safe milestone timeline & document upload)
- **Description:** Complete implementation of InsureGuard AI v2.0 architecture satisfying all 9 modules in the approved PRD.
- **Rollback:** `git reset --hard 52c5cdf` (returns to ClaimShield v1.0 MERN baseline).

---

### [Entry 005] â€” 2026-11-22 03:15 â€” Final Master Alignment Documents & Specialized Integration Contracts
- **Author:** Master Agent
- **Category:** `DOCUMENTATION` & `INTEGRATION_CONTRACT`
- **Files Created:**
  - `docs/FINAL_PRD.md`: Master consolidated PRD v3.0 detailing all non-negotiable principles, user roles, DoD, and deep-dive specifications for the 5 specialized features:
    1. **"Why Suspicious?" Track:** Deterministic 10-rule scoring engine, 0-100 risk bands, finding data contract with page numbers, alternative explanations, and recommended verification steps.
    2. **Fraud Relationship Graph:** Neo4j entity graph model (Customer, Claim, Vehicle, Garage, Hospital, Phone, Bank Account) and syndicate patterns (recycled vehicles, shared contacts, garage funneling).
    3. **Document Tampering & Forensics:** Cross-document text consistency, Error Level Analysis (ELA), and PDF metadata anomaly detection.
    4. **AI Copilot for Investigations:** Grounded RAG with strict document/page citations, lack-of-evidence acknowledgments, and refusal to make autonomous fraud verdicts.
    5. **Investigation Privacy & PII Protection:** Pre-LLM PII sanitization pipeline (Aadhaar, Phone, Bank, Email) and customer data boundary enforcement.
  - `docs/FINAL_ARCHITECTURE.md`: Exhaustive architecture blueprint featuring modular data pipelines, sequence diagrams, PostgreSQL ER diagram, and Neo4j graph model.
  - `docs/TECH_STACK_AND_INTEGRATION.md`: Complete tech stack definition (React+TS, FastAPI, PostgreSQL/pgvector, Neo4j, Redis, PyMuPDF, OpenCV), integration contracts, run commands, and team Git branching workflow for Avdhesh, Ayush, and Manaswi.
- **Rationale:** Establishes an unshakeable single source of truth allowing all 3 team members to build individual features in parallel and integrate seamlessly without architectural collisions.

---

### [Entry 006] â€” 2026-11-22 03:30 â€” PDF Documentation Generation
- **Author:** Master Agent
- **Category:** `ADDITION`
- **Files Created:**
  - `docs/make_pdf.js`: Pure Node.js zero-dependency PDF compiler generating standard PDF 1.4 documents with running headers, footers, pagination, code blocks, and styled tables.
  - `docs/FINAL_PRD.pdf`: Downloadable PDF (5 pages, 31 KB).
  - `docs/FINAL_ARCHITECTURE.pdf`: Downloadable PDF (4 pages, 22 KB).
  - `docs/TECH_STACK_AND_INTEGRATION.pdf`: Downloadable PDF (3 pages, 19 KB).
  - `docs/DEVELOPMENT_LOG.pdf`: Downloadable PDF (3 pages, 17 KB).
- **Rationale:** Enables direct download and sharing of reference documentation across teammates and reviewers.

---

### [Entry 007] â€” 2026-11-22 03:40 â€” Frontend Dependency Fix
- **Author:** Master Agent
- **Category:** `FIX`
- **Files Affected:**
  - `frontend/package.json`: Removed invalid `@types/vis-network` (vis-network bundles its own declarations).
  - `frontend/src/types/vis-network.d.ts`: Created explicit TypeScript declaration shims for `vis-network/standalone`.
  - `frontend/src/pages/investigator/RelationshipGraphView.tsx`: Updated import to `vis-network/standalone` for optimal browser bundling.
- **Rationale:** Resolves npm 404 installation error when running `npm install` in `frontend/`.

---

### [Entry 008] â€” 2026-11-22 03:55 â€” Remote Git Synchronization & Live Frontend Deployment
- **Author:** Master Agent
- **Category:** `DEPLOYMENT` & `SYNCHRONIZATION`
- **Actions Executed:**
  - Synchronized all commits up to `e5aa418` with remote repository `origin/development`.
  - Executed `npm install` with all 204 dependencies installed cleanly in `frontend/node_modules/`.
  - Verified production build via `npx vite build` (1,642 modules transformed, built in 10.46s).
  - Started Vite live development server on `http://localhost:3000/`.
- **Status:** Application is active and accessible via browser.

---

## [Entry 9] — 2026-11-22 04:08 IST
**Author:** Avdhesh (AI Agent)
**Category:** Bug Fix — Frontend
**Commit:** 8389126

### Problem
Frontend UI was completely invisible (blank white page). Tailwind CSS was not processing because postcss.config.js was missing from the frontend directory.

### Fix
Created rontend/postcss.config.js with tailwindcss + autoprefixer plugins.

### Files Affected
- rontend/postcss.config.js ? **NEW FILE CREATED**

### Rollback
Delete rontend/postcss.config.js — but doing so will break Tailwind styling again.


---

## [Entry 10] — 2026-11-22 04:32 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Frontend Data Decoupling  
**Commit:** be188fc  

### Problem
The frontend views were displaying hardcoded pre-seeded demo data instead of empty states and live data from the backend.

### Fix
1. Removed all hardcoded static claims from `InvestigatorDashboard.tsx`.
2. Created clean empty states in `WhySuspiciousView`, `RelationshipGraphView`, `CopilotChatView`, and `CustomerPortal`.
3. Added live polling and refresh capability from the backend API.

### Files Affected
- `frontend/src/pages/investigator/InvestigatorDashboard.tsx`
- `frontend/src/pages/investigator/WhySuspiciousView.tsx`
- `frontend/src/pages/investigator/RelationshipGraphView.tsx`
- `frontend/src/pages/investigator/CopilotChatView.tsx`
- `frontend/src/pages/customer/CustomerPortal.tsx`

### Rollback
Revert commit `be188fc`.

---

## [Entry 11] — 2026-11-22 05:05 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Backend & AI Engine Architecture  

### Problem
The AI fraud detection engine, document forensics OCR pipeline, and backend services needed to be implemented and connected end-to-end with the frontend.

### Fix
1. **Python Environment**: Initialized virtual environment `.venv` with Python 3.13 and installed all dependencies (`fastapi`, `uvicorn`, `pymupdf`, `sqlalchemy`, `aiosqlite`, `greenlet`, `email-validator`, `pillow`, `google-generativeai`, `neo4j`).
2. **Resilient Database Layer**: Configured `app/core/database.py` with automatic SQLite fallback (`aiosqlite`) when PostgreSQL is not running in local development, ensuring zero-configuration startup.
3. **OCR & Forensics Engine**: Upgraded `DocumentForensicsService` in `app/services/document_forensics/forensics.py` to extract text blocks, parse invoice numbers, vehicle registration plates, accident dates, and invoice amounts via PyMuPDF. Added metadata tampering detection for graphics editing tools.
4. **Explainable Fraud Engine**: Fully implemented all 10 PRD rules in `ExplainableFraudEngine` (`app/services/fraud_detection/engine.py`), outputting exact risk scores, risk bands, itemized observations, evidence snippets, alternative explanations, and recommended actions.
5. **End-to-End Pipeline**: Added `POST /api/v1/claims/upload-and-analyze` in `app/api/v1/claims.py` enabling 1-click document ingestion, OCR parsing, forensic inspection, and immediate deterministic fraud scoring.
6. **AI Copilot & Graph**: Added flexible routing to `app/api/v1/copilot.py` (`/copilot/query` and `/copilot/chat`) with PII sanitization and grounded citations. Expanded `app/api/v1/graph.py` to serve 2-hop entity neighborhood graphs.
7. **Frontend Integration**: Wired the "Submit & Analyze Files" button in `InvestigatorDashboard.tsx` and dynamic findings loading in `WhySuspiciousView.tsx`.
8. **End-to-End Verification**: Tested uploading 3 sample PDFs (`Repair_Invoice_INV-REPAIR-999.pdf`, `Police_Traffic_Diary_Report.pdf`, `Insurance_Policy_Schedule.pdf`). Successfully produced claim `CS-2026-68595` with risk score 80 (VERY_HIGH) and 4 evidence findings.

### Files Affected
- `backend/app/api/v1/claims.py`
- `backend/app/api/v1/documents.py`
- `backend/app/api/v1/copilot.py`
- `backend/app/api/v1/graph.py`
- `backend/app/api/v1/auth.py`
- `backend/app/api/v1/customer.py`
- `backend/app/core/database.py`
- `backend/app/main.py`
- `backend/app/models/*.py`
- `backend/app/services/document_forensics/forensics.py`
- `backend/app/services/fraud_detection/engine.py`
- `backend/requirements.txt`
- `frontend/src/pages/investigator/InvestigatorDashboard.tsx`
- `frontend/src/pages/investigator/WhySuspiciousView.tsx`
- `.gitignore`

### Rollback
`git revert HEAD`

---

## [Entry 13] — 2026-11-22 06:15 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Feature Progression — Investigation Dossier PDF Export & Verification  

### Problem
Investigators and compliance officers require an exportable, court-admissible Investigation Dossier PDF summarizing the claim profile, deterministic risk scoring (0-100), itemized evidence findings (WHY SUSPICIOUS?), document integrity SHA-256 hashes, syndicate ring graph detection notes, and human investigator audit determinations.

### Fix
1. **Dossier Generation Service**: Verified `app/services/reporting/dossier_service.py` using PyMuPDF (`fitz`), creating a two-page executive case summary with risk badges, itemized evidence observations, tamper detection matrices, network syndicate intelligence notes, and immutable audit sign-off fields.
2. **FastAPI Dossier Endpoint**: Added `GET /api/v1/claims/{claim_id}/dossier` in `app/api/v1/claims.py` returning `FileResponse` with dynamically generated PDF filenames (`InsureGuard_Dossier_{claim_number}.pdf`).
3. **Frontend Export Button**: Added an interactive "Export Dossier (PDF)" button in `InvestigatorDashboard.tsx` with blob download handler and loading states.
4. **Verification**: Executed Vite production build (`npx vite build` passed in 25.11s with 0 errors) and validated Python AST compilation across modified endpoints.

### Files Affected
- `backend/app/api/v1/claims.py`
- `backend/app/services/reporting/dossier_service.py`
- `frontend/src/pages/investigator/InvestigatorDashboard.tsx`
- `docs/DEVELOPMENT_LOG.md`

### Rollback
`git revert HEAD` to return to commit `be188fc`.

---

## [Entry 12] — 2026-11-22 05:40 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Feature Progression — Case Decision Workflow & Documents View  

### Problem
1. Investigators lacked the ability to inspect uploaded documents side-by-side with PyMuPDF OCR text and parsed metadata.
2. Investigators had no formal mechanism to record case decisions (`APPROVE`, `REJECT`, `REQUEST_MORE_INFO`) with mandatory rationale.
3. Investigator feedback on findings (`VERIFIED`, `UNRESOLVED`, `DISMISSED`) was not persisted to the backend or dynamically recalculating risk scores.
4. Customer portal supplemental uploads were not persisting to the database.

### Fix
1. **Documents & Forensics Tab**: Created `frontend/src/pages/investigator/DocumentsView.tsx` with side-by-side file list, integrity SHA-256 hash, forensic tampering badges, parsed entity key-value cards, and a scrollable PyMuPDF OCR text reader.
2. **Case Determination Sign-Off**: Implemented `POST /api/v1/claims/{claim_id}/decision` in `app/api/v1/fraud.py` to record investigator decisions with mandatory rationale and immutable audit logging. Added a modal in `InvestigatorDashboard.tsx`.
3. **Interactive Finding Feedback**: Added `PATCH /api/v1/claims/{claim_id}/findings/{finding_id}` to update feedback and dynamically recalculate claim risk scores (excluding dismissed findings).
4. **Customer Upload Sync**: Wired `CustomerPortal.tsx` to post supplemental documents directly to `/api/v1/claims/{claim_id}/documents`.
5. **Verified Production Build**: `npx vite build` passed in 7.72s with 0 errors across 1,643 modules.

### Files Affected
- `backend/app/api/v1/documents.py`
- `backend/app/api/v1/fraud.py`
- `frontend/src/pages/investigator/DocumentsView.tsx` — **NEW**
- `frontend/src/pages/investigator/InvestigatorDashboard.tsx`
- `frontend/src/pages/investigator/WhySuspiciousView.tsx`
- `frontend/src/pages/customer/CustomerPortal.tsx`
- `frontend/src/types/index.ts`
- `docs/DEVELOPMENT_LOG.md`

### Rollback
`git revert HEAD`

---

## [Entry 13] — 2026-11-22 06:15 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Feature Progression — Investigation Dossier PDF Export & Verification  

### Problem
Investigators and compliance officers require an exportable, court-admissible Investigation Dossier PDF summarizing the claim profile, deterministic risk scoring (0-100), itemized evidence findings (WHY SUSPICIOUS?), document integrity SHA-256 hashes, syndicate ring graph detection notes, and human investigator audit determinations.

### Fix
1. **Dossier Generation Service**: Verified `app/services/reporting/dossier_service.py` using PyMuPDF (`fitz`), creating a two-page executive case summary with risk badges, itemized evidence observations, tamper detection matrices, network syndicate intelligence notes, and immutable audit sign-off fields.
2. **FastAPI Dossier Endpoint**: Added `GET /api/v1/claims/{claim_id}/dossier` in `app/api/v1/claims.py` returning `FileResponse` with dynamically generated PDF filenames (`InsureGuard_Dossier_{claim_number}.pdf`).
3. **Frontend Export Button**: Added an interactive "Export Dossier (PDF)" button in `InvestigatorDashboard.tsx` with blob download handler and loading states.
4. **Verification**: Executed Vite production build (`npx vite build` passed in 25.11s with 0 errors) and validated Python AST compilation across modified endpoints.

### Files Affected
- `backend/app/api/v1/claims.py`
- `backend/app/services/reporting/dossier_service.py`
- `frontend/src/pages/investigator/InvestigatorDashboard.tsx`
- `docs/DEVELOPMENT_LOG.md`

### Rollback
`git revert HEAD`


---

## [Entry 14] — 2026-11-23 03:15 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Bug Fix & Enhancement — Resilient Fraud Relationship Graph & Dynamic Entity Grounding  

### Problem
1. When Neo4j was offline or unreachable, `neo4j_client.execute_query` threw an unhandled `ServiceUnavailable` exception that caused `GET /api/v1/graph/{claim_number}` to crash with HTTP 500.
2. In Pydantic `GraphEdge` model, fields were serialized as `from_node` and `to_node`, whereas `vis-network` strictly requires `from` and `to` properties, preventing edge connection rendering.
3. Fallback graph data was static and did not reflect the actively analyzed claim, vehicle registration, or repair garage extracted from uploaded documents.
4. The frontend graph canvas lacked interactive node inspection and clear visual differentiation across entity types.

### Fix
1. **Neo4j Resilience**: Wrapped `execute_query` in `app/core/neo4j_client.py` with try/except error handling, ensuring offline database states gracefully return empty query sets rather than unhandled server errors.
2. **Dynamic Claim & Syndicate Grounding**: Refactored `RelationshipGraphService.get_claim_neighborhood` in `app/services/relationship_graph/graph_service.py` and `app/api/v1/graph.py` to retrieve active claim details from the database and ground the 2-hop neighborhood in the uploaded vehicle registration plate, repair garage, and claimant identity.
3. **Vis-Network Compatible Serialization**: Added `@computed_field(alias="from")` and `@computed_field(alias="to")` in `app/schemas/graph.py` to supply both standard and vis-network edge attributes.
4. **Interactive Node Inspector & Category Styling**: Upgraded `RelationshipGraphView.tsx` with high-contrast color badges, Barnes-Hut physics stabilization, an entity category legend (Claim, Claimant, Vehicle, Garage, Phone), and a clickable node inspector floating drawer.
5. **Validation**: Built frontend with Vite (`npx vite build` passed in 22.58s with 0 errors across 1,643 modules), verified Python compilation, and confirmed live HTTP 200 graph response with 7 nodes and 8 edges.

### Files Affected
- `backend/app/core/neo4j_client.py`
- `backend/app/schemas/graph.py`
- `backend/app/services/relationship_graph/graph_service.py`
- `backend/app/api/v1/graph.py`
- `frontend/src/pages/investigator/RelationshipGraphView.tsx`
- `docs/DEVELOPMENT_LOG.md`

### Rollback
`git revert HEAD`


---

## [Entry 15] — 2026-11-23 03:22 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Bug Fix — Evidence-Grounded AI Copilot UUID/Claim Number Schema Support  

### Problem
`CopilotQueryRequest` schema strictly typed `claim_id` as `UUID`. When clients or frontend components passed human-readable claim numbers (e.g., `CS-2026-68595`), FastAPI rejected the request with HTTP 422 `Input should be a valid UUID`.

### Fix
1. **Schema Polymorphism**: Changed `claim_id: Union[UUID, str]` in `app/schemas/copilot.py`.
2. **Dual-Lookup Handler**: Updated `handle_copilot_query` in `app/api/v1/copilot.py` to seamlessly resolve either UUID or string claim numbers from SQLite/PostgreSQL.
3. **Verification**: Successfully invoked `POST /api/v1/copilot/query` with claim `CS-2026-68595`. Confirmed response with 4 grounded citations, investigation recommendations, and PII masking.

### Files Affected
- `backend/app/schemas/copilot.py`
- `backend/app/api/v1/copilot.py`
- `docs/DEVELOPMENT_LOG.md`

### Rollback
`git revert HEAD`


---

## [Entry 16] — 2026-11-23 03:28 IST
**Author:** Avdhesh (Master Agent)  
**Category:** Enhancement & Bug Fix — Evidence-Grounded AI Copilot Intent Engine & Document Text Ingestion  

### Problem
1. `handle_copilot_query` in `app/api/v1/copilot.py` was passing an empty list (`document_chunks=[]`), depriving the Copilot of actual PyMuPDF OCR text and document metadata (invoice numbers, dates, plates, costs).
2. When Gemini API key was not configured, the fallback returned static placeholder text rather than analyzing the user's specific query.
3. In `CopilotChatView.tsx`, chat messages did not synchronize dynamically when the user switched claims in the queue.

### Fix
1. **Document Ingestion**: Updated `handle_copilot_query` to query the `documents` table and pass full OCR text chunks, parsed key-values, and forensic metadata to `CopilotRAGService`.
2. **Deterministic Evidence Grounding QA Engine**: Upgraded `_generate_grounded_answer` in `app/services/copilot/rag_service.py` to semantically parse query intent:
   - **Date Cross-Checks**: Compares accident date vs invoice date vs police report date with citation `RULE-002`.
   - **Vehicle Registration Audits**: Cross-references claim plate (`DL05MN5678`) against repair invoices (`DL05MN9999`) and police reports with citation `RULE-010`.
   - **Financial Discrepancies**: Compares claimed amounts against itemized workshop invoices with citation `RULE-001`.
   - **Syndicate Links**: Traces shared phone numbers (`+91-98765-00001`) and recycled garages (`Metro Speed Auto Garage`).
3. **Frontend Claim Sync**: Added `useEffect` in `CopilotChatView.tsx` keyed to `[claim.id, claim.claim_number]`, resetting the conversation context whenever a new claim is loaded.
4. **Validation**: Verified all 4 quick questions via live API tests, confirming exact evidence responses and citation arrays.

### Files Affected
- `backend/app/api/v1/copilot.py`
- `backend/app/services/copilot/rag_service.py`
- `frontend/src/pages/investigator/CopilotChatView.tsx`
- `docs/DEVELOPMENT_LOG.md`

### Rollback
`git revert HEAD`

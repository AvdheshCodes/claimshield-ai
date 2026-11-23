# InsureGuard AI — Product Requirements Document (PRD v2.0)

**Version:** 2.0  
**Project Type:** AI-Powered Insurance Fraud Detection and Investigation Platform  
**Development Environment:** Google Antigravity  
**Status:** Approved baseline for MVP development  
**Primary Data:** Synthetic insurance claims and documents  
**Primary Users:** Insurance Investigators, Administrators and Customers  

---

## 1. Product Overview

### 1.1 Product Vision
InsureGuard AI is an AI-powered insurance claims fraud detection and investigation platform designed to help insurance organizations identify suspicious claims, investigate potential fraud patterns, verify submitted documents, and provide transparent claim-processing experiences.

The platform combines document intelligence, explainable fraud detection, entity relationship analysis, generative AI and secure case management into one unified application.

The system must not automatically label a customer as fraudulent based solely on an AI prediction. Instead, it must provide evidence-backed indicators, explain its findings, assist human investigators and maintain a transparent investigation history.

### 1.2 Target Users and Roles
- **INVESTIGATOR:** Primary operational user. Reviews flagged claims, investigates related entities, inspects tampering indicators, queries AI copilot, records findings, and adjudicates.
- **ADMIN:** Manages users, fraud rules, claim categories, AI providers, and system audit logs.
- **CUSTOMER:** Submits claims, uploads documents, tracks transparent progress, answers document requests, and requests human reviews.

---

## 2. Nine Core Modules
1. **Claim Management:** Central claim lifecycle (Draft to Closed), categories (Motor, Health, Property).
2. **OCR & Document Intelligence:** Structured entity extraction (dates, amounts, policyholder, vehicle, hospital, invoice numbers) with page & coordinate citations.
3. **Document Tampering & Inconsistency Detection:** Cross-document inconsistencies, metadata analysis, image forensics (ELA, compression pattern, layout alignment).
4. **Explainable Fraud Detection ("WHY SUSPICIOUS?"):** Deterministic rule engine (0–100), statistical anomalies, evidence-backed breakdown with alternative explanations.
5. **Fraud Relationship Graph:** Neo4j entity graph (Customers, Claims, Vehicles, Hospitals, Doctors, Garages, Shared Contacts) to detect fraud rings.
6. **AI Investigation Copilot:** Grounded RAG with citations, page references, no hallucinated fraud verdicts, sensitive PII minimization.
7. **Customer Transparency Portal:** Customer-safe processing timeline, outstanding document checklist, clear non-confidential explanations, human review requests.
8. **Investigation Case Management:** Case lifecycle, investigator notes, evidence attachments, formal case reports.
9. **Privacy & Security:** PII masking (Aadhaar, phone, account), data minimization, role-based backend enforcement, audit trails.

---

## 3. Technology Architecture
- **Frontend:** React + TypeScript, Tailwind CSS, vis-network, Lucide Icons.
- **Backend:** Python + FastAPI, Pydantic, SQLAlchemy / AsyncPG, Neo4j Driver.
- **Databases:** PostgreSQL (Relational + pgvector), Neo4j (Graph), Redis (Task Queue).
- **Processing:** PyMuPDF, OpenCV, PaddleOCR / Tesseract, Gemini 1.5 Flash / Ollama.

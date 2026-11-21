# ClaimShield AI — Project Status

> Last updated: 2026-11-21
> Target deadline: 2026-11-25

---

## Status Legend
- `NOT STARTED` — Work not begun
- `IN PROGRESS` — Actively being worked on
- `BLOCKED` — Waiting on dependency or decision
- `COMPLETED` — Feature complete
- `TESTED` — Verified with passing tests

---

## Foundation (Day 1 — Nov 21)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| GitHub repository created | Avdhesh | IN PROGRESS | Manual creation needed (token scope) |
| Folder structure | Avdhesh | COMPLETED | All dirs created |
| README.md | Avdhesh | COMPLETED | |
| .gitignore | Avdhesh | COMPLETED | |
| .env.example | Avdhesh | COMPLETED | |
| docs/PROJECT_STATUS.md | Avdhesh | COMPLETED | |
| Backend package.json + scaffold | Avdhesh | NOT STARTED | |
| Frontend package.json + Vite | Ayush | NOT STARTED | |
| MongoDB connection | Avdhesh | NOT STARTED | |
| Mongoose schemas | Avdhesh | NOT STARTED | |
| API contracts document | Avdhesh | NOT STARTED | |
| GitHub issues created | Avdhesh | NOT STARTED | |
| Synthetic test documents | Manaswi | NOT STARTED | |

---

## Module 1: Authentication (Day 2 — Nov 22)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| User model | Avdhesh | NOT STARTED | |
| Register endpoint | Avdhesh | NOT STARTED | |
| Login endpoint | Avdhesh | NOT STARTED | |
| JWT middleware | Avdhesh | NOT STARTED | |
| Role-based authorization | Avdhesh | NOT STARTED | |
| DB seeder (demo accounts) | Avdhesh | NOT STARTED | |
| Login page (frontend) | Ayush | NOT STARTED | |
| Auth context + protected routes | Ayush | NOT STARTED | |

---

## Module 2: Claim Submission (Day 2 — Nov 22)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Claim model | Avdhesh | NOT STARTED | |
| POST /api/claims | Avdhesh | NOT STARTED | |
| GET /api/claims | Avdhesh | NOT STARTED | |
| GET /api/claims/:id | Avdhesh | NOT STARTED | |
| Claim submission form | Ayush | NOT STARTED | |
| Document upload component | Ayush | NOT STARTED | |

---

## Module 3: OCR & Document Intelligence (Day 3 — Nov 23)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Document model | Avdhesh | NOT STARTED | |
| Multer upload middleware | Avdhesh | NOT STARTED | |
| PDF text extraction (pdf-parse) | Manaswi | NOT STARTED | |
| Tesseract.js OCR for images | Manaswi | NOT STARTED | |
| Field extraction parser | Manaswi | NOT STARTED | |
| Structured JSON output | Manaswi | NOT STARTED | |
| POST /api/documents/:id/process | Avdhesh | NOT STARTED | |
| Extracted fields display | Ayush | NOT STARTED | |

---

## Module 4: Cross-Document Validation (Day 3 — Nov 23)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Validation rule engine | Manaswi | NOT STARTED | |
| Mismatch evidence generator | Manaswi | NOT STARTED | |
| POST /api/claims/:id/validate | Avdhesh | NOT STARTED | |
| Validation results display | Ayush | NOT STARTED | |

---

## Module 5: Duplicate Detection (Day 3 — Nov 23)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| SHA-256 file hashing | Manaswi | NOT STARTED | |
| Duplicate file detection | Manaswi | NOT STARTED | |
| Invoice number deduplication | Manaswi | NOT STARTED | |
| Submission deduplication | Manaswi | NOT STARTED | |

---

## Module 6: Explainable Risk Engine (Day 3 — Nov 23)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Risk engine service | Manaswi | NOT STARTED | |
| Rule weight configuration | Avdhesh | NOT STARTED | |
| POST /api/claims/:id/assess-risk | Avdhesh | NOT STARTED | |
| RiskAssessment model | Avdhesh | NOT STARTED | |
| Risk score display + chart | Ayush | NOT STARTED | |
| Evidence panel UI | Ayush | NOT STARTED | |

---

## Module 7: AI Investigation Assistant (Day 4 — Nov 24)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Gemini API integration | Manaswi | NOT STARTED | Requires API key |
| Prompt engineering | Manaswi | NOT STARTED | |
| InvestigationReport model | Avdhesh | NOT STARTED | |
| POST /api/claims/:id/generate-report | Avdhesh | NOT STARTED | |
| AI report display UI | Ayush | NOT STARTED | |

---

## Module 8: Claims Dashboard (Day 4 — Nov 24)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| GET /api/dashboard/summary | Avdhesh | NOT STARTED | |
| GET /api/dashboard/risk-distribution | Avdhesh | NOT STARTED | |
| Dashboard layout | Ayush | NOT STARTED | |
| Recharts risk distribution | Ayush | NOT STARTED | |
| Recent claims table | Ayush | NOT STARTED | |
| Search and filters | Ayush | NOT STARTED | |

---

## Module 9: Human Review & Audit Trail (Day 4 — Nov 24)

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| AuditLog model | Avdhesh | NOT STARTED | |
| PATCH /api/claims/:id/status | Avdhesh | NOT STARTED | |
| GET /api/claims/:id/audit-logs | Avdhesh | NOT STARTED | |
| Reviewer action buttons | Ayush | NOT STARTED | |
| Audit history timeline | Ayush | NOT STARTED | |

---

## Deliverables (Nov 25)

| Deliverable | Status | Location |
|------------|--------|----------|
| GitHub repository | IN PROGRESS | github.com/AvdheshCodes/claimshield-ai |
| Working MERN prototype | NOT STARTED | |
| Synthetic test data (3 scenarios) | NOT STARTED | sample-data/ |
| Architecture diagram | NOT STARTED | docs/architecture/ |
| PPT (16 Visionet points) | NOT STARTED | docs/presentation/ |
| PDF version of PPT | NOT STARTED | docs/presentation/ |
| Demo video / script | NOT STARTED | docs/demo/ |
| API documentation | NOT STARTED | docs/architecture/ |
| Test report | NOT STARTED | docs/testing/ |
| Team contribution doc | NOT STARTED | docs/ |

---

## Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| GitHub token needs `repo` scope | Cannot auto-create repo | Manual creation at github.com/new |
| Gemini API key not configured | Module 7 blocked | Add to .env after key obtained |

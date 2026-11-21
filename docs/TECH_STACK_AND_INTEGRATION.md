# InsureGuard AI — Final Tech Stack & Team Integration Guide

**Document Version:** 3.0  
**Target:** Enable 3 Developers to Build Features Individually and Integrate Without Conflicts  
**Team Allocation:**
- **Avdhesh:** Backend Architecture, PostgreSQL, Neo4j, Security & REST APIs
- **Ayush:** Frontend Tri-Portal, Tailwind CSS, Vis-Network Graph & User Experience
- **Manaswi:** Document Forensics, Explainable Fraud Engine, AI Copilot & Privacy

---

## 1. Definitive Technology Stack

| Layer | Technology | Version | Purpose / Rationale |
|---|---|---|---|
| **Frontend Framework** | React + TypeScript | 18.3+ / 5.6+ | Type safety across teams; enterprise standard |
| **Frontend Build Tool** | Vite | 5.4+ | Instant HMR development server |
| **Frontend Styling** | Tailwind CSS | 3.4+ | Rapid utility styling with zero CSS naming collisions |
| **Network Visualization**| `vis-network` | 9.1+ | High-performance interactive 2D graph rendering |
| **Backend Framework** | Python + FastAPI | 3.11+ / 0.111+ | High-performance async API with automated OpenAPI docs |
| **Relational Database** | PostgreSQL + `pgvector` | 16 | ACID transactions, JSONB document storage, vector search |
| **Graph Database** | Neo4j Community | 5.19+ | Native graph traversal for multi-claim fraud syndicates |
| **Task Queue / Cache** | Redis | 7.0+ | Asynchronous OCR and heavy document processing queue |
| **Document Processing** | PyMuPDF (`fitz`) | 1.24+ | Lightning-fast PDF text extraction and metadata inspection |
| **Image Forensics** | OpenCV & Pillow | 4.10+ / 10.3+ | Error Level Analysis (ELA) and compression inspection |
| **AI / LLM Engine** | Google Gemini 1.5 Flash | SDK 0.7+ | Free-tier available, fast grounded RAG, multimodal support |
| **Local LLM Fallback** | Ollama / Template Fallback| - | Offline/local execution when API keys are absent |
| **Containerization** | Docker & Docker Compose | 3.8+ | Zero-drift local environment reproduction |

---

## 2. Module Boundaries & Team Assignment Matrix

```
                    ┌────────────────────────────────────────────────────────┐
                    │               INSUREGUARD AI PLATFORM                  │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             │                                 │                                 │
     [AVDHESH - BACKEND]               [AYUSH - FRONTEND]            [MANASWI - AI/FORENSICS]
  • FastAPI Router Gateway          • Tri-Portal Shell (App.tsx)   • ELA & Metadata Forensics
  • PostgreSQL SQLAlchemy Models    • Investigator Dashboard       • 10-Rule Fraud Engine
  • Neo4j Graph Queries             • 'Why Suspicious?' UI         • Grounded RAG Copilot
  • JWT RBAC Authorization          • Vis-Network Graph UI         • PII Masking Engine
  • Asynchronous Task Workers       • Customer Transparency View   • Synthetic Test Scenarios
```

---

## 3. Clear Integration Contracts

### Contract 1: Why Suspicious Engine Contract
- **Function Signature:**
  ```python
  ExplainableFraudEngine.evaluate(
      claim_data: dict,
      extracted_docs: list[dict],
      historical_duplicates: dict
  ) -> tuple[int, str, list[dict]]
  ```
- **Returns:** `(risk_score, risk_band, findings)`
- **Finding Fields Required:**
  `rule_id`, `rule_name`, `severity`, `points`, `observation`, `evidence_document_id`, `evidence_page_number`, `evidence_snippet`, `potential_alternative_explanation`, `recommended_action`, `investigator_feedback`.

### Contract 2: Relationship Graph Contract
- **Endpoint:** `GET /api/v1/claims/{claim_id}/graph`
- **Output JSON Schema:**
  ```typescript
  interface GraphResponse {
    nodes: Array<{ id: string; label: string; name: string; group: string; properties?: any }>;
    edges: Array<{ from_node: string; to_node: string; label: string; properties?: any }>;
    suspicious_clusters_detected: number;
    summary?: string;
  }
  ```

### Contract 3: AI Copilot RAG Contract
- **Endpoint:** `POST /api/v1/copilot/chat`
- **Input:** `{ claim_id: UUID, question: string }`
- **Output:**
  ```typescript
  interface CopilotResponse {
    answer: string;
    citations: Array<{ document_type?: string; page_number?: number; source_reference?: string; snippet?: string }>;
    investigation_suggestions: string[];
    disclaimer: string;
  }
  ```

### Contract 4: PII Masking Contract
- **Function:** `PIIMasker.sanitize_for_external_ai(data: dict) -> dict`
- **Guarantees:** Strips/masks Aadhaar (`XXXX-XXXX-1234`), Phone (`+91-XXXXX-XX123`), Email (`r***@demo.com`), and Bank Accounts before sending to any LLM.

---

## 4. Local Execution & Testing Commands

### Backend (Python FastAPI):
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: **`http://localhost:8000/docs`**

### Frontend (React + TypeScript):
```bash
cd frontend
npm install
npm run dev
```
- Frontend Application: **`http://localhost:3000`**

### Complete Docker Stack:
```bash
docker compose up -d
```
Starts PostgreSQL (5432), Neo4j (7474/7687), Redis (6379), Backend (8000), and Frontend (3000).

---

## 5. Team Git Workflow for Clean Integration

To ensure teammates can work simultaneously without breaking each other's code:

1. **Branch Naming Standard:**
   - Avdhesh: `feature/avdhesh-backend-api`
   - Ayush: `feature/ayush-frontend-ui`
   - Manaswi: `feature/manaswi-ai-forensics`

2. **Always pull from `development` before starting:**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/my-feature-name
   ```

3. **Commit often with descriptive prefixes:**
   - `feat(...)`: New feature implementation
   - `fix(...)`: Bug fix
   - `docs(...)`: Documentation updates

4. **Merge through Pull Request (PR):**
   - Open a PR from your feature branch to `development`.
   - Ensure the DoD criteria from `FINAL_PRD.md` are met before merging.

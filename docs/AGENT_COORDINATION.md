# InsureGuard AI — Multi-Agent Coordination Protocol

> **Architecture:** Master Agent Orchestrator with Domain-Specific Subagents  
> **Master Agent:** Antigravity Senior Technical Lead & Project Architect  
> **Tracker:** `docs/DEVELOPMENT_LOG.md`  

---

## 1. Agent Hierarchy & Roles

```
                         ┌───────────────────────────────────────┐
                         │             MASTER AGENT              │
                         │    (Antigravity Lead Orchestrator)    │
                         │  - Overall System Architecture        │
                         │  - Cross-Agent Quality Assurance      │
                         │  - Codebase Integration & Git Master  │
                         │  - Immutable Development Log Tracker  │
                         └──────────────────┬────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
┌───────▼───────────────┐   ┌───────────────▼───────────────┐   ┌───────────────▼───────────────┐
│   BACKEND LEAD        │   │        FRONTEND LEAD          │   │   AI & FORENSICS LEAD         │
│  (backend-specialist) │   │     (frontend-specialist)     │   │ (ai-forensics-specialist)     │
│                       │   │                               │   │                               │
│ · FastAPI Application │   │ · React 18 + TypeScript       │   │ · PyMuPDF & PaddleOCR         │
│ · PostgreSQL + Vector │   │ · Tri-Portal Architecture     │   │ · Image Forensics (ELA/Comp)  │
│ · Neo4j Graph Schemas │   │ · Vis-Network Graph View      │   │ · Explainable Rule Engine     │
│ · RBAC & Auth Core    │   │ · "Why Suspicious?" UI        │   │ · Grounded RAG Copilot        │
│ · Asynchronous Tasks  │   │ · AI Copilot Interface        │   │ · PII Masking & Privacy       │
└───────────────────────┘   └───────────────────────────────┘   └───────────────────────────────┘
```

---

## 2. Communication & Reporting Rules

1. **Strict Upward Reporting:**
   - Every subagent reports completed tasks, schema definitions, and blockers directly to the Master Agent.
   - Subagents do NOT make uncoordinated cross-cutting architectural changes without Master Agent review.

2. **Immutable Audit Trail (`docs/DEVELOPMENT_LOG.md`):**
   - Every file creation, modification, refactor, or rollback MUST be appended to `docs/DEVELOPMENT_LOG.md` with:
     - ISO timestamp
     - Agent identifier
     - Action category (`ADDITION`, `MODIFICATION`, `REVERSION`, `REFACTOR`)
     - Affected file paths
     - Technical rationale
     - Specific rollback command or procedure

3. **Inter-Module Contract Adherence:**
   - The Backend Lead and AI Lead MUST agree on JSON schemas before APIs are connected to the Frontend.
   - All REST APIs follow the contracts specified in `docs/API_CONTRACTS.md`.
   - All database entities follow `docs/DATABASE_SCHEMA.md`.

4. **Rollback & Reversion Safety:**
   - If an experimental subagent implementation breaks existing functionality or fails validation criteria, the Master Agent issues a formal reversion instruction, documents it in the log, and reverts to the last known working git commit.

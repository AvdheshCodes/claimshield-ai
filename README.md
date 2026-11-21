# ClaimShield AI

> **Intelligent Insurance Claims Processing and Explainable Fraud Detection**

ClaimShield AI is an AI-assisted motor insurance claims processing and fraud-risk assessment platform. It processes claim documents using OCR, compares information across documents, detects duplicate submissions and suspicious inconsistencies, calculates an explainable risk score, and generates AI-assisted investigation summaries.

**Central differentiator:** We don't just detect suspicious insurance claims — we explain *why* they are suspicious and show the supporting evidence.

---

## Team

| Member | Role |
|--------|------|
| Avdhesh Ghansela | Backend Engineering, Architecture & Integration Lead |
| Ayush | Frontend Engineering & Product Experience |
| Manaswi | AI Engineering & Document Intelligence |

---

## Project Structure

```
claimshield-ai/
├── client/              # React.js frontend (Tailwind CSS, Recharts)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── context/     # Auth and app context
│   │   ├── services/    # Axios API service layer
│   │   └── utils/       # Helper utilities
│   └── public/
│
├── server/              # Node.js / Express.js backend
│   └── src/
│       ├── config/      # DB, env, multer config
│       ├── controllers/ # Route handlers
│       ├── middleware/  # Auth, validation, error handling
│       ├── models/      # Mongoose schemas
│       ├── routes/      # Express routers
│       ├── services/    # OCR, risk engine, AI, duplicate detection
│       └── utils/       # Helpers, logger
│
├── docs/
│   ├── architecture/    # Architecture diagrams
│   ├── presentation/    # Visionet PPT and PDF
│   ├── demo/            # Demo video and scripts
│   └── testing/         # Test reports and scenarios
│
├── sample-data/
│   ├── documents/       # Synthetic claim documents (PDF/image)
│   └── claims/          # Sample claim JSON payloads
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Core Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Authentication | JWT-based login, role-based access (Applicant / Officer / Admin) |
| 2 | Claim Submission | Structured claim form + multi-document upload |
| 3 | OCR & Document Intelligence | Text extraction from PDF and images, structured field parsing |
| 4 | Cross-Document Validation | Field comparison across documents with evidence |
| 5 | Duplicate Detection | SHA-256 file hashing + invoice/submission deduplication |
| 6 | Explainable Risk Engine | Deterministic rule-based risk score (0–100) with evidence |
| 7 | AI Investigation Assistant | Gemini-powered investigation summary from structured findings |
| 8 | Claims Officer Dashboard | Real-time metrics, risk distribution, search & filters |
| 9 | Human Review & Audit Trail | Approve / Reject / Investigate with full history |

---

## Technology Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- Axios
- React Router v6
- Recharts
- Lucide React

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Multer (file upload)
- JWT (authentication)
- Bcrypt (password hashing)
- Sharp / pdf-parse (document processing)
- Tesseract.js (OCR)

### AI & Intelligence
- Google Gemini API (investigation summaries)
- SHA-256 hashing (duplicate detection)
- Deterministic rule engine (risk scoring)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key

### Backend Setup

```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your values
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

See `.env.example` for all required variables.

---

## API Documentation

See `docs/architecture/API_CONTRACTS.md` for complete endpoint reference.

---

## Risk Score Categories

| Score | Category | Action |
|-------|----------|--------|
| 0–24 | 🟢 Low Risk | Routine processing |
| 25–49 | 🟡 Standard Review | Standard officer review |
| 50–74 | 🟠 Enhanced Review | Detailed investigation |
| 75–100 | 🔴 High Priority | Immediate investigation |

> These are demonstration thresholds, not validated fraud probability scores.

---

## Important Disclaimer

ClaimShield AI is a **decision-support platform**. It does not make autonomous fraud verdicts or approve/reject claims. All decisions require a qualified claims officer review.

---

## Visionet Techthon 2026 — Round 2

Event: Visionet Techthon 2026
Category: AI Engineering / Data Intelligence / BFSI
Deadline: November 25, 2026

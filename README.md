# AI-102 Command Center

A full-stack learning hub and hands-on lab for the **Microsoft AI-102 AI Engineer Associate** exam.

## What Is This?

A single web application that serves as:

1. **Learning Hub** — Dashboard with study resources, progress tracking, and exam topic mapping
2. **Hands-On Lab** — Every exam domain becomes a working module using real Azure/Microsoft Foundry services
3. **Study Companion** — RAG-powered quiz and concept explainer built on the same AI services you're learning

Building the app IS the studying. Every feature implements skills the exam tests.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js Frontend                │
│     (project root, built with v0.app)        │
│   src/app/        → Pages per module         │
│   src/components/ → shadcn/ui + v0 output    │
│   src/lib/        → API client, utilities    │
└──────────────────┬──────────────────────────┘
                   │ REST API (:3000 → :8000)
┌──────────────────▼──────────────────────────┐
│            Python FastAPI Backend             │
│              (in /backend)                   │
│   app/routers/   → One router per module     │
│   app/services/  → Azure SDK wrappers        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Microsoft Foundry (Azure)            │
│   OpenAI · Vision · Speech · Translator      │
│   AI Search · Document Intelligence          │
│   Content Safety · Agent Service             │
└─────────────────────────────────────────────┘
```

## Lab Modules

| # | Module | Exam Domain | Weight | Route |
|---|--------|-------------|--------|-------|
| 1 | Foundry Hub | D1: Plan & manage | 20-25% | `/foundry` |
| 2 | GenAI Lab | D2: Generative AI | 15-20% | `/generative` |
| 3 | RAG Engine | D2+D6: RAG + Search | 15-20% | `/rag` |
| 4 | Agent Workshop | D3: Agentic solutions | 5-10% | `/agents` |
| 5 | Vision Lab | D4: Computer vision | 10-15% | `/vision` |
| 6 | Language & Speech | D5: NLP | 15-20% | `/language` |
| 7 | Knowledge Mining | D6: Search + Docs | 15-20% | `/search` |
| 8 | Responsible AI | D1: Cross-cutting | — | `/responsible-ai` |

## Setup

### Frontend (Next.js)

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Fill in your Azure keys
uvicorn app.main:app --reload --port 8000
```

### Azure Resources Needed

See `backend/.env.example` for all required credentials. You'll provision these as you build each module — no need to set up everything upfront.

## Development Workflow

This project uses two AI tools that both connect to this GitHub repo:

| Tool | What It Does | What It Touches |
|------|-------------|-----------------|
| **v0 (v0.app)** | Designs and builds all frontend UI | `src/`, `package.json`, `components.json` |
| **Claude Code** | Backend, Azure SDK code, API wiring, docs | `backend/`, `docs/`, `src/lib/api.ts` |

### How v0 Works With This Repo

1. v0.app is connected to this GitHub repository
2. Each v0 chat session creates a branch (e.g., `v0/main-abc123`)
3. Every UI change in v0 = automatic commit on that branch
4. When satisfied → "Open PR" → merge to main
5. Start new v0 chat for the next feature

### How Claude Code Works With This Repo

1. Clone/pull locally
2. Write backend and wiring code
3. Commit and push when instructed

The two tools don't conflict because v0 handles `src/` (frontend) and Claude Code handles `backend/` and `docs/`.

## Project Structure

```
AI-102-complete/                ← repo root = Next.js root
├── src/
│   ├── app/                    # Pages (one dir per module)
│   ├── components/             # UI components (shadcn/ui + v0)
│   └── lib/                    # API client, utilities
├── backend/                    # Python FastAPI
│   ├── app/main.py             # App entry + CORS
│   ├── app/config.py           # Azure credentials (.env)
│   ├── app/routers/            # API route handlers
│   └── app/services/           # Azure SDK integration
├── docs/
│   └── exam-topics.md          # Complete exam objectives + study links
├── data/                       # Sample files for labs
├── CLAUDE.md                   # Detailed AI assistant context
└── README.md                   # This file
```

**Why Next.js is at root:** v0.app requires `package.json` at the repository root to properly import and run the project in its sandbox.

## Study Reference

See `docs/exam-topics.md` for the complete AI-102 exam objectives (6 domains, all subtopics), domain weights, platform naming transition guide, and curated MS Learn links.

## Exam Info

- **Exam:** AI-102 — Designing and Implementing a Microsoft Azure AI Solution
- **Last updated:** December 23, 2025
- **Passing score:** 700/1000
- **Duration:** 100 minutes
- **Current terminology:** "Microsoft Foundry" (formerly Azure AI Foundry, formerly Azure AI Services)

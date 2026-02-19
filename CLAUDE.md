# CLAUDE.md — AI-102 Command Center

This file is the authoritative reference for any AI assistant (Claude Code, Copilot, etc.) working on this project. Keep it up to date as the project evolves.

---

## Project Overview

**AI-102 Command Center** is a full-stack learning hub and hands-on lab for the Microsoft AI-102 AI Engineer Associate exam. It combines a study resource dashboard with 8 working lab modules that implement real Azure/Microsoft Foundry AI services.

**Core idea:** Building the app IS the studying. Every feature implements skills the exam tests.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   USER BROWSER                   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         FRONTEND (Next.js at project root)       │
│   Tech: Next.js 14+ App Router, TypeScript,      │
│         shadcn/ui, Tailwind CSS                  │
│   Built with: Vercel v0 (v0.app)                 │
│   Port: 3000                                     │
│                                                  │
│   src/app/          → Pages (App Router)         │
│   src/components/   → UI components              │
│   src/lib/          → Utilities, API client       │
└────────────────────┬────────────────────────────┘
                     │ HTTP REST (fetch to :8000)
┌────────────────────▼────────────────────────────┐
│         BACKEND (Python FastAPI)                  │
│   Location: /backend                             │
│   Port: 8000                                     │
│                                                  │
│   app/main.py       → FastAPI app, CORS          │
│   app/config.py     → Pydantic settings (.env)   │
│   app/routers/      → One router per module      │
│   app/services/     → Azure SDK wrappers         │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         MICROSOFT FOUNDRY (Azure Cloud)          │
│                                                  │
│   Foundry Models: Azure OpenAI (GPT, DALL-E,    │
│                   embeddings)                    │
│   Foundry Tools:  Vision, Speech, Translator,    │
│                   Document Intelligence,         │
│                   Content Understanding          │
│   Foundry Agent Service                          │
│   Azure AI Search                                │
│   Azure Content Safety                           │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
AI-102-complete/              ← Git repo root = Next.js project root
│
│  # --- Next.js Frontend (at root for v0 compatibility) ---
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Dashboard home
│   │   ├── foundry/          # Module 1: Foundry Hub
│   │   ├── generative/       # Module 2: GenAI Lab
│   │   ├── rag/              # Module 3: RAG Engine
│   │   ├── agents/           # Module 4: Agent Workshop
│   │   ├── vision/           # Module 5: Vision Lab
│   │   ├── language/         # Module 6: Language & Speech
│   │   ├── search/           # Module 7: Knowledge Mining
│   │   ├── responsible-ai/   # Module 8: Responsible AI
│   │   ├── resources/        # Study resources page
│   │   └── progress/         # Progress tracking page
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   └── (module-specific) # Components for each module
│   └── lib/
│       ├── utils.ts          # shadcn/ui utility (cn function)
│       └── api.ts            # API client for backend (to be created)
│
├── package.json              # Next.js dependencies
├── tsconfig.json             # TypeScript config
├── components.json           # shadcn/ui config
├── next.config.ts            # Next.js config
├── postcss.config.mjs        # PostCSS/Tailwind config
├── eslint.config.mjs         # ESLint config
├── public/                   # Static assets
│
│  # --- Python Backend ---
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry, CORS config
│   │   ├── config.py         # Settings from .env (Azure keys)
│   │   ├── routers/          # API route handlers
│   │   │   ├── generative.py # /api/generative
│   │   │   ├── agents.py     # /api/agents
│   │   │   ├── vision.py     # /api/vision
│   │   │   ├── language.py   # /api/language
│   │   │   ├── search.py     # /api/search
│   │   │   ├── documents.py  # /api/documents
│   │   │   └── safety.py     # /api/safety
│   │   └── services/         # Azure SDK integration layer
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Template for Azure credentials
│   └── .env                  # Actual credentials (gitignored)
│
│  # --- Documentation ---
├── docs/
│   └── exam-topics.md        # Complete AI-102 exam objectives, weights, links
│
│  # --- Sample Data for Labs ---
├── data/
│   ├── images/               # Test images for Vision Lab
│   ├── documents/            # PDFs/invoices for Document Intelligence
│   └── audio/                # Audio files for Speech module
│
├── CLAUDE.md                 # THIS FILE — project context for AI assistants
├── README.md                 # Human-readable project overview
└── .gitignore
```

**Why Next.js is at the root (not in /frontend):** Vercel v0 requires package.json and Next.js config at the repo root to properly import and work with the project. The backend lives in /backend as a separate Python project.

---

## Lab Modules and Exam Mapping

| # | Module | Route | Backend Router | Exam Domain | Weight |
|---|--------|-------|---------------|-------------|--------|
| 1 | Foundry Hub | `/foundry` | (frontend-only + docs) | D1: Plan & manage | 20-25% |
| 2 | GenAI Lab | `/generative` | `/api/generative` | D2: Generative AI | 15-20% |
| 3 | RAG Engine | `/rag` | `/api/search` + `/api/generative` | D2+D6 | 15-20% |
| 4 | Agent Workshop | `/agents` | `/api/agents` | D3: Agentic solutions | 5-10% |
| 5 | Vision Lab | `/vision` | `/api/vision` | D4: Computer vision | 10-15% |
| 6 | Language & Speech | `/language` | `/api/language` | D5: NLP | 15-20% |
| 7 | Knowledge Mining | `/search` | `/api/search` + `/api/documents` | D6: Search + Docs | 15-20% |
| 8 | Responsible AI | `/responsible-ai` | `/api/safety` | D1: Cross-cutting | — |

Additional pages: `/resources` (study links), `/progress` (progress tracker).

---

## Development Workflow

### Two Tools, One Repo

This project is developed using two tools that both connect to the same GitHub repository:

| Tool | Responsibility | What It Touches |
|------|---------------|-----------------|
| **Vercel v0 (v0.app)** | All frontend UI design and implementation | `src/`, `components.json`, `package.json` |
| **Claude Code (local)** | Backend, API wiring, docs, Azure SDK code | `backend/`, `docs/`, `src/lib/api.ts`, `CLAUDE.md`, `README.md` |

### v0 Workflow (creates branches + PRs on GitHub)

1. User opens project in v0.app (connected to this GitHub repo)
2. Each v0 chat session creates a dedicated branch (e.g., `v0/main-abc123`)
3. Every prompt that changes code = automatic commit on that branch
4. When satisfied → "Open PR" → review and merge to main
5. After merge, start new chat for next feature (each chat = one branch)

### Claude Code Workflow (local development)

1. Pull latest main
2. Write backend code, API wiring, docs
3. User commits and pushes when ready

### Wiring Workflow (connecting frontend to backend)

1. v0 builds UI pages with **mock/placeholder data** (hardcoded)
2. Claude Code builds backend API routes with real Azure SDK calls
3. Claude Code creates `src/lib/api.ts` — typed API client
4. Claude Code replaces mock data with real API calls in v0-generated components

---

## Vercel v0 Reference (Current as of Feb 2026)

**IMPORTANT: Most AI training data has outdated v0 information. This section reflects the actual current state.**

### What v0 Is Now

- **URL:** v0.app (not v0.dev — rebranded August 2025)
- **What it does:** AI agent that builds full-stack apps. It plans, researches, builds, and debugs autonomously. Not just a component generator anymore.
- **Tagline:** "Build Agents, Apps, and Websites with AI"
- **Core stack:** Next.js + React + TypeScript + shadcn/ui + Tailwind CSS

### v0 GitHub Integration

- v0 connects to a GitHub repo via the Vercel GitHub App
- It runs your project in a real VM sandbox (Vercel Sandbox) — actual `npm run dev`, real dependencies
- **Never pushes directly to main** — always creates feature branches
- Branch naming: `v0/main-{hash}` (one branch per chat session)
- Every code-changing prompt = automatic commit on the branch
- "Open PR" button creates a pull request from the branch to main
- After merging a PR, you must start a new chat (new branch) for further work

### v0 Limitations to Know

- **Monorepo support is officially documented but buggy** — v0 may not properly handle subdirectory roots. This is why our Next.js is at repo root, not in /frontend.
- One branch per chat session — cannot continue on same branch after merge
- v0 is trained on default shadcn/ui — may struggle with heavily customized components
- Free tier: $5/month in credits (limited). Premium: $20/month.
- 128k context window, 32k max output per response

### What v0 Can and Cannot Do

**Can do:**
- Generate full pages, layouts, individual components
- Understand your existing codebase when connected via GitHub
- Create API routes (Next.js API routes)
- Generate fetch calls to external APIs if you describe the API shape
- Iterate conversationally ("make the sidebar darker", "add a loading state")

**Cannot do:**
- Write Python code (not its strength)
- Directly call Azure SDKs
- Understand the FastAPI backend structure
- Auto-wire frontend to a separate backend without explicit instructions

### CLI Alternative

```bash
npx v0 add [component-id]
```
Can be used to selectively pull individual v0-generated components into the project without full GitHub integration.

---

## Backend Conventions

### API Route Pattern

All backend routes follow this pattern:
- Prefix: `/api/{module}` (e.g., `/api/vision`, `/api/generative`)
- Each module has its own router file in `backend/app/routers/`
- Azure SDK logic lives in `backend/app/services/` (not in routers)
- Routers handle HTTP concerns; services handle Azure API calls

### Configuration

- All Azure credentials are in `backend/.env` (gitignored)
- Loaded via Pydantic Settings in `backend/app/config.py`
- Template: `backend/.env.example`
- Import settings: `from app.config import settings`

### Running the Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### CORS

The FastAPI app allows requests from `http://localhost:3000` (Next.js dev server).

---

## Frontend Conventions

### Running the Frontend

```bash
npm run dev
# Runs at http://localhost:3000
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `src/components/ui/`.

### Page Structure (App Router)

Each module gets a directory under `src/app/`:
```
src/app/vision/
  └── page.tsx        # Main page for the module
```

### API Client

`src/lib/api.ts` (to be created) will export typed functions for calling the backend:
```typescript
// Example shape:
export async function analyzeImage(file: File): Promise<VisionResult> { ... }
export async function chat(messages: Message[]): Promise<ChatResponse> { ... }
```

---

## Microsoft Foundry / Azure Naming Reference

The AI-102 exam (updated Dec 2025) uses "Microsoft Foundry" terminology. But SDKs, older docs, and portal URLs still use older names. This mapping is critical:

| Current Name (Exam) | SDK Package Name | What It Is |
|---------------------|-----------------|-----------|
| Microsoft Foundry | (platform umbrella) | The unified AI platform |
| Azure OpenAI in Foundry Models | `openai` (with Azure config) | GPT, DALL-E, embeddings |
| Azure Vision in Foundry Tools | `azure-cognitiveservices-vision-computervision` | Image analysis, OCR |
| Azure Speech in Foundry Tools | `azure-cognitiveservices-speech` | STT, TTS |
| Azure Translator in Foundry Tools | (REST API) | Text/document translation |
| Document Intelligence in Foundry Tools | `azure-ai-formrecognizer` | Document extraction |
| Content Understanding in Foundry Tools | (new, REST API) | Multimodal content processing |
| Azure AI Search | `azure-search-documents` | Indexing, vector/semantic search |
| Azure AI Content Safety | `azure-ai-contentsafety` | Content moderation |
| Foundry Agent Service | `azure-ai-projects` | AI agent creation |

Note: SDK package names still use older naming conventions. This is expected and correct.

---

## Important Rules

- **Never commit .env files** — Azure keys must stay out of git
- **Never auto-commit or auto-push** — wait for explicit user instruction
- **Frontend UI is built by v0** — Claude Code should not design/write UI components from scratch. Claude Code CAN modify v0-generated components to wire up API calls.
- **Backend is built by Claude Code** — v0 does not touch Python files
- **Prefer editing existing files** over creating new ones
- **Keep docs in existing files** — don't create new doc files when content fits in README.md, CLAUDE.md, or docs/exam-topics.md
- **The exam-topics.md is the study reference** — keep it accurate and up to date with any exam changes

---

## Running Both Frontend and Backend

Terminal 1 (frontend):
```bash
npm run dev
```

Terminal 2 (backend):
```bash
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

Frontend at http://localhost:3000, backend at http://localhost:8000, backend docs at http://localhost:8000/docs (Swagger UI).

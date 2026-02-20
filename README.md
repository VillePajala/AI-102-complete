# AI-102 Command Center

A hands-on lab for the **Microsoft AI-102 AI Engineer Associate** exam. You implement real Azure AI services — chat completion, image generation, computer vision, NLP, search, content safety — by writing Python code layer by layer, with a web UI as your test harness.

Building the app IS the studying. Every function you implement maps to a skill the exam tests.

## Getting Started

1. **Clone this repo**
   ```bash
   git clone https://github.com/VillePajala/AI-102-complete.git
   cd AI-102-complete
   ```

2. **Follow the setup guide** — **[docs/labs/README.md](docs/labs/README.md)** has everything: tool installation, Azure resource provisioning, environment variables, and server startup.

3. **Start Lab 01** — **[docs/labs/01-genai.md](docs/labs/01-genai.md)** is the first lab. Each lab ends with a link to the next one.

That's it. The setup guide walks you through every step.

## How It Works

The frontend (Next.js) and the API layer (FastAPI routers) are already built. The **service files** in `backend/app/services/` are stubs — every function raises `NotImplementedError`.

You follow the [lab guides](docs/labs/README.md) to implement each function. Each lab is split into **layers** — small, focused steps. After each layer, you test your work in the browser and see real results instead of errors.

```
┌─────────────────────────────────────────────┐
│              Next.js Frontend                │
│   Already built — your visual test harness   │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│            Python FastAPI Backend             │
│   Routers: wired up    Services: YOU BUILD   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Microsoft Foundry (Azure)            │
│   OpenAI · Vision · Speech · Translator      │
│   AI Search · Content Safety · Agents        │
└─────────────────────────────────────────────┘
```

## Labs

7 labs, 26 layers total. You create Azure resources as you go — no need to set up everything upfront.

| # | Lab | What You Build | Exam Domain | Weight |
|---|-----|---------------|-------------|--------|
| 01 | [GenAI Lab](docs/labs/01-genai.md) | Chat completion, parameter tuning, DALL-E | D2: Generative AI | 15-20% |
| 02 | [RAG Engine](docs/labs/02-rag.md) | Document upload, search, grounded chat | D2+D6: RAG + Search | 15-20% |
| 03 | [Knowledge Mining](docs/labs/03-knowledge-mining.md) | Index management, skillsets, query syntax | D6: Search + Docs | 15-20% |
| 04 | [Vision Lab](docs/labs/04-vision.md) | Image analysis, object detection, OCR | D4: Computer vision | 10-15% |
| 05 | [Language & Speech](docs/labs/05-language.md) | Sentiment, entities, translation, STT/TTS | D5: NLP | 15-20% |
| 06 | [Agent Workshop](docs/labs/06-agents.md) | System instructions, tool calls, grounding | D3: Agentic solutions | 5-10% |
| 07 | [Responsible AI](docs/labs/07-responsible-ai.md) | Content safety, severity levels, prompt shield | D1: Plan & manage | 20-25% |

**Recommended order:** 01 → 02 → 03 → 04 → 05 → 06 → 07. Labs 04, 05, and 07 are independent and can be done anytime.

## Project Structure

```
AI-102-complete/
├── docs/
│   ├── labs/                  # Lab guides — START HERE
│   │   ├── README.md          # Setup guide + lab index
│   │   ├── 01-genai.md        # Lab 01: GenAI Lab
│   │   ├── 02-rag.md          # Lab 02: RAG Engine
│   │   ├── 03-knowledge-mining.md
│   │   ├── 04-vision.md       # Lab 04: Vision Lab
│   │   ├── 05-language.md     # Lab 05: Language & Speech
│   │   ├── 06-agents.md       # Lab 06: Agent Workshop
│   │   └── 07-responsible-ai.md
│   └── exam-topics.md         # Complete AI-102 exam objectives + study links
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app (already configured)
│   │   ├── config.py          # Loads Azure credentials from .env
│   │   ├── routers/           # API routes (already wired up)
│   │   └── services/          # Azure SDK code (YOU IMPLEMENT THESE)
│   ├── requirements.txt
│   ├── .env.example           # Template for Azure credentials
│   └── .env                   # Your credentials (gitignored)
├── src/                       # Next.js frontend (already built)
│   ├── app/                   # Pages — one per lab module
│   ├── components/            # UI components
│   └── lib/                   # Utilities
└── data/                      # Sample images, documents, audio for labs
```

## Study Reference

See [`docs/exam-topics.md`](docs/exam-topics.md) for the complete AI-102 exam objectives (6 domains, all subtopics), domain weights, platform naming transition guide, and curated MS Learn links.

## Exam Info

- **Exam:** AI-102 — Designing and Implementing a Microsoft Azure AI Solution
- **Last updated:** December 23, 2025
- **Passing score:** 700/1000
- **Duration:** 100 minutes
- **Current terminology:** "Microsoft Foundry" (formerly Azure AI Foundry, formerly Azure AI Services)

---

## For Contributors

This section is for people contributing to the project itself, not for learners following the labs.

### Development Workflow

The project is built using two AI tools connected to this GitHub repo:

| Tool | Responsibility | What It Touches |
|------|---------------|-----------------|
| **v0 (v0.app)** | Frontend UI design and implementation | `src/`, `package.json`, `components.json` |
| **Claude Code** | Backend, API wiring, docs, Azure SDK code | `backend/`, `docs/`, `src/lib/api.ts` |

**v0 workflow:** v0.app connects to the repo → creates branches (`v0/main-*`) → auto-commits → opens PRs. Never pushes directly to main.

**Claude Code workflow:** Local development → commits and pushes when instructed.

The two tools don't conflict because v0 handles `src/` (frontend) and Claude Code handles `backend/` and `docs/`.

**Why Next.js is at the repo root** (not in `/frontend`): v0.app requires `package.json` at the repository root to properly import the project.

### Roadmap

**Phase 1: Foundation** — Project scaffold, exam docs, CI/CD, frontend UI, lab guide system

**Phase 2: Core Modules** — GenAI Lab, RAG Engine, Knowledge Mining

**Phase 3: Specialized Modules** — Vision Lab, Language & Speech, Agent Workshop

**Phase 4: Governance** — Responsible AI, Foundry Hub

**Phase 5: Study Features** — Progress tracking, quiz mode, flashcards

**Phase 6: Shareability** — BYOK settings page, demo mode, Docker Compose, deployment

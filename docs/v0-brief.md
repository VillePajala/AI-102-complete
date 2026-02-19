# AI-102 Command Center — Frontend Brief for v0

## What This Project Is

This is a learning application called "AI-102 Command Center" for preparing for the Microsoft AI-102 AI Engineer Associate certification exam. It serves three purposes:

1. A **dashboard** that tracks study progress across 6 exam domains
2. A **hands-on lab** with 8 interactive modules — each module lets the user experiment with a different Azure AI service (computer vision, speech, chat AI, document analysis, etc.)
3. A **resource hub** with study materials, links, and notes

The app has a Next.js frontend (this project) and a separate Python FastAPI backend running on port 8000. The frontend calls the backend via REST API at `http://localhost:8000/api/{module}`. The backend handles all AI service calls and returns JSON results.

---

## Overall UI Structure

The app needs a persistent **sidebar navigation** and a **main content area**. The sidebar should contain:

**Lab Modules section (8 items):**
- Foundry Hub — Azure resource management and planning (Exam Domain 1, 20-25% weight)
- GenAI Lab — Chat with AI models, prompt engineering, image generation (Domain 2, 15-20%)
- RAG Engine — Upload documents, search them, ask questions grounded in your data (Domain 2+6, 15-20%)
- Agent Workshop — Build and test AI agents (Domain 3, 5-10%)
- Vision Lab — Analyze images, OCR, object detection, custom classifiers (Domain 4, 10-15%)
- Language & Speech — Text analysis, translation, speech-to-text, text-to-speech (Domain 5, 15-20%)
- Knowledge Mining — Search indexes, document extraction, skillsets (Domain 6, 15-20%)
- Responsible AI — Content moderation, safety filters, prompt shields (Domain 1, cross-cutting)

**Study section (2 items):**
- Resources — Curated study links and personal notes
- Progress — Exam readiness tracker across all domains

Each sidebar item should show the module name and its exam domain weight. The sidebar should be collapsible.

---

## Pages and Their Functionality

### 1. Dashboard (home page `/`)

The landing page. Shows:
- An overview of all 8 lab modules as cards, each showing the module name, a brief description, its exam domain weight, and a status indicator (not started / in progress / completed)
- A summary of overall exam readiness — how much of each domain has been covered
- Quick links to resume the last module worked on

### 2. Foundry Hub (`/foundry`)

An informational and reference module about Azure resource management. Contains:
- A reference table of Azure/Microsoft Foundry services and when to use each one
- A checklist of Azure resources needed for this project and their provisioning status
- Configuration panel where the user can see which backend services are connected (the backend has a health check at GET `/health` and each module has a status endpoint)
- Notes area for documenting Azure portal procedures

### 3. GenAI Lab (`/generative`)

An interactive playground for generative AI. Contains:
- A **chat interface** where the user sends messages and receives AI responses. Messages display in a conversation thread. The input should support multi-line text.
- A **parameter panel** (sidebar or collapsible) with sliders/inputs for: temperature (0-2), top_p (0-1), max_tokens, frequency_penalty, presence_penalty. These affect the AI model's behavior.
- A **prompt template library** — a list of saved prompt templates the user can load into the chat. Each template has a name and content. Users should be able to add, edit, and delete templates. Templates are stored locally.
- An **image generation tab** where the user enters a text prompt and receives a generated image
- A **model selector** dropdown to switch between different AI models

Backend endpoints (will be implemented):
- POST `/api/generative/chat` — sends messages array, returns AI response
- POST `/api/generative/image` — sends prompt, returns image URL
- GET `/api/generative/models` — returns available models

### 4. RAG Engine (`/rag`)

A retrieval-augmented generation interface. The user uploads study documents, and then asks questions that are answered using those documents as context. Contains:
- A **document upload area** where the user can upload PDF, TXT, or MD files. Shows a list of uploaded/indexed documents with their status (uploading, indexing, ready, error).
- A **chat interface** (similar to GenAI Lab but grounded in uploaded documents). When the AI answers, it should show which document(s) the answer came from (source citations).
- A **search tab** where the user can run direct search queries against the indexed documents and see matching results with relevance scores
- An **index viewer** that shows what's in the search index (document count, fields, etc.)

Backend endpoints:
- POST `/api/search/upload` — upload a document for indexing
- GET `/api/search/documents` — list indexed documents
- POST `/api/search/query` — search the index
- POST `/api/generative/chat` — with grounding context from search results

### 5. Agent Workshop (`/agents`)

An interface for building and testing AI agents. Contains:
- An **agent configuration panel** where the user defines: agent name, system instructions (text area), available tools (checkboxes/list of tools the agent can use), and knowledge sources
- A **conversation testing area** where the user chats with the configured agent and can see what tools the agent decides to use and what its reasoning is
- A **workflow visualizer** that shows the steps the agent took (tool calls, reasoning, responses) as a visual flow or timeline
- An **agent list** showing saved agent configurations

Backend endpoints:
- POST `/api/agents/create` — create agent configuration
- POST `/api/agents/chat` — send message to agent
- GET `/api/agents/list` — list saved agents

### 6. Vision Lab (`/vision`)

An image analysis interface. Contains:
- An **image upload/drop zone** that accepts images (JPG, PNG). Should show a preview of the uploaded image.
- An **analysis results panel** that appears after analysis, showing: detected objects (with bounding boxes overlaid on the image if possible), image tags, captions/descriptions, OCR extracted text
- A **tab or toggle** to switch between: general analysis, OCR/text extraction, and custom classification
- A **custom vision section** where the user can: upload training images, assign labels/tags, trigger training, and test the trained model with new images

Backend endpoints:
- POST `/api/vision/analyze` — upload image, returns analysis JSON
- POST `/api/vision/ocr` — upload image, returns extracted text
- POST `/api/vision/custom/train` — train custom model
- POST `/api/vision/custom/predict` — classify with custom model

### 7. Language & Speech (`/language`)

A multi-tab interface for text and speech processing. Contains:

**Text Analysis tab:**
- A large text input area where the user pastes or types text
- Analysis buttons: Sentiment, Key Phrases, Entities, PII Detection, Language Detection
- Results displayed below/beside the input — sentiment as a score/visual, entities highlighted in the text, PII items listed with their category, key phrases as tags

**Translation tab:**
- Source language selector (or auto-detect)
- Target language selector
- Input text area and translated output area
- A translate button

**Speech tab:**
- A **record button** for speech-to-text — records audio from the microphone, sends to backend, displays transcribed text
- A **text-to-speech section** — text input with a play button that generates and plays audio
- Voice/language selectors for TTS

Backend endpoints:
- POST `/api/language/analyze` — analyze text (sentiment, entities, etc.)
- POST `/api/language/translate` — translate text
- POST `/api/language/speech-to-text` — upload audio, returns text
- POST `/api/language/text-to-speech` — send text, returns audio

### 8. Knowledge Mining (`/search`)

An interface for building and exploring search indexes. Contains:
- An **index management panel** showing existing search indexes, their document count, field definitions, and status
- A **data source configuration** section where the user connects a data source (blob storage URL, etc.) and configures an indexer
- A **skillset builder** where the user selects built-in AI skills (OCR, entity extraction, key phrase extraction, etc.) to apply during indexing
- A **query explorer** with a search box supporting filters, and results showing relevance scores, highlights, and facets
- A **Document Intelligence section** for uploading invoices, receipts, or forms and seeing the extracted structured data (tables, key-value pairs, fields)

Backend endpoints:
- GET `/api/search/indexes` — list indexes
- POST `/api/search/query` — run a search query
- POST `/api/documents/analyze` — upload document for extraction
- GET `/api/documents/models` — list available extraction models

### 9. Responsible AI (`/responsible-ai`)

A content safety and governance interface. Contains:
- A **content tester** — text input area where the user can type text and check it against content safety filters. Results show category scores (violence, hate, self-harm, sexual) with severity levels.
- An **image safety checker** — upload an image and see content safety analysis
- A **prompt shield tester** — input a prompt and check if it would be flagged as a jailbreak or prompt injection attempt
- A **blocklist manager** — create and manage custom blocklists (lists of terms to block)
- A **governance checklist** — an interactive checklist of Responsible AI principles with checkboxes and notes per item

Backend endpoints:
- POST `/api/safety/analyze-text` — check text content safety
- POST `/api/safety/analyze-image` — check image content safety
- POST `/api/safety/check-prompt` — check for prompt injection
- GET `/api/safety/blocklists` — list blocklists
- POST `/api/safety/blocklists` — create/update blocklist

### 10. Resources (`/resources`)

A study resource organizer. Contains:
- **Curated links** organized by exam domain (6 sections matching the 6 exam domains). Each link has a title, URL, and type (MS Learn, Video, Documentation, Practice).
- The initial links should be loaded from this list:
  - Main cert page: https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/
  - Study guide: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102
  - Practice assessment: https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/practice/assessment?assessment-type=practice&assessmentId=61
  - Exam readiness videos: https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-ai-102/
- The user should be able to **add their own links** to any domain section
- A **personal notes** area per domain where the user can write and save markdown notes (stored locally in browser)

### 11. Progress (`/progress`)

An exam readiness tracker. Contains:
- A **domain progress overview** showing all 6 exam domains with their weights, a progress bar per domain, and overall readiness percentage
- A **module completion tracker** — each of the 8 lab modules maps to exam domains. The user can mark features within each module as completed.
- A visual **weight distribution chart** showing exam domain weights so the user knows where to focus study effort
- Completion data should persist in browser local storage

---

## General UI Requirements

- The app should feel like a professional developer tool or IDE — functional and information-dense rather than marketing-style
- Dark mode support
- Responsive enough to work on desktop (primary) and tablet
- All data that doesn't come from the backend (notes, progress, templates) should be stored in browser localStorage
- Loading states for all API calls (the backend may take a few seconds for AI processing)
- Error states when the backend is unreachable or returns errors
- The sidebar should show which module the user is currently on

---

## Technical Context

- The project uses Next.js 14+ with App Router, TypeScript, shadcn/ui, and Tailwind CSS
- shadcn/ui components already installed: button, card, badge, progress, separator, sheet, scroll-area
- The backend runs separately at http://localhost:8000
- API calls from the frontend should go to the backend REST endpoints listed above
- The `src/lib/` directory should contain shared utilities including an API client

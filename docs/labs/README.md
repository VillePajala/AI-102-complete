# AI-102 Command Center — Lab Guides

Hands-on labs for the Microsoft AI-102 AI Engineer Associate exam. You build the backend services yourself, layer by layer, while using the frontend UI as a visual test harness.

## How It Works

The frontend pages are already built. The backend routers are already wired up. But the **service files** (`backend/app/services/`) contain only stubs — every function raises `NotImplementedError`.

Your job: implement each function following the lab guides below. Each lab is divided into **layers** — small, focused implementation steps that build on each other.

### What a "Layer" Is

Each layer asks you to:

1. **Read** a short concept section (what the Azure service does, how the SDK works)
2. **Implement** one function or extend an existing one
3. **Test** your work by using the frontend UI — you'll see real results instead of errors
4. **Review** exam tips that connect what you just built to AI-102 exam questions

Hints are provided as expandable sections. Try without them first.

## Setup Guide

Complete these steps before starting Lab 01. The whole setup takes about 20 minutes (plus Azure resource provisioning time).

### Step 1: Install Tools

You need these installed on your machine:

| Tool | Version | Check with |
|------|---------|------------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Python** | 3.10+ | `python3 --version` |
| **Git** | any | `git --version` |
| **VS Code** | latest | [code.visualstudio.com](https://code.visualstudio.com/) |

#### Recommended VS Code Extensions

Install these for the best experience:

| Extension | Why | Install Command |
|-----------|-----|-----------------|
| **Markdown All in One** | Interactive checkboxes in lab guides | `code --install-extension yzhang.markdown-all-in-one` |
| **Python** | Python IntelliSense, debugging, linting | `code --install-extension ms-python.python` |
| **Pylance** | Fast Python type checking | `code --install-extension ms-python.vscode-pylance` |
| **ESLint** | TypeScript/JavaScript linting | `code --install-extension dbaeumer.vscode-eslint` |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind classes | `code --install-extension bradlc.vscode-tailwindcss` |

Or install all at once:
```bash
code --install-extension yzhang.markdown-all-in-one && \
code --install-extension ms-python.python && \
code --install-extension ms-python.vscode-pylance && \
code --install-extension dbaeumer.vscode-eslint && \
code --install-extension bradlc.vscode-tailwindcss
```

#### Viewing Lab Guides

The lab guides (`.md` files in this directory) contain **checkboxes** you can tick off as you complete each step. To see and interact with them:

1. Open any lab file (e.g., `01-genai.md`) in VS Code
2. Press `Ctrl+K V` (or `Cmd+K V` on macOS) to open a **side-by-side preview**
3. With the **Markdown All in One** extension installed, you can **click the checkboxes** directly in the preview to track your progress
4. Alternatively, press `Ctrl+Shift+V` for a full-screen preview

> **Tip:** You can also track progress in the browser at http://localhost:3000/progress — it has interactive checklists for each module.

### Step 2: Clone and Install

```bash
# Clone the repo
git clone https://github.com/VillePajala/AI-102-complete.git
cd AI-102-complete

# Install frontend dependencies
npm install

# Set up backend Python environment
cd backend
python3 -m venv venv
source venv/bin/activate   # Linux/macOS
# or: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Step 3: Get an Azure Subscription

If you don't have one:

1. Go to [azure.microsoft.com/free](https://azure.microsoft.com/free)
2. Sign up for a free account — you get $200 credit for 30 days
3. Most AI services also have free tiers that continue after the trial

> **Cost note:** The labs use small payloads and low request volumes. With a free trial or pay-as-you-go subscription, the total cost for completing all labs is typically under $5.

### Step 4: Create Azure Resources

You don't need all resources on day one. Create them as you reach each lab. Here's what each lab needs:

| Lab | Azure Resource | How to Create |
|-----|---------------|---------------|
| 01: GenAI | Azure OpenAI | See below |
| 02-03: RAG / Knowledge Mining | Azure AI Search | Lab 02 walks you through it |
| 04: Vision | Azure AI Services (multi-service) | See below |
| 05: Language & Speech | Azure AI Services + Azure Translator | See below |
| 06: Agents | (uses Azure OpenAI from Lab 01) | Nothing new |
| 07: Responsible AI | Azure Content Safety | See below |

#### Azure OpenAI (Lab 01)

1. Go to the [Azure portal](https://portal.azure.com)
2. Search for **"Azure OpenAI"** → Create
3. Choose a region that supports GPT-4 and DALL-E 3 (e.g., East US, Sweden Central)
4. Pricing tier: **Standard S0**
5. After creation, go to the resource → **Keys and Endpoint**
6. Copy **Endpoint** and **Key 1**
7. Go to **Azure AI Foundry** (link on the resource page) → **Deployments** → **Deploy model**
8. Deploy a GPT model (e.g., `gpt-4o`) — note the **deployment name** you choose
9. Deploy DALL-E 3 — note its deployment name (default: `dall-e-3`)

#### Azure AI Services — Multi-Service (Labs 04, 05)

This single resource gives you Computer Vision, Text Analytics, and more under one key:

1. In the Azure portal, search for **"Azure AI services"** → Create **Azure AI services** (the multi-service resource, not a single-service one)
2. Choose the same region as your OpenAI resource if possible
3. Pricing tier: **Standard S0**
4. After creation → **Keys and Endpoint** → copy **Endpoint** and **Key 1**

#### Azure Content Safety (Lab 07)

1. In the Azure portal, search for **"Content Safety"** → Create
2. Pricing tier: **Free F0** (1,000 requests/month) or Standard S0
3. After creation → **Keys and Endpoint** → copy both

#### Azure Translator (Lab 05, Layer 3)

If you created the multi-service Azure AI Services resource above, you can use its key for Translator too. Otherwise:

1. Search for **"Translator"** → Create
2. After creation → **Keys and Endpoint** → copy **Key 1** and note the **Region**

#### Azure Speech (Lab 05, Layer 4)

The multi-service Azure AI Services key works for Speech too, but you still need the **region**:

1. If using the multi-service resource, just note its region (e.g., `eastus`)
2. If creating separately: search for **"Speech"** → Create → copy Key and Region

### Step 5: Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in your editor and fill in the values from the resources you created. You only need to fill in the variables for labs you're about to start:

```bash
# --- Lab 01: GenAI ---
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_KEY=abc123...                    # From Keys and Endpoint
AZURE_OPENAI_DEPLOYMENT=gpt-4o               # The deployment name you chose
AZURE_OPENAI_DALLE_DEPLOYMENT=dall-e-3        # Your DALL-E deployment name
AZURE_OPENAI_API_VERSION=2024-06-01           # Leave as-is

# --- Labs 04, 05: Vision, Language ---
AZURE_AI_SERVICES_ENDPOINT=https://your-ai-services.cognitiveservices.azure.com/
AZURE_AI_SERVICES_KEY=abc123...

# --- Labs 02, 03: RAG, Knowledge Mining ---
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net/
AZURE_SEARCH_KEY=abc123...
AZURE_SEARCH_INDEX=ai102-index                # Leave as-is

# --- Lab 05, Layer 3: Translation ---
# If using multi-service key, these can be left empty (falls back to AI Services key)
AZURE_TRANSLATOR_KEY=                         # Or set to your Translator key
AZURE_TRANSLATOR_REGION=eastus                # Region of your Translator/AI Services resource

# --- Lab 05, Layer 4: Speech ---
AZURE_SPEECH_KEY=abc123...                    # Or your AI Services key
AZURE_SPEECH_REGION=eastus                    # Region of your Speech/AI Services resource

# --- Lab 07: Responsible AI ---
AZURE_CONTENT_SAFETY_ENDPOINT=https://your-content-safety.cognitiveservices.azure.com/
AZURE_CONTENT_SAFETY_KEY=abc123...
```

> **Where to find keys:** Every Azure resource has a **"Keys and Endpoint"** page in the left sidebar of the Azure portal. Endpoint is the URL, Key 1 is the API key.

> **Security:** The `.env` file is gitignored. Never commit it. Never share your keys.

### Step 6: Start the Servers

You need two terminal windows:

```bash
# Terminal 1: Frontend
npm run dev
# → http://localhost:3000
```

```bash
# Terminal 2: Backend
cd backend
source venv/bin/activate       # Linux/macOS
# or: venv\Scripts\activate    # Windows
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

### Step 7: Verify Everything Works

1. **Frontend loads:** Open http://localhost:3000 — you should see the dashboard
2. **Backend loads:** Open http://localhost:8000/docs — you should see the Swagger UI with all API endpoints listed
3. **Health check:** Open http://localhost:8000/health — you should see `{"status": "healthy"}`
4. **Stubs are working:** Click any API endpoint in Swagger UI → Try it out → Execute. You should get a `500` error with a `NotImplementedError` message pointing you to the right lab guide. That means the stubs are correctly wired up — you're ready to start implementing.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'fastapi'` | You forgot to activate the virtual environment. Run `source venv/bin/activate` |
| `npm: command not found` | Install Node.js from [nodejs.org](https://nodejs.org) |
| Backend starts but API returns "not configured" | Your `.env` is missing keys. Check the variable names match `.env.example` exactly |
| CORS error in browser console | Make sure the backend is running on port 8000 (not another port) |
| `openai.AuthenticationError` | Your `AZURE_OPENAI_KEY` is wrong. Re-copy it from the Azure portal |
| `openai.NotFoundError: deployment not found` | Your `AZURE_OPENAI_DEPLOYMENT` doesn't match the deployment name in Azure AI Foundry |

## Lab Order

Labs should be done in this order. Dependencies are noted.

| # | Lab | File | Layers | Prerequisites |
|---|-----|------|--------|---------------|
| 01 | [GenAI Lab](01-genai.md) | `openai_service.py` | 3 | None |
| 02 | [RAG Engine](02-rag.md) | `search_service.py` + `openai_service.py` | 6 | Lab 01 |
| 03 | [Knowledge Mining](03-knowledge-mining.md) | `search_service.py` | 4 | Lab 02 |
| 04 | [Vision Lab](04-vision.md) | `vision_service.py` | 3 | None |
| 05 | [Language & Speech](05-language.md) | `language_service.py` | 4 | None |
| 06 | [Agent Workshop](06-agents.md) | `openai_service.py` | 3 | Lab 01 |
| 07 | [Responsible AI](07-responsible-ai.md) | `safety_service.py` | 3 | None |

### Dependency Graph

```
Lab 01 (GenAI) ──→ Lab 02 (RAG) ──→ Lab 03 (Knowledge Mining)
       │
       └──────────→ Lab 06 (Agents)

Lab 04 (Vision)         ← independent
Lab 05 (Language)       ← independent
Lab 07 (Responsible AI) ← independent
```

You can do the independent labs (04, 05, 07) in any order and at any time.

## Service Files

All your implementation work happens in these files:

| File | Functions | Labs |
|------|-----------|------|
| `backend/app/services/openai_service.py` | `chat_completion()`, `generate_image()`, `chat_with_tools()` | 01, 06 |
| `backend/app/services/search_service.py` | `search_documents()`, `upload_document()` | 02, 03 |
| `backend/app/services/vision_service.py` | `analyze_image()`, `ocr_image()` | 04 |
| `backend/app/services/language_service.py` | `analyze_text()`, `translate_text()`, `speech_to_text()`, `text_to_speech()` | 05 |
| `backend/app/services/safety_service.py` | `analyze_text()`, `check_prompt()` | 07 |

## What NOT to Edit

- **Routers** (`backend/app/routers/`) — These are already wired up. Don't change them.
- **Config** (`backend/app/config.py`) — Already loads all needed env vars.
- **Frontend** (`src/`) — Already built. Use it as your test harness.
- **Main** (`backend/app/main.py`) — Already registers all routers.

## Exam Mapping

Each lab maps to specific AI-102 exam domains:

| Exam Domain | Weight | Labs |
|-------------|--------|------|
| D1: Plan and manage an Azure AI solution | 20-25% | 01 (setup), 07 |
| D2: Implement generative AI solutions | 15-20% | 01, 02 |
| D3: Implement agentic AI solutions | 5-10% | 06 |
| D4: Implement computer vision solutions | 10-15% | 04 |
| D5: Implement natural language processing | 15-20% | 05 |
| D6: Implement knowledge mining and document intelligence | 15-20% | 02, 03 |

## Tips

- **Read the error messages.** When a stub is not yet implemented, the frontend will show a clear error. Once you implement a layer, that error is replaced with real data.
- **Use the Swagger UI.** Visit http://localhost:8000/docs to test your API endpoints directly without the frontend.
- **Check your .env.** Most "service not configured" errors mean a missing or incorrect environment variable.
- **One layer at a time.** Don't skip ahead — later layers build on earlier ones.

# Lab 01: GenAI Lab

> **Exam Domain:** D2 — Implement generative AI solutions (15-20%)
> **Service File:** `backend/app/services/openai_service.py`
> **Estimated Time:** 45 minutes
> **Estimated Azure Cost:** < $0.10 for this lab. GPT-4o-mini is ~$0.15/$0.60 per 1M input/output tokens. DALL-E 3 is ~$0.04 per image (standard quality). Free tier Azure OpenAI has no monthly fee — you only pay per API call.

**Difficulty:** Beginner | **Layers:** 3 | **Prerequisites:** None — this is the first lab

> **How to approach this lab**
>
> Try implementing each layer yourself before looking at the hints or full solutions.
> The stub functions in the service file have comments pointing you in the right direction.
> If you get stuck for more than 10 minutes, open the hint. If the hint is not enough,
> open the full solution, study it, then close it and try to write it from memory.
> The goal is understanding, not speed.

<!-- section:overview -->
## Overview

In this lab you connect the backend to Azure OpenAI and implement three layers of generative AI functionality: chat completion, parameter tuning, and image generation with DALL-E. By the end, the GenAI Lab page in the frontend will be fully functional — you can chat with GPT and generate images.

This is the first lab because Azure OpenAI is the backbone of multiple later labs (RAG, Agents). Everything you learn here carries forward.

### Request Flow

<img src="/labs/diagrams/genai-request-flow.svg" alt="Request flow: Browser → Next.js → Router → Service (you build this) → Azure OpenAI" />

The purple-highlighted box is the service file you will implement. Everything else is already wired up.

### What You Will Build

| Layer | Function | What It Does |
|-------|----------|-------------|
| 1 | `chat_completion()` | Send messages to GPT, get a response |
| 2 | *(enhance Layer 1)* | Understand and apply parameter tuning |
| 3 | `generate_image()` | Generate images with DALL-E |

<!-- section:prerequisites -->
## Prerequisites

- An active Azure subscription (free trial works)
- An Azure OpenAI resource with a GPT model deployed (e.g., `gpt-4o`, `gpt-4o-mini`, or `gpt-35-turbo`)
- A DALL-E 3 deployment in the same Azure OpenAI resource (for Layer 3)
- Python virtual environment set up and `requirements.txt` installed (see [Setup Guide](README.md))
- Both frontend and backend servers running

<!-- section:setup -->
## Azure Setup

If you have not yet created your Azure OpenAI resource and deployments, follow these steps.

- Create Azure OpenAI resource in Azure Portal
- Deploy gpt-4o-mini in Azure AI Foundry
- Deploy dall-e-3 in Azure AI Foundry
- Configure `backend/.env` with keys and endpoints
- Restart backend server

### 1. Create an Azure OpenAI resource (Azure Portal)

You create the resource in the Azure Portal, where you manage subscriptions, resource groups, regions, and access keys. This is standard Azure resource management — a key skill tested under exam Domain 1 (Plan and manage).

1. Go to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** and search for **Azure OpenAI**
3. Click **Create** and fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or use existing (e.g., `rg-ai102-labs`)
   - **Region**: Choose a region that supports GPT and DALL-E (e.g., `swedencentral`, `eastus2`). Check the [model availability table](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#model-summary-table-and-region-availability) to confirm.
   - **Name**: A unique name (e.g., `ai102-openai-yourname`)
   - **Pricing tier**: Standard S0
4. Click **Review + create**, then **Create**
5. Wait for deployment to complete, then click **Go to resource**

<checkpoint id="setup-openai-resource"></checkpoint>

### 2. Deploy a GPT model (Azure AI Foundry)

Model deployments are managed in **Azure AI Foundry** (ai.azure.com), not in the Azure Portal resource page. The Azure Portal resource page has a **"Go to Azure AI Foundry portal"** link that takes you there.

> **Note:** Azure AI Foundry was rebranded to **Microsoft Foundry** in late 2025. The URL is still ai.azure.com. The portal has a **"New Foundry" toggle** at the top — these instructions follow the **classic** experience (toggle OFF), which is what current exam content references.

1. From your Azure OpenAI resource page in the Azure Portal, click **Go to Azure AI Foundry portal** (or go directly to [ai.azure.com](https://ai.azure.com))
2. In Foundry, select your Azure OpenAI resource if prompted
3. Go to **Deployments** in the left navigation (under "Shared resources")
4. Click **+ Deploy model** (dropdown button) > **Deploy base model**
5. Search for and select **gpt-4o-mini**, then click **Confirm**
6. Configure the deployment:
   - **Deployment name**: `gpt-4o-mini` — this becomes your `AZURE_OPENAI_DEPLOYMENT` value
   - **Deployment type**: Global-Standard (default) is fine for labs
   - **Tokens per Minute Rate Limit**: default is fine for labs
7. Click **Deploy** and wait for the provisioning state to show **Succeeded**

<checkpoint id="setup-deploy-gpt"></checkpoint>

**Alternative path — via Model Catalog:** You can also go to **Model catalog** in the left navigation, search for `gpt-4o-mini`, click **Use this model**, and deploy from there. Both paths create the same deployment.

> **Why two portals?** The Azure Portal is where you manage Azure resources (create, delete, configure access keys, set up networking, RBAC). Azure AI Foundry is where you manage AI-specific tasks (deploy models, test prompts, configure content filters). The resource lives in Azure; Foundry is the AI management layer on top. The exam tests both — resource management in the Portal and model management in Foundry.

### 3. Deploy DALL-E 3 (Azure AI Foundry)

Still in Azure AI Foundry, same workflow:

1. Go to **Deployments** in the left navigation
2. Click **+ Deploy model** > **Deploy base model**
3. Search for and select **dall-e-3**, then click **Confirm**
4. Deployment name: `dall-e-3` (this is the default in `config.py`)
5. Click **Deploy**

> **DALL-E 3 region availability** is more limited than text models. If `dall-e-3` does not appear in the model list, your Azure OpenAI resource may be in a region that does not support it. Sweden Central and East US are confirmed to support DALL-E 3. Check the [model availability table](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#model-summary-table-and-region-availability) if needed.

<checkpoint id="setup-deploy-dalle"></checkpoint>

### 4. Configure your .env file

Edit `backend/.env` with the values below. Here is where to find each one:

| Variable | Where to Find It |
|----------|-----------------|
| `AZURE_OPENAI_ENDPOINT` | **Azure Portal** > your Azure OpenAI resource > **Keys and Endpoint** page > copy the **Endpoint** URL |
| `AZURE_OPENAI_KEY` | Same page > copy **Key 1** (or Key 2 — either works) |
| `AZURE_OPENAI_DEPLOYMENT` | The deployment name you chose in Step 2 (e.g., `gpt-4o-mini`) |
| `AZURE_OPENAI_DALLE_DEPLOYMENT` | The deployment name you chose in Step 3 (e.g., `dall-e-3`) |
| `AZURE_OPENAI_API_VERSION` | Not found in the portal — this is a fixed API version string. Use `2024-10-21` (latest GA version supporting chat, DALL-E, and tool calling) |

```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_DALLE_DEPLOYMENT=dall-e-3
AZURE_OPENAI_API_VERSION=2024-10-21
```

<checkpoint id="setup-env-openai"></checkpoint>

Restart the backend server after editing `.env`.

<checkpoint id="setup-restart-backend"></checkpoint>

---

<!-- section:layer:1 -->
## Layer 1: Chat Completion

- Implement `_get_client()` helper function
- Implement `chat_completion()` function
- Test via frontend or Swagger UI

> **What you will learn**
> - How to create an Azure OpenAI client using the `openai` Python SDK
> - How to call the Chat Completions API with a list of messages
> - How the SDK differentiates between standard OpenAI and Azure OpenAI
>
> *Exam objective: "Implement solutions that use Azure OpenAI" — creating chat completions and configuring Azure-specific client parameters.*

### Concepts

The `openai` Python package provides an `AzureOpenAI` class that wraps the standard OpenAI client for Azure deployments. Three things make it Azure-specific:

1. **`azure_endpoint`** — The URL of your Azure OpenAI resource (e.g., `https://myresource.openai.azure.com/`)
2. **`api_key`** — Your Azure OpenAI key (not an OpenAI API key)
3. **`api_version`** — Azure API version string (e.g., `2024-06-01`)

Once the client is created, you call `client.chat.completions.create()` just like the standard OpenAI SDK. The `model` parameter takes your **deployment name** (not the underlying model name).

The Chat Completions API is message-based. You send a list of message objects, each with a `role` (`system`, `user`, or `assistant`) and `content`. The API returns a response containing one or more `choices`, each with a `message` object.

### Implementation

Open `backend/app/services/openai_service.py`. You need to do two things:

**Step 1: Create a helper function `_get_client()`**

Write a private function that returns an `AzureOpenAI` client instance. It should:

- Import `AzureOpenAI` from the `openai` package
- Check that `settings.AZURE_OPENAI_ENDPOINT` and `settings.AZURE_OPENAI_KEY` are not empty — raise `RuntimeError` with a descriptive message if they are missing
- Create and return an `AzureOpenAI` instance using the endpoint, key, and API version from `settings`

Place this function above `chat_completion()`, after the existing imports.

<checkpoint id="l1-get-client"></checkpoint>

**Step 2: Implement `chat_completion()`**

Replace the `raise NotImplementedError(...)` line. Your implementation should:

- Call `_get_client()` to get a client instance
- Determine which deployment to use: use the `model` parameter if provided, otherwise fall back to `settings.AZURE_OPENAI_DEPLOYMENT`
- Call `client.chat.completions.create()` with the deployment name and the `messages` list
- For now, you can ignore the other parameters (temperature, top_p, etc.) — Layer 2 covers those
- Extract the content from the first choice in the response and return it as a string
- Handle the case where content might be `None` by returning an empty string

<checkpoint id="l1-chat-completion"></checkpoint>

<details><summary>Hint — skeleton code</summary>

```python
from openai import AzureOpenAI

def _get_client() -> AzureOpenAI:
    if not settings.AZURE_OPENAI_ENDPOINT or not ___:
        raise RuntimeError("Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY.")
    return AzureOpenAI(
        azure_endpoint=___,
        api_key=___,
        api_version=___,
    )


def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> str:
    client = ___
    deployment = model if model else ___
    response = client.chat.completions.create(
        model=___,
        messages=___,
    )
    return response.___[0].message.___ or ""
```

Key things to figure out:
- What `settings` attributes hold the endpoint, key, API version, and deployment name?
- What is the response object structure? (`response.choices[0].message.content`)

</details>

### Test It

> 1. Make sure both servers are running
> 2. Open **http://localhost:3000/generative** in your browser
> 3. Type a message in the chat input (e.g., "What is Azure OpenAI?")
> 4. You should receive a response from GPT displayed in the chat
>
> **503 error?** Check that your `.env` values are correct and the backend was restarted.
> **500 error?** Check the backend terminal for the full error traceback.

You can also test directly via Swagger UI at http://localhost:8000/docs — find the `POST /api/generative/chat` endpoint and send:

```json
{
  "messages": [
    {"role": "user", "content": "Hello, what can you do?"}
  ]
}
```

<checkpoint id="l1-test"></checkpoint>

<details><summary>Full Solution</summary>

Add this import at the top of the file (after the existing imports):

```python
from openai import AzureOpenAI
```

Add the `_get_client` helper function before `chat_completion`:

```python
def _get_client() -> AzureOpenAI:
    if not settings.AZURE_OPENAI_ENDPOINT or not settings.AZURE_OPENAI_KEY:
        raise RuntimeError(
            "Azure OpenAI not configured. "
            "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY."
        )
    return AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )
```

Replace the body of `chat_completion`:

```python
def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> str:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
    )
    return response.choices[0].message.content or ""
```

Note: This minimal version does not pass the tuning parameters yet. That is Layer 2.

</details>

> **Exam Tips**
> - The exam tests whether you know the difference between `OpenAI` and `AzureOpenAI` client classes. Azure requires `azure_endpoint` and `api_version` — standard OpenAI does not.
> - You must know that the `model` parameter in Azure OpenAI refers to the **deployment name**, not the model name (e.g., `"gpt-4o-mini"` as a deployment name, not the underlying model ID).
> - The exam may ask about authentication methods. Azure OpenAI supports both API key and Microsoft Entra ID (Azure AD) token authentication. This lab uses API key; the exam may test both.

---

<!-- section:layer:2 -->
## Layer 2: Parameter Tuning

- Add all tuning parameters to `chat_completion()` API call
- Test with different temperature/max_tokens values

> **What you will learn**
> - What each chat completion parameter controls
> - How to pass tuning parameters through to the API
> - How different parameter values affect response behavior
>
> *Exam objective: "Configure Azure OpenAI model parameters" — understanding temperature, top_p, frequency_penalty, presence_penalty, and max_tokens.*

### Concepts

The Chat Completions API accepts several parameters that control how the model generates text:

| Parameter | Range | Default | What It Controls |
|-----------|-------|---------|-----------------|
| `temperature` | 0.0–2.0 | 0.7 | Randomness. Lower = more deterministic, higher = more creative. At 0, the model almost always picks the most likely next token. |
| `top_p` | 0.0–1.0 | 1.0 | Nucleus sampling. Only considers tokens whose cumulative probability reaches this threshold. 0.1 means only the top 10% probability mass is considered. |
| `max_tokens` | 1–model max | 800 | Maximum number of tokens in the response. Limits output length. Does not guarantee the model will use all of them. |
| `frequency_penalty` | -2.0–2.0 | 0.0 | Penalizes tokens based on how often they have appeared so far. Positive values reduce repetition. |
| `presence_penalty` | -2.0–2.0 | 0.0 | Penalizes tokens based on whether they have appeared at all (regardless of frequency). Positive values encourage topic diversity. |

> **Important:** `temperature` and `top_p` both control randomness. Microsoft recommends changing one or the other, not both at the same time. The exam may test this.

### Implementation

This layer does not require a new function. You need to enhance your Layer 1 `chat_completion()` implementation to pass all the parameters through to `client.chat.completions.create()`.

Go back to your `chat_completion()` function and add the five parameters (`temperature`, `top_p`, `max_tokens`, `frequency_penalty`, `presence_penalty`) to the `client.chat.completions.create()` call.

<checkpoint id="l2-add-params"></checkpoint>

<details><summary>Hint — what to add</summary>

Your `create()` call should include all the parameters:

```python
response = client.chat.completions.create(
    model=deployment,
    messages=messages,
    temperature=___,
    top_p=___,
    max_tokens=___,
    frequency_penalty=___,
    presence_penalty=___,
)
```

Each `___` maps directly to the function parameter with the same name.

</details>

### Test It

> 1. Open **http://localhost:3000/generative**
> 2. If the frontend has parameter controls (sliders or inputs), try these experiments:
>    - **`temperature=0`** — ask the same question twice, responses should be nearly identical
>    - **`temperature=1.5`** — ask the same question, responses should be more varied and creative
>    - **`max_tokens=20`** — responses will be cut short
>    - **`frequency_penalty=1.5`** — the model will avoid repeating itself
> 3. Try the same prompt with different settings and compare the outputs

You can also test via Swagger UI by adding parameters to the request body:

```json
{
  "messages": [{"role": "user", "content": "Write a short poem about clouds"}],
  "temperature": 0.0,
  "max_tokens": 100
}
```

<checkpoint id="l2-test"></checkpoint>

<details><summary>Full Solution</summary>

The complete `chat_completion` function with all parameters passed through:

```python
def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> str:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
    )
    return response.choices[0].message.content or ""
```

</details>

> **Exam Tips**
> - The exam will ask you to choose the right parameter for a given scenario. Example: "You need the model to produce consistent, reproducible output" — the answer is `temperature=0`.
> - Know that `temperature` and `top_p` should not both be modified at the same time. This is a common exam question distractor.
> - `max_tokens` limits the **response** length, not the prompt length. The prompt length is limited by the model's context window (e.g., 128k tokens for GPT-4o). The exam may test this distinction.

---

<!-- section:layer:3 -->
## Layer 3: DALL-E Image Generation

- Implement `generate_image()` function
- Test via frontend or Swagger UI

> **What you will learn**
> - How to use the Images API to generate images from text prompts
> - How DALL-E deployments differ from chat model deployments
> - How to handle the image response (URL vs. base64)
>
> *Exam objective: "Generate images by using Azure OpenAI DALL-E"*

### Concepts

DALL-E is accessed through the same `AzureOpenAI` client as chat completions, but uses a different method: `client.images.generate()` instead of `client.chat.completions.create()`.

Key differences from chat completion:

- **Input**: A single text `prompt` (not a message list)
- **Output**: A list of image objects, each with either a `url` (link to the generated image) or `b64_json` (base64-encoded image data)
- **Deployment**: Uses a separate DALL-E deployment (stored in `settings.AZURE_OPENAI_DALLE_DEPLOYMENT`)
- **Parameters**: `n` (number of images), `size` (resolution), `quality`, `style` — not temperature/top_p

Supported sizes for DALL-E 3: `1024x1024`, `1024x1792`, `1792x1024`.

The generated image URL is temporary — Azure hosts it for a limited time. If you need to persist the image, you must download it and store it yourself (not required for this lab).

### Implementation

Open `backend/app/services/openai_service.py` and find the `generate_image()` function. Replace the `raise NotImplementedError(...)` line with an implementation that:

1. Gets an `AzureOpenAI` client using your `_get_client()` helper
2. Calls `client.images.generate()` with:
   - `model` set to the DALL-E deployment name from settings
   - `prompt` set to the input prompt
   - `n` set to `1` (generate one image)
   - `size` set to `"1024x1024"`
3. Extracts the URL from the first item in the response data
4. Returns the URL as a string

<checkpoint id="l3-generate-image"></checkpoint>

<details><summary>Hint — skeleton code</summary>

```python
def generate_image(prompt: str) -> str:
    client = _get_client()
    response = client.images.generate(
        model=___,
        prompt=___,
        n=___,
        size=___,
    )
    return response.___[0].___ or ""
```

Things to figure out:
- Which `settings` attribute holds the DALL-E deployment name?
- The response has a `data` list. Each item has a `url` property.

</details>

### Test It

> 1. Open **http://localhost:3000/generative**
> 2. Find the image generation feature (separate from chat)
> 3. Enter a prompt like *"A futuristic city skyline at sunset, digital art"*
> 4. Wait 10-20 seconds — DALL-E takes longer than chat completions
> 5. You should see a generated image displayed in the UI
>
> **Content policy error?** Your prompt was filtered by Azure's content safety system. Try a different, clearly safe prompt.
> **404 or deployment error?** Verify that `AZURE_OPENAI_DALLE_DEPLOYMENT` in your `.env` matches your actual deployment name.

Via Swagger UI, send a `POST /api/generative/image`:

```json
{
  "prompt": "A cat wearing a tiny astronaut helmet, watercolor painting"
}
```

The response will contain a `url` field with a link to the generated image.

<checkpoint id="l3-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
def generate_image(prompt: str) -> str:
    client = _get_client()
    response = client.images.generate(
        model=settings.AZURE_OPENAI_DALLE_DEPLOYMENT,
        prompt=prompt,
        n=1,
        size="1024x1024",
    )
    return response.data[0].url or ""
```

</details>

> **Exam Tips**
> - The exam distinguishes between DALL-E 2 and DALL-E 3 capabilities. DALL-E 3 supports `quality` (`"standard"` or `"hd"`) and `style` (`"vivid"` or `"natural"`) parameters. DALL-E 2 does not.
> - Know the supported image sizes. DALL-E 3: `1024x1024`, `1024x1792`, `1792x1024`. DALL-E 2: `256x256`, `512x512`, `1024x1024`.
> - Azure OpenAI image generation has built-in content filtering. The exam may ask about content policy violations and how to handle them (the API returns a specific error when a prompt is rejected).

---

## Checkpoint

After completing all three layers, verify everything works:

- **Chat works** — Send a message on `/generative`, get a response
- **Parameters affect output** — `temperature=0` produces consistent results; `temperature=1.5` produces varied results
- **Image generation works** — Enter an image prompt, receive a generated image
- **No errors in backend terminal** — Uvicorn output shows 200 status codes

Your `openai_service.py` should now have three implemented pieces:

| Function | Status |
|----------|--------|
| `_get_client()` | Helper that creates an `AzureOpenAI` client |
| `chat_completion()` | Sends messages with tuning parameters, returns response text |
| `generate_image()` | Generates an image from a prompt, returns the image URL |
| `chat_with_tools()` | Still raises `NotImplementedError` — implemented in [Lab 06](06-agents.md) |

<details><summary>Complete openai_service.py (after Lab 01)</summary>

```python
import logging

from openai import AzureOpenAI

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> AzureOpenAI:
    if not settings.AZURE_OPENAI_ENDPOINT or not settings.AZURE_OPENAI_KEY:
        raise RuntimeError(
            "Azure OpenAI not configured. "
            "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY."
        )
    return AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )


def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> str:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
    )
    return response.choices[0].message.content or ""


def generate_image(prompt: str) -> str:
    client = _get_client()
    response = client.images.generate(
        model=settings.AZURE_OPENAI_DALLE_DEPLOYMENT,
        prompt=prompt,
        n=1,
        size="1024x1024",
    )
    return response.data[0].url or ""


# chat_with_tools() — not yet implemented (Lab 06)
def chat_with_tools(
    messages: list[dict],
    system_instructions: str,
    tools: list[str],
) -> dict:
    raise NotImplementedError("See docs/labs/06-agents.md — Layer 1")
```

</details>

<!-- section:layer:4 -->
## Layer 4: Streaming Responses

- Implement streaming chat completion with stream=True
- Return Server-Sent Events (SSE) from the FastAPI endpoint
- Test streaming output in the frontend

> **What you will learn**
> - How to switch from buffered to streaming chat completions
> - How to read `ChatCompletionChunk` delta objects as they arrive
> - How to build a FastAPI Server-Sent Events (SSE) endpoint with `StreamingResponse`
>
> *Exam objective: "Implement solutions that use Azure OpenAI" — understanding streaming response patterns and real-time token delivery.*

### Concepts

By default, `client.chat.completions.create()` waits for the entire response to be generated before returning. With `stream=True`, the API returns an iterator of **chunks** instead, each containing a small piece (delta) of the response. This enables token-by-token output in the frontend — the user sees text appearing as it is generated rather than waiting for the full response.

| Mode | Return Type | Behavior |
|------|------------|----------|
| `stream=False` (default) | `ChatCompletion` | Blocks until the full response is ready. `response.choices[0].message.content` contains the complete text. |
| `stream=True` | Iterator of `ChatCompletionChunk` | Yields chunks as they are generated. Each chunk has `choices[0].delta.content` with a small piece of text (often a single token). |

Each `ChatCompletionChunk` has this structure:

```python
chunk.choices[0].delta.content  # str | None — the new token(s)
chunk.choices[0].delta.role     # str | None — only set in the first chunk
chunk.choices[0].finish_reason  # str | None — "stop" in the last chunk, None otherwise
```

To deliver chunks to the browser, the standard pattern is **Server-Sent Events (SSE)**. SSE is a simple HTTP-based protocol where the server sends a stream of `data: ...\n\n` messages over a long-lived connection. FastAPI supports this via `StreamingResponse` with `media_type="text/event-stream"`.

SSE message format:
```
data: {"content": "Hello"}\n\n
data: {"content": " world"}\n\n
data: [DONE]\n\n
```

### Implementation

You will add two things: a generator function in the service file and an SSE endpoint in the router.

**Step 1: Implement `chat_completion_stream()` in `openai_service.py`**

Create a new generator function below `chat_completion()` that:

- Accepts the same parameters as `chat_completion()` (messages, model, temperature, etc.)
- Calls `client.chat.completions.create()` with `stream=True`
- Iterates over the returned chunks
- For each chunk, checks if `choices[0].delta.content` is not `None`
- Yields each non-None content string

<checkpoint id="l4-stream-impl"></checkpoint>

**Step 2: Create an SSE endpoint in the generative router**

Open `backend/app/routers/generative.py` and add a new endpoint `POST /api/generative/chat/stream` that:

- Accepts the same request body as the existing `/chat` endpoint
- Calls `chat_completion_stream()` to get the generator
- Wraps the generator in a helper that formats each chunk as an SSE `data:` line (JSON with a `content` field)
- Sends a final `data: [DONE]\n\n` message when the generator is exhausted
- Returns a `StreamingResponse` with `media_type="text/event-stream"`

<checkpoint id="l4-stream-sse"></checkpoint>

<details><summary>Hint — skeleton code</summary>

**Service function (`openai_service.py`):**

```python
from collections.abc import Generator

def chat_completion_stream(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> Generator[str, None, None]:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    stream = client.chat.completions.create(
        model=___,
        messages=___,
        temperature=___,
        top_p=___,
        max_tokens=___,
        frequency_penalty=___,
        presence_penalty=___,
        stream=___,
    )
    for ___ in stream:
        if not chunk.choices:  # Azure content filtering may send empty choices
            continue
        content = chunk.choices[0].___.___
        if content is not ___:
            yield ___
```

**Router endpoint (`generative.py`):**

```python
import json
from fastapi.responses import StreamingResponse

@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    gen = openai_service.chat_completion_stream(
        messages=[m.model_dump() for m in req.messages],
        temperature=req.temperature,
        # ... pass all parameters
    )

    def event_generator():
        for token in ___:
            yield f"data: {json.dumps({'content': ___})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(___, media_type="___")
```

</details>

### Test It

> 1. Restart the backend server after adding the new endpoint
> 2. Test with `curl` to see the raw SSE stream:
>    ```bash
>    curl -N -X POST http://localhost:8000/api/generative/chat/stream \
>      -H "Content-Type: application/json" \
>      -d '{"messages": [{"role": "user", "content": "Count from 1 to 10 slowly"}]}'
>    ```
> 3. You should see `data: {"content": "..."}` lines appearing one by one
> 4. The stream should end with `data: [DONE]`
> 5. If the frontend supports streaming, test there as well — text should appear token by token
>
> **No output?** Check that you set `stream=True` in the `create()` call.
> **All text at once?** Make sure your `StreamingResponse` uses `media_type="text/event-stream"` and you are yielding individual chunks, not accumulating them.

<checkpoint id="l4-stream-test"></checkpoint>

<details><summary>Full Solution</summary>

**Add to `openai_service.py`** (after `chat_completion`):

```python
from collections.abc import Generator


def chat_completion_stream(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> Generator[str, None, None]:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    stream = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
        stream=True,
    )
    for chunk in stream:
        if not chunk.choices:  # Azure content filtering may send empty choices
            continue
        content = chunk.choices[0].delta.content
        if content is not None:
            yield content
```

**Add to `generative.py` router:**

```python
import json
from fastapi.responses import StreamingResponse


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    gen = openai_service.chat_completion_stream(
        messages=[m.model_dump() for m in req.messages],
        model=req.model,
        temperature=req.temperature,
        top_p=req.top_p,
        max_tokens=req.max_tokens,
        frequency_penalty=req.frequency_penalty,
        presence_penalty=req.presence_penalty,
    )

    def event_generator():
        for token in gen:
            yield f"data: {json.dumps({'content': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

</details>

> **Exam Tips**
> - The exam may ask about the difference between synchronous and streaming responses. Know that streaming uses Server-Sent Events (SSE) and returns partial results as they are generated.
> - Streaming does not change the total number of tokens consumed — the same prompt and completion tokens are used regardless of whether you stream.
> - In production, streaming improves perceived latency (time-to-first-token) but does not reduce total generation time. The exam may test this distinction.
> - Know that each chunk's `finish_reason` is `None` until the final chunk, which has `finish_reason="stop"`. This is how the client knows the stream is complete.

---

<!-- section:layer:5 -->
## Layer 5: Token Counting & Cost Estimation

- Use tiktoken to count prompt/completion tokens
- Return token usage and estimated cost in API response
- Verify token counts match Azure usage metadata

> **What you will learn**
> - How to use the `tiktoken` library to pre-count tokens before sending a request
> - How to read the `usage` object from the API response to get actual token counts
> - How to calculate estimated cost based on model pricing
>
> *Exam objective: "Configure Azure OpenAI model parameters" — understanding token limits, usage tracking, and cost management for Azure OpenAI deployments.*

### Concepts

Every Azure OpenAI API call consumes **tokens** — units of text that the model processes. Understanding token usage is critical for cost management, staying within rate limits, and ensuring prompts fit within the model's context window.

**tiktoken** is OpenAI's open-source tokenizer library. It lets you count tokens locally before making an API call. Each model family uses a specific encoding:

| Model | Encoding | Package |
|-------|----------|---------|
| `gpt-4o`, `gpt-4o-mini` | `o200k_base` | `tiktoken` |
| `gpt-4`, `gpt-4-turbo` | `cl100k_base` | `tiktoken` |
| `gpt-35-turbo` | `cl100k_base` | `tiktoken` |

After each API call, the response includes a `usage` object with actual counts from the server:

```python
response.usage.prompt_tokens       # tokens in the input messages
response.usage.completion_tokens   # tokens in the generated response
response.usage.total_tokens        # prompt_tokens + completion_tokens
```

**Cost formula:**

```
cost = (prompt_tokens / 1_000_000) * input_price_per_million
     + (completion_tokens / 1_000_000) * output_price_per_million
```

Approximate Azure OpenAI pricing (Global Standard, subject to change):

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| `gpt-4o` | $2.50 | $10.00 |
| `gpt-4o-mini` | $0.15 | $0.60 |
| `gpt-35-turbo` | $1.50 | $2.00 |

### Implementation

You will create a helper function for token counting and enhance `chat_completion()` to return usage data.

**Step 1: Create a `count_tokens()` helper in `openai_service.py`**

Write a function that:

- Takes a list of messages (same format as `chat_completion()`) and an optional model name
- Uses `tiktoken.encoding_for_model()` to get the correct encoding for the model
- Counts tokens for each message, accounting for the per-message overhead (each message costs 3 extra tokens for `<|start|>role\ncontent<|end|>\n`)
- Adds 3 tokens for the assistant reply priming
- Returns the total token count as an integer

<checkpoint id="l5-tiktoken"></checkpoint>

**Step 2: Enhance `chat_completion()` to return usage data**

Modify `chat_completion()` (or create a new `chat_completion_with_usage()` variant) that:

- Calls the API as before
- Reads `response.usage` to get `prompt_tokens`, `completion_tokens`, and `total_tokens`
- Calculates estimated cost using a pricing lookup for the model
- Returns a dictionary containing `content`, `usage` (token counts), and `estimated_cost`

<checkpoint id="l5-usage-response"></checkpoint>

<details><summary>Hint — skeleton code</summary>

**Token counting helper:**

```python
import tiktoken

def count_tokens(messages: list[dict], model: str = "gpt-4o-mini") -> int:
    try:
        encoding = tiktoken.encoding_for_model(___)
    except KeyError:
        encoding = tiktoken.get_encoding("o200k_base")

    tokens_per_message = 3  # every message has <|start|>role/name\n and content<|end|>\n

    num_tokens = 0
    for message in ___:
        num_tokens += ___
        for key, value in message.items():
            num_tokens += len(encoding.encode(___))
            if key == "name":
                num_tokens += 1  # name field costs an extra token
    num_tokens += 3  # priming for assistant reply
    return ___
```

**Enhanced chat function:**

```python
PRICING = {
    "gpt-4o":       {"input": 2.50, "output": 10.00},
    "gpt-4o-mini":  {"input": 0.15, "output": 0.60},
    "gpt-35-turbo": {"input": 1.50, "output": 2.00},
}

def chat_completion_with_usage(
    messages: list[dict],
    model: str | None = None,
    # ... same params as chat_completion
) -> dict:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    response = client.chat.completions.create(
        model=___,
        messages=___,
        # ... all params
    )
    content = response.choices[0].message.___ or ""
    usage = response.___
    prices = PRICING.get(deployment, PRICING["gpt-4o-mini"])
    cost = (usage.___ / 1_000_000) * prices["input"] \
         + (usage.___ / 1_000_000) * prices["output"]
    return {
        "content": ___,
        "usage": {
            "prompt_tokens": usage.___,
            "completion_tokens": usage.___,
            "total_tokens": usage.___,
        },
        "estimated_cost_usd": round(___, 6),
    }
```

</details>

### Test It

> 1. Restart the backend server after making changes
> 2. Test `count_tokens()` locally in a Python shell:
>    ```python
>    from app.services.openai_service import count_tokens
>    msgs = [{"role": "user", "content": "Hello, how are you?"}]
>    print(count_tokens(msgs))  # Should print a number like 12-15
>    ```
> 3. Call the enhanced endpoint and check that `usage` and `estimated_cost_usd` are in the response
> 4. Compare your local `count_tokens()` result with the `prompt_tokens` from the API response — they should be close (within 1-3 tokens due to formatting overhead)
>
> **Import error for tiktoken?** Make sure to `pip install tiktoken` and add it to `requirements.txt`.
> **usage is None?** Verify you are reading `response.usage`, not `response.choices[0].usage`. The usage object lives at the top level of the response.

<checkpoint id="l5-test"></checkpoint>

<details><summary>Full Solution</summary>

**Add to `openai_service.py`:**

```python
import tiktoken


PRICING_PER_MILLION = {
    "gpt-4o":       {"input": 2.50, "output": 10.00},
    "gpt-4o-mini":  {"input": 0.15, "output": 0.60},
    "gpt-35-turbo": {"input": 1.50, "output": 2.00},
}


def count_tokens(messages: list[dict], model: str = "gpt-4o-mini") -> int:
    """Count the number of tokens in a list of messages using tiktoken."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("o200k_base")

    tokens_per_message = 3
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens += 1  # name field costs an extra token
    num_tokens += 3  # assistant reply priming
    return num_tokens


def chat_completion_with_usage(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> dict:
    """Chat completion that returns content, token usage, and estimated cost."""
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
    )
    content = response.choices[0].message.content or ""
    usage = response.usage

    prices = PRICING_PER_MILLION.get(deployment, PRICING_PER_MILLION["gpt-4o-mini"])
    cost = 0.0
    if usage:
        cost = (usage.prompt_tokens / 1_000_000) * prices["input"] \
             + (usage.completion_tokens / 1_000_000) * prices["output"]

    return {
        "content": content,
        "usage": {
            "prompt_tokens": usage.prompt_tokens if usage else 0,
            "completion_tokens": usage.completion_tokens if usage else 0,
            "total_tokens": usage.total_tokens if usage else 0,
        },
        "estimated_cost_usd": round(cost, 6),
    }
```

</details>

> **Exam Tips**
> - The exam expects you to understand that token counts affect both cost and rate limits. Azure OpenAI has per-minute token rate limits that are configured per deployment.
> - Know that `max_tokens` limits the **completion** tokens only. The prompt tokens are determined by the input messages and are not capped by this parameter.
> - The exam may ask how to estimate whether a prompt fits within a model's context window. The answer involves counting prompt tokens (using tiktoken or the API) and comparing against the model's maximum context length (e.g., 128k for GPT-4o).
> - Azure OpenAI usage data is also available in the Azure Portal under **Metrics** for monitoring and cost management at scale. The exam tests awareness of monitoring tools.

---

<!-- section:layer:6 -->
## Layer 6: Entra ID Authentication & Governance

- Review Entra ID (AAD) auth flow for Azure OpenAI
- Understand RBAC roles: Cognitive Services User vs Contributor
- Review managed identity patterns for production deployments
- Answer self-check questions on authentication

> **What you will learn**
> - How to replace API key authentication with Microsoft Entra ID (formerly Azure AD) token-based auth
> - Which RBAC roles grant access to Azure OpenAI and what each role allows
> - How managed identities eliminate the need for stored credentials in production
> - When to use system-assigned vs. user-assigned managed identities
>
> *Exam objective: "Plan and manage an Azure AI solution" — configuring authentication, authorization, and identity management for Azure AI services.*

### Concepts

In Layers 1-5, you authenticated to Azure OpenAI using an **API key** (`settings.AZURE_OPENAI_KEY`). This is the simplest method but has significant limitations in production:

- API keys are long-lived secrets that can be leaked
- They cannot be scoped to specific users or applications
- They provide full access — no fine-grained permissions
- Rotating keys requires updating every application that uses them

**Microsoft Entra ID** (formerly Azure Active Directory / Azure AD) is the recommended production authentication method. Instead of a static key, your application obtains a short-lived OAuth 2.0 token from Entra ID and passes it with each request.

<checkpoint id="l6-entra-concept"></checkpoint>

#### Authentication Flow: API Key vs. Entra ID

| Aspect | API Key | Entra ID Token |
|--------|---------|---------------|
| Credential type | Static string (never expires unless rotated) | Short-lived token (typically 1 hour) |
| Storage | Must be stored securely (Key Vault, env vars) | No secret to store when using managed identity |
| Granularity | Full access — anyone with the key has the same permissions | RBAC-based — different users/apps get different roles |
| Rotation | Manual — update all consumers when key changes | Automatic — tokens are refreshed transparently |
| Audit trail | Limited — logs show the key was used, not who used it | Full — logs show which identity made each request |
| Exam preference | Acceptable for development and testing | Recommended for production (exam expects this answer) |

#### Entra ID with the OpenAI SDK

The `AzureOpenAI` client accepts an `azure_ad_token_provider` parameter — a callable that returns a valid token. The `azure-identity` package provides `DefaultAzureCredential`, which automatically tries multiple authentication methods in order (environment variables, managed identity, Azure CLI, etc.).

```python
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

# Create a token provider for the Azure OpenAI scope
credential = DefaultAzureCredential()
token_provider = get_bearer_token_provider(
    credential,
    "https://cognitiveservices.azure.com/.default"
)

# Create the client — no api_key needed
client = AzureOpenAI(
    azure_endpoint="https://your-resource.openai.azure.com/",
    azure_ad_token_provider=token_provider,
    api_version="2024-10-21",
)

# Use the client normally — token is fetched/refreshed automatically
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
)
```

Note the scope string `"https://cognitiveservices.azure.com/.default"` — this is the resource identifier for all Azure Cognitive Services (including Azure OpenAI). The exam may test this exact value.

#### RBAC Roles for Azure OpenAI

Access is controlled through Azure Role-Based Access Control (RBAC). You assign roles to identities (users, groups, service principals, managed identities) at a specific scope (resource, resource group, or subscription).

<checkpoint id="l6-rbac-roles"></checkpoint>

| Role | Can Call APIs | Can Manage Resource | Can Manage Deployments | Typical Use |
|------|:------------:|:-------------------:|:---------------------:|------------|
| **Cognitive Services OpenAI User** | Yes | No | No | Applications that only need to call the API (chat, completions, embeddings). Most common role for production apps. |
| **Cognitive Services OpenAI Contributor** | Yes | No | Yes (create/delete deployments) | CI/CD pipelines that deploy models. Dev teams that manage their own deployments. |
| **Cognitive Services User** | Yes (all Cognitive Services) | No | No | Applications that use multiple AI services (not just OpenAI). Broader than OpenAI User. |
| **Cognitive Services Contributor** | Yes (all Cognitive Services) | Yes (create/delete resources) | Yes | Admins who manage AI service resources. Full control except role assignment. |

> **Key distinction for the exam:** "OpenAI User" vs. "OpenAI Contributor" — the User role can call the API but cannot create or delete model deployments. The Contributor role can do both. Choose the least-privileged role that meets the requirement.

#### Managed Identities

A **managed identity** is an Entra ID identity that Azure creates and manages for your resource. It eliminates the need to store any credentials — Azure handles the entire token lifecycle.

<checkpoint id="l6-managed-identity"></checkpoint>

| Type | Created With | Lifecycle | Shared Across Resources | When to Use |
|------|-------------|-----------|:-----------------------:|------------|
| **System-assigned** | Enabled on the resource (e.g., App Service, VM) | Tied to the resource — deleted when the resource is deleted | No — one identity per resource | Single-purpose apps where each resource needs its own identity. Simplest to set up. |
| **User-assigned** | Created as a standalone Azure resource | Independent — persists until explicitly deleted | Yes — can be assigned to multiple resources | Multiple resources that need the same permissions (e.g., several App Services accessing the same OpenAI resource). |

**Setup pattern for an App Service calling Azure OpenAI:**

1. Enable system-assigned managed identity on the App Service
2. Go to the Azure OpenAI resource > **Access control (IAM)**
3. Click **Add role assignment**
4. Select **Cognitive Services OpenAI User**
5. Assign it to the App Service's managed identity
6. In your code, use `DefaultAzureCredential()` — it automatically detects the managed identity

No API key, no Key Vault, no secret rotation. `DefaultAzureCredential` handles everything.

#### How `DefaultAzureCredential` Selects an Identity

`DefaultAzureCredential` tries authentication methods in a fixed order and uses the first one that succeeds:

1. **Environment variables** (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`)
2. **Workload identity** (Kubernetes)
3. **Managed identity** (App Service, VM, Container Apps)
4. **Shared token cache** (Windows only)
5. **Visual Studio Code**
6. **Azure CLI** (`az login`)
7. **Azure PowerShell**
8. **Azure Developer CLI** (`azd auth login`)

> *This is the default chain as of `azure-identity` 1.x. See [official docs](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential) for the full list.*

In production (App Service with managed identity), it picks up method 3 automatically. In local development, it falls through to method 4 (your `az login` session). This means the same code works in both environments without changes.

### Self-Check Questions

**Q1.** Your company requires that no API keys are stored in application configuration. You deploy an Azure OpenAI-backed application to Azure App Service. What is the recommended authentication approach?

<details><summary>Answer</summary>

Enable a **system-assigned managed identity** on the App Service, assign it the **Cognitive Services OpenAI User** RBAC role on the Azure OpenAI resource, and use `DefaultAzureCredential` in your code. This eliminates all stored secrets — the managed identity obtains tokens automatically from Entra ID.

</details>

**Q2.** A developer needs to create and delete model deployments in Azure OpenAI via a CI/CD pipeline, but should NOT be able to delete the Azure OpenAI resource itself. Which RBAC role should you assign?

<details><summary>Answer</summary>

**Cognitive Services OpenAI Contributor**. This role allows managing deployments (create, delete, update) and calling the API, but does not grant permission to delete or modify the Azure OpenAI resource itself. "Cognitive Services Contributor" would be too broad — it allows managing the resource.

</details>

**Q3.** What is the token scope (resource URI) used when requesting an Entra ID token for Azure OpenAI?

<details><summary>Answer</summary>

`https://cognitiveservices.azure.com/.default` — This is the scope for all Azure Cognitive Services, including Azure OpenAI. It is passed to `get_bearer_token_provider()` or used directly in token acquisition calls.

</details>

**Q4.** You have three App Services that all need to call the same Azure OpenAI resource with identical permissions. Should you use system-assigned or user-assigned managed identities?

<details><summary>Answer</summary>

**User-assigned managed identity**. Create a single user-assigned identity, assign it the Cognitive Services OpenAI User role on the OpenAI resource, and attach the same identity to all three App Services. This is cleaner than creating three separate system-assigned identities with three separate role assignments. User-assigned identities are preferred when multiple resources share the same access requirements.

</details>

<checkpoint id="l6-questions"></checkpoint>

> **Exam Tips**
> - The exam strongly favors Entra ID over API keys for production scenarios. If a question asks about "the most secure" or "recommended" authentication method, the answer is almost always Entra ID with managed identity.
> - Know the four Cognitive Services RBAC roles and what each allows. The exam frequently asks you to choose the **least privileged** role for a given scenario.
> - `DefaultAzureCredential` is the recommended credential class because it works in both local development (Azure CLI) and production (managed identity) without code changes. The exam tests this.
> - System-assigned managed identities are tied to the resource lifecycle (deleted when the resource is deleted). User-assigned managed identities are independent resources. The exam may ask which to choose based on requirements.
> - The token scope `https://cognitiveservices.azure.com/.default` applies to all Cognitive Services, not just OpenAI. This is a common exam question.

---

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** You are building an application that uses Azure OpenAI. You need the model to produce consistent, reproducible output for the same input. Which parameter should you set?

A) `max_tokens=1`
B) `temperature=0`
C) `top_p=0`
D) `frequency_penalty=2.0`

<details><summary>Answer</summary>

**B) `temperature=0`** — Setting temperature to 0 makes the model nearly deterministic, always picking the most likely next token. `top_p=0` would also reduce randomness but Microsoft recommends adjusting temperature OR top_p, not both. `max_tokens=1` would limit the response to one token, not make it consistent.

</details>

**Q2.** A developer creates an `AzureOpenAI` client but gets an authentication error. The code uses `api_key` and `azure_endpoint` correctly. What is the most likely missing parameter?

A) `model`
B) `api_version`
C) `organization`
D) `deployment_name`

<details><summary>Answer</summary>

**B) `api_version`** — The `AzureOpenAI` client requires `api_version` (e.g., `"2024-10-21"`), which is not needed for the standard OpenAI client. This is a key Azure-specific requirement. `model` and `deployment_name` are passed to individual API calls, not the client constructor.

</details>

**Q3.** In Azure OpenAI, what does the `model` parameter in `client.chat.completions.create()` refer to?

A) The underlying model name (e.g., `gpt-4o`)
B) The deployment name you created in Azure AI Foundry
C) The Azure resource name
D) The API version string

<details><summary>Answer</summary>

**B) The deployment name** — In Azure OpenAI, the `model` parameter maps to your deployment name, not the underlying model name. You might deploy `gpt-4o-mini` with a deployment name like `my-gpt-deployment`, and you would pass `"my-gpt-deployment"` as the model parameter.

</details>

**Q4.** You need to generate images using DALL-E 3 in Azure OpenAI. Which image sizes are supported? (Select all that apply.)

A) `256x256`
B) `512x512`
C) `1024x1024`
D) `1024x1792`

<details><summary>Answer</summary>

**C) `1024x1024` and D) `1024x1792`** — DALL-E 3 supports `1024x1024`, `1024x1792`, and `1792x1024`. The smaller sizes (`256x256`, `512x512`) are only supported by DALL-E 2.

</details>

<!-- section:summary -->
## What You Learned

| Concept | How You Used It | Exam Relevance |
|---------|----------------|----------------|
| `AzureOpenAI` client creation | `_get_client()` with endpoint, key, API version | Core setup question type |
| Chat Completions API | `client.chat.completions.create()` with messages | Most common API on the exam |
| Deployment vs. model names | `model` parameter = deployment name | Frequent exam distractor |
| Parameter tuning | temperature, top_p, max_tokens, penalties | "Choose the right parameter" questions |
| DALL-E image generation | `client.images.generate()` with prompt and size | Separate deployment, different API |

## Next Lab

Continue to **[Lab 02: RAG Engine](02-rag.md)** — you will implement Azure AI Search integration and connect it to the chat completion function you just built, creating a retrieval-augmented generation pipeline.

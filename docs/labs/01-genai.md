# Lab 01: GenAI Lab

> Exam domain: D2 — Implement generative AI solutions (15-20%) | Service file: `backend/app/services/openai_service.py` | Estimated time: 45 minutes

## Overview

In this lab you connect the backend to Azure OpenAI and implement three layers of generative AI functionality: chat completion, parameter tuning, and image generation with DALL-E. By the end, the GenAI Lab page in the frontend will be fully functional — you can chat with GPT and generate images.

This is the first lab because Azure OpenAI is the backbone of multiple later labs (RAG, Agents). Everything you learn here carries forward.

**What you will implement:**

| Layer | Function | What It Does |
|-------|----------|-------------|
| 1 | `chat_completion()` | Send messages to GPT, get a response |
| 2 | (enhance Layer 1) | Understand and apply parameter tuning |
| 3 | `generate_image()` | Generate images with DALL-E |

## Prerequisites

- An active Azure subscription (free trial works)
- An Azure OpenAI resource with a GPT model deployed (e.g., `gpt-4o`, `gpt-4o-mini`, or `gpt-35-turbo`)
- A DALL-E 3 deployment in the same Azure OpenAI resource (for Layer 3)
- Python virtual environment set up and `requirements.txt` installed (see `docs/labs/README.md`)
- Both frontend and backend servers running

## Azure Setup

If you have not yet created your Azure OpenAI resource and deployments, follow these steps.

### 1. Create an Azure OpenAI resource

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

### 2. Deploy a GPT model

1. In your Azure OpenAI resource, go to **Model deployments** (or open [Azure AI Foundry](https://ai.azure.com))
2. Click **Create new deployment**
3. Select a model: `gpt-4o-mini` is recommended for labs (cheaper, fast, capable)
4. Give the deployment a name (e.g., `gpt-4o-mini`) — this becomes your `AZURE_OPENAI_DEPLOYMENT` value
5. Set tokens-per-minute rate limit as needed (default is fine for labs)
6. Click **Create**

### 3. Deploy DALL-E 3

1. Create another deployment in the same resource
2. Select model: `dall-e-3`
3. Deployment name: `dall-e-3` (this is the default in `config.py`)
4. Click **Create**

### 4. Configure your .env file

From your Azure OpenAI resource's **Keys and Endpoint** page, copy the endpoint and one of the keys. Edit `backend/.env`:

```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_DALLE_DEPLOYMENT=dall-e-3
AZURE_OPENAI_API_VERSION=2024-06-01
```

Restart the backend server after editing `.env`.

---

## Layer 1: Chat Completion

### What You Will Learn

- How to create an Azure OpenAI client using the `openai` Python SDK
- How to call the Chat Completions API with a list of messages
- How the SDK differentiates between standard OpenAI and Azure OpenAI

These map directly to AI-102 exam objective: **"Implement solutions that use Azure OpenAI"** — specifically creating chat completions and configuring Azure-specific client parameters.

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

**Step 2: Implement `chat_completion()`**

Replace the `raise NotImplementedError(...)` line. Your implementation should:

- Call `_get_client()` to get a client instance
- Determine which deployment to use: use the `model` parameter if provided, otherwise fall back to `settings.AZURE_OPENAI_DEPLOYMENT`
- Call `client.chat.completions.create()` with the deployment name and the `messages` list
- For now, you can ignore the other parameters (temperature, top_p, etc.) — Layer 2 covers those
- Extract the content from the first choice in the response and return it as a string
- Handle the case where content might be `None` by returning an empty string

<details><summary>Hint</summary>

Here is the skeleton. Fill in the parts marked `___`:

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

1. Make sure both servers are running
2. Open http://localhost:3000/generative in your browser
3. Type a message in the chat input (e.g., "What is Azure OpenAI?")
4. You should receive a response from GPT displayed in the chat

If you see a 503 error, check that your `.env` values are correct and the backend was restarted. If you see a 500 error, check the backend terminal for the full error traceback.

You can also test directly via Swagger UI at http://localhost:8000/docs — find the `POST /api/generative/chat` endpoint and send:

```json
{
  "messages": [
    {"role": "user", "content": "Hello, what can you do?"}
  ]
}
```

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

### Exam Tips

- The exam tests whether you know the difference between `OpenAI` and `AzureOpenAI` client classes. Azure requires `azure_endpoint` and `api_version` — standard OpenAI does not.
- You must know that the `model` parameter in Azure OpenAI refers to the **deployment name**, not the model name (e.g., `"gpt-4o-mini"` as a deployment name, not the underlying model ID).
- The exam may ask about authentication methods. Azure OpenAI supports both API key and Microsoft Entra ID (Azure AD) token authentication. This lab uses API key; the exam may test both.

---

## Layer 2: Parameter Tuning

### What You Will Learn

- What each chat completion parameter controls
- How to pass tuning parameters through to the API
- How different parameter values affect response behavior

This maps to AI-102 exam objective: **"Configure Azure OpenAI model parameters"** — understanding temperature, top_p, frequency_penalty, presence_penalty, and max_tokens.

### Concepts

The Chat Completions API accepts several parameters that control how the model generates text:

| Parameter | Range | Default | What It Controls |
|-----------|-------|---------|-----------------|
| `temperature` | 0.0 - 2.0 | 0.7 | Randomness. Lower = more deterministic, higher = more creative. At 0, the model almost always picks the most likely next token. |
| `top_p` | 0.0 - 1.0 | 1.0 | Nucleus sampling. Only considers tokens whose cumulative probability reaches this threshold. 0.1 means only the top 10% probability mass is considered. |
| `max_tokens` | 1 - model max | 800 | Maximum number of tokens in the response. Limits output length. Does not guarantee the model will use all of them. |
| `frequency_penalty` | -2.0 - 2.0 | 0.0 | Penalizes tokens based on how often they have appeared so far. Positive values reduce repetition. |
| `presence_penalty` | -2.0 - 2.0 | 0.0 | Penalizes tokens based on whether they have appeared at all (regardless of frequency). Positive values encourage topic diversity. |

**Important:** `temperature` and `top_p` both control randomness. Microsoft recommends changing one or the other, not both at the same time. The exam may test this.

### Implementation

This layer does not require a new function. You need to enhance your Layer 1 `chat_completion()` implementation to pass all the parameters through to `client.chat.completions.create()`.

Go back to your `chat_completion()` function and add the five parameters (`temperature`, `top_p`, `max_tokens`, `frequency_penalty`, `presence_penalty`) to the `client.chat.completions.create()` call.

<details><summary>Hint</summary>

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

1. Open http://localhost:3000/generative
2. If the frontend has parameter controls (sliders or inputs), try these experiments:
   - Set `temperature=0` and ask the same question twice — responses should be nearly identical
   - Set `temperature=1.5` and ask the same question — responses should be more varied and creative
   - Set `max_tokens=20` — responses will be cut short
   - Set `frequency_penalty=1.5` — the model will avoid repeating itself
3. You can also test via Swagger UI by adding parameters to the request body:

```json
{
  "messages": [{"role": "user", "content": "Write a short poem about clouds"}],
  "temperature": 0.0,
  "max_tokens": 100
}
```

Try the same prompt with `temperature: 1.5` and compare the output.

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

### Exam Tips

- The exam will ask you to choose the right parameter for a given scenario. Example: "You need the model to produce consistent, reproducible output" — the answer is `temperature=0`.
- Know that `temperature` and `top_p` should not both be modified at the same time. This is a common exam question distractor.
- `max_tokens` limits the **response** length, not the prompt length. The prompt length is limited by the model's context window (e.g., 128k tokens for GPT-4o). The exam may test this distinction.

---

## Layer 3: DALL-E Image Generation

### What You Will Learn

- How to use the Images API to generate images from text prompts
- How DALL-E deployments differ from chat model deployments
- How to handle the image response (URL vs. base64)

This maps to AI-102 exam objective: **"Generate images by using Azure OpenAI DALL-E"**.

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

<details><summary>Hint</summary>

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

1. Open http://localhost:3000/generative
2. Find the image generation feature (separate from chat)
3. Enter a prompt like "A futuristic city skyline at sunset, digital art"
4. Wait 10-20 seconds — DALL-E takes longer than chat completions
5. You should see a generated image displayed in the UI

Via Swagger UI, send a `POST /api/generative/image`:

```json
{
  "prompt": "A cat wearing a tiny astronaut helmet, watercolor painting"
}
```

The response will contain a `url` field with a link to the generated image.

**Troubleshooting:**
- If you get a content policy error, your prompt may have been filtered by Azure's content safety system. Try a different, clearly safe prompt.
- If you get a 404 or deployment error, verify that `AZURE_OPENAI_DALLE_DEPLOYMENT` in your `.env` matches your actual DALL-E deployment name.

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

### Exam Tips

- The exam distinguishes between DALL-E 2 and DALL-E 3 capabilities. DALL-E 3 supports `quality` (`"standard"` or `"hd"`) and `style` (`"vivid"` or `"natural"`) parameters. DALL-E 2 does not.
- Know the supported image sizes. DALL-E 3: `1024x1024`, `1024x1792`, `1792x1024`. DALL-E 2: `256x256`, `512x512`, `1024x1024`.
- Azure OpenAI image generation has built-in content filtering. The exam may ask about content policy violations and how to handle them (the API returns a specific error when a prompt is rejected).

---

## Checkpoint

After completing all three layers, verify everything works:

- [ ] **Chat works**: Go to `/generative`, send a message, get a response
- [ ] **Parameters affect output**: Sending the same message with `temperature=0` produces consistent results; `temperature=1.5` produces varied results
- [ ] **Image generation works**: Enter an image prompt, receive a generated image
- [ ] **No errors in backend terminal**: The uvicorn output should show 200 status codes for `/api/generative/chat` and `/api/generative/image`

Your `openai_service.py` should now have three implemented pieces:
1. `_get_client()` — helper that creates an `AzureOpenAI` client
2. `chat_completion()` — sends messages with tuning parameters, returns response text
3. `generate_image()` — generates an image from a prompt, returns the image URL

The `chat_with_tools()` function should still raise `NotImplementedError` — that is implemented in Lab 06 (Agent Workshop).

## What You Learned

| Concept | How You Used It | Exam Relevance |
|---------|----------------|----------------|
| `AzureOpenAI` client creation | `_get_client()` with endpoint, key, API version | Core setup question type |
| Chat Completions API | `client.chat.completions.create()` with messages | Most common API on the exam |
| Deployment vs. model names | `model` parameter = deployment name | Frequent exam distractor |
| Parameter tuning | temperature, top_p, max_tokens, penalties | "Choose the right parameter" questions |
| DALL-E image generation | `client.images.generate()` with prompt and size | Separate deployment, different API |

## Next Lab

Continue to **[Lab 02: RAG Engine](02-rag.md)** where you will implement Azure AI Search integration and connect it to the chat completion function you just built, creating a retrieval-augmented generation pipeline.

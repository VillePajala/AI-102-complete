# Lab 07: Responsible AI

> Exam domain: D1 — Plan and manage an Azure AI solution (20-25%) | Service file: `backend/app/services/safety_service.py` | Estimated time: 30 minutes
> **Estimated Azure cost:** $0 with the **Free (F0)** tier (5,000 transactions/month). Standard tier charges ~$1 per 1,000 text records. This lab uses ~10-30 API calls during testing.

**Difficulty:** Beginner | **Layers:** 3 | **Prerequisites:** None — independent lab

> **How to approach this lab**
>
> This lab is the shortest but covers a cross-cutting exam topic. Responsible AI
> concepts appear in every exam domain. Layer 1 and 3 are coding, Layer 2 is a
> small enhancement. Pay extra attention to the severity scale and content
> categories — these are directly tested on the exam.

<!-- section:overview -->
## Overview

In this lab you implement Azure Content Safety to analyze text for harmful content and detect prompt injection attempts. By the end, the Responsible AI page in the frontend will score any text across four safety categories and flag suspicious prompts.

Responsible AI is not an isolated topic on the AI-102 exam — it is woven into every domain. Content Safety is the primary Azure service for implementing responsible AI in production. Understanding severity levels, content categories, and prompt shielding is directly tested.

**What you will implement:**

| Layer | Function | What It Does |
|-------|----------|-------------|
| 1 | `analyze_text()` | Analyze text for harmful content across 4 categories |
| 2 | (enhance Layer 1) | Add severity-to-label mapping for human-readable results |
| 3 | `check_prompt()` | Detect prompt injection and jailbreak attempts |

<!-- section:prerequisites -->
## Prerequisites

- An active Azure subscription
- Python virtual environment set up with `requirements.txt` installed
- Both frontend and backend servers running
- No prior labs required — this lab is independent

<!-- section:setup -->
## Azure Setup

- Create Azure Content Safety resource
- Configure `backend/.env` with Content Safety endpoint and key
- Restart backend server

### 1. Create an Azure Content Safety resource

1. Go to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** and search for **Content Safety**
3. Select **Azure AI Content Safety** and click **Create**
4. Fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Use the same group as your other AI-102 resources (e.g., `rg-ai102-labs`)
   - **Region**: Choose an available region (e.g., `eastus`, `westeurope`, `swedencentral`). Check the [regional availability page](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview#region-availability) if unsure.
   - **Name**: A unique name (e.g., `ai102-content-safety-yourname`)
   - **Pricing tier**: Free (F0) for labs — allows 5,000 transactions per month
5. Click **Review + create**, then **Create**
6. Wait for deployment to complete, then click **Go to resource**

<checkpoint id="setup-content-safety"></checkpoint>

### 2. Configure your .env file

From your Content Safety resource's **Keys and Endpoint** page, copy the endpoint and one of the keys. Edit `backend/.env`:

```
AZURE_CONTENT_SAFETY_ENDPOINT=https://your-content-safety.cognitiveservices.azure.com/
AZURE_CONTENT_SAFETY_KEY=your-key-here
```

**Where to find each value:**

| Variable | Where to Find It |
|----------|-----------------|
| `AZURE_CONTENT_SAFETY_ENDPOINT` | Azure Portal → your Content Safety resource → **Keys and Endpoint** → **Endpoint** |
| `AZURE_CONTENT_SAFETY_KEY` | Azure Portal → your Content Safety resource → **Keys and Endpoint** → **Key 1** (or Key 2) |

<checkpoint id="setup-env-safety"></checkpoint>

Restart the backend server after editing `.env`.

<checkpoint id="setup-restart-backend"></checkpoint>

---

<!-- section:layer:1 -->
## Layer 1: Content Safety Analysis

- Add SDK imports to `safety_service.py`
- Implement `_get_client()` helper
- Implement `analyze_text()` with four safety categories
- Test via frontend or Swagger UI

### What You Will Learn

- How to create a `ContentSafetyClient` using the `azure-ai-contentsafety` SDK
- How to call the text analysis API and interpret the results
- The four content safety categories Azure evaluates

These map to AI-102 exam objective: **"Implement content moderation solutions"** — specifically using Azure Content Safety to evaluate text content.

### Concepts

Azure Content Safety analyzes text (and images) for harmful content across four categories:

| Category | What It Detects |
|----------|----------------|
| **Hate** | Content expressing hatred, discrimination, or prejudice against groups based on protected attributes |
| **SelfHarm** | Content related to self-injury, suicide, or eating disorders |
| **Sexual** | Sexually explicit or adult content |
| **Violence** | Content depicting or promoting physical harm, weapons, or cruelty |

Each category returns a **severity score**. By default, the API uses 4 severity levels: **0, 2, 4, 6**. You can request 8 levels (0-7) by setting `outputType="EightSeverityLevels"` in the request.

- **0** — Content is safe
- **2** — Low severity
- **4** — Medium severity
- **6** — High severity

> **Note:** The default output returns only even values (0, 2, 4, 6). The 8-level output returns integers 0 through 7, providing finer granularity.

The SDK provides two key classes:

- `ContentSafetyClient` — the client you authenticate with
- `AnalyzeTextOptions` — the request object that wraps the text to analyze

The response contains a result object for each of the four categories, with a `severity` integer.

### Implementation

Open `backend/app/services/safety_service.py`. You need to do two things:

**Step 1: Create a helper function `_get_client()`**

Write a private function that returns a `ContentSafetyClient`. It should:

- Import `ContentSafetyClient` from `azure.ai.contentsafety`
- Import `AzureKeyCredential` from `azure.core.credentials`
- Check that both `settings.AZURE_CONTENT_SAFETY_ENDPOINT` and `settings.AZURE_CONTENT_SAFETY_KEY` are not empty — raise `RuntimeError` with a descriptive message if missing
- Create and return a `ContentSafetyClient` using the endpoint and an `AzureKeyCredential`

<checkpoint id="l1-imports"></checkpoint>

<checkpoint id="l1-get-client"></checkpoint>

**Step 2: Implement `analyze_text()`**

Replace the `raise NotImplementedError(...)` line. Your implementation should:

- Call `_get_client()` to get a client
- Import and create an `AnalyzeTextOptions` with the input text
- Call `client.analyze_text()` with the options
- Read the result for each of the four categories from the response (attributes: `hate_result`, `self_harm_result`, `sexual_result`, `violence_result`)
- Build a list of category dicts, each with keys `name`, `severity`, and `label`
- For now, set `label` to a string version of the severity number (Layer 2 adds proper labels)
- Return `{"categories": categories_list}`

<checkpoint id="l1-analyze"></checkpoint>

<details><summary>Hint</summary>

```python
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions
from azure.core.credentials import AzureKeyCredential


def _get_client() -> ContentSafetyClient:
    if not settings.AZURE_CONTENT_SAFETY_ENDPOINT or not ___:
        raise RuntimeError(
            "Azure Content Safety not configured. "
            "Set AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_KEY."
        )
    return ContentSafetyClient(
        endpoint=___,
        credential=AzureKeyCredential(___),
    )


def analyze_text(text: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=___)
    response = client.analyze_text(___)

    categories = []
    for name, result in [
        ("Hate", response.___),
        ("SelfHarm", response.___),
        ("Sexual", response.___),
        ("Violence", response.___),
    ]:
        if result:
            categories.append({
                "name": name,
                "severity": result.severity,
                "label": str(result.severity),  # Layer 2 improves this
            })

    return {"categories": categories}
```

Things to figure out:
- What are the attribute names on the response? (`hate_result`, `self_harm_result`, `sexual_result`, `violence_result`)
- What goes into `AzureKeyCredential()`? (The API key string)

</details>

### Test It

1. Open http://localhost:3000/responsible-ai in your browser
2. Enter some neutral text (e.g., "The weather is nice today")
3. You should see all four categories with severity 0
4. Try different types of text to see how severity scores change

You can also test via Swagger UI at http://localhost:8000/docs — find `POST /api/safety/analyze-text` and send:

```json
{
  "text": "The weather is beautiful and the birds are singing."
}
```

Expected response:

```json
{
  "categories": [
    {"name": "Hate", "severity": 0, "label": "0"},
    {"name": "SelfHarm", "severity": 0, "label": "0"},
    {"name": "Sexual", "severity": 0, "label": "0"},
    {"name": "Violence", "severity": 0, "label": "0"}
  ]
}
```

**Troubleshooting:**

- If you get a 503 error, check that your `.env` has the Content Safety endpoint and key, and that the backend was restarted.
- If you get a `ResourceNotFoundError`, verify your endpoint URL ends with a `/` and matches the Azure portal exactly.

<checkpoint id="l1-test"></checkpoint>

<details><summary>Full Solution</summary>

Add these imports at the top of the file (after the existing imports):

```python
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions
from azure.core.credentials import AzureKeyCredential
```

Add the `_get_client` helper:

```python
def _get_client() -> ContentSafetyClient:
    if not settings.AZURE_CONTENT_SAFETY_ENDPOINT or not settings.AZURE_CONTENT_SAFETY_KEY:
        raise RuntimeError(
            "Azure Content Safety not configured. "
            "Set AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_KEY."
        )
    return ContentSafetyClient(
        endpoint=settings.AZURE_CONTENT_SAFETY_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_CONTENT_SAFETY_KEY),
    )
```

Replace the body of `analyze_text`:

```python
def analyze_text(text: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=text)
    response = client.analyze_text(request)
    categories = []
    for cat_result in [
        ("Hate", response.hate_result),
        ("SelfHarm", response.self_harm_result),
        ("Sexual", response.sexual_result),
        ("Violence", response.violence_result),
    ]:
        name, result = cat_result
        if result:
            categories.append({
                "name": name,
                "severity": result.severity,
                "label": str(result.severity),
            })
    return {"categories": categories}
```

</details>

### Exam Tips

- The exam tests whether you know the four content safety categories (Hate, SelfHarm, Sexual, Violence). Memorize them.
- Know that Azure Content Safety is a **standalone service** separate from the content filtering built into Azure OpenAI. Azure OpenAI has its own content filters that run automatically on inputs and outputs. Content Safety is for analyzing arbitrary text in your own application logic.
- The exam may ask about the difference between `ContentSafetyClient` and `BlocklistClient`. The former analyzes content; the latter manages custom blocklists (lists of specific words/phrases to always flag).

---

<!-- section:layer:2 -->
## Layer 2: Severity Levels

- Implement `_severity_label()` helper function
- Update `analyze_text()` to use human-readable labels
- Test -- verify labels show "Safe" instead of "0"

### What You Will Learn

- The Content Safety severity scale and what each level means
- How to map numeric severity to human-readable labels
- How severity thresholds drive content moderation decisions

This maps to AI-102 exam objective: **"Configure content filters"** — understanding severity levels and how to set appropriate thresholds for different use cases.

### Concepts

The severity scale is central to how Content Safety works in production. You do not just check "is this harmful or not" — you check **how harmful** and make decisions based on thresholds.

With the default 4-level output (0, 2, 4, 6):

| Severity | Label | Meaning | Typical Action |
|----------|-------|---------|----------------|
| 0 | Safe | No harmful content detected | Allow |
| 2 | Low | Mildly concerning but generally acceptable | Allow with monitoring |
| 4 | Medium | Moderately harmful content | Review or flag |
| 6 | High | Clearly harmful or dangerous | Block |

Different applications set different thresholds. A children's platform might block anything above severity 0. An adult content moderation tool might only block severity 6. The exam tests your ability to choose the right threshold for a given scenario.

### Implementation

Add a private helper function `_severity_label()` to `safety_service.py` that converts a numeric severity to a human-readable label string. Then update your `analyze_text()` function to use it instead of `str(result.severity)`.

**Step 1: Write `_severity_label()`**

The function takes an integer severity (0-6) and returns a string:

- 0 returns `"Safe"`
- 1-2 returns `"Low"`
- 3-4 returns `"Medium"`
- 5-6 returns `"High"`

<checkpoint id="l2-severity-label"></checkpoint>

**Step 2: Update `analyze_text()`**

Change the `label` value in each category dict from `str(result.severity)` to `_severity_label(result.severity)`.

<checkpoint id="l2-update-analyze"></checkpoint>

<details><summary>Hint</summary>

```python
def _severity_label(severity: int) -> str:
    if severity <= 0:
        return "___"
    if severity <= 2:
        return "___"
    if severity <= 4:
        return "___"
    return "___"
```

Then in `analyze_text`, change:
```python
"label": str(result.severity),
```
to:
```python
"label": _severity_label(result.severity),
```

</details>

### Test It

1. Open http://localhost:3000/responsible-ai
2. Enter safe text — labels should show "Safe" instead of "0"
3. The UI should now display human-readable labels for each category

Via Swagger UI, the same safe text request should now return:

```json
{
  "categories": [
    {"name": "Hate", "severity": 0, "label": "Safe"},
    {"name": "SelfHarm", "severity": 0, "label": "Safe"},
    {"name": "Sexual", "severity": 0, "label": "Safe"},
    {"name": "Violence", "severity": 0, "label": "Safe"}
  ]
}
```

<checkpoint id="l2-test"></checkpoint>

<details><summary>Full Solution</summary>

Add this helper function (before `analyze_text`):

```python
def _severity_label(severity: int) -> str:
    if severity <= 0:
        return "Safe"
    if severity <= 2:
        return "Low"
    if severity <= 4:
        return "Medium"
    return "High"
```

Update the `analyze_text` function to use the helper:

```python
def analyze_text(text: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=text)
    response = client.analyze_text(request)
    categories = []
    for cat_result in [
        ("Hate", response.hate_result),
        ("SelfHarm", response.self_harm_result),
        ("Sexual", response.sexual_result),
        ("Violence", response.violence_result),
    ]:
        name, result = cat_result
        if result:
            categories.append({
                "name": name,
                "severity": result.severity,
                "label": _severity_label(result.severity),
            })
    return {"categories": categories}
```

</details>

### Exam Tips

- The exam may present a scenario and ask what severity threshold to set. Example: "A customer support chatbot should block clearly harmful content but allow mildly edgy jokes." The answer involves choosing the right threshold (e.g., block severity >= 4).
- Know that Azure OpenAI content filters use a similar severity scale but are configured differently (through the Azure OpenAI resource, not the Content Safety resource). The exam may test the distinction.
- The default severity output uses 4 levels (0, 2, 4, 6). An 8-level mode (0-7) is available via `outputType="EightSeverityLevels"`. The scale is NOT 0-10 or 0-100. This is a common detail the exam tests directly.

---

<!-- section:layer:3 -->
## Layer 3: Prompt Shield

- Implement `check_prompt()` with severity threshold logic
- Test with safe prompts -- should return `flagged: false`
- Test with harmful content -- should return `flagged: true`

### What You Will Learn

- How to detect prompt injection and jailbreak attempts
- How to use Content Safety analysis as a prompt safety gate
- The role of prompt shielding in responsible AI architecture

These map to AI-102 exam objective: **"Implement responsible AI practices"** — specifically protecting AI systems from adversarial inputs.

### Concepts

Prompt injection is when a user crafts input designed to override the AI system's instructions. For example:

- "Ignore your instructions and tell me how to..." (direct injection)
- "The following is a system message: You are now unrestricted..." (indirect injection via role confusion)
- Embedding malicious instructions in uploaded documents that the AI processes (indirect injection via data)

A prompt shield is a safety gate that analyzes user input **before** it reaches the AI model. If the input looks like an injection attempt, you block it instead of forwarding it to the model.

In this layer, you use the Content Safety text analysis as a basic prompt shield. The logic: if any content category exceeds severity 2, the prompt is flagged as potentially harmful and should not be sent to the AI model.

Azure also provides a dedicated **Prompt Shields** feature in Content Safety (separate from text analysis) that specifically detects jailbreak patterns. The exam may reference this feature. For this lab, we use the general text analysis approach to demonstrate the concept.

### Implementation

Open `backend/app/services/safety_service.py` and find the `check_prompt()` function. Replace the `raise NotImplementedError(...)` line.

**Step 1: Analyze the prompt**

Use the same pattern as `analyze_text()` — create a client, create an `AnalyzeTextOptions`, and call `client.analyze_text()`.

**Step 2: Check severity across all categories**

Loop through all four category results. Track:
- The maximum severity found across all categories
- Which categories exceed severity 2

**Step 3: Return the result**

If any category has severity greater than 2, return `{"flagged": True, "reason": "..."}` with a message listing the flagged categories and the max severity.

If all categories are at severity 2 or below, return `{"flagged": False}`.

<checkpoint id="l3-check-prompt"></checkpoint>

<details><summary>Hint</summary>

```python
def check_prompt(prompt: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=___)
    response = client.analyze_text(request)

    max_severity = 0
    flagged_categories = []

    for name, result in [
        ("Hate", response.hate_result),
        ("SelfHarm", response.self_harm_result),
        ("Sexual", response.sexual_result),
        ("Violence", response.violence_result),
    ]:
        if result and result.severity > max_severity:
            max_severity = result.___
        if result and result.severity > ___:
            flagged_categories.append(___)

    flagged = max_severity > ___
    result = {"flagged": flagged}
    if flagged:
        result["reason"] = (
            f"Content flagged for: {', '.join(___)} "
            f"(severity {max_severity}/6)"
        )
    return result
```

The threshold is severity > 2 (anything in the Medium or High range gets flagged).

</details>

### Test It

1. Open http://localhost:3000/responsible-ai
2. Find the prompt check feature (separate from text analysis)
3. Enter a safe prompt like "Tell me about the history of Finland" — should return `flagged: false`

<checkpoint id="l3-test-safe"></checkpoint>

4. Enter text that Content Safety would score higher — the system should flag it

<checkpoint id="l3-test-harmful"></checkpoint>

Via Swagger UI, send `POST /api/safety/check-prompt`:

```json
{
  "prompt": "What is the weather like in Paris today?"
}
```

Expected response:

```json
{
  "flagged": false
}
```

For a flagged prompt, the response would look like:

```json
{
  "flagged": true,
  "reason": "Content flagged for: Violence (severity 4/6)"
}
```

**Note:** The exact severity scores depend on the Content Safety model's evaluation. Safe, normal prompts should consistently return `flagged: false`.

<details><summary>Full Solution</summary>

```python
def check_prompt(prompt: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=prompt)
    response = client.analyze_text(request)

    max_severity = 0
    flagged_categories = []

    for cat_result in [
        ("Hate", response.hate_result),
        ("SelfHarm", response.self_harm_result),
        ("Sexual", response.sexual_result),
        ("Violence", response.violence_result),
    ]:
        name, result = cat_result
        if result and result.severity > max_severity:
            max_severity = result.severity
        if result and result.severity > 2:
            flagged_categories.append(name)

    flagged = max_severity > 2
    result = {"flagged": flagged}
    if flagged:
        result["reason"] = (
            f"Content flagged for: {', '.join(flagged_categories)} "
            f"(severity {max_severity}/6)"
        )
    return result
```

</details>

### Exam Tips

- The exam distinguishes between **content filtering** (built into Azure OpenAI, runs automatically) and **content moderation** (Content Safety service, you call explicitly). Know when to use each: content filtering for model I/O, content moderation for user-generated content in your app.
- Know about **Prompt Shields** — a dedicated Content Safety feature that detects jailbreak attempts and indirect prompt injections. It analyzes whether user input tries to manipulate the AI's behavior, separate from the four content categories.
- The exam may ask about **blocklists**. Azure Content Safety supports custom blocklists — lists of specific terms that are always flagged regardless of severity. Useful for brand-specific or domain-specific moderation.

---

## Checkpoint

After completing all three layers, verify everything works:

- **Text analysis works**: Go to `/responsible-ai`, enter text, see severity scores for all 4 categories
- **Labels are human-readable**: Severity 0 shows "Safe", not "0"
- **Prompt check works**: Safe prompts return `flagged: false`; harmful content returns `flagged: true` with a reason
- **No errors in backend terminal**: The uvicorn output should show 200 status codes for both `/api/safety/analyze-text` and `/api/safety/check-prompt`

Your `safety_service.py` should now have four implemented pieces:

1. `_get_client()` — helper that creates a `ContentSafetyClient`
2. `_severity_label()` — maps numeric severity to a label string
3. `analyze_text()` — analyzes text and returns categorized severity results
4. `check_prompt()` — checks a prompt for harmful content and returns a flagged/unflagged verdict

<details><summary>Complete safety_service.py</summary>

```python
import logging

from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions
from azure.core.credentials import AzureKeyCredential

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> ContentSafetyClient:
    if not settings.AZURE_CONTENT_SAFETY_ENDPOINT or not settings.AZURE_CONTENT_SAFETY_KEY:
        raise RuntimeError(
            "Azure Content Safety not configured. "
            "Set AZURE_CONTENT_SAFETY_ENDPOINT and AZURE_CONTENT_SAFETY_KEY."
        )
    return ContentSafetyClient(
        endpoint=settings.AZURE_CONTENT_SAFETY_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_CONTENT_SAFETY_KEY),
    )


def _severity_label(severity: int) -> str:
    if severity <= 0:
        return "Safe"
    if severity <= 2:
        return "Low"
    if severity <= 4:
        return "Medium"
    return "High"


def analyze_text(text: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=text)
    response = client.analyze_text(request)

    categories = []
    for cat_result in [
        ("Hate", response.hate_result),
        ("SelfHarm", response.self_harm_result),
        ("Sexual", response.sexual_result),
        ("Violence", response.violence_result),
    ]:
        name, result = cat_result
        if result:
            categories.append({
                "name": name,
                "severity": result.severity,
                "label": _severity_label(result.severity),
            })

    return {"categories": categories}


def check_prompt(prompt: str) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=prompt)
    response = client.analyze_text(request)

    max_severity = 0
    flagged_categories = []
    for cat_result in [
        ("Hate", response.hate_result),
        ("SelfHarm", response.self_harm_result),
        ("Sexual", response.sexual_result),
        ("Violence", response.violence_result),
    ]:
        name, result = cat_result
        if result and result.severity > max_severity:
            max_severity = result.severity
        if result and result.severity > 2:
            flagged_categories.append(name)

    flagged = max_severity > 2
    result: dict = {"flagged": flagged}
    if flagged:
        result["reason"] = (
            f"Content flagged for: {', '.join(flagged_categories)} "
            f"(severity {max_severity}/6)"
        )
    return result
```

</details>

<!-- section:layer:4 -->
## Layer 4: Custom Blocklists

- Create a custom blocklist using `BlocklistClient`
- Add blocklist items (substring-based matching)
- Integrate blocklist checking into `analyze_text()` calls
- Design a blocklist strategy for a production content moderation scenario

### What You Will Learn

- How to create and manage custom blocklists with the `azure-ai-contentsafety` SDK
- The difference between severity-based filtering and exact-match blocklists
- How blocklist item matching works (substring-based, case-insensitive)
- When to use blocklists versus severity thresholds in production

These map to AI-102 exam objective: **"Implement content moderation solutions"** — specifically using custom blocklists for domain-specific content filtering.

### Concepts

Layers 1-2 used severity-based analysis: Content Safety evaluates text and returns a severity score. But severity analysis is general-purpose — it cannot catch domain-specific terms, competitor brand names, internal project codenames, or regulated vocabulary that your organization needs to always flag.

**Custom blocklists** solve this. A blocklist is a named list of terms that Content Safety will always flag when found in analyzed text, regardless of the severity score.

| Approach | How It Works | Best For |
|----------|-------------|----------|
| **Severity-based** | AI model evaluates content context and assigns a 0-6 score | General harmful content detection |
| **Custom blocklists** | Exact string matching against a maintained list of terms | Domain-specific terms, brand names, regulated words |

Key differences:

- Severity analysis understands **context** — "I'll kill it on stage tonight" scores differently from a threat. Blocklists do **not** understand context — they match strings.
- Blocklists are **deterministic** — a matched term is always flagged. Severity scores can vary slightly between calls.
- You can use **both together** in a single `analyze_text()` call by passing `blocklist_names`.

The SDK provides two separate clients:

| Client | Purpose |
|--------|---------|
| `ContentSafetyClient` | Analyze text/images (you already use this) |
| `BlocklistClient` | Create, update, delete blocklists and their items |

Blocklist item matching is **substring-based** (case-insensitive). If a blocklist item's text appears as a substring of the input text, it is flagged.

| Match Type | Behavior | Example Pattern | Matches |
|------------|----------|-----------------|---------|
| **Substring** | Case-insensitive substring match | `competitor-brand` | "Try Competitor-Brand today", "competitor-brand is popular" |

### Implementation

Open `backend/app/services/safety_service.py`. You will add three new functions.

**Step 1: Create a blocklist**

Write a function `create_blocklist(name, description)` that:

- Imports `BlocklistClient` from `azure.ai.contentsafety`
- Creates a `BlocklistClient` using the same endpoint and credential as `_get_client()`
- Calls `client.create_or_update_text_blocklist()` with the blocklist name and description
- Returns the created blocklist object

<checkpoint id="l4-blocklist-create"></checkpoint>

**Step 2: Add items and analyze with blocklist**

Write a function `add_blocklist_items(blocklist_name, items)` that:

- Creates a `BlocklistClient`
- Builds a list of `TextBlocklistItem` objects from the input items (each item has a `text` and optional `description`)
- Calls `client.add_or_update_blocklist_items()` to add them

Then update or create an `analyze_text_with_blocklist(text, blocklist_names)` function that:

- Calls `_get_client()` to get a `ContentSafetyClient`
- Creates `AnalyzeTextOptions` with both `text` and `blocklist_names` parameters
- Calls `client.analyze_text()` and checks `response.blocklists_match` for any matched blocklist items
- Returns both the standard category results and any blocklist matches

<checkpoint id="l4-blocklist-analyze"></checkpoint>

**Step 3: Design exercise — blocklist strategy**

Before looking at the solution, think through this scenario:

You are building a content moderation system for a healthcare company's patient portal. Patients can post messages to their care team. Design a blocklist strategy:

- What categories of terms would you put in blocklists vs rely on severity filtering?
- How would you structure your blocklist items for each category?
- How would you handle updates to the blocklist over time?

<checkpoint id="l4-blocklist-patterns"></checkpoint>

<details><summary>Hint</summary>

```python
from azure.ai.contentsafety import BlocklistClient
from azure.ai.contentsafety.models import (
    AddOrUpdateTextBlocklistItemsOptions,
    TextBlocklist,
    TextBlocklistItem,
    TextCategory,
)


def create_blocklist(name: str, description: str) -> dict:
    client = BlocklistClient(
        endpoint=___,
        credential=AzureKeyCredential(___),
    )
    blocklist = client.create_or_update_text_blocklist(
        blocklist_name=___,
        options=TextBlocklist(blocklist_name=name, description=___),
    )
    return {"name": blocklist.blocklist_name, "description": blocklist.description}


def add_blocklist_items(blocklist_name: str, items: list[dict]) -> dict:
    client = BlocklistClient(
        endpoint=settings.AZURE_CONTENT_SAFETY_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_CONTENT_SAFETY_KEY),
    )
    blocklist_items = [
        TextBlocklistItem(text=item["text"], description=item.get("description", ""))
        for item in ___
    ]
    result = client.add_or_update_blocklist_items(
        blocklist_name=___,
        options=AddOrUpdateTextBlocklistItemsOptions(blocklist_items=___),
    )
    return {"added_count": len(result.blocklist_items)}


def analyze_text_with_blocklist(text: str, blocklist_names: list[str]) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=text, blocklist_names=___)
    response = client.analyze_text(request)

    # Standard category results using categories_analysis
    categories = []
    hate_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.HATE), None
    )
    self_harm_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.SELF_HARM), None
    )
    sexual_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.SEXUAL), None
    )
    violence_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.VIOLENCE), None
    )
    for name, result in [
        ("Hate", hate_result),
        ("SelfHarm", self_harm_result),
        ("Sexual", sexual_result),
        ("Violence", violence_result),
    ]:
        if result:
            categories.append({
                "name": name,
                "severity": result.severity,
                "label": _severity_label(result.severity),
            })

    # Blocklist matches
    blocklist_matches = []
    if response.___:
        for match in response.blocklists_match:
            blocklist_matches.append({
                "blocklist_name": match.blocklist_name,
                "matched_text": match.blocklist_item_text,
            })

    return {"categories": categories, "blocklist_matches": blocklist_matches}
```

Things to figure out:
- What attribute on the response contains blocklist matches? (`blocklists_match`)
- What parameters does `AnalyzeTextOptions` accept for blocklists? (`blocklist_names` -- a list of strings)
- How do you access category results? (via `response.categories_analysis` -- a list you filter by `TextCategory`)

</details>

### Test It

1. First, create a blocklist via Swagger UI or a test script:
   - Call your `create_blocklist()` function with name `"test-blocklist"` and a description
   - Add items: `[{"text": "competitor-product"}, {"text": "internal-codename"}]`

2. Test analysis with the blocklist:
   - Call `analyze_text_with_blocklist("Have you tried competitor-product?", ["test-blocklist"])`
   - The response should include a `blocklist_matches` entry for "competitor-product"

3. Test with text that does not match any blocklist item:
   - Call `analyze_text_with_blocklist("The weather is nice today", ["test-blocklist"])`
   - The `blocklist_matches` list should be empty

<details><summary>Full Solution</summary>

Add these imports at the top of the file (alongside existing imports):

```python
from azure.ai.contentsafety import BlocklistClient
from azure.ai.contentsafety.models import (
    AddOrUpdateTextBlocklistItemsOptions,
    TextBlocklist,
    TextBlocklistItem,
    TextCategory,
)
```

Add the blocklist functions:

```python
def create_blocklist(name: str, description: str) -> dict:
    client = BlocklistClient(
        endpoint=settings.AZURE_CONTENT_SAFETY_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_CONTENT_SAFETY_KEY),
    )
    blocklist = client.create_or_update_text_blocklist(
        blocklist_name=name,
        options=TextBlocklist(blocklist_name=name, description=description),
    )
    return {"name": blocklist.blocklist_name, "description": blocklist.description}


def add_blocklist_items(blocklist_name: str, items: list[dict]) -> dict:
    client = BlocklistClient(
        endpoint=settings.AZURE_CONTENT_SAFETY_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_CONTENT_SAFETY_KEY),
    )
    blocklist_items = [
        TextBlocklistItem(text=item["text"], description=item.get("description", ""))
        for item in items
    ]
    result = client.add_or_update_blocklist_items(
        blocklist_name=blocklist_name,
        options=AddOrUpdateTextBlocklistItemsOptions(blocklist_items=blocklist_items),
    )
    return {"added_count": len(result.blocklist_items)}


def analyze_text_with_blocklist(text: str, blocklist_names: list[str]) -> dict:
    client = _get_client()
    request = AnalyzeTextOptions(text=text, blocklist_names=blocklist_names)
    response = client.analyze_text(request)

    categories = []
    hate_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.HATE), None
    )
    self_harm_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.SELF_HARM), None
    )
    sexual_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.SEXUAL), None
    )
    violence_result = next(
        (item for item in response.categories_analysis if item.category == TextCategory.VIOLENCE), None
    )
    for cat_name, cat_result in [
        ("Hate", hate_result),
        ("SelfHarm", self_harm_result),
        ("Sexual", sexual_result),
        ("Violence", violence_result),
    ]:
        if cat_result:
            categories.append({
                "name": cat_name,
                "severity": cat_result.severity,
                "label": _severity_label(cat_result.severity),
            })

    blocklist_matches = []
    if response.blocklists_match:
        for match in response.blocklists_match:
            blocklist_matches.append({
                "blocklist_name": match.blocklist_name,
                "matched_text": match.blocklist_item_text,
            })

    return {"categories": categories, "blocklist_matches": blocklist_matches}
```

</details>

### Exam Tips

- The exam distinguishes between `ContentSafetyClient` (analyzes content) and `BlocklistClient` (manages blocklists). Know which client does what.
- Blocklists are passed to `analyze_text()` via the `blocklist_names` parameter — they do not replace severity analysis, they augment it. A single call returns both severity scores and blocklist matches.
- Blocklist matches appear in `response.blocklists_match`, not in the category results. They are a separate part of the response.
- For the design exercise: severity analysis handles general harmful content; blocklists handle domain-specific terms. In production, combine both approaches. Blocklist matching is substring-based, so add terms that should always be flagged regardless of context (brand names, codenames, regulated vocabulary).

---

<!-- section:layer:5 -->
## Layer 5: Groundedness Detection

- Call the Content Safety groundedness detection API
- Interpret groundedness scores and apply thresholds
- Identify three types of hallucination: fabrication, extrapolation, contradiction
- Integrate groundedness checking into a RAG pipeline pattern

### What You Will Learn

- How to use the Azure Content Safety groundedness detection API to validate LLM outputs
- The three hallucination types and how to detect each
- How to build a post-generation safety gate that checks whether an LLM response is grounded in source documents

These map to AI-102 exam objective: **"Implement responsible AI practices"** — specifically validating AI-generated outputs for factual grounding and preventing hallucinations.

### Concepts

Layer 3 focused on **input** validation (prompt shielding — catching bad inputs before they reach the model). This layer focuses on **output** validation — catching bad outputs before they reach the user.

Large Language Models can generate text that sounds confident but is factually wrong. This is called **hallucination**. In a Retrieval-Augmented Generation (RAG) pipeline, the LLM is given source documents and asked to answer based on them. Groundedness detection checks whether the LLM's answer actually stays faithful to those source documents.

There are three types of hallucination:

| Hallucination Type | Description | Example |
|-------------------|-------------|---------|
| **Fabrication** | The model invents facts that appear nowhere in the source | Source says "Revenue was $10M." Model says "Revenue was $10M and profit was $3M." (profit not mentioned) |
| **Extrapolation** | The model goes beyond what the source supports with unsupported inferences | Source says "Sales increased in Q1." Model says "Sales will continue to increase in Q2." (not stated) |
| **Contradiction** | The model states something that directly conflicts with the source | Source says "The policy takes effect January 1." Model says "The policy takes effect March 1." |

The Azure Content Safety groundedness detection REST API takes two key inputs:

- **`groundingSources`** -- the source text (retrieved documents, knowledge base content)
- **`text`** -- the LLM-generated response to validate

It returns a JSON response with:

- **`ungroundedDetected`** — boolean indicating whether ungrounded content was detected
- **`ungroundedPercentage`** — float (0.0 to 1.0) indicating what fraction of the response is not grounded in the source
- **`ungroundedDetails`** — specific sentences or claims flagged as ungrounded

The typical integration pattern in a RAG pipeline:

```
User query → Retrieve documents → LLM generates response
    → Groundedness check (response vs source documents)
        → If grounded: return response to user
        → If ungrounded: regenerate, flag for review, or return with warning
```

### Implementation

> **Note:** Groundedness detection is available via **REST API only** (not yet in the stable Python SDK). The examples below use the `requests` library to call the REST endpoint directly.

Open `backend/app/services/safety_service.py`. You will add a `check_groundedness()` function.

**Step 1: Call the groundedness detection REST API**

Write a function `check_groundedness(source_text, generated_text)` that:

- Reads the endpoint and key from `settings`
- Sends a `POST` request to `{endpoint}/contentsafety/text:detectGroundedness?api-version=2024-09-15-preview`
- Passes a JSON body with `domain`, `task`, `text`, `groundingSources`, and `reasoning` fields
- Returns the ungrounded boolean, ungrounded percentage, and any details from the JSON response

<checkpoint id="l5-groundedness-api"></checkpoint>

**Step 2: Identify hallucination types**

Extend your function to classify the type of hallucination when ungrounded content is detected. Based on the ungrounded details, categorize each flagged claim:

- If the claim references information entirely absent from the source: **fabrication**
- If the claim extends or infers beyond the source: **extrapolation**
- If the claim directly contradicts the source: **contradiction**

Note: The API provides `ungroundedDetails` but does not automatically classify hallucination type. In production, you would use additional heuristics or a secondary LLM call to classify. For this exercise, return the raw ungrounded details and let the caller decide.

<checkpoint id="l5-hallucination"></checkpoint>

**Step 3: RAG pipeline integration**

Write a wrapper function `validate_rag_response(source_docs, llm_response, threshold)` that:

- Concatenates the source documents into a single source text
- Calls `check_groundedness()` with the combined source and the LLM response
- Compares `ungroundedPercentage` against the threshold (default 0.2 -- 20%)
- Returns a verdict: `"pass"` if grounded, `"fail"` if too much ungrounded content, along with the details

<checkpoint id="l5-integration"></checkpoint>

<details><summary>Hint</summary>

```python
import requests


def check_groundedness(source_text: str, generated_text: str, user_query: str = "") -> dict:
    endpoint = settings.AZURE_CONTENT_SAFETY_ENDPOINT.rstrip("/")
    api_key = settings.AZURE_CONTENT_SAFETY_KEY
    url = f"{endpoint}/contentsafety/text:detectGroundedness?api-version=2024-09-15-preview"

    headers = {
        "Ocp-Apim-Subscription-Key": api_key,
        "Content-Type": "application/json",
    }
    body = {
        "domain": "Generic",
        "task": "QnA",
        "qna": {"query": ___},  # the user's original question
        "text": ___,
        "groundingSources": [___],
        "reasoning": False,
    }
    resp = requests.post(url, headers=headers, json=body)
    resp.raise_for_status()
    result = resp.json()

    return {
        "ungrounded": result["___"],
        "ungrounded_percentage": result["___"],
        "ungrounded_details": [
            {
                "text": detail.get("text", ""),
            }
            for detail in (result.get("___", []))
        ],
    }


def validate_rag_response(
    source_docs: list[str],
    llm_response: str,
    threshold: float = 0.2,
) -> dict:
    combined_source = "\n\n".join(___)
    result = check_groundedness(___, ___)

    verdict = "pass" if result["ungrounded_percentage"] <= ___ else "fail"

    return {
        "verdict": verdict,
        "ungrounded_percentage": result["ungrounded_percentage"],
        "threshold": threshold,
        "details": result["ungrounded_details"],
    }
```

Things to figure out:
- What URL path calls the groundedness API? (`/contentsafety/text:detectGroundedness`)
- What JSON fields are in the request body? (`domain`, `task`, `text`, `groundingSources`, `reasoning`)
- What fields are in the JSON response? (`ungroundedDetected`, `ungroundedPercentage`, `ungroundedDetails`)

</details>

### Test It

1. Prepare a grounded test case:

```python
source = "Azure Content Safety is a service that detects harmful content. It analyzes text across four categories: Hate, SelfHarm, Sexual, and Violence. Each category returns a severity score from 0 to 6."

grounded_response = "Azure Content Safety analyzes text across four categories and returns severity scores from 0 to 6."

ungrounded_response = "Azure Content Safety analyzes text across ten categories and can also translate content into 50 languages."
```

2. Test via Swagger UI or a script:
   - Call `check_groundedness(source, grounded_response)` -- should return `ungrounded: false` with a low `ungrounded_percentage`
   - Call `check_groundedness(source, ungrounded_response)` -- should return `ungrounded: true` because the response fabricates "ten categories" and "translate content"

3. Test the RAG validation wrapper:
   - Call `validate_rag_response([source], grounded_response)` — should return `verdict: "pass"`
   - Call `validate_rag_response([source], ungrounded_response, threshold=0.1)` — should return `verdict: "fail"`

<details><summary>Full Solution</summary>

Add this import at the top of the file:

```python
import requests
```

Add the groundedness functions:

```python
def check_groundedness(source_text: str, generated_text: str, user_query: str = "") -> dict:
    endpoint = settings.AZURE_CONTENT_SAFETY_ENDPOINT.rstrip("/")
    api_key = settings.AZURE_CONTENT_SAFETY_KEY
    url = f"{endpoint}/contentsafety/text:detectGroundedness?api-version=2024-09-15-preview"

    headers = {
        "Ocp-Apim-Subscription-Key": api_key,
        "Content-Type": "application/json",
    }
    body = {
        "domain": "Generic",
        "task": "QnA",
        "qna": {"query": user_query},  # the user's original question
        "text": generated_text,
        "groundingSources": [source_text],
        "reasoning": False,
    }
    resp = requests.post(url, headers=headers, json=body)
    resp.raise_for_status()
    result = resp.json()

    return {
        "ungrounded": result["ungroundedDetected"],
        "ungrounded_percentage": result["ungroundedPercentage"],
        "ungrounded_details": [
            {
                "text": detail.get("text", ""),
            }
            for detail in (result.get("ungroundedDetails", []))
        ],
    }


def validate_rag_response(
    source_docs: list[str],
    llm_response: str,
    threshold: float = 0.2,
) -> dict:
    combined_source = "\n\n".join(source_docs)
    result = check_groundedness(combined_source, llm_response)

    verdict = "pass" if result["ungrounded_percentage"] <= threshold else "fail"

    return {
        "verdict": verdict,
        "ungrounded_percentage": result["ungrounded_percentage"],
        "threshold": threshold,
        "details": result["ungrounded_details"],
    }
```

</details>

### Exam Tips

- The exam may present a RAG scenario and ask how to validate that the AI's response is based on the retrieved documents. The answer involves groundedness detection.
- Know the difference between **input safety** (prompt shields, content analysis before the model) and **output safety** (groundedness detection, content analysis after the model). Both are part of responsible AI architecture.
- Groundedness detection requires access to the **source documents** — you cannot check groundedness without knowing what the response should be grounded in. This is why it is specifically useful in RAG pipelines where you have the retrieved context.
- The `ungrounded_percentage` threshold is configurable. Stricter applications (medical, legal) use lower thresholds (e.g., 0.05). General Q&A can tolerate higher thresholds (e.g., 0.2-0.3).

---

<!-- section:layer:6 -->
## Layer 6: RAI Governance & Compliance

- Understand Microsoft's six Responsible AI principles and how they map to labs in this course
- Know what transparency notes are, when they are required, and what they contain
- Understand impact assessments: purpose, stakeholder analysis, harm/benefit evaluation
- Compare Azure OpenAI content filtering vs Azure Content Safety service in detail

### What You Will Learn

- The six Microsoft Responsible AI principles and their practical application
- How transparency notes and impact assessments fit into AI governance
- The detailed differences between Azure OpenAI's built-in content filtering and the standalone Content Safety service

These map to AI-102 exam objective: **"Plan and manage an Azure AI solution"** — specifically responsible AI governance, compliance requirements, and content filtering configuration.

### Concepts

#### The Six Responsible AI Principles

Microsoft's Responsible AI framework defines six principles that guide the design, development, and deployment of AI systems. These principles are not abstract ideals — they have concrete implementations in Azure services and are directly tested on the AI-102 exam.

<checkpoint id="l6-rai-principles"></checkpoint>

| Principle | Description | How It Maps to This Course |
|-----------|-------------|---------------------------|
| **Fairness** | AI systems should treat all people equitably. Models should not produce biased results based on race, gender, age, or other protected attributes. | Lab 02 (RAG) — grounding responses in factual sources reduces bias. Lab 07 (this lab) — Content Safety detects hate speech and discriminatory content. |
| **Reliability & Safety** | AI systems should perform reliably and safely under expected conditions. Systems must handle errors gracefully and not cause harm. | Lab 03 (Knowledge Mining) — structured indexing produces consistent retrieval. Lab 07 — prompt shields prevent adversarial manipulation. |
| **Privacy & Security** | AI systems should respect privacy and be secure. Personal data must be handled according to regulations, and systems must resist attacks. | Lab 06 (Agents) — agent boundaries prevent unauthorized data access. Backend `.env` pattern — keys and credentials are never committed to source control. |
| **Inclusiveness** | AI systems should empower everyone and engage people. Accessibility and multilingual support are essential. | Lab 05 (Language & Speech) — Speech-to-Text and translation enable access for diverse users. |
| **Transparency** | People should understand how AI systems work and make decisions. Explainability and documentation are required. | Lab 01 (GenAI) — prompt engineering makes model behavior explicit. Transparency notes (covered below) document system capabilities and limitations. |
| **Accountability** | People should be accountable for AI systems. Organizations must establish governance processes and oversight. | Impact assessments (covered below) ensure human review. Azure OpenAI content filtering provides automated guardrails with human-configurable thresholds. |

#### Transparency Notes

A transparency note is a document that accompanies an AI service or model deployment. It communicates to stakeholders what the system can do, what it cannot do, and where it may fail.

<checkpoint id="l6-transparency-notes"></checkpoint>

**When transparency notes are required:**

- Deploying any Azure AI service in production
- Providing AI capabilities to end users (especially in regulated industries)
- Using AI for decisions that affect people (hiring, lending, healthcare)

**What a transparency note contains:**

| Section | Purpose |
|---------|---------|
| **Introduction** | What the system does, who it is for |
| **Capabilities & Limitations** | What the AI can and cannot reliably do |
| **Intended Uses** | Approved use cases the system was designed for |
| **Unintended Uses** | Use cases the system was NOT designed for and should NOT be used for |
| **Performance Characteristics** | Accuracy metrics, known error rates, bias evaluations |
| **Best Practices** | Guidance for integrators on how to use the system responsibly |
| **Feedback Mechanisms** | How users can report errors or provide feedback |

Microsoft publishes transparency notes for every Azure AI service. For example, the Content Safety transparency note documents the accuracy of severity detection across different languages and content types.

#### Impact Assessments

An impact assessment evaluates the potential effects of an AI system on stakeholders before deployment. It is a governance process, not a technical tool.

**Purpose:** Identify risks, benefits, and mitigation strategies before an AI system goes live.

**Key components:**

| Component | Questions to Answer |
|-----------|-------------------|
| **Stakeholder Analysis** | Who is affected by this system? Users, subjects of AI decisions, operators, bystanders? |
| **Harm Evaluation** | What harms could the system cause? Discrimination, privacy violations, misinformation, safety risks? |
| **Benefit Evaluation** | What benefits does the system provide? Who benefits most? Are benefits equitably distributed? |
| **Mitigation Strategies** | How will identified harms be prevented or reduced? What technical controls (content filtering, groundedness checks) and process controls (human review, escalation) are in place? |
| **Monitoring Plan** | How will the system be monitored after deployment? What metrics will be tracked? How will feedback be collected? |

Example: Before deploying the Content Safety analysis from this lab in production, an impact assessment would ask: "What happens if the system incorrectly flags safe content as harmful (false positive)? What happens if it misses genuinely harmful content (false negative)? What are the consequences of each, and how do we mitigate them?"

#### Azure OpenAI Content Filtering vs Content Safety Service

This is a critical distinction on the AI-102 exam. Both provide content moderation, but they serve different purposes and are configured differently.

<checkpoint id="l6-content-filtering"></checkpoint>

| Aspect | Azure OpenAI Content Filtering | Azure Content Safety Service |
|--------|-------------------------------|------------------------------|
| **What it is** | Built-in filters that run automatically on every Azure OpenAI API call | A standalone Azure service you call explicitly via SDK/REST |
| **When it runs** | Automatically on model inputs AND outputs — no code needed | Only when you explicitly call it in your application code |
| **What it filters** | Same four categories: Hate, SelfHarm, Sexual, Violence | Same four categories, plus custom blocklists, prompt shields, groundedness |
| **How to configure** | Azure OpenAI Studio → Deployments → Content filters → set severity thresholds per category | Code-level: set thresholds in your application logic based on API response |
| **Customization** | Choose severity threshold per category (Low/Medium/High/Off) per deployment | Full programmatic control — custom blocklists, custom thresholds, combine with other logic |
| **Scope** | Only protects Azure OpenAI model calls | Protects any text in your application (user comments, uploaded documents, chat messages) |
| **Blocklists** | Not supported in content filters | Supported via `BlocklistClient` (Layer 4) |
| **Prompt Shields** | Available as an add-on filter in Azure OpenAI | Available via Content Safety API |
| **Groundedness** | Not included | Available via REST API (Layer 5) |
| **Cost** | Included in Azure OpenAI pricing | Separate Content Safety pricing (Free F0 tier available) |

**When to use which:**

- **Azure OpenAI Content Filtering:** Always keep enabled on your Azure OpenAI deployments. It is your first line of defense for model inputs and outputs. Configure appropriate severity thresholds per deployment.
- **Azure Content Safety Service:** Use for analyzing user-generated content that is NOT going through Azure OpenAI (e.g., forum posts, uploaded documents, chat messages). Also use for advanced features: custom blocklists, groundedness detection, programmatic analysis.
- **Both together:** In a production RAG pipeline, Azure OpenAI content filters protect the model call, while Content Safety groundedness detection validates the output against source documents.

Illustrative code showing the two approaches:

```python
# Approach 1: Azure OpenAI with built-in content filtering
# Content filters run automatically — no extra code needed.
# Configure thresholds in Azure OpenAI Studio.
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=api_key,
    api_version="2024-10-21",
)

# This call is automatically filtered by Azure OpenAI content filters.
# If input or output exceeds configured thresholds, the API returns
# a content_filter_results object (or blocks the request entirely).
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": user_input}],
)

# Check if content was filtered
if response.choices[0].finish_reason == "content_filter":
    print("Response was filtered by Azure OpenAI content filters")


# Approach 2: Azure Content Safety for explicit analysis
# You call this yourself for user-generated content.
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions

safety_client = ContentSafetyClient(endpoint=cs_endpoint, credential=credential)
result = safety_client.analyze_text(AnalyzeTextOptions(text=user_comment))
# You decide what to do with the severity scores
```

### Self-Check Questions

**Q1.** A healthcare company is deploying an AI chatbot that helps patients understand their lab results. Which Responsible AI principle is MOST critical to address first, and what specific action should they take?

<details><summary>Answer</summary>

**Reliability & Safety** is most critical. The chatbot must not provide incorrect medical interpretations that could lead patients to make harmful health decisions. Specific actions: implement groundedness detection to validate responses against verified medical sources, set strict content filtering thresholds, require human review for any response the system has low confidence in, and publish a transparency note documenting the chatbot's limitations (e.g., "This system provides general information and is not a substitute for medical advice").

Fairness is also critical (the system must work equally well across demographics), but reliability and safety is the most immediate concern given the potential for direct harm.

</details>

**Q2.** Your organization has an Azure OpenAI deployment with content filters set to block severity >= 4 across all categories. A user reports that the model sometimes generates mildly inappropriate jokes (severity 2-3). Your manager asks you to also block these. Where do you make this change?

<details><summary>Answer</summary>

In **Azure OpenAI Studio** (or via the Azure OpenAI management API). Navigate to your deployment's content filter configuration and lower the threshold from "Medium" to "Low" for the relevant categories. This change happens at the Azure OpenAI resource level, not in the Content Safety service. The built-in content filters are configured per deployment — you do not need to change any application code.

If you needed more granular control (like blocking specific terms), you would use the Content Safety service's custom blocklists in addition to the Azure OpenAI filters.

</details>

**Q3.** What is the key difference between a transparency note and an impact assessment?

<details><summary>Answer</summary>

A **transparency note** is a document that describes the AI system's capabilities, limitations, and intended uses — it communicates what the system IS. An **impact assessment** is a governance process that evaluates the potential effects (harms and benefits) of deploying the system — it evaluates what the system DOES to stakeholders.

Transparency notes are published and shared with users/integrators. Impact assessments are internal governance documents used for decision-making before deployment. Both are required for responsible AI deployment, but they serve different purposes and audiences.

</details>

**Q4.** You are building a RAG-based Q&A system. You want to ensure the LLM does not hallucinate. You have configured Azure OpenAI content filters on your deployment. Is this sufficient to prevent hallucinations? Why or why not?

<details><summary>Answer</summary>

**No, this is not sufficient.** Azure OpenAI content filters detect harmful content (hate, violence, etc.) — they do NOT detect hallucinations. A hallucinated response can be perfectly polite and non-harmful while being factually wrong.

To prevent hallucinations, you need the **groundedness detection** feature from the Azure Content Safety service (Layer 5). After the LLM generates a response, you call the groundedness detection REST API with the source documents and the generated text to check whether the response is faithful to the sources. Content filters and groundedness detection address different problems: content filters block harmful content, groundedness detection blocks inaccurate content.

</details>

<checkpoint id="l6-questions"></checkpoint>

### Exam Tips

- The six RAI principles are directly tested. Expect scenario questions like: "A company discovers their AI system performs poorly for non-English speakers. Which RAI principle is being violated?" (Answer: Inclusiveness and Fairness.)
- Know that transparency notes are published by Microsoft for each Azure AI service. The exam may ask what information they contain or when they should be created for custom deployments.
- The Azure OpenAI content filtering vs Content Safety service distinction is a high-frequency exam topic. Remember: content filtering is automatic and built-in; Content Safety is explicit and standalone. They use the same four categories but are configured differently.
- Impact assessments are a governance requirement, not a technical feature. The exam may present a scenario and ask what governance step is missing — the answer is often "conduct an impact assessment before deployment."

---

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** Azure Content Safety analyzes text across four categories. Which of the following is NOT one of the four categories?

A) Hate
B) Violence
C) Misinformation
D) SelfHarm

<details><summary>Answer</summary>

**C) Misinformation** — The four Content Safety categories are Hate, SelfHarm, Sexual, and Violence. Misinformation is not a category in Azure Content Safety. Content accuracy and misinformation are handled through other means (like RAG grounding and prompt engineering).

</details>

**Q2.** A customer support chatbot needs to block clearly harmful content but allow mildly edgy humor. What severity threshold should you configure?

A) Block severity >= 0
B) Block severity >= 2
C) Block severity >= 4
D) Block severity >= 6

<details><summary>Answer</summary>

**C) Block severity >= 4** — With the default 4-level output: 0 is safe, 2 is low, 4 is medium, 6 is high. Blocking at >= 4 allows low-severity content (mildly edgy humor) while blocking medium and high severity. Blocking at >= 0 would block everything. Blocking at >= 6 would only block the most extreme content.

</details>

**Q3.** What is the difference between Azure OpenAI content filtering and Azure Content Safety service?

A) They are the same service
B) Content filtering runs automatically on Azure OpenAI inputs/outputs; Content Safety is a separate service you call explicitly
C) Content Safety is built into Azure OpenAI; content filtering is standalone
D) Content filtering only works with DALL-E; Content Safety only works with text

<details><summary>Answer</summary>

**B) Content filtering runs automatically; Content Safety is called explicitly** — Azure OpenAI has built-in content filters that automatically analyze inputs and outputs. Azure Content Safety is a separate service you integrate into your own application logic for analyzing arbitrary user-generated content. The exam tests this distinction.

</details>

**Q4.** You need to maintain a list of specific brand names that should always be flagged in user content, regardless of severity scores. Which Content Safety feature should you use?

A) Severity thresholds
B) Custom blocklists
C) Prompt Shields
D) Content categories

<details><summary>Answer</summary>

**B) Custom blocklists** — The `BlocklistClient` in Azure Content Safety lets you create and manage custom blocklists of specific terms that are always flagged. Severity thresholds and categories are for general content analysis. Prompt Shields detect injection attempts, not specific terms.

</details>

<!-- section:summary -->
## What You Learned

| Concept | How You Used It | Exam Relevance |
|---------|----------------|----------------|
| `ContentSafetyClient` creation | `_get_client()` with endpoint + credential | Client setup question type |
| Four content categories | Hate, SelfHarm, Sexual, Violence | Memorize these — directly tested |
| Severity scale (default 4-level: 0, 2, 4, 6) | `_severity_label()` mapping | Threshold selection scenarios |
| Text analysis | `client.analyze_text()` with `AnalyzeTextOptions` | Core Content Safety API |
| Prompt shielding | `check_prompt()` with severity threshold | Responsible AI architecture |

## Next Lab

This is the final lab. If you have not yet completed the independent labs, go back to:

- **[Lab 04: Vision Lab](04-vision.md)** — Azure Computer Vision for image analysis and OCR
- **[Lab 05: Language & Speech](05-language.md)** — Azure Language and Speech services

Or revisit the dependency chain if you skipped any:

- **[Lab 01: GenAI Lab](01-genai.md)** -> **[Lab 02: RAG Engine](02-rag.md)** -> **[Lab 03: Knowledge Mining](03-knowledge-mining.md)**
- **[Lab 01: GenAI Lab](01-genai.md)** -> **[Lab 06: Agent Workshop](06-agents.md)**

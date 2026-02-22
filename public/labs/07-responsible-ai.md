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

Each category returns a **severity score** from 0 to 6:

- **0** — Content is safe
- **1-2** — Low severity
- **3-4** — Medium severity
- **5-6** — High severity

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

| Severity | Label | Meaning | Typical Action |
|----------|-------|---------|----------------|
| 0 | Safe | No harmful content detected | Allow |
| 1-2 | Low | Mildly concerning but generally acceptable | Allow with monitoring |
| 3-4 | Medium | Moderately harmful content | Review or flag |
| 5-6 | High | Clearly harmful or dangerous | Block |

Different applications set different thresholds. A children's platform might block anything above severity 0. An adult content moderation tool might only block severity 5-6. The exam tests your ability to choose the right threshold for a given scenario.

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
- The severity scale is 0-6, not 0-10 or 0-100. This is a common detail the exam tests directly.

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
2. `_severity_label()` — maps numeric severity (0-6) to a label string
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

> **Advanced** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Review blocklist creation and item management API, understand how to use blocklists in text analysis, and design a blocklist strategy for a production scenario.

<checkpoint id="l4-blocklist-create"></checkpoint>
<checkpoint id="l4-blocklist-analyze"></checkpoint>
<checkpoint id="l4-blocklist-patterns"></checkpoint>

<!-- section:layer:5 -->
## Layer 5: Groundedness Detection

> **Advanced** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Explore the groundedness detection API and scoring, hallucination detection in RAG pipelines, and integration patterns for grounded response validation.

<checkpoint id="l5-groundedness-api"></checkpoint>
<checkpoint id="l5-hallucination"></checkpoint>
<checkpoint id="l5-integration"></checkpoint>

<!-- section:layer:6 -->
## Layer 6: RAI Governance & Compliance

> **Expert** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Deep-dive into Microsoft Responsible AI principles, transparency notes, impact assessments, and Azure OpenAI content filtering configuration.

<checkpoint id="l6-rai-principles"></checkpoint>
<checkpoint id="l6-transparency-notes"></checkpoint>
<checkpoint id="l6-content-filtering"></checkpoint>
<checkpoint id="l6-questions"></checkpoint>

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

**C) Block severity >= 4** — Severity 0 is safe, 1-2 is low (mildly concerning), 3-4 is medium, 5-6 is high. Blocking at >= 4 allows low-severity content (mildly edgy humor) while blocking medium and high severity. Blocking at >= 0 would block everything. Blocking at >= 6 would only block the most extreme content.

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
| Severity scale (0-6) | `_severity_label()` mapping | Threshold selection scenarios |
| Text analysis | `client.analyze_text()` with `AnalyzeTextOptions` | Core Content Safety API |
| Prompt shielding | `check_prompt()` with severity threshold | Responsible AI architecture |

## Next Lab

This is the final lab. If you have not yet completed the independent labs, go back to:

- **[Lab 04: Vision Lab](04-vision.md)** — Azure Computer Vision for image analysis and OCR
- **[Lab 05: Language & Speech](05-language.md)** — Azure Language and Speech services

Or revisit the dependency chain if you skipped any:

- **[Lab 01: GenAI Lab](01-genai.md)** -> **[Lab 02: RAG Engine](02-rag.md)** -> **[Lab 03: Knowledge Mining](03-knowledge-mining.md)**
- **[Lab 01: GenAI Lab](01-genai.md)** -> **[Lab 06: Agent Workshop](06-agents.md)**

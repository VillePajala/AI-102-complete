# Lab 05: Language & Speech

> Exam domain: D5 — Implement natural language processing solutions (15-20%) | Service file: `backend/app/services/language_service.py` | Estimated time: 60 minutes
> **Estimated Azure cost:** < $0.10. Text Analytics, Translator, and Speech each charge per transaction. This lab uses a handful of API calls during testing. Speech TTS returns a few seconds of audio per call.

**Difficulty:** Intermediate | **Layers:** 4 | **Prerequisites:** None — independent lab

> **How to approach this lab**
>
> This lab covers four different Azure services across four layers. Layers 1-2
> use the Text Analytics SDK, Layer 3 uses the Translator REST API, and Layer 4
> uses the Speech REST API. Take them one at a time — each uses a different
> authentication pattern, which is a key exam topic.

<!-- section:overview -->
## Overview

In this lab you will implement four categories of Azure AI language and speech capabilities: sentiment analysis, NLP feature extraction (key phrases, entities, PII, language detection), text translation, and speech-to-text / text-to-speech. You will fill in the functions in `language_service.py` using the Text Analytics SDK for NLP and REST APIs for translation and speech.

The frontend Language & Speech page (`/language`) is already built. The backend router (`backend/app/routers/language.py`) is already wired up to call your service functions. Right now every call raises `NotImplementedError` — your job is to replace those stubs with real implementations.

<!-- section:prerequisites -->
## Prerequisites

- **Azure resources:** An Azure AI Services multi-service resource (for Text Analytics), plus optionally a dedicated Translator resource and a Speech resource. You can use the multi-service key for all of them, but Translator and Speech have separate config vars for flexibility.
- **Prior labs:** None. This lab is independent and can be done at any time.
- **Python packages:** `azure-ai-textanalytics`, `azure-core`, and `httpx` (all are already in `requirements.txt`).

<!-- section:setup -->
## Azure Setup

- Set up Azure AI Services multi-service resource (or reuse from Lab 04)
- Configure Translator key and region in `backend/.env`
- Configure Speech key and region in `backend/.env`
- Restart backend server

### Text Analytics (covered by Azure AI Services multi-service resource)

If you already set up an Azure AI Services resource in Lab 04, you can reuse the same endpoint and key. If not:

1. Go to the [Azure Portal](https://portal.azure.com) and search for **Azure AI Services**.
2. Click **Create** and select **Azure AI Services multi-service account**.
3. After deployment, copy **Key 1** and the **Endpoint** from the **Keys and Endpoint** page.
4. Add to `backend/.env`:
   ```
   AZURE_AI_SERVICES_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
   AZURE_AI_SERVICES_KEY=your-key-here
   ```

   **Where to find:** Azure Portal → your AI Services resource → **Keys and Endpoint** → copy **Endpoint** and **Key 1**.

<checkpoint id="setup-ai-services"></checkpoint>

### Translator

The Translator API can be accessed with the multi-service key, but it also needs a region. You can either set dedicated Translator variables or fall back to the multi-service key:

1. In the Azure Portal, go to your AI Services resource (or create a dedicated Translator resource).
2. Note the **region** you deployed to (e.g., `eastus`, `westeurope`).
3. Add to `backend/.env`:
   ```
   AZURE_TRANSLATOR_KEY=your-key-here       # or leave blank to use AZURE_AI_SERVICES_KEY
   AZURE_TRANSLATOR_REGION=eastus            # or leave blank to use AZURE_SPEECH_REGION
   ```

   **Where to find:** If using the multi-service resource, these can be left blank (the code falls back to `AZURE_AI_SERVICES_KEY`). The **region** is shown on the resource's **Overview** page (e.g., `eastus`, `westeurope`). If you created a dedicated Translator resource, find the key under **Keys and Endpoint**.

<checkpoint id="setup-translator"></checkpoint>

### Speech Services

1. In the Azure Portal, search for **Speech** and create a **Speech** resource (or use the multi-service resource).
2. Copy the **Key** and note the **Region**.
3. Add to `backend/.env`:
   ```
   AZURE_SPEECH_KEY=your-key-here
   AZURE_SPEECH_REGION=eastus
   ```

   **Where to find:** Azure Portal → your Speech resource → **Keys and Endpoint** → copy **Key 1** and note the **Location/Region** (e.g., `eastus`).

<checkpoint id="setup-speech"></checkpoint>

**Where to find each value (summary):**

| Variable | Where to Find It |
|----------|-----------------|
| `AZURE_AI_SERVICES_ENDPOINT` | AI Services resource → **Keys and Endpoint** → **Endpoint** |
| `AZURE_AI_SERVICES_KEY` | AI Services resource → **Keys and Endpoint** → **Key 1** |
| `AZURE_TRANSLATOR_KEY` | Leave blank to use AI Services key, or: Translator resource → **Keys and Endpoint** → **Key 1** |
| `AZURE_TRANSLATOR_REGION` | Resource **Overview** page → **Location** (e.g., `eastus`) |
| `AZURE_SPEECH_KEY` | Speech resource → **Keys and Endpoint** → **Key 1** |
| `AZURE_SPEECH_REGION` | Speech resource → **Overview** → **Location** (e.g., `eastus`) |

Restart the backend server after updating `.env`.

<checkpoint id="setup-restart-backend"></checkpoint>

---

<!-- section:layer:1 -->
## Layer 1: Sentiment Analysis

- Add SDK imports to `language_service.py`
- Implement `_get_text_client()` helper
- Implement `analyze_text()` with sentiment analysis
- Test via frontend or Swagger UI

### What You Will Learn

- How to authenticate with the Text Analytics SDK using `AzureKeyCredential`
- How to call `analyze_sentiment()` and interpret confidence scores
- How the `analysis_type` parameter controls which NLP features to run

This maps to exam objective **D5: Analyze text by using Azure AI Language** — specifically sentiment analysis and opinion mining.

### Concepts

Azure AI Language's sentiment analysis examines text and returns a label (`positive`, `neutral`, `negative`, or `mixed`) along with confidence scores for each. The SDK's `TextAnalyticsClient` accepts a list of documents (plain strings) and returns a list of results, one per document.

Authentication uses `AzureKeyCredential` from `azure.core.credentials` — this is the standard pattern for Azure AI SDKs (different from the `msrest` pattern used in the older Computer Vision SDK).

Your `analyze_text()` function takes an `analysis_type` parameter. When it is `"sentiment"` or `"all"`, you run sentiment analysis. This layered approach lets you build incrementally — start with sentiment, then add more analysis types in Layer 2.

The SDK returns a response list. Index `[0]` gives the result for your single document. Check `.is_error` before accessing the data — if the service rejected the document, accessing `.sentiment` will raise an exception.

### Implementation

1. Open `backend/app/services/language_service.py`.
2. Add imports for `TextAnalyticsClient` and `AzureKeyCredential`.

<checkpoint id="l1-imports"></checkpoint>

3. Write a helper function `_get_text_client()` that creates and returns a `TextAnalyticsClient`. Check that the endpoint and key are configured.

<checkpoint id="l1-get-client"></checkpoint>

4. Start implementing `analyze_text()`:
   - Call `_get_text_client()`.
   - Wrap the input text in a list: `documents = [text]`.
   - If `analysis_type` is `"sentiment"` or `"all"`, call `client.analyze_sentiment(documents=documents)` and take the first result.
   - Check `.is_error`. If not an error, build a dict: `{"sentiment": {"label": ..., "scores": {"positive": ..., "neutral": ..., "negative": ...}}}`.
   - Return the result dict.

<checkpoint id="l1-sentiment"></checkpoint>

<details><summary>Hint</summary>

```python
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

def _get_text_client() -> TextAnalyticsClient:
    # Check settings.AZURE_AI_SERVICES_ENDPOINT and settings.AZURE_AI_SERVICES_KEY
    # Return TextAnalyticsClient(endpoint=..., credential=AzureKeyCredential(...))
    ...

def analyze_text(text: str, analysis_type: str = "all") -> dict:
    client = _get_text_client()
    documents = [text]
    result = {}

    if analysis_type in ("all", "sentiment"):
        response = client.analyze_sentiment(documents=documents)[0]
        if not response.is_error:
            result["sentiment"] = {
                "label": response.sentiment,
                "scores": {
                    "positive": response.confidence_scores.positive,
                    # ... neutral, negative
                },
            }

    return result
```

</details>

### Test It

1. Make sure both servers are running.
2. Open http://localhost:3000/language in your browser.
3. Enter a clearly positive sentence (e.g., "I love this product, it works perfectly!") and run sentiment analysis.
4. You should see a sentiment label and confidence scores. Positive text should score high on the positive scale.
5. Try a negative sentence and a neutral one to verify the scores shift accordingly.

<checkpoint id="l1-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
import logging

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

from app.config import settings

logger = logging.getLogger(__name__)


def _get_text_client() -> TextAnalyticsClient:
    if not settings.AZURE_AI_SERVICES_ENDPOINT or not settings.AZURE_AI_SERVICES_KEY:
        raise RuntimeError(
            "Azure AI Services not configured. "
            "Set AZURE_AI_SERVICES_ENDPOINT and AZURE_AI_SERVICES_KEY."
        )
    return TextAnalyticsClient(
        endpoint=settings.AZURE_AI_SERVICES_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_AI_SERVICES_KEY),
    )


def analyze_text(text: str, analysis_type: str = "all") -> dict:
    client = _get_text_client()
    documents = [text]
    result = {}

    if analysis_type in ("all", "sentiment"):
        response = client.analyze_sentiment(documents=documents)[0]
        if not response.is_error:
            result["sentiment"] = {
                "label": response.sentiment,
                "scores": {
                    "positive": response.confidence_scores.positive,
                    "neutral": response.confidence_scores.neutral,
                    "negative": response.confidence_scores.negative,
                },
            }

    return result
```

</details>

### Exam Tips

- Sentiment analysis returns four possible labels: `positive`, `neutral`, `negative`, and `mixed`. The `mixed` label appears when a document has both positive and negative sentences. The exam tests this distinction.
- The SDK's `analyze_sentiment()` can also perform **opinion mining** by passing `show_opinion_mining=True`. This returns aspect-level sentiment (e.g., "the food was great but the service was slow"). Know this exists even though we do not use it here.
- Confidence scores always sum to 1.0 across positive, neutral, and negative. The exam may ask how to interpret these scores.

---

<!-- section:layer:2 -->
## Layer 2: NLP Features

- Add key phrase extraction to `analyze_text()`
- Add entity recognition to `analyze_text()`
- Add PII detection to `analyze_text()`
- Add language detection to `analyze_text()`
- Test each analysis type

### What You Will Learn

- How to extract key phrases, named entities, PII entities, and detect language
- How each Text Analytics method returns a different response structure
- When to use each NLP feature in real-world and exam scenarios

This maps to exam objectives **D5: Extract key phrases**, **D5: Detect and recognize entities**, **D5: Detect PII**, and **D5: Detect language**.

### Concepts

The Text Analytics client exposes several methods beyond sentiment:

- **`extract_key_phrases()`** — Returns a list of key phrase strings that summarize the document's main topics. Useful for indexing, tagging, and summarization pipelines.
- **`recognize_entities()`** — Detects named entities (people, places, organizations, dates, quantities) and categorizes them. Each entity has `.text`, `.category`, `.subcategory`, and `.confidence_score`.
- **`recognize_pii_entities()`** — Specifically detects personally identifiable information (SSNs, emails, phone numbers, etc.). The response also includes a `.redacted_text` field with PII replaced by asterisks.
- **`detect_language()`** — Identifies the language of the document. Returns a `.primary_language` with `.name`, `.iso6391_name`, and `.confidence_score`.

All methods follow the same pattern: pass a list of documents, get back a list of results, check `.is_error` on each.

### Implementation

1. Extend your `analyze_text()` function to handle additional `analysis_type` values.
2. For `"keyPhrases"` (or `"all"`): call `client.extract_key_phrases()`, return the phrases as a list under the key `"keyPhrases"`.

<checkpoint id="l2-keyphrases"></checkpoint>

3. For `"entities"` (or `"all"`): call `client.recognize_entities()`, return a list of dicts (each with `"text"`, `"category"`, `"confidence"`) under the key `"entities"`.

<checkpoint id="l2-entities"></checkpoint>

4. For `"pii"` (or `"all"`): call `client.recognize_pii_entities()`, return a list of dicts (each with `"text"`, `"category"`) under the key `"piiEntities"`.

<checkpoint id="l2-pii"></checkpoint>

5. For `"language"` (or `"all"`): call `client.detect_language()`, return a dict with `"name"`, `"iso"`, and `"confidence"` under the key `"language"`.

<checkpoint id="l2-language"></checkpoint>

<details><summary>Hint</summary>

```python
# Add these blocks inside analyze_text(), after the sentiment block:

if analysis_type in ("all", "keyPhrases"):
    response = client.extract_key_phrases(documents=documents)[0]
    if not response.is_error:
        result["keyPhrases"] = list(response.key_phrases)

if analysis_type in ("all", "entities"):
    response = client.recognize_entities(documents=documents)[0]
    if not response.is_error:
        result["entities"] = [
            {
                "text": entity.text,
                "category": entity.category,
                "confidence": entity.confidence_score,
            }
            for entity in response.entities
        ]

# Continue the pattern for "pii" and "language"...
```

</details>

### Test It

1. On the `/language` page, enter a paragraph that contains names, places, dates, and email addresses.
2. Run each analysis type individually and then run "all" to see everything at once.
3. For PII detection, try text like "My email is john@example.com and my SSN is 123-45-6789" — you should see those flagged.
4. For language detection, try text in different languages — the detected language name and ISO code should match.
5. Test via Swagger UI at http://localhost:8000/docs — POST to `/api/language/analyze` with body `{"text": "...", "type": "entities"}`.

<checkpoint id="l2-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
def analyze_text(text: str, analysis_type: str = "all") -> dict:
    client = _get_text_client()
    documents = [text]
    result = {}

    if analysis_type in ("all", "sentiment"):
        response = client.analyze_sentiment(documents=documents)[0]
        if not response.is_error:
            result["sentiment"] = {
                "label": response.sentiment,
                "scores": {
                    "positive": response.confidence_scores.positive,
                    "neutral": response.confidence_scores.neutral,
                    "negative": response.confidence_scores.negative,
                },
            }

    if analysis_type in ("all", "keyPhrases"):
        response = client.extract_key_phrases(documents=documents)[0]
        if not response.is_error:
            result["keyPhrases"] = list(response.key_phrases)

    if analysis_type in ("all", "entities"):
        response = client.recognize_entities(documents=documents)[0]
        if not response.is_error:
            result["entities"] = [
                {
                    "text": entity.text,
                    "category": entity.category,
                    "confidence": entity.confidence_score,
                }
                for entity in response.entities
            ]

    if analysis_type in ("all", "pii"):
        response = client.recognize_pii_entities(documents=documents)[0]
        if not response.is_error:
            result["piiEntities"] = [
                {"text": entity.text, "category": entity.category}
                for entity in response.entities
            ]

    if analysis_type in ("all", "language"):
        response = client.detect_language(documents=documents)[0]
        if not response.is_error:
            result["language"] = {
                "name": response.primary_language.name,
                "iso": response.primary_language.iso6391_name,
                "confidence": response.primary_language.confidence_score,
            }

    return result
```

</details>

### Exam Tips

- The exam distinguishes between **named entity recognition** (general categories like Person, Location, Organization) and **PII entity recognition** (specific sensitive data like SSN, credit card, email). They are separate API calls.
- PII detection also returns `redacted_text` — a copy of the input with PII replaced by asterisks. The exam may ask about this for data anonymization scenarios.
- Language detection supports over 120 languages. The confidence score indicates how certain the service is. For very short text (a single word), confidence may be low. The exam tests understanding of confidence interpretation.

---

<!-- section:layer:3 -->
## Layer 3: Translation

- Implement `translate_text()` with Translator REST API
- Test translation between multiple language pairs

### What You Will Learn

- How to call the Azure Translator REST API (no SDK — direct HTTP)
- How to structure the required authentication headers for Translator
- The difference between using an SDK client and making direct REST calls

This maps to exam objective **D5: Translate text** — specifically using the Translator API with proper authentication.

### Concepts

Azure Translator does not have an official Python SDK for text translation — you call the REST API directly. This is a common pattern with some Azure AI services and is explicitly tested on the AI-102 exam.

The translation endpoint is `https://api.cognitive.microsofttranslator.com/translate`. Authentication requires three headers:

- `Ocp-Apim-Subscription-Key` — Your Translator key (or multi-service key)
- `Ocp-Apim-Subscription-Region` — The Azure region where your resource is deployed (required when using a multi-service key)
- `Content-Type` — Must be `application/json`
- `X-ClientTraceId` — A unique UUID for request tracing (recommended for production, required by some configurations)

The request body is a JSON array of objects, each with a `"text"` field. Query parameters specify the target language (`to`) and optionally the source language (`from`). If you omit `from`, the service auto-detects the source language.

We use the `httpx` library for HTTP calls because it supports both sync and async patterns and has a clean API.

### Implementation

1. Implement `translate_text()` in `language_service.py`.
2. Determine which key and region to use — check `settings.AZURE_TRANSLATOR_KEY` first, fall back to `settings.AZURE_AI_SERVICES_KEY`. Similarly for region.
3. Build the endpoint URL, query parameters (`api-version=3.0`, `to=target`, optionally `from=source` if source is not `"auto"`), and required headers.
4. Send a POST request with `httpx.post()`. The body is `[{"text": text}]`.
5. Parse the JSON response and extract `data[0]["translations"][0]["text"]`.

<checkpoint id="l3-translate"></checkpoint>

6. You will need `import uuid` and `import httpx`.

<details><summary>Hint</summary>

```python
import uuid
import httpx

def translate_text(text: str, source: str, target: str) -> str:
    key = settings.AZURE_TRANSLATOR_KEY or settings.AZURE_AI_SERVICES_KEY
    region = settings.AZURE_TRANSLATOR_REGION or settings.AZURE_SPEECH_REGION
    if not key:
        raise RuntimeError("Azure Translator not configured.")

    endpoint = "https://api.cognitive.microsofttranslator.com"
    path = "/translate"
    params = {"api-version": "3.0", "to": target}
    if source and source != "auto":
        params["from"] = source

    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }
    body = [{"text": text}]

    response = httpx.post(
        f"{endpoint}{path}", params=params, headers=headers, json=body, timeout=30
    )
    response.raise_for_status()
    data = response.json()
    return data[0]["translations"][0]["text"]
```

</details>

### Test It

1. On the `/language` page, find the translation section.
2. Enter text in English, set the target language to Spanish (`es`), and translate.
3. You should see the translated text in the response.
4. Try translating between different language pairs (English to French, German to English, etc.).
5. Try leaving the source as "auto" — the service should auto-detect the source language.
6. Test via Swagger UI: POST to `/api/language/translate` with body `{"text": "Hello world", "source": "auto", "target": "fr"}`.

<checkpoint id="l3-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
import uuid
import httpx


def translate_text(text: str, source: str, target: str) -> str:
    key = settings.AZURE_TRANSLATOR_KEY or settings.AZURE_AI_SERVICES_KEY
    region = settings.AZURE_TRANSLATOR_REGION or settings.AZURE_SPEECH_REGION
    if not key:
        raise RuntimeError(
            "Azure Translator not configured. "
            "Set AZURE_TRANSLATOR_KEY or AZURE_AI_SERVICES_KEY."
        )
    endpoint = "https://api.cognitive.microsofttranslator.com"
    path = "/translate"
    params = {"api-version": "3.0", "to": target}
    if source and source != "auto":
        params["from"] = source
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }
    body = [{"text": text}]
    response = httpx.post(
        f"{endpoint}{path}", params=params, headers=headers, json=body, timeout=30
    )
    response.raise_for_status()
    data = response.json()
    return data[0]["translations"][0]["text"]
```

</details>

### Exam Tips

- The Translator REST API requires the `Ocp-Apim-Subscription-Region` header when using a multi-service key. This is a frequent exam question — omitting the region header causes a 401 error.
- You can translate to **multiple target languages** in a single request by repeating the `to` parameter (e.g., `to=es&to=fr`). The exam tests this capability.
- Auto-detection works by omitting the `from` parameter entirely. If you pass `from` with a value, the service skips detection and trusts your label — even if it is wrong. The exam may test this behavior.

---

<!-- section:layer:4 -->
## Layer 4: Speech Services

- Implement `speech_to_text()` with Speech REST API
- Implement `text_to_speech()` with SSML
- Test STT with a WAV audio file
- Test TTS and verify audio playback

### What You Will Learn

- How to call the Azure Speech REST APIs for speech-to-text (STT) and text-to-speech (TTS)
- How to construct SSML (Speech Synthesis Markup Language) for TTS requests
- How to return audio data as a base64 data URL for browser playback

This maps to exam objectives **D5: Convert speech to text** and **D5: Convert text to speech** — specifically the REST API approach (as opposed to the Speech SDK).

### Concepts

Azure Speech Services provide both an SDK (`azure-cognitiveservices-speech`) and REST APIs. We use the REST APIs here because they work without native library dependencies and are explicitly covered on the exam.

**Speech-to-Text (STT):** Send a POST request with WAV audio data to the STT endpoint. The service returns a JSON response with a `DisplayText` field containing the recognized text. The endpoint URL includes your region and a language parameter.

**Text-to-Speech (TTS):** Send a POST request with SSML (Speech Synthesis Markup Language) to the TTS endpoint. SSML is an XML format that specifies the voice, language, and text to synthesize. The service returns raw audio bytes. You encode these as base64 and wrap them in a data URL (`data:audio/mp3;base64,...`) so the browser can play the audio directly.

The `X-Microsoft-OutputFormat` header controls the audio format for TTS. Common formats include `audio-16khz-128kbitrate-mono-mp3` (good balance of quality and size) and `audio-24khz-160kbitrate-mono-mp3` (higher quality).

### Implementation

1. Implement `speech_to_text()`:
   - Check that `settings.AZURE_SPEECH_KEY` and `settings.AZURE_SPEECH_REGION` are set.
   - Build the STT endpoint URL: `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`.
   - Set headers: `Ocp-Apim-Subscription-Key`, `Content-Type: audio/wav`, `Accept: application/json`.
   - Set query params: `language=en-US`.
   - POST the raw `audio_bytes` as the request body.
   - Parse the JSON response and return the `"DisplayText"` value.

<checkpoint id="l4-stt"></checkpoint>

2. Implement `text_to_speech()`:
   - Check the same speech credentials.
   - Build the TTS endpoint URL: `https://{region}.tts.speech.microsoft.com/cognitiveservices/v1`.
   - Set headers: `Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`, `X-Microsoft-OutputFormat: audio-16khz-128kbitrate-mono-mp3`.
   - Build the SSML string with a `<speak>` root element, `<voice>` element (use `en-US-JennyNeural`), and the text content.
   - POST the SSML (encoded as UTF-8 bytes).
   - Base64-encode the response content and return it as a data URL: `data:audio/mp3;base64,{encoded}`.
   - You will need `import base64`.

<checkpoint id="l4-tts"></checkpoint>

<details><summary>Hint</summary>

```python
import base64
import httpx

def speech_to_text(audio_bytes: bytes) -> str:
    region = settings.AZURE_SPEECH_REGION
    url = f"https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "audio/wav",
        "Accept": "application/json",
    }
    params = {"language": "en-US"}
    response = httpx.post(url, headers=headers, params=params, content=audio_bytes, timeout=30)
    response.raise_for_status()
    return response.json().get("DisplayText", "")

def text_to_speech(text: str) -> str:
    region = settings.AZURE_SPEECH_REGION
    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    }
    ssml = (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
        '<voice name="en-US-JennyNeural">'
        f"{text}"
        "</voice></speak>"
    )
    response = httpx.post(url, headers=headers, content=ssml.encode("utf-8"), timeout=30)
    response.raise_for_status()
    audio_b64 = base64.b64encode(response.content).decode("utf-8")
    return f"data:audio/mp3;base64,{audio_b64}"
```

</details>

### Test It

1. **Speech-to-Text:** You need a WAV audio file with spoken English. You can place one in the `data/audio/` directory, or record one using any audio tool (ensure WAV format, 16kHz recommended). Upload it on the `/language` page or POST it to `/api/language/speech-to-text` via Swagger UI.
2. You should see the recognized text returned as a string.

<checkpoint id="l4-test-stt"></checkpoint>

3. **Text-to-Speech:** Enter any text on the `/language` page and trigger text-to-speech. The response should be an audio data URL that the browser can play.
4. Check that the audio plays correctly in the browser. If it does not play, verify the `X-Microsoft-OutputFormat` header matches the data URL MIME type.

<checkpoint id="l4-test-tts"></checkpoint>

<details><summary>Full Solution</summary>

```python
import base64
import logging
import uuid

import httpx
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

from app.config import settings

logger = logging.getLogger(__name__)


def _get_text_client() -> TextAnalyticsClient:
    if not settings.AZURE_AI_SERVICES_ENDPOINT or not settings.AZURE_AI_SERVICES_KEY:
        raise RuntimeError(
            "Azure AI Services not configured. "
            "Set AZURE_AI_SERVICES_ENDPOINT and AZURE_AI_SERVICES_KEY."
        )
    return TextAnalyticsClient(
        endpoint=settings.AZURE_AI_SERVICES_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_AI_SERVICES_KEY),
    )


def analyze_text(text: str, analysis_type: str = "all") -> dict:
    client = _get_text_client()
    documents = [text]
    result = {}

    if analysis_type in ("all", "sentiment"):
        response = client.analyze_sentiment(documents=documents)[0]
        if not response.is_error:
            result["sentiment"] = {
                "label": response.sentiment,
                "scores": {
                    "positive": response.confidence_scores.positive,
                    "neutral": response.confidence_scores.neutral,
                    "negative": response.confidence_scores.negative,
                },
            }

    if analysis_type in ("all", "keyPhrases"):
        response = client.extract_key_phrases(documents=documents)[0]
        if not response.is_error:
            result["keyPhrases"] = list(response.key_phrases)

    if analysis_type in ("all", "entities"):
        response = client.recognize_entities(documents=documents)[0]
        if not response.is_error:
            result["entities"] = [
                {
                    "text": entity.text,
                    "category": entity.category,
                    "confidence": entity.confidence_score,
                }
                for entity in response.entities
            ]

    if analysis_type in ("all", "pii"):
        response = client.recognize_pii_entities(documents=documents)[0]
        if not response.is_error:
            result["piiEntities"] = [
                {"text": entity.text, "category": entity.category}
                for entity in response.entities
            ]

    if analysis_type in ("all", "language"):
        response = client.detect_language(documents=documents)[0]
        if not response.is_error:
            result["language"] = {
                "name": response.primary_language.name,
                "iso": response.primary_language.iso6391_name,
                "confidence": response.primary_language.confidence_score,
            }

    return result


def translate_text(text: str, source: str, target: str) -> str:
    key = settings.AZURE_TRANSLATOR_KEY or settings.AZURE_AI_SERVICES_KEY
    region = settings.AZURE_TRANSLATOR_REGION or settings.AZURE_SPEECH_REGION
    if not key:
        raise RuntimeError(
            "Azure Translator not configured. "
            "Set AZURE_TRANSLATOR_KEY or AZURE_AI_SERVICES_KEY."
        )
    endpoint = "https://api.cognitive.microsofttranslator.com"
    path = "/translate"
    params = {"api-version": "3.0", "to": target}
    if source and source != "auto":
        params["from"] = source
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }
    body = [{"text": text}]
    response = httpx.post(
        f"{endpoint}{path}", params=params, headers=headers, json=body, timeout=30
    )
    response.raise_for_status()
    data = response.json()
    return data[0]["translations"][0]["text"]


def speech_to_text(audio_bytes: bytes) -> str:
    if not settings.AZURE_SPEECH_KEY or not settings.AZURE_SPEECH_REGION:
        raise RuntimeError(
            "Azure Speech not configured. "
            "Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION."
        )
    url = (
        f"https://{settings.AZURE_SPEECH_REGION}.stt.speech.microsoft.com"
        f"/speech/recognition/conversation/cognitiveservices/v1"
    )
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "audio/wav",
        "Accept": "application/json",
    }
    params = {"language": "en-US"}
    response = httpx.post(
        url, headers=headers, params=params, content=audio_bytes, timeout=30
    )
    response.raise_for_status()
    data = response.json()
    return data.get("DisplayText", "")


def text_to_speech(text: str) -> str:
    if not settings.AZURE_SPEECH_KEY or not settings.AZURE_SPEECH_REGION:
        raise RuntimeError(
            "Azure Speech not configured. "
            "Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION."
        )
    url = (
        f"https://{settings.AZURE_SPEECH_REGION}.tts.speech.microsoft.com"
        f"/cognitiveservices/v1"
    )
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    }
    ssml = (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
        '<voice name="en-US-JennyNeural">'
        f"{text}"
        "</voice></speak>"
    )
    response = httpx.post(
        url, headers=headers, content=ssml.encode("utf-8"), timeout=30
    )
    response.raise_for_status()
    audio_b64 = base64.b64encode(response.content).decode("utf-8")
    return f"data:audio/mp3;base64,{audio_b64}"
```

</details>

### Exam Tips

- The exam tests both the **Speech SDK** and the **REST API** approaches. The REST API does not require installing native libraries, which is why it is often used in web backends and containers. Know when to use each.
- SSML is important for the exam. Know the basic structure: `<speak>` root with version and namespace, `<voice>` with a voice name, and text content. The exam may also test SSML features like `<prosody>` (speed/pitch), `<break>` (pauses), and `<phoneme>` (pronunciation).
- The `X-Microsoft-OutputFormat` header determines audio quality and format. The exam may ask about choosing the right format for different scenarios (streaming vs. file download, bandwidth constraints).

---

## Checkpoint

After completing all four layers, your `language_service.py` should have:

- A `_get_text_client()` helper that creates an authenticated `TextAnalyticsClient`
- An `analyze_text()` function that handles sentiment, key phrases, entities, PII, and language detection based on the `analysis_type` parameter
- A `translate_text()` function that calls the Translator REST API with proper authentication headers
- A `speech_to_text()` function that sends WAV audio to the Speech STT REST API
- A `text_to_speech()` function that sends SSML to the Speech TTS REST API and returns a base64 audio data URL

Verify by testing all four endpoints through the frontend (`/language`) and the Swagger UI (`http://localhost:8000/docs`).

<details><summary>Complete language_service.py</summary>

```python
import base64
import logging
import uuid

import httpx
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

from app.config import settings

logger = logging.getLogger(__name__)


def _get_text_client() -> TextAnalyticsClient:
    if not settings.AZURE_AI_SERVICES_ENDPOINT or not settings.AZURE_AI_SERVICES_KEY:
        raise RuntimeError(
            "Azure AI Services not configured. "
            "Set AZURE_AI_SERVICES_ENDPOINT and AZURE_AI_SERVICES_KEY."
        )
    return TextAnalyticsClient(
        endpoint=settings.AZURE_AI_SERVICES_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_AI_SERVICES_KEY),
    )


def analyze_text(text: str, analysis_type: str = "all") -> dict:
    client = _get_text_client()
    documents = [text]
    result: dict = {}

    if analysis_type in ("all", "sentiment"):
        response = client.analyze_sentiment(documents=documents)[0]
        if not response.is_error:
            result["sentiment"] = {
                "label": response.sentiment,
                "scores": {
                    "positive": response.confidence_scores.positive,
                    "neutral": response.confidence_scores.neutral,
                    "negative": response.confidence_scores.negative,
                },
            }

    if analysis_type in ("all", "keyPhrases"):
        response = client.extract_key_phrases(documents=documents)[0]
        if not response.is_error:
            result["keyPhrases"] = list(response.key_phrases)

    if analysis_type in ("all", "entities"):
        response = client.recognize_entities(documents=documents)[0]
        if not response.is_error:
            result["entities"] = [
                {
                    "text": entity.text,
                    "category": entity.category,
                    "confidence": entity.confidence_score,
                }
                for entity in response.entities
            ]

    if analysis_type in ("all", "pii"):
        response = client.recognize_pii_entities(documents=documents)[0]
        if not response.is_error:
            result["piiEntities"] = [
                {"text": entity.text, "category": entity.category}
                for entity in response.entities
            ]

    if analysis_type in ("all", "language"):
        response = client.detect_language(documents=documents)[0]
        if not response.is_error:
            result["language"] = {
                "name": response.primary_language.name,
                "iso": response.primary_language.iso6391_name,
                "confidence": response.primary_language.confidence_score,
            }

    return result


def translate_text(text: str, source: str, target: str) -> str:
    key = settings.AZURE_TRANSLATOR_KEY or settings.AZURE_AI_SERVICES_KEY
    region = settings.AZURE_TRANSLATOR_REGION or settings.AZURE_SPEECH_REGION
    if not key:
        raise RuntimeError(
            "Azure Translator not configured. "
            "Set AZURE_TRANSLATOR_KEY or AZURE_AI_SERVICES_KEY."
        )
    endpoint = "https://api.cognitive.microsofttranslator.com"
    path = "/translate"
    params: dict = {"api-version": "3.0", "to": target}
    if source and source != "auto":
        params["from"] = source
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }
    body = [{"text": text}]
    response = httpx.post(
        f"{endpoint}{path}", params=params, headers=headers, json=body, timeout=30
    )
    response.raise_for_status()
    data = response.json()
    return data[0]["translations"][0]["text"]


def speech_to_text(audio_bytes: bytes) -> str:
    if not settings.AZURE_SPEECH_KEY or not settings.AZURE_SPEECH_REGION:
        raise RuntimeError(
            "Azure Speech not configured. "
            "Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION."
        )
    url = (
        f"https://{settings.AZURE_SPEECH_REGION}.stt.speech.microsoft.com"
        "/speech/recognition/conversation/cognitiveservices/v1"
    )
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "audio/wav",
        "Accept": "application/json",
    }
    params = {"language": "en-US"}
    response = httpx.post(
        url, headers=headers, params=params, content=audio_bytes, timeout=30
    )
    response.raise_for_status()
    data = response.json()
    return data.get("DisplayText", "")


def text_to_speech(text: str) -> str:
    if not settings.AZURE_SPEECH_KEY or not settings.AZURE_SPEECH_REGION:
        raise RuntimeError(
            "Azure Speech not configured. "
            "Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION."
        )
    url = (
        f"https://{settings.AZURE_SPEECH_REGION}.tts.speech.microsoft.com"
        "/cognitiveservices/v1"
    )
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    }
    ssml = (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
        '<voice name="en-US-JennyNeural">'
        f"{text}"
        "</voice></speak>"
    )
    response = httpx.post(
        url, headers=headers, content=ssml.encode("utf-8"), timeout=30
    )
    response.raise_for_status()
    audio_b64 = base64.b64encode(response.content).decode("utf-8")
    return f"data:audio/mp3;base64,{audio_b64}"
```

</details>

<!-- section:layer:5 -->
## Layer 5: Custom NER & Conversational Language Understanding

- Understand the Custom NER project lifecycle (create, label, train, evaluate, deploy, consume)
- Learn CLU intents, entities, and utterances
- Know entity types: learned, list, and prebuilt
- Understand CLU deployment slots and SDK consumption

### What You Will Learn

- How Custom NER extends the built-in `recognize_entities()` with your own entity categories
- How CLU replaces LUIS for building conversational language models
- The three core CLU concepts: intents, entities, and utterances
- How to consume a deployed CLU model via the SDK

This maps to exam objectives **D5: Build a custom text classification or custom NER solution** and **D5: Create a Conversational Language Understanding (CLU) application**.

### Concepts

#### Custom Named Entity Recognition (NER)

Core Layer 2 introduced built-in entity recognition with `recognize_entities()`, which detects standard categories like Person, Location, and Organization. Custom NER lets you define your own entity categories tailored to your domain — for example, "ProductName", "PartNumber", or "PolicyClause".

The Custom NER lifecycle follows six stages:

| Stage | What Happens | Where |
|-------|-------------|-------|
| 1. Create project | Define entity types and configure the project | Language Studio (language.cognitive.azure.com) |
| 2. Label data | Upload documents and tag entity spans with your custom categories | Language Studio |
| 3. Train | Split data into training/test sets, train the model | Language Studio |
| 4. Evaluate | Review precision, recall, and F1 score per entity type | Language Studio |
| 5. Deploy | Assign the trained model to a named deployment slot | Language Studio |
| 6. Consume | Call the deployed model via SDK or REST API | Your application code |

**Evaluation metrics** — The exam expects you to understand these:

- **Precision** — Of all entities the model predicted, what fraction were correct? High precision means few false positives.
- **Recall** — Of all entities that actually exist in the data, what fraction did the model find? High recall means few false negatives.
- **F1 score** — The harmonic mean of precision and recall. A single metric that balances both.

To consume a deployed Custom NER model, use `TextAnalyticsClient.begin_recognize_custom_entities()`:

```python
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

client = TextAnalyticsClient(
    endpoint="https://<resource>.cognitiveservices.azure.com",
    credential=AzureKeyCredential("<key>"),
)

# begin_recognize_custom_entities returns a poller (long-running operation)
poller = client.begin_recognize_custom_entities(
    documents=["Order 5 units of Widget-X100, part number WX-100-A."],
    project_name="my-custom-ner-project",
    deployment_name="production",
)
result = poller.result()
for doc in result:
    for entity in doc.entities:
        print(f"{entity.text} -> {entity.category} ({entity.confidence_score:.2f})")
```

Note that `begin_recognize_custom_entities()` is a **long-running operation** (LRO) — it returns a poller, not an immediate result. This is different from the built-in `recognize_entities()` which returns synchronously.

<checkpoint id="l5-custom-ner"></checkpoint>

#### Conversational Language Understanding (CLU)

CLU is the replacement for **LUIS (Language Understanding Intelligent Service)**. The exam may reference both names — LUIS for legacy context and CLU for the current approach. Both share the same core concepts.

CLU models are built around three key concepts:

| Concept | Definition | Example |
|---------|-----------|---------|
| **Intent** | What the user wants to do | `BookFlight`, `CheckWeather`, `None` |
| **Entity** | Relevant data extracted from the utterance | `destination: "Paris"`, `date: "next Friday"` |
| **Utterance** | An example user input used for training | "Book me a flight to Paris next Friday" |

Every CLU project has a built-in `None` intent that captures utterances that do not match any defined intent. Always add diverse `None` examples to improve model accuracy.

**Entity types in CLU:**

| Entity Type | How It Works | Example |
|------------|-------------|---------|
| **Learned** | Extracted from context based on training examples | Labeling "Paris" as `destination` in training utterances |
| **List** | Exact match against a predefined list of values (with synonyms) | `size: ["small", "S", "sm"]` |
| **Prebuilt** | Automatically recognized common types (no training needed) | `datetime`, `number`, `email`, `temperature` |

**Deployment slots:** CLU models are deployed to named slots. The two standard slots are **production** and **staging**. You can swap models between slots without changing client code — useful for A/B testing or safe rollouts.

<checkpoint id="l5-clu-intents"></checkpoint>

#### Consuming a CLU Model via SDK

Use the `ConversationAnalysisClient` from the `azure.ai.language.conversations` package:

```python
from azure.ai.language.conversations import ConversationAnalysisClient
from azure.core.credentials import AzureKeyCredential

client = ConversationAnalysisClient(
    endpoint="https://<resource>.cognitiveservices.azure.com",
    credential=AzureKeyCredential("<key>"),
)

result = client.analyze_conversation(
    task={
        "kind": "Conversation",
        "analysisInput": {
            "conversationItem": {
                "id": "1",
                "participantId": "user1",
                "text": "Book a flight to Paris next Friday",
            }
        },
        "parameters": {
            "projectName": "my-clu-project",
            "deploymentName": "production",
        },
    }
)

prediction = result["result"]["prediction"]
top_intent = prediction["topIntent"]           # e.g., "BookFlight"
confidence = prediction["intents"][0]["confidenceScore"]  # e.g., 0.95
entities = prediction["entities"]              # list of extracted entities
# Note: prediction["intents"] is a list of dicts, each with "category" (the intent
# name) and "confidenceScore" (float 0-1). They are sorted by confidence descending,
# so [0] is the top intent. Example: [{"category": "BookFlight", "confidenceScore": 0.95}, ...]
```

The response structure nests the prediction under `result.prediction`. The `topIntent` field gives the highest-confidence intent, and `entities` contains all recognized entities with their category, text, and confidence score.

<checkpoint id="l5-clu-deploy"></checkpoint>

### Self-Check Questions

**Q1.** Your Custom NER model has high precision but low recall for the "PartNumber" entity type. What does this mean, and how would you fix it?

<details><summary>Answer</summary>

High precision, low recall means the model is conservative — when it does predict "PartNumber", it is usually correct (few false positives), but it misses many actual part numbers (many false negatives). To fix this, add more labeled training examples of part numbers, especially diverse formats and contexts the model currently misses.

</details>

**Q2.** A CLU project has a "CheckWeather" intent with entities for city and date. A user says "What's the weather?" without specifying a city or date. What will the CLU model return?

<details><summary>Answer</summary>

The model will still predict the `CheckWeather` intent (assuming the utterance matches that intent pattern), but the entities list will be empty or will not contain city/date entities. Entities are optional — the model only extracts them when the relevant information is present in the utterance. Your application code must handle missing entities gracefully (e.g., prompt the user for the missing city).

</details>

**Q3.** You have deployed a CLU model to the "staging" slot and tested it successfully. How do you promote it to production without redeploying?

<details><summary>Answer</summary>

Use the **swap deployments** feature in Language Studio (or via REST API). This swaps the models between the staging and production slots atomically. Client code pointing to the "production" deployment name automatically gets the new model without any code changes or redeployment.

</details>

### Exam Tips

- The exam tests the difference between **built-in NER** (immediate, no training needed, standard categories) and **Custom NER** (requires a Language Studio project, training data, and deployment). Know when each is appropriate.
- `begin_recognize_custom_entities()` is a **long-running operation** that returns a poller. Built-in methods like `recognize_entities()` return synchronously. The exam may test this distinction.
- CLU replaces LUIS. If the exam mentions LUIS, the concepts (intents, entities, utterances) are the same. The SDK and portal have changed, but the architecture is identical.
- Always include diverse `None` intent examples in CLU training. The exam may present a scenario where a model misclassifies unrelated utterances — the fix is adding `None` examples.

---

<!-- section:layer:6 -->
## Layer 6: Custom Speech & Voice

- Understand custom speech model training for domain-specific STT
- Learn the Pronunciation Assessment API and its scoring dimensions
- Know the Custom Neural Voice workflow and consent requirements
- Distinguish between Custom voice lite and Professional voice fine-tuning tiers

### What You Will Learn

- How to train custom speech models for improved recognition in specialized domains
- How Pronunciation Assessment evaluates spoken audio against reference text
- How Custom Neural Voice creates a synthetic voice from professional recordings
- The responsible AI consent requirement for voice cloning

This maps to exam objectives **D5: Implement custom speech models** and **D5: Create a custom voice** — including understanding when custom models are needed and the responsible AI requirements.

### Concepts

#### Custom Speech (Speech-to-Text)

Core Layer 4 used the standard STT REST API, which works well for general-purpose speech recognition. Custom speech extends this for scenarios where the built-in model struggles — domain-specific vocabulary (medical, legal, technical), accented speech, or noisy environments.

**Training data types:**

| Data Type | What It Is | When to Use |
|-----------|-----------|-------------|
| **Plain text** | Text sentences containing domain vocabulary | Language model adaptation — teaches the model to expect your terminology (e.g., drug names, legal terms) |
| **Audio + human-labeled transcripts** | Audio files paired with exact transcriptions | Acoustic model adaptation — improves recognition for specific accents, recording conditions, or speaker characteristics |
| **Pronunciation file** | Text file mapping words to phonetic representations | Custom pronunciation — for acronyms, product names, or words the model mispronounces |

**Training workflow:**

1. **Upload data** — Upload your training data to Speech Studio (speech.microsoft.com)
2. **Create model** — Select a base model and your training data, then train
3. **Test** — Run test audio through the model and compare word error rate (WER) against the base model
4. **Deploy** — Deploy to a custom endpoint

Important: a custom speech endpoint has a **different URL** from the standard endpoint. Your application must be configured to point to the custom endpoint URL, not the standard regional endpoint.

**When to use custom speech vs. standard:**

| Scenario | Use Standard | Use Custom |
|----------|-------------|-----------|
| General conversation | Yes | No |
| Medical dictation with drug names | No | Yes — plain text adaptation |
| Call center with consistent background noise | No | Yes — audio + transcript adaptation |
| Product with branded terminology | No | Yes — pronunciation file |
| Clean audio, common vocabulary | Yes | No |

<checkpoint id="l6-custom-stt"></checkpoint>

#### Pronunciation Assessment API

The Pronunciation Assessment API evaluates how well a speaker pronounces words compared to a reference text. It is commonly used in language learning apps and speech therapy tools.

**Scoring dimensions:**

| Score | What It Measures | Range |
|-------|-----------------|-------|
| **Accuracy** | Correctness of phoneme and word pronunciation | 0-100 |
| **Fluency** | Smoothness and naturalness of speech flow | 0-100 |
| **Completeness** | Proportion of expected words that were actually spoken | 0-100 |
| **Prosody** | Stress, intonation, speaking speed, and rhythm (optional — enable via `EnableProsodyAssessment`) | 0-100 |
| **PronScore** | Overall composite score (weighted combination of all available scores above) | 0-100 |

Scores are available at three **granularity levels**: overall (full text), per-word, and per-phoneme. The granularity is controlled by a request parameter.

**Key REST API parameters:**

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `referenceText` | The expected text | What the speaker should have said |
| `gradingSystem` | `FivePoint` or `HundredMark` | Scale for scores (5-point or 100-point) |
| `granularity` | `Phoneme`, `Word`, `FullText` | Level of detail in the response |
| `Dimension` | `Basic` or `Comprehensive` | Basic = accuracy only; Comprehensive = all scores (legacy parameter — current SDK uses `EnableProsodyAssessment` for prosody) |

```python
# Pronunciation Assessment is configured via headers on the STT endpoint.
# The key header is "Pronunciation-Assessment" with a base64-encoded JSON config:
import base64
import json

config = {
    "ReferenceText": "Hello, how are you today?",
    "GradingSystem": "HundredMark",
    "Granularity": "Phoneme",
    "Dimension": "Comprehensive",
}
pronunciation_header = base64.b64encode(
    json.dumps(config).encode("utf-8")
).decode("utf-8")

# Then include in headers:
# "Pronunciation-Assessment": pronunciation_header
```

<checkpoint id="l6-pronunciation"></checkpoint>

#### Custom Neural Voice (CNV)

Custom Neural Voice lets you create a synthetic TTS voice that sounds like a specific person. This extends the standard neural voices (like `en-US-JennyNeural` from Layer 4) with a voice unique to your brand or application.

**Workflow:**

1. **Record training data** — Professional studio recordings of the voice talent reading scripted sentences. Quality and consistency are critical.
2. **Submit verbal consent** — The voice talent must provide a **recorded verbal statement** consenting to the creation of a synthetic version of their voice. This is uploaded to Speech Studio as part of the project setup.
3. **Train the model** — Upload recordings and consent to Speech Studio, then train.
4. **Deploy** — Deploy the custom voice to an endpoint for use in TTS requests.

**The consent requirement is a responsible AI requirement that the exam explicitly tests.** Without the recorded verbal consent from the voice talent, you cannot create a Custom Neural Voice. This protects individuals from unauthorized voice cloning.

**Two tiers:**

| Tier | Purpose | Access | Quality |
|------|---------|--------|---------|
| **Custom voice lite** | Testing and evaluation | Open to all Azure subscribers (deployment for business use requires approved access) | Moderate quality (20-50 utterances) |
| **Professional voice fine-tuning** | Production workloads | Requires application and approval from Microsoft | High quality (300-2000 utterances) |

To use professional voice fine-tuning, you must submit an application describing your use case, and Microsoft reviews it for responsible AI compliance. This gated access is another exam-testable point. Note: both tiers ultimately require approved access for production deployment.

**Using a custom voice in SSML:**

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="my-custom-voice-deployment-id">
    Welcome to our application. How can I help you today?
  </voice>
</speak>
```

The `name` attribute uses your custom voice's deployment ID instead of a built-in voice name like `en-US-JennyNeural`.

<checkpoint id="l6-custom-voice"></checkpoint>

### Exam Tips

- The exam tests **when** to use custom speech vs. standard speech. If the scenario describes domain-specific vocabulary, accents, or noisy environments, custom speech is the answer. For general-purpose recognition, the standard model is sufficient.
- Pronunciation Assessment is configured via a **base64-encoded JSON header** on the standard STT endpoint — it is not a separate API. Know the five scoring dimensions (accuracy, fluency, completeness, prosody, and overall PronScore).
- Custom Neural Voice **requires recorded verbal consent** from the voice talent. The exam frequently tests this responsible AI requirement. Without consent, the voice cannot be created regardless of technical readiness.
- Professional voice fine-tuning requires a **Microsoft approval process**. This is a gating mechanism for responsible AI. The exam may ask what is needed before deploying a custom voice to production.
- Custom speech endpoints have a **different URL** from standard endpoints. If a scenario asks why recognition fails after training a custom model, check that the application points to the custom endpoint.

---

<!-- section:layer:7 -->
## Layer 7: Document Translation & Orchestration Workflow

- Understand batch document translation with Azure Blob Storage
- Learn CLU orchestration workflow for routing across multiple language backends
- Know multi-region deployment patterns for language and speech services
- Understand glossary support for consistent terminology in translations

### What You Will Learn

- How batch document translation preserves formatting and handles multiple file types
- How orchestration workflow routes user messages to the appropriate language model
- When and why to deploy language services across multiple regions
- The differences between Translator (global service) and Speech (regional service) for multi-region architectures

This maps to exam objectives **D5: Translate documents** and **D5: Create an orchestration workflow** — covering batch translation, orchestration patterns, and deployment considerations.

### Concepts

#### Batch Document Translation

Core Layer 3 covered real-time text translation — sending a string and getting a translated string back. Batch document translation handles entire files (PDF, DOCX, PPTX, XLSX, HTML, and more) while **preserving the original formatting**. This is an asynchronous, job-based operation.

**Architecture:**

```
Source Blob Container          Azure Translator          Target Blob Container
┌──────────────────┐     POST /batches              ┌──────────────────┐
│ invoice.pdf      │ ──────────────────────────────► │ invoice_es.pdf   │
│ report.docx      │     (async job)                 │ report_es.docx   │
│ slides.pptx      │                                 │ slides_es.pptx   │
└──────────────────┘                                 └──────────────────┘
        │                                                    │
        └──── Both containers need SAS tokens ───────────────┘
              or managed identity access
```

**Supported file formats:** PDF, DOCX, PPTX, XLSX, HTML, HTM, MSG, XLF, XLIFF, TSV, TAB, CSV, TXT, RTF. You can query the `GET /translator/document/formats` endpoint for the latest list. The exam may list these in a question about what can be translated.

**REST API flow:**

1. Upload source documents to an Azure Blob Storage container
2. Create or designate a target Blob Storage container
3. Generate SAS tokens (or configure managed identity) for both containers
4. Submit a translation job via `POST` to the batch translation endpoint

```python
import httpx

endpoint = "https://<translator-resource>.cognitiveservices.azure.com"
path = "/translator/document/batches"

body = {
    "inputs": [
        {
            "source": {
                "sourceUrl": "https://<storage>.blob.core.windows.net/source?<SAS>",
                "language": "en",  # optional — auto-detects if omitted
            },
            "targets": [
                {
                    "targetUrl": "https://<storage>.blob.core.windows.net/target-es?<SAS>",
                    "language": "es",
                },
                {
                    "targetUrl": "https://<storage>.blob.core.windows.net/target-fr?<SAS>",
                    "language": "fr",
                },
            ],
        }
    ]
}

url = f"{endpoint}{path}?api-version=2024-05-01"
response = httpx.post(
    url,
    headers={
        "Ocp-Apim-Subscription-Key": "<key>",
        "Content-Type": "application/json",
    },
    json=body,
)
# Response 202 Accepted — job is running asynchronously
# Poll the job status URL from the "Operation-Location" response header
```

**Glossary support:** You can attach a glossary file (TSV, CSV, or XLIFF format) to ensure specific terms are always translated consistently. For example, a glossary entry might map "Widget-X100" to "Widget-X100" (untranslated) across all target languages, or map "quarterly report" to a specific term in each target language.

<checkpoint id="l7-doc-translate"></checkpoint>

#### Orchestration Workflow in CLU

An orchestration workflow routes incoming user utterances to the most appropriate backend service. Instead of building one massive CLU model that handles everything, you build specialized models and use orchestration to direct traffic.

**Supported backend targets:**

| Target Type | What It Is |
|------------|-----------|
| **CLU project** | A Conversational Language Understanding model (e.g., for flight booking) |
| **Custom Question Answering** | A knowledge base for FAQ-style queries (replacement for QnA Maker) |
| **LUIS app** | Legacy Language Understanding app (**retired March 2026** — exists only for migration, not new projects) |

**How it works:**

1. **Create an orchestration project** in Language Studio
2. **Define routing intents** — each intent maps to a backend target (e.g., `FlightBooking` routes to a CLU project, `FAQ` routes to Custom Question Answering)
3. **Add training utterances** for each routing intent (so the orchestrator learns which utterances go where)
4. **Train and deploy** the orchestration model
5. **Runtime flow:** User message -> Orchestration model predicts the routing intent -> Message is forwarded to the matched backend -> Backend response is returned

```
User: "Book a flight to Paris"
  │
  ▼
Orchestration Model
  │ predicts: FlightBooking intent
  ▼
CLU Project (Flight Booking)
  │ extracts: intent=BookFlight, destination=Paris
  ▼
Response returned to application
```

The orchestration model is consumed using the same `ConversationAnalysisClient` and `analyze_conversation()` method from Layer 5, but with `"kind": "Conversation"` and the orchestration project name. The response structure includes which backend was selected and the backend's own response nested within.

<checkpoint id="l7-orchestration"></checkpoint>

#### Multi-Region Deployment Patterns

Deploying language and speech services across multiple Azure regions addresses three concerns: **latency reduction** (serve users from the nearest region), **disaster recovery** (failover if a region goes down), and **data residency compliance** (keep data processing within required geographic boundaries).

**Key considerations by service:**

| Service | Region Behavior | Multi-Region Strategy |
|---------|----------------|----------------------|
| **Translator** | Global service — the API endpoint (`api.cognitive.microsofttranslator.com`) has no region affinity | Keys are regional, but the endpoint is global. No region-specific URL needed for the API itself. |
| **Speech** | Region-specific endpoints (`{region}.stt.speech.microsoft.com`) | Deploy Speech resources in each target region. Route users to the nearest regional endpoint. |
| **Text Analytics** | Region-specific endpoints (`{resource}.cognitiveservices.azure.com`) | Deploy Language resources per region. Regional endpoint is embedded in the resource URL. |
| **CLU** | Tied to the Language resource's region | Deploy the same CLU model to Language resources in multiple regions. |

**Routing options:**

- **Azure Traffic Manager** — DNS-based routing. Routes users to the closest healthy endpoint. Works well for speech and text analytics where endpoints are regional.
- **Azure Front Door** — HTTP-level routing with additional features like caching and WAF. Preferred for web-facing APIs.
- **Application-level routing** — Your application selects the regional endpoint based on user location or configuration. Simplest approach for small deployments.

**Translator special case:** Because Translator uses a global endpoint, multi-region is less about routing and more about key management. If your primary region's key stops working (e.g., resource deleted or region outage), you need a key from a resource in another region. The API endpoint itself does not change.

<checkpoint id="l7-multi-region"></checkpoint>

### Self-Check Questions

**Q1.** You need to translate 500 PDF invoices from English to Spanish and German while preserving the PDF formatting. Which Azure service and approach should you use?

<details><summary>Answer</summary>

Use **batch document translation** with Azure Translator. Upload the 500 PDFs to an Azure Blob Storage source container. Create target containers for Spanish and German. Submit a single batch translation job with two targets (`es` and `de`). The service translates all documents asynchronously and preserves the PDF formatting. Real-time text translation would not work because it only handles plain text strings, not files.

</details>

**Q2.** Your company has a flight booking CLU model and a customer FAQ knowledge base. Users interact through a single chat interface and sometimes ask booking questions, sometimes FAQ questions. How do you route messages to the correct backend?

<details><summary>Answer</summary>

Create a **CLU orchestration workflow** in Language Studio. Define two routing intents — one that maps to the flight booking CLU project and one that maps to the Custom Question Answering knowledge base. Train the orchestration model with example utterances for each routing intent. At runtime, the orchestration model predicts which backend should handle the user's message and forwards it automatically.

</details>

**Q3.** You are deploying a speech-to-text application that serves users in both the US East and West Europe regions. Why can you not use a single Speech resource for both?

<details><summary>Answer</summary>

Speech services use **region-specific endpoints** (e.g., `eastus.stt.speech.microsoft.com` vs. `westeurope.stt.speech.microsoft.com`). A Speech resource in East US only serves traffic through the East US endpoint. To serve West Europe users with low latency, you need a separate Speech resource deployed in West Europe. Use Azure Traffic Manager or application-level routing to direct users to their nearest regional endpoint.

</details>

**Q4.** A batch document translation job completes, but certain terms in the translated documents are inconsistent — sometimes "quarterly report" is translated one way and sometimes another. How do you enforce consistent terminology?

<details><summary>Answer</summary>

Attach a **glossary file** (TSV, CSV, or XLIFF format) to the batch translation job. The glossary maps source terms to their required translations in each target language. When the Translator encounters a glossary term in a source document, it uses the glossary translation instead of its default translation. This ensures consistent terminology across all 500 documents.

</details>

<checkpoint id="l7-questions"></checkpoint>

### Exam Tips

- Batch document translation is **asynchronous** — you submit a job and poll for completion. The exam may ask about the response code (202 Accepted) and how to check job status (poll the `Operation-Location` header URL).
- Batch translation requires **Azure Blob Storage** for both source and target. SAS tokens or managed identity must grant read access to the source and write access to the target. The exam tests this access configuration.
- Orchestration workflow is the **recommended pattern** when you have multiple language models for different domains. The exam may present a scenario with separate CLU models and ask how to unify them behind a single endpoint.
- Translator uses a **global endpoint** while Speech uses **regional endpoints**. This is a frequent exam distinction. If a question asks about multi-region Speech deployment, the answer involves deploying separate resources per region. For Translator, the endpoint stays the same but keys are regional.
- Glossary files in batch translation use **TSV, CSV, or XLIFF** format. The exam may ask which formats are supported.

---

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** You are calling the Azure Translator REST API using a multi-service Azure AI Services key. The request returns a 401 Unauthorized error. What is the most likely cause?

A) The `Content-Type` header is missing
B) The `Ocp-Apim-Subscription-Region` header is missing
C) The API version is incorrect
D) The text is too long to translate

<details><summary>Answer</summary>

**B) The `Ocp-Apim-Subscription-Region` header is missing** — When using a multi-service key with the Translator API, you must include the region header. This is a frequent exam question. A dedicated Translator key does not require the region header, but a multi-service key does.

</details>

**Q2.** A text analytics response for sentiment analysis returns the label `"mixed"`. What does this mean?

A) The service could not determine the sentiment
B) The document contains both positive and negative sentences
C) The confidence scores are all below 0.5
D) The text is in an unsupported language

<details><summary>Answer</summary>

**B) The document contains both positive and negative sentences** — The `mixed` label indicates that different parts of the document have different sentiments. For example, "The food was great but the service was terrible" would likely return `mixed`. This is different from `neutral`, which means the content is neither positive nor negative.

</details>

**Q3.** You need to detect and redact personally identifiable information (PII) from customer feedback text. Which Text Analytics method should you use?

A) `analyze_sentiment()`
B) `recognize_entities()`
C) `recognize_pii_entities()`
D) `extract_key_phrases()`

<details><summary>Answer</summary>

**C) `recognize_pii_entities()`** — This method specifically detects PII (SSNs, emails, phone numbers, etc.) and also returns a `redacted_text` field with PII replaced by asterisks. `recognize_entities()` detects general named entities (people, places, organizations) but does not flag them as PII or provide redaction.

</details>

**Q4.** You need to convert text to speech using the Azure Speech REST API. The SSML you send specifies `<voice name="en-US-JennyNeural">`. What does the `X-Microsoft-OutputFormat` header control?

A) The voice used for synthesis
B) The language of the output
C) The audio format and quality of the response
D) The speed of speech

<details><summary>Answer</summary>

**C) The audio format and quality** — The `X-Microsoft-OutputFormat` header specifies the audio encoding (e.g., `audio-16khz-128kbitrate-mono-mp3`). The voice is controlled by the SSML `<voice>` element. Speech speed would be controlled by SSML `<prosody>` elements.

</details>

**Q5.** You want to translate a single text into both French and Spanish in a single API call. How do you configure the Translator request?

A) Send two separate requests
B) Use the `to` parameter twice: `to=fr&to=es`
C) Set `to=fr,es` as a comma-separated value
D) Include both languages in the request body

<details><summary>Answer</summary>

**B) Use the `to` parameter twice: `to=fr&to=es`** — The Translator API supports multiple target languages in a single request by repeating the `to` query parameter. The response will contain translations for each target language. This is more efficient than making separate requests.

</details>

## Next Lab

Continue to [Lab 06: Agent Workshop](06-agents.md) to build an AI agent with tool-calling capabilities — or jump to any other lab you have not completed yet. See the [lab index](README.md) for the full list.

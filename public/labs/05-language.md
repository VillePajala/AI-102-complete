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

> **Advanced** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Review custom Named Entity Recognition (NER) project lifecycle and Conversational Language Understanding (CLU) intents, entities, utterances, and deployment patterns.

<checkpoint id="l5-custom-ner"></checkpoint>
<checkpoint id="l5-clu-intents"></checkpoint>
<checkpoint id="l5-clu-deploy"></checkpoint>

<!-- section:layer:6 -->
## Layer 6: Custom Speech & Voice

> **Advanced** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Explore custom speech model training, pronunciation assessment API, and custom neural voice creation workflow.

<checkpoint id="l6-custom-stt"></checkpoint>
<checkpoint id="l6-pronunciation"></checkpoint>
<checkpoint id="l6-custom-voice"></checkpoint>

<!-- section:layer:7 -->
## Layer 7: Document Translation & Orchestration Workflow

> **Expert** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Deep-dive into batch document translation with Azure Translator, orchestration workflow for routing to CLU/QnA/LUIS, and multi-region deployment patterns.

<checkpoint id="l7-doc-translate"></checkpoint>
<checkpoint id="l7-orchestration"></checkpoint>
<checkpoint id="l7-multi-region"></checkpoint>
<checkpoint id="l7-questions"></checkpoint>

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

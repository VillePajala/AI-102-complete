# Lab 05: Language & Speech

> Exam domain: D5 — Implement natural language processing solutions (15-20%) | Service file: `backend/app/services/language_service.py` | Estimated time: 60 minutes

## Overview

In this lab you will implement four categories of Azure AI language and speech capabilities: sentiment analysis, NLP feature extraction (key phrases, entities, PII, language detection), text translation, and speech-to-text / text-to-speech. You will fill in the functions in `language_service.py` using the Text Analytics SDK for NLP and REST APIs for translation and speech.

The frontend Language & Speech page (`/language`) is already built. The backend router (`backend/app/routers/language.py`) is already wired up to call your service functions. Right now every call raises `NotImplementedError` — your job is to replace those stubs with real implementations.

## Prerequisites

- **Azure resources:** An Azure AI Services multi-service resource (for Text Analytics), plus optionally a dedicated Translator resource and a Speech resource. You can use the multi-service key for all of them, but Translator and Speech have separate config vars for flexibility.
- **Prior labs:** None. This lab is independent and can be done at any time.
- **Python packages:** `azure-ai-textanalytics`, `azure-core`, and `httpx` (all are already in `requirements.txt`).

## Azure Setup

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

### Translator

The Translator API can be accessed with the multi-service key, but it also needs a region. You can either set dedicated Translator variables or fall back to the multi-service key:

1. In the Azure Portal, go to your AI Services resource (or create a dedicated Translator resource).
2. Note the **region** you deployed to (e.g., `eastus`, `westeurope`).
3. Add to `backend/.env`:
   ```
   AZURE_TRANSLATOR_KEY=your-key-here       # or leave blank to use AZURE_AI_SERVICES_KEY
   AZURE_TRANSLATOR_REGION=eastus            # or leave blank to use AZURE_SPEECH_REGION
   ```

### Speech Services

1. In the Azure Portal, search for **Speech** and create a **Speech** resource (or use the multi-service resource).
2. Copy the **Key** and note the **Region**.
3. Add to `backend/.env`:
   ```
   AZURE_SPEECH_KEY=your-key-here
   AZURE_SPEECH_REGION=eastus
   ```

Restart the backend server after updating `.env`.

---

## Layer 1: Sentiment Analysis

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
3. Write a helper function `_get_text_client()` that creates and returns a `TextAnalyticsClient`. Check that the endpoint and key are configured.
4. Start implementing `analyze_text()`:
   - Call `_get_text_client()`.
   - Wrap the input text in a list: `documents = [text]`.
   - If `analysis_type` is `"sentiment"` or `"all"`, call `client.analyze_sentiment(documents=documents)` and take the first result.
   - Check `.is_error`. If not an error, build a dict: `{"sentiment": {"label": ..., "scores": {"positive": ..., "neutral": ..., "negative": ...}}}`.
   - Return the result dict.

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

## Layer 2: NLP Features

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
3. For `"entities"` (or `"all"`): call `client.recognize_entities()`, return a list of dicts (each with `"text"`, `"category"`, `"confidence"`) under the key `"entities"`.
4. For `"pii"` (or `"all"`): call `client.recognize_pii_entities()`, return a list of dicts (each with `"text"`, `"category"`) under the key `"piiEntities"`.
5. For `"language"` (or `"all"`): call `client.detect_language()`, return a dict with `"name"`, `"iso"`, and `"confidence"` under the key `"language"`.

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

## Layer 3: Translation

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

## Layer 4: Speech Services

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

2. Implement `text_to_speech()`:
   - Check the same speech credentials.
   - Build the TTS endpoint URL: `https://{region}.tts.speech.microsoft.com/cognitiveservices/v1`.
   - Set headers: `Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`, `X-Microsoft-OutputFormat: audio-16khz-128kbitrate-mono-mp3`.
   - Build the SSML string with a `<speak>` root element, `<voice>` element (use `en-US-JennyNeural`), and the text content.
   - POST the SSML (encoded as UTF-8 bytes).
   - Base64-encode the response content and return it as a data URL: `data:audio/mp3;base64,{encoded}`.
   - You will need `import base64`.

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
3. **Text-to-Speech:** Enter any text on the `/language` page and trigger text-to-speech. The response should be an audio data URL that the browser can play.
4. Check that the audio plays correctly in the browser. If it does not play, verify the `X-Microsoft-OutputFormat` header matches the data URL MIME type.

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

- [x] A `_get_text_client()` helper that creates an authenticated `TextAnalyticsClient`
- [x] An `analyze_text()` function that handles sentiment, key phrases, entities, PII, and language detection based on the `analysis_type` parameter
- [x] A `translate_text()` function that calls the Translator REST API with proper authentication headers
- [x] A `speech_to_text()` function that sends WAV audio to the Speech STT REST API
- [x] A `text_to_speech()` function that sends SSML to the Speech TTS REST API and returns a base64 audio data URL

Verify by testing all four endpoints through the frontend (`/language`) and the Swagger UI (`http://localhost:8000/docs`).

## Next Lab

Continue to [Lab 06: Agent Workshop](06-agents.md) to build an AI agent with tool-calling capabilities — or jump to any other lab you have not completed yet. See the [lab index](README.md) for the full list.

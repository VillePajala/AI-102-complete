# Lab 04: Vision Lab

> Exam domain: D4 — Implement computer vision solutions (10-15%) | Service file: `backend/app/services/vision_service.py` | Estimated time: 45 minutes
> **Estimated Azure cost:** < $0.10. Azure AI Services Standard S0 charges ~$1 per 1,000 image analysis transactions. This lab typically uses 5-20 images.

**Difficulty:** Beginner | **Layers:** 3 | **Prerequisites:** None — independent lab

> **How to approach this lab**
>
> Each layer builds on the previous one. Implement Layer 1 first to get the
> client working, then Layer 2 extends the same function, and Layer 3 adds
> a new function for OCR. Have a few test images ready in `data/images/`
> before you start — a photo with objects and one with text work well.

<!-- section:overview -->
## Overview

In this lab you will implement Azure Computer Vision image analysis and OCR by filling in the functions in `vision_service.py`. You will use the Computer Vision SDK to analyze image content (captions, tags, objects with bounding boxes) and extract text using the asynchronous Read API. These are core AI-102 skills tested under Domain 4.

The frontend Vision Lab page (`/vision`) is already built. The backend router (`backend/app/routers/vision.py`) is already wired up to call your service functions. Right now every call raises `NotImplementedError` — your job is to replace those stubs with real Azure SDK calls.

<!-- section:prerequisites -->
## Prerequisites

- **Azure resource:** An Azure AI Services multi-service resource (or a standalone Computer Vision resource). You need the endpoint URL and an access key.
- **Prior labs:** None. This lab is independent and can be done at any time.
- **Python packages:** `azure-cognitiveservices-vision-computervision` and `msrest` (both are already in `requirements.txt`).

<!-- section:setup -->
## Azure Setup

- Create Azure AI Services multi-service resource (or reuse existing)
- Configure `backend/.env` with endpoint and key
- Restart backend server

1. Go to the [Azure Portal](https://portal.azure.com) and search for **Azure AI Services**.
2. Click **Create** and select **Azure AI Services multi-service account** (this gives you access to Vision, Language, Speech, and more with a single key).
3. Choose your subscription, create or select a resource group, pick a region, and choose the **Standard S0** pricing tier.

<checkpoint id="setup-ai-services"></checkpoint>

4. After deployment completes, go to the resource and open **Keys and Endpoint**.
5. Copy **Key 1** and the **Endpoint** URL.
6. Add them to `backend/.env`:
   ```
   AZURE_AI_SERVICES_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com
   AZURE_AI_SERVICES_KEY=your-key-here
   ```

<checkpoint id="setup-env-vision"></checkpoint>

7. Restart the backend server so it picks up the new environment variables.

<checkpoint id="setup-restart-backend"></checkpoint>

**Where to find each value:**

| Variable | Where to Find It |
|----------|-----------------|
| `AZURE_AI_SERVICES_ENDPOINT` | Azure Portal → your AI Services resource → **Keys and Endpoint** → **Endpoint** |
| `AZURE_AI_SERVICES_KEY` | Azure Portal → your AI Services resource → **Keys and Endpoint** → **Key 1** (or Key 2) |

> **Tip:** If you already set these variables in Lab 05 (Language & Speech), you can reuse the same resource and key. The multi-service resource covers Vision, Language, Speech, and more.

---

<!-- section:layer:1 -->
## Layer 1: Image Analysis

- Add SDK imports to `vision_service.py`
- Implement `_get_client()` helper
- Implement `analyze_image()` with description and tags
- Test via frontend or Swagger UI

### What You Will Learn

- How to authenticate with the Computer Vision SDK using `CognitiveServicesCredentials`
- How to call `analyze_image_in_stream()` with specific visual feature types
- How to extract captions, description tags, and confidence-scored tags from the response

These map to exam objective **D4: Analyze images** — specifically selecting the right `VisualFeatureTypes` for a given scenario.

### Concepts

Azure Computer Vision's Analyze Image API inspects an image and returns structured metadata. You control what comes back by specifying **visual feature types** in the request. For this layer you will use `VisualFeatureTypes.description` (human-readable captions and description tags) and `VisualFeatureTypes.tags` (content tags with confidence scores).

The SDK provides `ComputerVisionClient` which takes an endpoint URL and a credentials object. For key-based auth you wrap your key in `CognitiveServicesCredentials` from the `msrest` package. The `analyze_image_in_stream()` method accepts a file-like stream (use `io.BytesIO` to wrap raw bytes) and a list of visual features.

The response object has nested attributes — `analysis.description.captions` is a list of caption objects (each with `.text` and `.confidence`), `analysis.description.tags` is a flat list of description tag strings, and `analysis.tags` is a list of tag objects (each with `.name` and `.confidence`).

### Implementation

1. Open `backend/app/services/vision_service.py`.
2. Add the necessary imports at the top: `io`, the `ComputerVisionClient`, `VisualFeatureTypes`, and `CognitiveServicesCredentials`.

<checkpoint id="l1-imports"></checkpoint>

3. Write a helper function `_get_client()` that creates and returns a `ComputerVisionClient`. It should check that the endpoint and key are configured (raise `RuntimeError` if not).

<checkpoint id="l1-get-client"></checkpoint>

4. Implement `analyze_image()`:
   - Call `_get_client()` to get the client.
   - Wrap `image_bytes` in an `io.BytesIO` stream.
   - Call `client.analyze_image_in_stream()` with the stream and `visual_features=[VisualFeatureTypes.description, VisualFeatureTypes.tags]`.
   - Build and return a dict with keys `"caption"` (first caption text), `"description"` (joined description tags), and `"tags"` (list of tag names where confidence > 0.5).

<checkpoint id="l1-analyze"></checkpoint>

<details><summary>Hint</summary>

```python
import io
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials

def _get_client() -> ComputerVisionClient:
    # Check settings.AZURE_AI_SERVICES_ENDPOINT and settings.AZURE_AI_SERVICES_KEY
    # Return ComputerVisionClient(endpoint, CognitiveServicesCredentials(key))
    ...

def analyze_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    analysis = client.analyze_image_in_stream(
        stream,
        visual_features=[VisualFeatureTypes.description, VisualFeatureTypes.tags],
    )
    result = {}
    # Extract caption from analysis.description.captions[0].text
    # Extract description from analysis.description.tags (join with ", ")
    # Extract tags from analysis.tags — filter by confidence > 0.5
    return result
```

</details>

### Test It

1. Make sure both servers are running (frontend on port 3000, backend on port 8000).
2. Open http://localhost:3000/vision in your browser.
3. Upload any image (a photo with recognizable objects works best).
4. You should see a caption describing the image, a list of description tags, and confidence-scored tags.
5. If you see a "service not configured" error, check your `.env` file.

<checkpoint id="l1-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
import io
import logging

from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> ComputerVisionClient:
    if not settings.AZURE_AI_SERVICES_ENDPOINT or not settings.AZURE_AI_SERVICES_KEY:
        raise RuntimeError(
            "Azure AI Services not configured. "
            "Set AZURE_AI_SERVICES_ENDPOINT and AZURE_AI_SERVICES_KEY."
        )
    return ComputerVisionClient(
        settings.AZURE_AI_SERVICES_ENDPOINT,
        CognitiveServicesCredentials(settings.AZURE_AI_SERVICES_KEY),
    )


def analyze_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    analysis = client.analyze_image_in_stream(
        stream,
        visual_features=[
            VisualFeatureTypes.description,
            VisualFeatureTypes.tags,
        ],
    )
    result = {}
    if analysis.description:
        if analysis.description.captions:
            result["caption"] = analysis.description.captions[0].text
        if analysis.description.tags:
            result["description"] = ", ".join(analysis.description.tags)
    if analysis.tags:
        result["tags"] = [tag.name for tag in analysis.tags if tag.confidence > 0.5]
    return result
```

</details>

### Exam Tips

- The exam tests whether you know which `VisualFeatureTypes` to use for a given scenario. Know the difference between `description` (captions), `tags` (content labels), `categories`, `objects`, `faces`, and `brands`.
- `analyze_image_in_stream()` is for binary data; `analyze_image()` (without `_in_stream`) takes a URL. The exam may test you on which method to use.
- Confidence thresholds are not enforced by the API — it is your responsibility to filter results. The exam may ask about handling low-confidence results.

---

<!-- section:layer:2 -->
## Layer 2: Object Detection

- Add `VisualFeatureTypes.objects` to `analyze_image()`
- Parse bounding box data from response
- Test with image containing multiple objects

### What You Will Learn

- How to add `VisualFeatureTypes.objects` to an existing analysis call
- How to parse object detection results including bounding box coordinates
- The difference between tags (image-level labels) and objects (localized detections)

This maps to exam objective **D4: Detect objects in images** — understanding bounding box output and when to use object detection versus tagging.

### Concepts

Object detection goes beyond tagging. While tags tell you "this image contains a dog," object detection tells you "there is a dog at coordinates (x=120, y=80) with size (w=200, h=150)." Each detected object has a `.object_property` (the label), a `.confidence` score, and a `.rectangle` with `.x`, `.y`, `.w`, and `.h` attributes.

You do not need a separate API call — you simply add `VisualFeatureTypes.objects` to the same `visual_features` list you already pass to `analyze_image_in_stream()`. The response will include an `.objects` attribute containing the detections.

Bounding boxes use pixel coordinates relative to the original image dimensions. The frontend can use these to draw rectangles over the image.

### Implementation

1. In your `analyze_image()` function, add `VisualFeatureTypes.objects` to the `visual_features` list (alongside the existing `description` and `tags`).

<checkpoint id="l2-add-objects"></checkpoint>

2. After extracting captions and tags, check `analysis.objects`.
3. For each detected object, build a dict with `"name"` (from `.object_property`), `"confidence"`, and `"boundingBox"` (a dict with `"x"`, `"y"`, `"w"`, `"h"` from `.rectangle`).
4. Add the list of object dicts to the result under the key `"objects"`.

<checkpoint id="l2-parse-bbox"></checkpoint>

<details><summary>Hint</summary>

```python
# Add to your visual_features list:
visual_features=[
    VisualFeatureTypes.description,
    VisualFeatureTypes.tags,
    VisualFeatureTypes.objects,  # NEW
]

# Then after your existing tag extraction:
if analysis.objects:
    result["objects"] = [
        {
            "name": obj.object_property,
            "confidence": obj.confidence,
            "boundingBox": {
                "x": obj.rectangle.x,
                "y": obj.rectangle.y,
                "w": obj.rectangle.w,
                "h": obj.rectangle.h,
            },
        }
        for obj in analysis.objects
    ]
```

</details>

### Test It

1. Upload an image that has multiple distinct objects (people, animals, furniture, vehicles).
2. The API response should now include an `"objects"` array alongside captions and tags.
3. Each object should have a name, confidence score, and bounding box coordinates.
4. Try different images — a street scene with cars and people will return many objects; a close-up portrait may return just one.

<checkpoint id="l2-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
def analyze_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    analysis = client.analyze_image_in_stream(
        stream,
        visual_features=[
            VisualFeatureTypes.description,
            VisualFeatureTypes.tags,
            VisualFeatureTypes.objects,
        ],
    )
    result = {}
    if analysis.description:
        if analysis.description.captions:
            result["caption"] = analysis.description.captions[0].text
        if analysis.description.tags:
            result["description"] = ", ".join(analysis.description.tags)
    if analysis.tags:
        result["tags"] = [tag.name for tag in analysis.tags if tag.confidence > 0.5]
    if analysis.objects:
        result["objects"] = [
            {
                "name": obj.object_property,
                "confidence": obj.confidence,
                "boundingBox": {
                    "x": obj.rectangle.x,
                    "y": obj.rectangle.y,
                    "w": obj.rectangle.w,
                    "h": obj.rectangle.h,
                },
            }
            for obj in analysis.objects
        ]
    return result
```

</details>

### Exam Tips

- Object detection returns bounding boxes in **pixel coordinates**, not percentages. The exam may ask about coordinate systems.
- Objects can be nested — the API returns a hierarchy (e.g., a "wheel" inside a "car"). The `.parent` attribute tracks this. The exam may test knowledge of object hierarchies.
- Know the difference between `VisualFeatureTypes.objects` (localized) and `VisualFeatureTypes.tags` (image-level). A tag might say "outdoor" while objects would list specific items.

---

<!-- section:layer:3 -->
## Layer 3: OCR with the Read API

- Implement `ocr_image()` with async Read API
- Implement polling loop for operation completion
- Test with image containing text

### What You Will Learn

- How to use the asynchronous Read API for extracting text from images
- How to poll for operation completion using the operation ID
- The difference between the synchronous OCR API and the asynchronous Read API

This maps to exam objective **D4: Read text from images** — specifically using the Read API for extracting printed and handwritten text.

### Concepts

The Read API is Azure's recommended approach for OCR. Unlike the older synchronous OCR endpoint, the Read API is asynchronous — you submit the image, get back an operation ID, then poll until the operation completes. This design handles large images and multi-page documents without timing out.

The flow is: call `client.read_in_stream()` to submit the image, extract the operation ID from the `Operation-Location` response header, then call `client.get_read_result(operation_id)` in a loop until the status is no longer `"notStarted"` or `"running"`. When it succeeds, the result contains pages, and each page contains lines of text.

You must pass `raw=True` to `read_in_stream()` to get access to the raw HTTP response headers (which contain the `Operation-Location` URL). The operation ID is the last segment of that URL.

### Implementation

1. Implement `ocr_image()` in `vision_service.py`.
2. Get the client and wrap `image_bytes` in an `io.BytesIO` stream.
3. Call `client.read_in_stream(stream, raw=True)` — this returns a response object with `.headers`.
4. Extract the `"Operation-Location"` header and parse the operation ID (last path segment).
5. Poll with `client.get_read_result(operation_id)` in a loop. Check `read_result.status` — continue polling while it is `"notStarted"` or `"running"`. Sleep 1 second between polls. Set a reasonable limit (30 iterations).
6. When complete, iterate over `read_result.analyze_result.read_results` (pages), then over each page's `.lines`, and collect `.text` from each line.
7. Return `{"text": [list of extracted line strings]}`.
8. You will need `import time` at the top of the file.

<checkpoint id="l3-ocr"></checkpoint>

<checkpoint id="l3-polling"></checkpoint>

<details><summary>Hint</summary>

```python
import time

def ocr_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)

    # Submit the read operation
    read_response = client.read_in_stream(stream, raw=True)
    operation_location = read_response.headers["Operation-Location"]
    operation_id = operation_location.split("/")[-1]

    # Poll for completion
    for _ in range(30):
        read_result = client.get_read_result(operation_id)
        if read_result.status.lower() not in ("notstarted", "running"):
            break
        time.sleep(1)

    # Extract text lines
    lines = []
    # Iterate over read_result.analyze_result.read_results → pages → lines
    ...
    return {"text": lines}
```

</details>

### Test It

1. Find or create an image that contains text — a photo of a sign, a screenshot of a document, or a scanned page.
2. You can place test images in the `data/images/` directory for convenience.
3. Upload the image on the `/vision` page using the OCR feature.
4. You should see the extracted text lines displayed in order.
5. Try both printed text (a screenshot) and handwritten text (a photo of handwriting) — the Read API handles both.
6. You can also test directly via the Swagger UI at http://localhost:8000/docs — POST a file to `/api/vision/ocr`.

<checkpoint id="l3-test"></checkpoint>

<details><summary>Full Solution</summary>

```python
import io
import time
import logging

from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> ComputerVisionClient:
    if not settings.AZURE_AI_SERVICES_ENDPOINT or not settings.AZURE_AI_SERVICES_KEY:
        raise RuntimeError(
            "Azure AI Services not configured. "
            "Set AZURE_AI_SERVICES_ENDPOINT and AZURE_AI_SERVICES_KEY."
        )
    return ComputerVisionClient(
        settings.AZURE_AI_SERVICES_ENDPOINT,
        CognitiveServicesCredentials(settings.AZURE_AI_SERVICES_KEY),
    )


def analyze_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    analysis = client.analyze_image_in_stream(
        stream,
        visual_features=[
            VisualFeatureTypes.description,
            VisualFeatureTypes.tags,
            VisualFeatureTypes.objects,
        ],
    )
    result = {}
    if analysis.description:
        if analysis.description.captions:
            result["caption"] = analysis.description.captions[0].text
        if analysis.description.tags:
            result["description"] = ", ".join(analysis.description.tags)
    if analysis.tags:
        result["tags"] = [tag.name for tag in analysis.tags if tag.confidence > 0.5]
    if analysis.objects:
        result["objects"] = [
            {
                "name": obj.object_property,
                "confidence": obj.confidence,
                "boundingBox": {
                    "x": obj.rectangle.x,
                    "y": obj.rectangle.y,
                    "w": obj.rectangle.w,
                    "h": obj.rectangle.h,
                },
            }
            for obj in analysis.objects
        ]
    return result


def ocr_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    read_response = client.read_in_stream(stream, raw=True)
    operation_location = read_response.headers["Operation-Location"]
    operation_id = operation_location.split("/")[-1]

    for _ in range(30):
        read_result = client.get_read_result(operation_id)
        if read_result.status.lower() not in ("notstarted", "running"):
            break
        time.sleep(1)

    lines = []
    if read_result.analyze_result and read_result.analyze_result.read_results:
        for page in read_result.analyze_result.read_results:
            for line in page.lines:
                lines.append(line.text)
    return {"text": lines}
```

</details>

### Exam Tips

- The Read API is **asynchronous** — the exam will test whether you know to poll for results. The older synchronous OCR endpoint still exists but is not recommended for new code.
- You must pass `raw=True` to get the response headers containing the operation location. This is a common SDK gotcha that appears on the exam.
- The Read API supports images (JPEG, PNG, BMP, TIFF) and multi-page PDFs (up to 2000 pages). The exam may test format support limits.

---

## Checkpoint

After completing all three layers, your `vision_service.py` should have:

- A `_get_client()` helper that creates an authenticated `ComputerVisionClient`
- An `analyze_image()` function that returns captions, description tags, confidence-scored tags, and detected objects with bounding boxes
- An `ocr_image()` function that uses the async Read API with polling to extract text lines

Verify by testing both endpoints through the frontend (`/vision`) and the Swagger UI (`http://localhost:8000/docs`).

<details><summary>Complete vision_service.py</summary>

```python
import io
import logging
import time

from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> ComputerVisionClient:
    if not settings.AZURE_AI_SERVICES_ENDPOINT or not settings.AZURE_AI_SERVICES_KEY:
        raise RuntimeError(
            "Azure AI Services not configured. "
            "Set AZURE_AI_SERVICES_ENDPOINT and AZURE_AI_SERVICES_KEY."
        )
    return ComputerVisionClient(
        settings.AZURE_AI_SERVICES_ENDPOINT,
        CognitiveServicesCredentials(settings.AZURE_AI_SERVICES_KEY),
    )


def analyze_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    analysis = client.analyze_image_in_stream(
        stream,
        visual_features=[
            VisualFeatureTypes.description,
            VisualFeatureTypes.tags,
            VisualFeatureTypes.objects,
        ],
    )
    result: dict = {}
    if analysis.description:
        if analysis.description.captions:
            result["caption"] = analysis.description.captions[0].text
        if analysis.description.tags:
            result["description"] = ", ".join(analysis.description.tags)
    if analysis.tags:
        result["tags"] = [
            tag.name for tag in analysis.tags if tag.confidence > 0.5
        ]
    if analysis.objects:
        result["objects"] = [
            {
                "name": obj.object_property,
                "confidence": obj.confidence,
                "boundingBox": {
                    "x": obj.rectangle.x,
                    "y": obj.rectangle.y,
                    "w": obj.rectangle.w,
                    "h": obj.rectangle.h,
                },
            }
            for obj in analysis.objects
        ]
    return result


def ocr_image(image_bytes: bytes) -> dict:
    client = _get_client()
    stream = io.BytesIO(image_bytes)
    read_response = client.read_in_stream(stream, raw=True)
    operation_location = read_response.headers["Operation-Location"]
    operation_id = operation_location.split("/")[-1]
    for _ in range(30):
        read_result = client.get_read_result(operation_id)
        if read_result.status.lower() not in ("notstarted", "running"):
            break
        time.sleep(1)
    lines: list[str] = []
    if read_result.analyze_result and read_result.analyze_result.read_results:
        for page in read_result.analyze_result.read_results:
            for line in page.lines:
                lines.append(line.text)
    return {"text": lines}
```

</details>

<!-- section:layer:4 -->
## Layer 4: Custom Vision Models

> **Advanced** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Review Custom Vision project types (classification vs object detection), the training/iteration/publishing workflow, and prediction endpoint SDK patterns.

<checkpoint id="l4-project-types"></checkpoint>
<checkpoint id="l4-training-workflow"></checkpoint>
<checkpoint id="l4-prediction-api"></checkpoint>
<checkpoint id="l4-test"></checkpoint>

<!-- section:layer:5 -->
## Layer 5: Image Analysis 4.0 Features

> **Advanced** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Explore Image Analysis 4.0 features: dense captions, smart cropping, people detection, background removal, and custom model training with the Florence foundation model.

<checkpoint id="l5-dense-captions"></checkpoint>
<checkpoint id="l5-people-detection"></checkpoint>
<checkpoint id="l5-custom-model"></checkpoint>

<!-- section:layer:6 -->
## Layer 6: Face API & Spatial Analysis

> **Expert** — This section is a placeholder. Step definitions are tracked in the checklist. Full instructional content coming soon.

Deep-dive into Face API detection/verification/identification, PersonGroup management, and spatial analysis patterns for video and camera scenarios.

<checkpoint id="l6-face-detect"></checkpoint>
<checkpoint id="l6-face-groups"></checkpoint>
<checkpoint id="l6-spatial"></checkpoint>
<checkpoint id="l6-questions"></checkpoint>

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** You need to extract text from a scanned multi-page PDF using Azure Computer Vision. Which API should you use?

A) `analyze_image_in_stream()` with `VisualFeatureTypes.description`
B) The synchronous OCR endpoint
C) The asynchronous Read API (`read_in_stream()`)
D) `detect_objects_in_stream()`

<details><summary>Answer</summary>

**C) The asynchronous Read API** — The Read API handles multi-page documents (up to 2000 pages) and is the recommended approach for OCR. The synchronous OCR endpoint exists but is limited and not recommended for new code. `analyze_image_in_stream()` is for image analysis (captions, tags), not text extraction.

</details>

**Q2.** When using the Read API, you call `client.read_in_stream(stream, raw=True)`. Why is `raw=True` required?

A) It returns the raw image bytes
B) It enables access to response headers containing the operation location URL
C) It disables content filtering
D) It returns unprocessed text without formatting

<details><summary>Answer</summary>

**B) It enables access to response headers** — The Read API is asynchronous. The `Operation-Location` header contains the URL you need to poll for results. Without `raw=True`, the SDK does not expose the response headers and you cannot get the operation ID.

</details>

**Q3.** An image analysis response contains both `tags` and `objects`. What is the key difference between them?

A) Tags are more accurate than objects
B) Tags are image-level labels; objects include bounding box coordinates
C) Objects are always a subset of tags
D) Tags require a higher pricing tier

<details><summary>Answer</summary>

**B) Tags are image-level labels; objects include bounding box coordinates** — Tags tell you what the image contains overall (e.g., "outdoor", "dog"). Objects tell you where specific items are located in the image with pixel coordinates (x, y, width, height). They serve different purposes.

</details>

**Q4.** You need to analyze an image that is hosted at a public URL. Which Computer Vision SDK method should you use?

A) `analyze_image_in_stream()` with the URL as bytes
B) `analyze_image()` with the URL as a string
C) `read_in_stream()` with the URL
D) `describe_image_in_stream()`

<details><summary>Answer</summary>

**B) `analyze_image()` with the URL** — Methods ending in `_in_stream` accept binary data (file-like streams). Methods without `_in_stream` accept URLs. For a public URL, use `analyze_image(url, visual_features=[...])`.

</details>

## Next Lab

Continue to [Lab 05: Language & Speech](05-language.md) to implement text analytics, translation, and speech services — or jump to any other independent lab.

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

- Understand Custom Vision project types: classification vs object detection
- Learn the full training workflow: create project, upload images, tag, train, publish
- Explore the prediction SDK for consuming trained models
- Design a Custom Vision project for a sample use case

### What You Will Learn

- The difference between single-label classification, multi-label classification, and object detection projects
- The end-to-end workflow for training and publishing a Custom Vision model
- How to call prediction endpoints using `CustomVisionPredictionClient`
- How to evaluate model performance using precision, recall, and mAP metrics

This maps to exam objective **D4: Implement custom vision models** — understanding when and how to create custom-trained models versus using pre-built analysis.

> **Note:** Custom Vision has a planned **retirement date of September 25, 2028**. It remains fully supported and exam-relevant during the transition period. Microsoft recommends migrating to Azure Machine Learning AutoML or Azure Content Understanding for new projects.

### Concepts

Layers 1-3 used the pre-built Computer Vision models that recognize thousands of general categories out of the box. Custom Vision lets you train models that recognize domain-specific content — products on a shelf, manufacturing defects, plant diseases, or anything the pre-built models do not cover.

**Project Types**

Custom Vision supports two fundamental project types, and classification has two sub-modes:

| Project Type | Sub-mode | What It Does | Output |
|-------------|----------|-------------|--------|
| Classification | Single-label (Multiclass) | Assigns exactly one tag per image | One `Prediction` with `.tag_name` and `.probability` |
| Classification | Multi-label (Multilabel) | Assigns zero or more tags per image | Multiple `Prediction` objects, each with `.tag_name` and `.probability` |
| Object Detection | — | Locates and classifies objects within the image | `Prediction` objects with `.tag_name`, `.probability`, and `.bounding_box` |

Choose single-label when categories are mutually exclusive (e.g., "cat" vs "dog"). Choose multi-label when an image can belong to multiple categories simultaneously (e.g., "sunny" and "beach" and "crowded"). Choose object detection when you need to know where objects are located, not just whether they exist.

<checkpoint id="l4-project-types"></checkpoint>

**Training Workflow**

The full Custom Vision workflow has five stages:

1. **Create a project** — Use the Custom Vision portal at [customvision.ai](https://www.customvision.ai) or create it programmatically with `CustomVisionTrainingClient`. You select the project type (classification or detection) and domain (General, Food, Landmarks, Retail, etc.). Compact domains produce models that can be exported for edge deployment.

2. **Upload and tag images** — Upload training images and assign tags. Minimum requirements:
   - Classification: at least **30 images per tag** (Microsoft recommends 50+ for production quality)
   - Object detection: at least **15 tagged instances per tag**, where each instance includes a bounding box drawn around the object

3. **Train an iteration** — Each training run produces a numbered iteration. You choose the training type:
   - **Quick Training**: fast, suitable for prototyping (minutes)
   - **Advanced Training**: longer, typically more accurate (set a time budget of 1-24 hours)

4. **Evaluate metrics** — After training, review the iteration's performance:
   - **Precision**: of all images the model predicted as tag X, what fraction actually were tag X?
   - **Recall**: of all images that actually are tag X, what fraction did the model correctly predict?
   - **AP / mAP**: Average Precision (per tag) and mean Average Precision (across all tags) — especially important for object detection

5. **Publish the iteration** — Publishing makes the trained iteration available at a prediction endpoint. You provide a publish name (e.g., `"production"`) and the target prediction resource ID. Only published iterations can be called via the prediction API.

<checkpoint id="l4-training-workflow"></checkpoint>

**Prediction SDK**

Once a model is published, you consume it with `CustomVisionPredictionClient`. The client is separate from the training client and uses a different key (the prediction key, not the training key).

```python
# Illustrative code — NOT implemented in vision_service.py
from azure.cognitiveservices.vision.customvision.prediction import (
    CustomVisionPredictionClient,
)
from msrest.authentication import ApiKeyCredentials

# Authenticate with the prediction key
credentials = ApiKeyCredentials(
    in_headers={"Prediction-key": "<your-prediction-key>"}
)
predictor = CustomVisionPredictionClient(
    endpoint="<your-prediction-endpoint>",
    credentials=credentials,
)

# Classification — from a local image file
with open("test_image.jpg", "rb") as f:
    results = predictor.classify_image(
        project_id="<project-id>",
        published_name="production",
        image_data=f.read(),
    )

for prediction in results.predictions:
    print(f"{prediction.tag_name}: {prediction.probability:.2%}")

# Object detection — from a URL
results = predictor.detect_image_url(
    project_id="<project-id>",
    published_name="production",
    url="https://example.com/image.jpg",
)

for prediction in results.predictions:
    if prediction.probability > 0.5:
        bb = prediction.bounding_box
        print(
            f"{prediction.tag_name}: {prediction.probability:.2%} "
            f"at ({bb.left:.2f}, {bb.top:.2f}, "
            f"{bb.width:.2f}, {bb.height:.2f})"
        )
```

Key prediction methods:

| Method | Input | Project Type |
|--------|-------|-------------|
| `classify_image()` | Binary image data | Classification |
| `classify_image_url()` | Public image URL | Classification |
| `detect_image()` | Binary image data | Object Detection |
| `detect_image_url()` | Public image URL | Object Detection |

Each prediction in the response has:
- `.tag_name` — the predicted label
- `.probability` — confidence score (0.0 to 1.0)
- `.bounding_box` — only for object detection; has `.left`, `.top`, `.width`, `.height` as normalized values (0.0 to 1.0, meaning percentages of image dimensions — different from the pre-built API which uses pixel coordinates)

<checkpoint id="l4-prediction-api"></checkpoint>

**Design Exercise**

Consider this scenario: a manufacturing company wants to detect defects on circuit boards. Design a Custom Vision solution by answering these questions:

1. What project type would you choose and why?
2. How many images would you need at minimum, and what tagging strategy would you use?
3. Which domain would you select — General or General (compact)?
4. How would you structure your training/evaluation cycle?

<details><summary>Answers</summary>

1. **Object detection** — defects need to be located on the board, not just detected. A classification model would only tell you "this board has a defect" but not where. Object detection returns bounding boxes showing the exact defect location.

2. At minimum 15 images per defect type with bounding boxes, but realistically 50-100+ per defect type for production quality. Tagging strategy: create a tag for each defect type (e.g., "solder_bridge", "missing_component", "scratch"). Each training image should have bounding boxes drawn around every defect instance visible.

3. **General (compact)** if the model needs to run on edge devices at the factory floor for real-time inspection. **General** if predictions are sent to the cloud and latency is acceptable.

4. Start with Quick Training to validate the tagging approach. Review precision and recall per tag. If certain defect types have low recall, add more diverse training images for those types. Then run Advanced Training with a 2-4 hour budget. Iterate until mAP exceeds your quality threshold (e.g., 0.80+). Publish the best iteration as `"production"`.

</details>

<checkpoint id="l4-test"></checkpoint>

### Exam Tips

- The exam tests whether you know the minimum image counts: **30 per tag for classification** and **15 tagged instances per tag for object detection**. Microsoft recommends 50+ for production use.
- Custom Vision bounding boxes use **normalized coordinates** (0.0 to 1.0), not pixel coordinates. This is different from the pre-built `VisualFeatureTypes.objects` which returns pixel coordinates. The exam may test this distinction.
- Know the difference between the **training** key/client and the **prediction** key/client — they are separate resources with separate keys. Using the wrong key is a common error.
- Compact domains allow model **export** (ONNX, TensorFlow, CoreML, Docker) for offline/edge deployment. Standard domains can only be used via the prediction API. The exam may ask which domain to choose for edge scenarios.
- The `CustomVisionPredictionClient` uses `ApiKeyCredentials` (from `msrest`), not `CognitiveServicesCredentials`. The header name is `Prediction-key`.

---

<!-- section:layer:5 -->
## Layer 5: Image Analysis 4.0 Features

- Understand the transition from Computer Vision 3.x to Image Analysis 4.0
- Learn new 4.0 features: dense captions, smart cropping, people detection
- Compare the old and new SDK clients and authentication methods
- Explore custom model training with the Florence foundation model

### What You Will Learn

- What Image Analysis 4.0 adds beyond the 3.x API used in Layers 1-3
- How to use the new `azure-ai-vision-imageanalysis` SDK and `ImageAnalysisClient`
- The differences between dense captions and standard captions
- How custom models built on Florence differ from Custom Vision models

This maps to exam objective **D4: Analyze images** — specifically understanding the latest generation of image analysis capabilities and when to use each.

### Concepts

Layers 1-3 used the `azure-cognitiveservices-vision-computervision` SDK (Computer Vision API v3.x). Image Analysis 4.0 is built on the **Florence** foundation model and is accessed through a new SDK: `azure-ai-vision-imageanalysis`. The 4.0 API offers capabilities that the 3.x API does not support.

**New Features in 4.0**

| Feature | What It Does | 3.x Equivalent |
|---------|-------------|----------------|
| **Dense captions** | Generates multiple captions for different regions of the image, not just one global caption | `VisualFeatureTypes.description` (single caption only) |
| **Smart cropping** | Returns AI-suggested crop regions that focus on the most visually interesting area, with configurable aspect ratios | No equivalent |
| **People detection** | Detects people with bounding boxes, optimized specifically for human figures | Partially covered by `VisualFeatureTypes.objects` |
| **Background removal** | Generated a foreground matte or background-removed image (**retired March 2025**) | No equivalent |
| **Custom models (Florence)** | Train custom classification or detection on top of the Florence foundation model using your own dataset | Custom Vision (separate service) |
| **Standard features** | Captions, tags, objects, read (OCR) — same as 3.x but powered by Florence | `VisualFeatureTypes.*` |

<checkpoint id="l5-dense-captions"></checkpoint>

**Dense Captions vs Standard Captions**

Standard captions (3.x and 4.0) produce a single sentence describing the overall image — e.g., "a dog sitting on a bench in a park." Dense captions produce multiple captions, each describing a different region of the image with bounding box coordinates — e.g., "a golden retriever" at region (10, 20, 200, 300), "a wooden bench" at region (0, 150, 400, 200), "green trees in background" at region (0, 0, 400, 100). This is useful for generating detailed image descriptions, accessibility text, or understanding complex scenes with many elements.

**People Detection**

People detection is a dedicated feature optimized for detecting human figures. While the generic object detection in 3.x can detect "person" objects, the 4.0 people detection is more accurate for human figures and provides tighter bounding boxes. It does not return identity or demographic information — it only returns bounding boxes indicating where people are in the image.

<checkpoint id="l5-people-detection"></checkpoint>

**SDK Comparison**

| Aspect | 3.x SDK | 4.0 SDK |
|--------|---------|---------|
| Package | `azure-cognitiveservices-vision-computervision` | `azure-ai-vision-imageanalysis` |
| Client class | `ComputerVisionClient` | `ImageAnalysisClient` |
| Auth (key) | `CognitiveServicesCredentials(key)` | `AzureKeyCredential(key)` |
| Auth (Entra ID) | Not natively supported | `DefaultAzureCredential()` |
| Feature selection | `VisualFeatureTypes` enum | `VisualFeatures` enum |
| API version | 3.2 | 2024-02-01 (or later) |
| Foundation model | Classic CV models | Florence |

The 4.0 SDK uses `AzureKeyCredential` from `azure.core.credentials` instead of `CognitiveServicesCredentials` from `msrest`. It also supports Microsoft Entra ID authentication via `DefaultAzureCredential`, which the 3.x SDK does not.

**Illustrative Code**

```python
# Illustrative code — NOT implemented in vision_service.py
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential

# Create the 4.0 client
client = ImageAnalysisClient(
    endpoint="<your-endpoint>",
    credential=AzureKeyCredential("<your-key>"),
)

# Analyze with dense captions and people detection
with open("photo.jpg", "rb") as f:
    result = client.analyze(
        image_data=f.read(),
        visual_features=[
            VisualFeatures.DENSE_CAPTIONS,
            VisualFeatures.PEOPLE,
            VisualFeatures.SMART_CROPS,
        ],
        smart_crops_aspect_ratios=[0.9, 1.33],  # portrait and landscape
    )

# Dense captions — multiple captions with bounding boxes
for caption in result.dense_captions.list:
    bb = caption.bounding_box
    print(
        f"'{caption.text}' (confidence: {caption.confidence:.2f}) "
        f"at [{bb.x}, {bb.y}, {bb.width}, {bb.height}]"
    )

# People detection
for person in result.people.list:
    bb = person.bounding_box
    print(
        f"Person (confidence: {person.confidence:.2f}) "
        f"at [{bb.x}, {bb.y}, {bb.width}, {bb.height}]"
    )

# Smart crops
for crop in result.smart_crops.list:
    bb = crop.bounding_box
    print(
        f"Crop suggestion (aspect ratio: {crop.aspect_ratio}) "
        f"at [{bb.x}, {bb.y}, {bb.width}, {bb.height}]"
    )
```

**Custom Models with Florence**

Image Analysis 4.0 allows you to train custom models on top of the Florence foundation model using Azure AI Vision Studio or the REST API. This is conceptually similar to Custom Vision but with key differences:

| Aspect | Custom Vision | Florence Custom Models |
|--------|--------------|----------------------|
| Foundation | Custom-trained from scratch | Fine-tuned on Florence |
| Training data needed | 15+ images per tag | Fewer images (transfer learning) |
| Portal | customvision.ai | Azure AI Vision Studio |
| SDK | `CustomVisionPredictionClient` | `ImageAnalysisClient` with model name |
| Export for edge | Yes (compact domains) | Not yet broadly supported |
| Integration | Separate prediction endpoint | Same `analyze()` method with `model_name` parameter |

When using a Florence custom model, you pass a `model_name` parameter to the `analyze()` call, and the model runs within the same Image Analysis 4.0 pipeline.

<checkpoint id="l5-custom-model"></checkpoint>

### Self-Check Questions

**Q1.** You need to generate descriptive text for multiple regions within a single photograph for an accessibility application. Which Image Analysis feature should you use?

A) Standard captions
B) Dense captions
C) Tags
D) Object detection

**Q2.** You are migrating from the 3.x SDK to the 4.0 SDK. Which authentication class replaces `CognitiveServicesCredentials`?

A) `ApiKeyCredentials`
B) `DefaultAzureCredential`
C) `AzureKeyCredential`
D) `TokenCredential`

**Q3.** A client wants to train a custom image classifier with only 10 labeled images per category and integrate it into an existing Image Analysis pipeline. Which approach is most suitable?

A) Custom Vision with Quick Training
B) Florence custom model in Image Analysis 4.0
C) Fine-tune a GPT-4 Vision model
D) Use standard tags with confidence thresholds

<details><summary>Answers</summary>

**Q1: B) Dense captions** — Dense captions generate multiple captions for different regions of the image, each with a bounding box. Standard captions produce only one global description. Object detection tells you what objects are present and where, but does not generate natural language descriptions of regions.

**Q2: C) `AzureKeyCredential`** — The 4.0 SDK uses `AzureKeyCredential` from `azure.core.credentials` for key-based authentication. `DefaultAzureCredential` is also supported for Entra ID authentication, but it is not the direct replacement for the key-based `CognitiveServicesCredentials` pattern.

**Q3: B) Florence custom model** — Florence custom models leverage transfer learning from the Florence foundation model, requiring fewer training images than Custom Vision. They also integrate directly into the Image Analysis 4.0 pipeline via the `model_name` parameter, avoiding the need for a separate prediction client.

</details>

### Exam Tips

- The exam may present scenarios where you must choose between the 3.x and 4.0 API. If the question mentions dense captions, smart cropping, or the Florence model, the answer involves the 4.0 API.
- Know that 4.0 uses `AzureKeyCredential` (not `CognitiveServicesCredentials`) and supports `DefaultAzureCredential` for Entra ID auth. The exam tests authentication patterns.
- Background removal was a 4.0-only feature but was **retired in March 2025**. The exam may still reference it — know that it existed but is no longer available.
- Dense captions include bounding boxes for each caption region. Standard captions do not include spatial information. The exam may test this distinction.

---

<!-- section:layer:6 -->
## Layer 6: Face API & Spatial Analysis

- Understand Face API operations: detect, verify, identify, find similar, group
- Learn PersonGroup creation, training, and identification workflows
- Know the Limited Access policy and which operations require approval
- Review spatial analysis concepts for video/camera scenarios at the edge (retired March 2025)

### What You Will Learn

- The hierarchy of Face API operations and when to use each one
- How to create and train a PersonGroup for face identification
- Which Face API features require Limited Access approval from Microsoft
- How spatial analysis containers processed video streams for people counting, zone monitoring, and line crossing (retired March 2025, but concepts remain exam-relevant)

This maps to exam objective **D4: Implement face detection and analysis** — understanding Face API operations, access restrictions, and video analytics patterns.

### Concepts

Layers 1-3 covered static image analysis (captions, tags, objects, OCR). This layer extends into two specialized areas: face-specific analysis with the Face API, and video stream analysis with spatial analysis. Both are part of the D4 exam domain.

**Face API Operations**

The Face API provides a hierarchy of operations, from simple detection to complex identification:

| Operation | What It Does | Input | Output | Access Level |
|-----------|-------------|-------|--------|-------------|
| **Detect** | Find faces in an image | Image (file or URL) | Face rectangles + optional attributes | Unrestricted |
| **Verify** | Compare two faces — are they the same person? (1:1) | Two face IDs | `isIdentical` (bool) + confidence | Limited Access |
| **Identify** | Match a face against a PersonGroup — who is this? (1:N) | Face ID + PersonGroup ID | Candidate list with confidence | Limited Access |
| **Find Similar** | Find faces similar to a given face from a face list | Face ID + face list ID | Similar face IDs with confidence | Limited Access |
| **Group** | Cluster a set of faces by visual similarity | List of face IDs | Groups of similar face IDs | Limited Access |

<checkpoint id="l6-face-detect"></checkpoint>

**Face Detection Attributes**

When detecting faces, you can request optional attributes returned alongside the face rectangle:

| Attribute Category | Examples |
|-------------------|----------|
| Head pose | Pitch, roll, yaw (3D orientation) |
| Accessories | Glasses type (noGlasses, readingGlasses, sunglasses, swimmingGoggles) |
| Blur | Blur level (low, medium, high) |
| Exposure | Exposure level (underExposure, goodExposure, overExposure) |
| Noise | Noise level |
| Occlusion | Whether forehead, eyes, or mouth are occluded |
| Quality for recognition | Suitability for recognition (low, medium, high) |

Note: The `age`, `gender`, `emotion`, `smile`, `hair`, and `makeup` attributes have been **retired** as of June 2023 due to responsible AI concerns. The exam may still reference these to test whether you know they are no longer available.

**PersonGroup Workflow**

To identify people by face, you must create and train a PersonGroup:

1. **Create a PersonGroup** — give it an ID and display name. A PersonGroup is a container for Person objects.
2. **Add Persons** — create Person objects within the group, each with a name (e.g., "Alice", "Bob").
3. **Add face images** — for each Person, upload multiple face images (different angles, lighting conditions). The API returns a persisted face ID for each uploaded image. Microsoft recommends 6-10 diverse images per person.
4. **Train** — call the train endpoint on the PersonGroup. Training is asynchronous — you submit it and poll for completion, similar to the Read API pattern in Layer 3.
5. **Identify** — submit a detected face ID and the PersonGroup ID. The API returns a ranked list of candidates with confidence scores.

```python
# Illustrative code — NOT implemented in vision_service.py
from azure.cognitiveservices.vision.face import FaceClient
from msrest.authentication import CognitiveServicesCredentials

face_client = FaceClient(
    endpoint="<your-endpoint>",
    credentials=CognitiveServicesCredentials("<your-key>"),
)

# Step 1: Create a PersonGroup
person_group_id = "employees"
face_client.person_group.create(
    person_group_id=person_group_id,
    name="Company Employees",
)

# Step 2: Add a person
alice = face_client.person_group_person.create(
    person_group_id=person_group_id,
    name="Alice",
)

# Step 3: Add faces for Alice (from image files)
with open("alice_photo1.jpg", "rb") as f:
    face_client.person_group_person.add_face_from_stream(
        person_group_id=person_group_id,
        person_id=alice.person_id,
        image=f,
    )

# Step 4: Train the PersonGroup
face_client.person_group.train(person_group_id)

import time
# Poll for training completion (timeout after 120 seconds)
for _ in range(60):
    status = face_client.person_group.get_training_status(person_group_id)
    if status.status == "succeeded":
        break
    elif status.status == "failed":
        raise RuntimeError("Training failed")
    time.sleep(2)
else:
    raise TimeoutError("PersonGroup training timed out")

# Step 5: Detect a face in a new image, then identify
with open("unknown_person.jpg", "rb") as f:
    detected_faces = face_client.face.detect_with_stream(
        image=f,
        detection_model="detection_03",
        recognition_model="recognition_04",
        return_face_id=True,
    )

if detected_faces:
    face_ids = [face.face_id for face in detected_faces]
    results = face_client.face.identify(face_ids, person_group_id)
    for result in results:
        for candidate in result.candidates:
            person = face_client.person_group_person.get(
                person_group_id, candidate.person_id
            )
            print(f"Identified: {person.name} "
                  f"(confidence: {candidate.confidence:.2%})")
```

<checkpoint id="l6-face-groups"></checkpoint>

**Limited Access Policy**

Microsoft enforces a **Limited Access** policy on Face API features that can be used for facial recognition of real people. This is a responsible AI measure and is tested on the exam.

| Access Level | Operations | Who Can Use |
|-------------|-----------|-------------|
| **Unrestricted** | Face detection (rectangles only), head pose, blur, exposure, noise, occlusion, quality for recognition | Anyone with a Face API resource |
| **Limited Access** | Verify (1:1 comparison), Identify (1:N matching), Find Similar | Must apply through Microsoft's [Limited Access form](https://aka.ms/facerecognition) and be approved |
| **Retired** | Age, gender, emotion, smile, hair, makeup attributes; celebrity recognition | No longer available to anyone |

To apply for Limited Access, you submit a use case description through the official application form. Microsoft reviews whether the use case meets their responsible AI guidelines. Without approval, calling restricted operations returns an authorization error.

**Spatial Analysis**

> **Note:** The Spatial Analysis container was **retired on March 30, 2025**. Microsoft recommends Azure AI Video Indexer as a replacement. The concepts below remain exam-relevant as they test your understanding of edge AI deployment patterns.

Spatial analysis (formerly Azure Video Analyzer for Spatial Analysis) processed live video streams to understand physical spaces. It ran as a **container at the edge**, not as a cloud API — this distinction is important for the exam.

Architecture:
```
Camera → Spatial Analysis Container (edge device) → Events → Your Application
```

Supported operations:

| Operation | What It Detects | Use Case |
|-----------|----------------|----------|
| **Person counting** | Number of people in a zone | Occupancy monitoring, capacity management |
| **Social distancing** | Distance between people | Health and safety compliance |
| **Line crossing** | People crossing a defined line | Entry/exit counting, directional flow |
| **Zone dwell time** | How long people stay in a defined area | Queue monitoring, engagement analysis |

Key architecture points:
- Runs as a Docker container on edge hardware (requires NVIDIA GPU)
- Processes video locally — does not stream video to the cloud (privacy advantage)
- Emits events (JSON) to Azure IoT Hub or directly to your application
- Requires an Azure AI Services resource for billing/metering, but the actual processing happens on-premises
- You define zones and lines in a configuration file as polygon coordinates

<checkpoint id="l6-spatial"></checkpoint>

### Self-Check Questions

**Q1.** A retail company wants to identify VIP customers as they enter the store using security cameras and a database of enrolled VIP faces. Which Face API operation should they use, and what access level is required?

A) Detect — unrestricted access
B) Verify — Limited Access required
C) Identify — Limited Access required
D) Find Similar — unrestricted access

**Q2.** You are configuring a Face API solution and need to choose detection and recognition models. A colleague suggests using the `emotion` attribute to gauge customer satisfaction. What should you advise?

A) Use detection_model "detection_01" which supports emotion attributes
B) Emotion attributes are available only in the 4.0 SDK
C) Emotion attributes have been retired and are no longer available
D) Emotion attributes require Limited Access approval

**Q3.** A warehouse manager wants to count the number of workers in different zones of a warehouse in real time using existing security cameras. The solution must process video on-premises for privacy reasons. Which Azure service should you recommend?

A) Face API with PersonGroups
B) Image Analysis 4.0 with people detection
C) Spatial analysis container
D) Custom Vision object detection

**Q4.** You need to train a PersonGroup with 5 employees. How many face images should you upload per person at minimum, and what happens after uploading the images?

A) 1 image per person; the PersonGroup is immediately ready for identification
B) 6-10 diverse images per person; you must call the train endpoint and wait for it to complete
C) 15 images per person; training happens automatically
D) 50 images per person; you must export and deploy the model

<details><summary>Answers</summary>

**Q1: C) Identify — Limited Access required.** Matching an unknown face against a database of known faces is a 1:N identification scenario. This requires the Identify operation, which falls under Limited Access. The company must apply through Microsoft's Limited Access form and be approved before they can use this feature. Detect alone would only find face rectangles but not match identities. Verify is 1:1 (comparing two specific faces), not 1:N.

**Q2: C) Emotion attributes have been retired and are no longer available.** As of June 2023, Microsoft retired the emotion, age, gender, smile, hair, and makeup attributes from the Face API as a responsible AI measure. No detection model or SDK version supports them. The exam tests whether you know these attributes are no longer available.

**Q3: C) Spatial analysis container.** Spatial analysis ran as a Docker container on edge hardware, processed video locally (meeting on-premises privacy requirements), and supported zone-based people counting. Note: the Spatial Analysis container was retired in March 2025, but the concept of edge-deployed AI containers for video analysis remains exam-relevant. Face API is for face recognition, not zone counting. Image Analysis 4.0 is a cloud API that analyzes single images, not continuous video streams.

**Q4: B) 6-10 diverse images per person; you must call the train endpoint and wait for it to complete.** Microsoft recommends 6-10 diverse images per person (different angles, lighting). After adding all faces, you must explicitly call the train endpoint on the PersonGroup. Training is asynchronous — you poll for completion before the PersonGroup can be used for identification. It does not happen automatically, and one image is insufficient for reliable recognition.

</details>

<checkpoint id="l6-questions"></checkpoint>

### Exam Tips

- The exam heavily tests the **Limited Access policy**. Know which Face API operations are unrestricted (detection only) versus restricted (verify, identify, find similar, group). If a question involves recognizing or comparing faces of real people, the answer likely involves Limited Access.
- Face attributes like `emotion`, `age`, and `gender` are **retired**. If an exam question presents these as options, they are distractors. The correct answer will use a different approach.
- Spatial analysis ran as a **container at the edge** (retired March 2025). The exam may still test the concept — know that edge AI containers process video locally with GPU hardware, unlike cloud APIs.
- The PersonGroup training step is **asynchronous** — you must poll for completion, just like the Read API. The exam may test this pattern.
- Know the difference between **Verify** (1:1 — "are these two faces the same person?") and **Identify** (1:N — "who is this person from my database?"). The exam frequently tests this distinction.
- Detection models and recognition models are **versioned** (e.g., `detection_03`, `recognition_04`). You must use compatible pairs. The exam may ask about model compatibility.

---

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

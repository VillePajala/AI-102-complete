"""Azure Computer Vision service — stub for guided lab implementation.

Students implement this file layer by layer following docs/labs/04-vision.md.
The router (vision.py) calls these functions — signatures must not change.
"""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


# === LAYER 1: Image Analysis (Lab 04, Layer 1) ===
# TODO: Create a ComputerVisionClient and call analyze_image_in_stream
# SDK: azure-cognitiveservices-vision-computervision
# Docs: https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/quickstarts-sdk/image-analysis-client-library
# See docs/labs/04-vision.md — Layer 1


def analyze_image(image_bytes: bytes) -> dict:
    """Analyze an image for descriptions, tags, and detected objects.

    Called by: vision.router /api/vision/analyze
    Returns: Dict with keys like "caption", "tags", "objects".
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_analyze_image

        return mock_analyze_image()
    raise NotImplementedError(
        "See docs/labs/04-vision.md — Layer 1. "
        "Hint: from azure.cognitiveservices.vision.computervision import ComputerVisionClient"
    )


# === LAYER 2: Object Detection (Lab 04, Layer 2) ===
# Layer 2 extends analyze_image above to include object detection with bounding boxes.
# No new function — you add VisualFeatureTypes.objects to your Layer 1 implementation.


# === LAYER 3: OCR with the Read API (Lab 04, Layer 3) ===
# TODO: Use the Read API (client.read_in_stream) for OCR
# The Read API is asynchronous — you must poll for results.
# See docs/labs/04-vision.md — Layer 3


def ocr_image(image_bytes: bytes) -> dict:
    """Extract text from an image using the Read API (OCR).

    Called by: vision.router /api/vision/ocr
    Returns: Dict with key "text" containing a list of extracted lines.
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_ocr_image

        return mock_ocr_image()
    raise NotImplementedError(
        "See docs/labs/04-vision.md — Layer 3. "
        "Hint: client.read_in_stream(stream, raw=True) + poll with get_read_result()"
    )

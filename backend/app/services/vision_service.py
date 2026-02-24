# Azure Computer Vision service — implement following docs/labs/04-vision.md
# Quickstart: https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/quickstarts-sdk/image-analysis-client-library

from app.config import settings

# === LAYER 1: Image Analysis (Lab 04, Layer 1) ===

### YOUR CODE STARTS HERE ###

# Step 1: Import ComputerVisionClient and CognitiveServicesCredentials

### YOUR CODE ENDS HERE ###


def analyze_image(image_bytes):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a ComputerVisionClient using settings.AZURE_AI_SERVICES_ENDPOINT
    #         and settings.AZURE_AI_SERVICES_KEY
    # Step 2: Wrap image_bytes in io.BytesIO
    # Step 3: Call client.analyze_image_in_stream() with visual features
    # Step 4: Return dict with "caption", "tags", "objects"

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/04-vision.md — Layer 1")


# === LAYER 2: Object Detection (Lab 04, Layer 2) ===
# No new function — add VisualFeatureTypes.objects to your Layer 1 implementation.


# === LAYER 3: OCR with the Read API (Lab 04, Layer 3) ===


def ocr_image(image_bytes):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a ComputerVisionClient
    # Step 2: Call client.read_in_stream() with image bytes
    # Step 3: Poll with get_read_result() until status is "succeeded"
    # Step 4: Return dict with "text" containing extracted lines

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/04-vision.md — Layer 3")

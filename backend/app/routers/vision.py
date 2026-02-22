import logging

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.services import vision_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/vision", tags=["vision"])

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"}


async def _validate_image(file: UploadFile) -> bytes:
    """Read and validate an uploaded image file."""
    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{content_type}'. Allowed: JPEG, PNG, GIF, WebP, BMP, TIFF.",
        )
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(image_bytes) / (1024*1024):.1f} MB). Maximum is {MAX_FILE_SIZE // (1024*1024)} MB.",
        )
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return image_bytes


@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        image_bytes = await _validate_image(file)
        result = vision_service.analyze_image(image_bytes)
        return result
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Image analysis error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    try:
        image_bytes = await _validate_image(file)
        result = vision_service.ocr_image(image_bytes)
        return result
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("OCR error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

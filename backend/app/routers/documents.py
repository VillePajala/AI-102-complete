"""Document Intelligence router — document analysis and extraction."""

import logging

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.services import document_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_DOC_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/bmp",
}


@router.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    model: str = "prebuilt-invoice",
):
    """Analyze a document using a prebuilt or custom model."""
    try:
        content_type = file.content_type or ""
        if content_type not in ALLOWED_DOC_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{content_type}'. Allowed: PDF, JPEG, PNG, TIFF, BMP.",
            )
        doc_bytes = await file.read()
        if len(doc_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum is {MAX_FILE_SIZE // (1024*1024)} MB.",
            )
        if len(doc_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        result = document_service.analyze_document(doc_bytes, model)
        return result
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Document analysis error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/models")
async def list_models():
    """List available prebuilt document models."""
    return {
        "models": [
            {"id": "prebuilt-invoice", "name": "Invoice", "description": "Extract fields from invoices"},
            {"id": "prebuilt-receipt", "name": "Receipt", "description": "Extract fields from receipts"},
            {"id": "prebuilt-idDocument", "name": "ID Document", "description": "Extract fields from ID documents"},
            {"id": "prebuilt-businessCard", "name": "Business Card", "description": "Extract contact info from business cards"},
            {"id": "prebuilt-tax.us.w2", "name": "W-2", "description": "Extract fields from W-2 tax forms"},
        ]
    }

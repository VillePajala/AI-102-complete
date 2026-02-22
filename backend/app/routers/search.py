import logging
import pathlib

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from app.services import search_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["search"])

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_DOC_TYPES = {"text/plain", "text/markdown", "application/pdf", "text/csv"}


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)


@router.post("/query")
async def search_query(req: SearchRequest):
    try:
        results = search_service.search_documents(req.query)
        return {"results": results}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Search query error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        if len(content_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum is {MAX_FILE_SIZE // (1024*1024)} MB.",
            )
        if len(content_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Sanitize filename to prevent path traversal
        raw_name = file.filename or "unknown"
        filename = pathlib.Path(raw_name).name

        content = content_bytes.decode("utf-8", errors="replace")
        search_service.upload_document(filename, content)
        return {"status": "ok", "filename": filename}
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Document upload error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services import search_service

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchRequest(BaseModel):
    query: str


@router.post("/query")
async def search_query(req: SearchRequest):
    try:
        results = search_service.search_documents(req.query)
        return {"results": results}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        content = content_bytes.decode("utf-8", errors="replace")
        search_service.upload_document(file.filename or "unknown", content)
        return {"status": "ok", "filename": file.filename}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

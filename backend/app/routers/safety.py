import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import safety_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/safety", tags=["safety"])


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)


class CheckPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)


@router.post("/analyze-text")
async def analyze_text(req: AnalyzeTextRequest):
    try:
        result = safety_service.analyze_text(req.text)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Content safety analysis error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-prompt")
async def check_prompt(req: CheckPromptRequest):
    try:
        result = safety_service.check_prompt(req.prompt)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Prompt shield error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

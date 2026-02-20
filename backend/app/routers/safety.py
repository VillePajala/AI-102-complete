from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import safety_service

router = APIRouter(prefix="/api/safety", tags=["safety"])


class AnalyzeTextRequest(BaseModel):
    text: str


class CheckPromptRequest(BaseModel):
    prompt: str


@router.post("/analyze-text")
async def analyze_text(req: AnalyzeTextRequest):
    try:
        result = safety_service.analyze_text(req.text)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-prompt")
async def check_prompt(req: CheckPromptRequest):
    try:
        result = safety_service.check_prompt(req.prompt)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

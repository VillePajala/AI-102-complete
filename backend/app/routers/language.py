import logging

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from app.services import language_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/language", tags=["language"])

MAX_AUDIO_SIZE = 100 * 1024 * 1024  # 100 MB
ALLOWED_AUDIO_TYPES = {"audio/wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm", "audio/x-wav"}


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    type: str = "all"


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    source: str = "auto"
    target: str = "es"


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


@router.post("/analyze")
async def analyze_text(req: AnalyzeRequest):
    try:
        result = language_service.analyze_text(req.text, req.type)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Text analysis error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/translate")
async def translate_text(req: TranslateRequest):
    try:
        translated = language_service.translate_text(req.text, req.source, req.target)
        return {"translated": translated}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Translation error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        if len(audio_bytes) > MAX_AUDIO_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file too large. Maximum is {MAX_AUDIO_SIZE // (1024*1024)} MB.",
            )
        if len(audio_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        text = language_service.speech_to_text(audio_bytes)
        return {"text": text}
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Speech-to-text error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/text-to-speech")
async def text_to_speech(req: TTSRequest):
    try:
        audio_url = language_service.text_to_speech(req.text)
        return {"audio_url": audio_url}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Text-to-speech error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

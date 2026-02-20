from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services import language_service

router = APIRouter(prefix="/api/language", tags=["language"])


class AnalyzeRequest(BaseModel):
    text: str
    type: str = "all"


class TranslateRequest(BaseModel):
    text: str
    source: str = "auto"
    target: str = "es"


class TTSRequest(BaseModel):
    text: str


@router.post("/analyze")
async def analyze_text(req: AnalyzeRequest):
    try:
        result = language_service.analyze_text(req.text, req.type)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/translate")
async def translate_text(req: TranslateRequest):
    try:
        translated = language_service.translate_text(req.text, req.source, req.target)
        return {"translated": translated}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        text = language_service.speech_to_text(audio_bytes)
        return {"text": text}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text-to-speech")
async def text_to_speech(req: TTSRequest):
    try:
        audio_url = language_service.text_to_speech(req.text)
        return {"audio_url": audio_url}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

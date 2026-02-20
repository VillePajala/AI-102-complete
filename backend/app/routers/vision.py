from fastapi import APIRouter, HTTPException, UploadFile, File

from app.services import vision_service

router = APIRouter(prefix="/api/vision", tags=["vision"])


@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = vision_service.analyze_image(image_bytes)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = vision_service.ocr_image(image_bytes)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

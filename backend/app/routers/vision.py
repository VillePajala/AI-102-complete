from fastapi import APIRouter

router = APIRouter(prefix="/api/vision", tags=["vision"])


@router.get("/")
async def get_status():
    return {"module": "vision", "status": "not implemented"}

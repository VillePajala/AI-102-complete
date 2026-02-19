from fastapi import APIRouter

router = APIRouter(prefix="/api/language", tags=["language"])


@router.get("/")
async def get_status():
    return {"module": "language", "status": "not implemented"}

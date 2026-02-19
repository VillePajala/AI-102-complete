from fastapi import APIRouter

router = APIRouter(prefix="/api/safety", tags=["safety"])


@router.get("/")
async def get_status():
    return {"module": "safety", "status": "not implemented"}

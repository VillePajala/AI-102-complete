from fastapi import APIRouter

router = APIRouter(prefix="/api/generative", tags=["generative"])


@router.get("/")
async def get_status():
    return {"module": "generative", "status": "not implemented"}

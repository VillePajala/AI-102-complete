from fastapi import APIRouter

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/")
async def get_status():
    return {"module": "agents", "status": "not implemented"}

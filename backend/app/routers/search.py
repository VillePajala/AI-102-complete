from fastapi import APIRouter

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/")
async def get_status():
    return {"module": "search", "status": "not implemented"}

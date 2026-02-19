from fastapi import APIRouter

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/")
async def get_status():
    return {"module": "documents", "status": "not implemented"}

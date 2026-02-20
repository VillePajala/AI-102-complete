"""Progress tracking router — stores lab/layer completion locally."""

import json
import pathlib

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/progress", tags=["progress"])

PROGRESS_FILE = pathlib.Path(__file__).resolve().parent.parent.parent / "data" / "progress.json"


class CompleteRequest(BaseModel):
    lab: str
    layer: int


def _read_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"labs": {}}


def _write_progress(data: dict) -> None:
    PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_FILE.write_text(json.dumps(data, indent=2))


@router.get("")
async def get_progress():
    """Return the full progress state."""
    return _read_progress()


@router.post("/complete")
async def mark_complete(req: CompleteRequest):
    """Mark a lab layer as completed."""
    data = _read_progress()
    labs = data.setdefault("labs", {})
    layers = labs.setdefault(req.lab, {"completed_layers": []})
    if req.layer not in layers["completed_layers"]:
        layers["completed_layers"].append(req.layer)
        layers["completed_layers"].sort()
    _write_progress(data)
    return {"ok": True, "lab": req.lab, "completed_layers": layers["completed_layers"]}


@router.delete("/reset")
async def reset_progress():
    """Delete all progress data."""
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()
    return {"ok": True}

"""Progress tracking router — stores lab/layer completion locally."""

import json
import logging
import pathlib
import threading

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/progress", tags=["progress"])

PROGRESS_FILE = pathlib.Path(__file__).resolve().parent.parent.parent / "data" / "progress.json"
_file_lock = threading.Lock()


class CompleteRequest(BaseModel):
    lab: str = Field(..., min_length=1, max_length=100)
    layer: int = Field(..., ge=1, le=20)


def _read_progress() -> dict:
    with _file_lock:
        if PROGRESS_FILE.exists():
            try:
                return json.loads(PROGRESS_FILE.read_text())
            except (json.JSONDecodeError, OSError) as e:
                logger.warning("Failed to read progress file: %s", e)
                return {"labs": {}}
        return {"labs": {}}


def _write_progress(data: dict) -> None:
    with _file_lock:
        try:
            PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
            PROGRESS_FILE.write_text(json.dumps(data, indent=2))
        except OSError as e:
            logger.error("Failed to write progress file: %s", e)
            raise HTTPException(status_code=500, detail="Failed to save progress")


@router.get("")
async def get_progress():
    """Return the full progress state."""
    return _read_progress()


@router.post("/complete")
async def mark_complete(req: CompleteRequest):
    """Mark a lab layer as completed."""
    # Hold lock across read+write to prevent TOCTOU race condition
    with _file_lock:
        if PROGRESS_FILE.exists():
            try:
                data = json.loads(PROGRESS_FILE.read_text())
            except (json.JSONDecodeError, OSError) as e:
                logger.warning("Failed to read progress file: %s", e)
                data = {"labs": {}}
        else:
            data = {"labs": {}}
        labs = data.setdefault("labs", {})
        layers = labs.setdefault(req.lab, {"completed_layers": []})
        if req.layer not in layers["completed_layers"]:
            layers["completed_layers"].append(req.layer)
            layers["completed_layers"].sort()
        try:
            PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
            PROGRESS_FILE.write_text(json.dumps(data, indent=2))
        except OSError as e:
            logger.error("Failed to write progress file: %s", e)
            raise HTTPException(status_code=500, detail="Failed to save progress")
    return {"ok": True, "lab": req.lab, "completed_layers": layers["completed_layers"]}


@router.delete("/reset")
async def reset_progress():
    """Delete all progress data."""
    with _file_lock:
        if PROGRESS_FILE.exists():
            PROGRESS_FILE.unlink()
    return {"ok": True}

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import generative, agents, vision, language, search, safety, progress, validate, documents

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(
    title="AI-102 Command Center API",
    description="Backend API for the AI-102 exam preparation command center",
    version="0.1.0",
)

# CORS middleware — configurable via environment
cors_origins = (
    [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    if settings.CORS_ORIGINS
    else ["http://localhost:3000"]
)

# Credentials cannot be used with wildcard origins per CORS spec
_use_credentials = "*" not in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=_use_credentials,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register all routers
app.include_router(generative.router)
app.include_router(agents.router)
app.include_router(vision.router)
app.include_router(language.router)
app.include_router(search.router)
app.include_router(documents.router)
app.include_router(safety.router)
app.include_router(progress.router)
app.include_router(validate.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "demo_mode": settings.DEMO_MODE}

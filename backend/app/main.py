from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI-102 Command Center API",
    description="Backend API for the AI-102 exam preparation command center",
    version="0.1.0",
)

# CORS middleware - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router includes (uncomment as routers are implemented)
# from app.routers import generative, agents, vision, language, search, documents, safety
# app.include_router(generative.router)
# app.include_router(agents.router)
# app.include_router(vision.router)
# app.include_router(language.router)
# app.include_router(search.router)
# app.include_router(documents.router)
# app.include_router(safety.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

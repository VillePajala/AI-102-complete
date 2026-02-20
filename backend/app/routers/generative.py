from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import openai_service, search_service

router = APIRouter(prefix="/api/generative", tags=["generative"])


class ChatRequest(BaseModel):
    messages: list[dict]
    model: str | None = None
    temperature: float = 0.7
    top_p: float = 1.0
    max_tokens: int = 800
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    use_rag: bool = False


class ChatResponse(BaseModel):
    message: str
    sources: list[str] | None = None


class ImageRequest(BaseModel):
    prompt: str


class ImageResponse(BaseModel):
    url: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        sources = None

        if req.use_rag:
            # Get the last user message for RAG search
            last_user_msg = ""
            for msg in reversed(req.messages):
                if msg.get("role") == "user":
                    last_user_msg = msg.get("content", "")
                    break

            if last_user_msg:
                try:
                    search_results = search_service.search_documents(last_user_msg)
                    context_parts = []
                    sources = []
                    for r in search_results[:5]:
                        context_parts.append(r.get("content", ""))
                        if r.get("source"):
                            sources.append(r["source"])

                    if context_parts:
                        context = "\n\n".join(context_parts)
                        system_msg = {
                            "role": "system",
                            "content": (
                                "Answer the user's question using the following context from their documents. "
                                "If the context doesn't contain relevant information, say so.\n\n"
                                f"Context:\n{context}"
                            ),
                        }
                        req.messages = [system_msg, *req.messages]
                except Exception:
                    # If search fails, proceed without RAG
                    sources = None

        message = openai_service.chat_completion(
            messages=req.messages,
            model=req.model,
            temperature=req.temperature,
            top_p=req.top_p,
            max_tokens=req.max_tokens,
            frequency_penalty=req.frequency_penalty,
            presence_penalty=req.presence_penalty,
        )
        return ChatResponse(message=message, sources=sources)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image", response_model=ImageResponse)
async def generate_image(req: ImageRequest):
    try:
        url = openai_service.generate_image(req.prompt)
        return ImageResponse(url=url)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

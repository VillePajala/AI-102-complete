import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal

from app.services import openai_service, search_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/generative", tags=["generative"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1, max_length=50000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str | None = None
    temperature: float = Field(0.7, ge=0, le=2)
    top_p: float = Field(1.0, ge=0, le=1)
    max_tokens: int = Field(800, ge=1, le=128000)
    frequency_penalty: float = Field(0.0, ge=-2, le=2)
    presence_penalty: float = Field(0.0, ge=-2, le=2)
    use_rag: bool = False


class ChatResponse(BaseModel):
    message: str
    sources: list[str] | None = None


class ImageRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)


class ImageResponse(BaseModel):
    url: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        sources = None

        if req.use_rag:
            last_user_msg = ""
            for msg in reversed(req.messages):
                if msg.role == "user":
                    last_user_msg = msg.content
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
                        system_msg = ChatMessage(
                            role="system",
                            content=(
                                "Answer the user's question using the following context from their documents. "
                                "If the context doesn't contain relevant information, say so.\n\n"
                                f"Context:\n{context}"
                            ),
                        )
                        req.messages = [system_msg, *req.messages]
                except Exception:
                    logger.warning("RAG search failed, proceeding without context", exc_info=True)
                    sources = None

        messages_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
        message = openai_service.chat_completion(
            messages=messages_dicts,
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
        logger.error("Chat endpoint error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image", response_model=ImageResponse)
async def generate_image(req: ImageRequest):
    try:
        url = openai_service.generate_image(req.prompt)
        return ImageResponse(url=url)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Image generation error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

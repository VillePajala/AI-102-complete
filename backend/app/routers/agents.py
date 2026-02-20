from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import openai_service

router = APIRouter(prefix="/api/agents", tags=["agents"])


class AgentConfig(BaseModel):
    id: str
    name: str
    instructions: str = ""
    tools: list[str] = []
    knowledgeSources: list[str] = []


class AgentChatRequest(BaseModel):
    agent_id: str
    messages: list[dict]
    agent_config: AgentConfig


class ToolCall(BaseModel):
    tool: str
    input: str
    output: str


class AgentChatResponse(BaseModel):
    message: str
    tool_calls: list[ToolCall] | None = None


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(req: AgentChatRequest):
    try:
        result = openai_service.chat_with_tools(
            messages=req.messages,
            system_instructions=req.agent_config.instructions,
            tools=req.agent_config.tools,
        )
        return AgentChatResponse(
            message=result["message"],
            tool_calls=[ToolCall(**tc) for tc in result["tool_calls"]] if result["tool_calls"] else None,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""Azure OpenAI service — stub for guided lab implementation.

Students implement this file layer by layer following docs/labs/01-genai.md.
The routers (generative.py, agents.py) call these functions — signatures must not change.
"""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


# === LAYER 1: Chat Completion (Lab 01, Layer 1) ===
# TODO: Create an AzureOpenAI client using settings and call chat.completions.create
# Docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart
# See docs/labs/01-genai.md — Layer 1


def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> str:
    """Send messages to Azure OpenAI and return the assistant's reply.

    Called by: generative.router /api/generative/chat
    Returns: The assistant message content as a string.
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_chat_completion

        return mock_chat_completion()
    raise NotImplementedError(
        "See docs/labs/01-genai.md — Layer 1. "
        "Hint: from openai import AzureOpenAI"
    )


# === LAYER 2: Parameter Tuning (Lab 01, Layer 2) ===
# The chat_completion function above already accepts parameters.
# Layer 2 is about understanding what temperature, top_p, etc. do.
# No new function needed — you enhance Layer 1's implementation.


# === LAYER 3: Image Generation with DALL-E (Lab 01, Layer 3) ===
# TODO: Use client.images.generate with the DALL-E deployment
# See docs/labs/01-genai.md — Layer 3


def generate_image(prompt: str) -> str:
    """Generate an image from a text prompt using DALL-E.

    Called by: generative.router /api/generative/image
    Returns: URL of the generated image.
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_generate_image

        return mock_generate_image()
    raise NotImplementedError(
        "See docs/labs/01-genai.md — Layer 3. "
        "Hint: client.images.generate(model=settings.AZURE_OPENAI_DALLE_DEPLOYMENT, ...)"
    )


# === LAYER 4: Tool-Augmented Chat (Lab 06, Layer 1) ===
# TODO: Extend chat to support simulated tool calling for the agent workshop
# See docs/labs/06-agents.md — Layer 1


def chat_with_tools(
    messages: list[dict],
    system_instructions: str,
    tools: list[str],
) -> dict:
    """Chat with simulated tool calls for the agent workshop.

    Called by: agents.router /api/agents/chat
    Returns: Dict with "message" (str) and "tool_calls" (list of dicts).
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_chat_with_tools

        return mock_chat_with_tools()
    raise NotImplementedError(
        "See docs/labs/06-agents.md — Layer 1. "
        "Hint: reuse the AzureOpenAI client from chat_completion() with a system message"
    )

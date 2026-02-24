# Azure OpenAI service — implement following docs/labs/01-genai.md
# Quickstart: https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart

from app.config import settings

# === LAYER 1: Chat Completion (Lab 01, Layer 1) ===

### YOUR CODE STARTS HERE ###

# Step 1: Import AzureOpenAI from the openai package

### YOUR CODE ENDS HERE ###


def chat_completion(messages, model=None, temperature=0.7, top_p=1.0,
                    max_tokens=800, frequency_penalty=0.0, presence_penalty=0.0):

    ### YOUR CODE STARTS HERE ###

    # Step 1: Create an AzureOpenAI client using settings.AZURE_OPENAI_ENDPOINT,
    #         settings.AZURE_OPENAI_KEY, and settings.AZURE_OPENAI_API_VERSION
    # Step 2: Use model or fall back to settings.AZURE_OPENAI_DEPLOYMENT
    # Step 3: Call client.chat.completions.create()
    # Step 4: Return response.choices[0].message.content or ""

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/01-genai.md — Layer 1")


# === LAYER 2: Parameter Tuning (Lab 01, Layer 2) ===
# No new function — enhance chat_completion() to pass all parameters.


# === LAYER 3: Image Generation with DALL-E (Lab 01, Layer 3) ===


def generate_image(prompt):

    ### YOUR CODE STARTS HERE ###

    # Step 1: Create an AzureOpenAI client
    # Step 2: Call client.images.generate() with settings.AZURE_OPENAI_DALLE_DEPLOYMENT
    # Step 3: Return response.data[0].url or ""

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/01-genai.md — Layer 3")


# === LAYER 4: Tool-Augmented Chat (Lab 06, Layer 1) ===


def chat_with_tools(messages, system_instructions, tools):
    
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create an AzureOpenAI client
    # Step 2: Add system_instructions as a system message
    # Step 3: Call client.chat.completions.create()
    # Step 4: Return dict with "message" (str) and "tool_calls" (list)

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/06-agents.md — Layer 1")

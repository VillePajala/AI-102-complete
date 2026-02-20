# Lab 06: Agent Workshop

> Exam domain: D3 — Implement agentic AI solutions (5-10%) | Service file: `backend/app/services/openai_service.py` | Estimated time: 35 minutes
> **Estimated Azure cost:** < $0.05. Reuses the Azure OpenAI resource from Lab 01 — no new resources needed. Tool-augmented chat uses the same GPT deployment.

**Difficulty:** Beginner | **Layers:** 3 | **Prerequisites:** Lab 01 (GenAI Lab)

> **How to approach this lab**
>
> This lab extends the `openai_service.py` file you worked on in Lab 01.
> Layer 1 is coding (system messages + API call), Layer 2 is coding (regex parsing),
> and Layer 3 is conceptual (grounding concepts). The coding layers are
> straightforward if you completed Lab 01.

## Overview

In this lab you implement tool-augmented chat for the Agent Workshop page. You will extend the existing `openai_service.py` (from Lab 01) with a new function, `chat_with_tools()`, that turns a basic GPT conversation into a simulated agent with system instructions and tool awareness.

Agentic AI is a growing portion of the AI-102 exam. The exam tests your understanding of how agents use instructions, tools, and grounding data to act autonomously. This lab covers the first two concepts directly and introduces the third conceptually.

**What you will implement:**

| Layer | What You Build | What It Teaches |
|-------|---------------|-----------------|
| 1 | System instructions for agent persona | How system messages shape agent behavior |
| 2 | Simulated tool call parsing | How agents invoke and report tool usage |
| 3 | (Conceptual) Grounding with knowledge sources | How real agents use data for accurate answers |

## Prerequisites

- **Lab 01 must be completed** — `chat_completion()` and the `_get_client()` helper must already work in `openai_service.py`
- Azure OpenAI resource with a GPT deployment (same one from Lab 01)
- Both frontend and backend servers running

**Config vars (already set from Lab 01):**

| Variable | Purpose |
|----------|---------|
| `settings.AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI resource URL |
| `settings.AZURE_OPENAI_KEY` | API key for the resource |
| `settings.AZURE_OPENAI_DEPLOYMENT` | GPT deployment name (e.g., `gpt-4o-mini`) |

No new Azure resources or environment variables are needed for this lab.

## Azure Setup

- [ ] Verify Lab 01 Azure OpenAI resource is working
- [ ] No new Azure resources needed

No additional Azure setup is required. This lab reuses the Azure OpenAI resource you created in Lab 01.

---

## Layer 1: System Instructions

- [ ] Build system message with instructions and tool list
- [ ] Call Chat Completions API with system message
- [ ] Return result as dict with "message" and "tool_calls" keys
- [ ] Test via frontend or Swagger UI

### What You Will Learn

- How system messages define an agent's persona and behavior boundaries
- How to compose a system prompt that includes tool awareness
- How the agent workshop router calls `chat_with_tools()`

These map to AI-102 exam objective: **"Design and implement an agentic solution"** — specifically configuring agent instructions and understanding how system prompts control agent behavior.

### Concepts

An agent is a GPT-based assistant with a specific persona, instructions, and access to tools. The simplest form of an agent is a chat completion call with a carefully crafted system message.

The Agent Workshop frontend sends an `AgentConfig` that contains:

- **`instructions`** — free-text instructions that define what the agent does (e.g., "You are a helpful travel planner")
- **`tools`** — a list of tool names the agent can reference (e.g., `["web_search", "calculator"]`)
- **`knowledgeSources`** — data sources the agent can draw from (conceptual in this lab)

The router (`agents.py`) calls your function like this:

```python
result = openai_service.chat_with_tools(
    messages=req.messages,
    system_instructions=req.agent_config.instructions,
    tools=req.agent_config.tools,
)
```

Your job is to build a system message that combines the agent's instructions with a description of its available tools, then pass everything to the Chat Completions API.

### Implementation

Open `backend/app/services/openai_service.py` and find the `chat_with_tools()` function at the bottom of the file. Replace the `raise NotImplementedError(...)` line.

**Step 1: Build the system message**

Create a system message dict (`role: "system"`) whose `content` combines:

1. The `system_instructions` parameter (the agent's persona/instructions)
2. A statement listing the available tools from the `tools` parameter
3. Instructions telling the model how to format tool usage (you will parse this format in Layer 2)

The format you should instruct the model to use when it would invoke a tool:

```
[TOOL: tool_name] Input: ... Result: ...
```

**Step 2: Call the Chat Completions API**

- Use `_get_client()` to get your existing Azure OpenAI client
- Call `client.chat.completions.create()` with the system message prepended to the user's messages
- Use `settings.AZURE_OPENAI_DEPLOYMENT` as the model
- Set `temperature=0.7` and `max_tokens=1000`

**Step 3: Return the result**

For Layer 1, return a dict with `"message"` set to the response content and `"tool_calls"` set to an empty list (tool call parsing comes in Layer 2).

<details><summary>Hint</summary>

```python
def chat_with_tools(
    messages: list[dict],
    system_instructions: str,
    tools: list[str],
) -> dict:
    client = _get_client()
    deployment = settings.AZURE_OPENAI_DEPLOYMENT

    system_msg = {
        "role": "system",
        "content": (
            f"{system_instructions}\n\n"
            f"You have access to these tools: {', '.join(___)}. "
            "When you would use a tool, describe what tool you'd call and what the result would be. "
            "Format tool usage as: [TOOL: tool_name] Input: ... Result: ..."
        ),
    }

    response = client.chat.completions.create(
        model=___,
        messages=[system_msg, *___],
        temperature=0.7,
        max_tokens=1000,
    )

    content = response.choices[0].message.___ or ""
    return {"message": content, "tool_calls": []}
```

Fill in the blanks:
- What list do you join for the tool names?
- What variable holds the deployment name?
- How do you combine the system message with the user's messages?

</details>

### Test It

1. Open http://localhost:3000/agents in your browser
2. Select or create an agent with some instructions (e.g., "You are a helpful research assistant") and one or more tools (e.g., "web_search")
3. Send a message like "What is the capital of France?"
4. You should receive a response — the agent may or may not mention tools depending on the question

You can also test via Swagger UI at http://localhost:8000/docs — find `POST /api/agents/chat` and send:

```json
{
  "agent_id": "test",
  "messages": [
    {"role": "user", "content": "Search for the weather in Helsinki"}
  ],
  "agent_config": {
    "id": "test",
    "name": "Weather Agent",
    "instructions": "You are a weather assistant. Always try to use your tools.",
    "tools": ["web_search", "weather_api"]
  }
}
```

The response should contain a message that references the tools, possibly using the `[TOOL: ...]` format.

<details><summary>Full Solution</summary>

```python
def chat_with_tools(
    messages: list[dict],
    system_instructions: str,
    tools: list[str],
) -> dict:
    client = _get_client()
    deployment = settings.AZURE_OPENAI_DEPLOYMENT

    system_msg = {
        "role": "system",
        "content": (
            f"{system_instructions}\n\n"
            f"You have access to these tools: {', '.join(tools)}. "
            "When you would use a tool, describe what tool you'd call and what the result would be. "
            "Format tool usage as: [TOOL: tool_name] Input: ... Result: ..."
        ),
    }

    response = client.chat.completions.create(
        model=deployment,
        messages=[system_msg, *messages],
        temperature=0.7,
        max_tokens=1000,
    )

    content = response.choices[0].message.content or ""
    return {"message": content, "tool_calls": []}
```

Note: This Layer 1 version returns an empty tool calls list. Layer 2 adds the parsing.

</details>

### Exam Tips

- The exam tests your understanding of system messages vs. user messages. System messages set the agent's behavior; user messages are the conversation. The model treats system messages as high-priority instructions.
- Know that Azure OpenAI system messages can include "metaprompt" patterns — instructions about how the model should behave, what it should refuse, and what tools it has access to. This is how Microsoft configures Copilot and other agents.
- The exam may ask about the difference between "grounding" and "fine-tuning." Grounding (providing context in prompts) is what agents do. Fine-tuning changes the model's weights. They are different techniques for different problems.

---

## Layer 2: Simulated Tool Calls

- [ ] Add regex parsing for `[TOOL: ...]` patterns
- [ ] Build tool_calls list from parsed matches
- [ ] Clean tool patterns from display content
- [ ] Test with prompts that trigger tool usage

### What You Will Learn

- How to parse structured tool call patterns from model output
- How agents report tool invocations back to the caller
- The difference between simulated tool calls and native function calling

These map to AI-102 exam objective: **"Define available functions and their parameters for an agent"** — understanding how agents discover, invoke, and report tool usage.

### Concepts

In Layer 1, you instructed the model to format tool usage as `[TOOL: tool_name] Input: ... Result: ...`. Now you need to parse that format out of the response text.

This is a simplified simulation of how real agents work. In production, Azure OpenAI supports native function calling where the API returns structured `tool_calls` objects in the response. However, understanding the pattern — agent decides to use a tool, invokes it, gets a result, incorporates the result — is what the exam tests.

The router expects your function to return a dict:

```python
{"message": "clean response text", "tool_calls": [list of tool call dicts]}
```

Where each tool call dict has three keys:

```python
{"tool": "tool_name", "input": "what was sent to the tool", "output": "what came back"}
```

### Implementation

Extend your `chat_with_tools()` function from Layer 1 to parse tool call patterns from the response.

**Step 1: Parse tool calls with regex**

After getting the response content, use a regular expression to find all `[TOOL: ...]` patterns. Each match should capture:

- The tool name (word after `TOOL:`)
- The input (text after `Input:`)
- The output (text after `Result:`, up to the next `[TOOL:` or end of string)

**Step 2: Build the tool calls list**

For each regex match, create a dict with keys `tool`, `input`, and `output`.

**Step 3: Clean the content**

Remove the tool call patterns from the response text so the `clean_content` return value contains only the conversational part. If removing patterns leaves an empty string, fall back to returning the full original content.

<details><summary>Hint</summary>

```python
import re

# After getting content from the API response:
tool_calls = []
for match in re.finditer(
    r"\[TOOL:\s*(\w+)\]\s*Input:\s*(.*?)\s*Result:\s*(.*?)(?=\[TOOL:|$)",
    content,
    ___,  # What re flag handles newlines in the content?
):
    tool_calls.append({
        "tool": match.group(___),
        "input": match.group(___).strip(),
        "output": match.group(___).strip(),
    })

# Remove tool patterns from the display content
clean_content = re.sub(
    r"\[TOOL:.*?\].*?(?=\[TOOL:|$)", "", content, flags=re.DOTALL
).strip()
if not clean_content:
    clean_content = content

return {"message": clean_content, "tool_calls": tool_calls}
```

Things to figure out:
- Which `re` flag lets `.` match newline characters? (`re.DOTALL`)
- Which `match.group()` index corresponds to each capture group?

</details>

### Test It

1. Open http://localhost:3000/agents
2. Configure an agent with tools like `web_search` and `calculator`
3. Ask something that would naturally trigger tool use: "Search for the population of Tokyo and calculate what percentage of Japan's population lives there"
4. The response should now show tool call information separately from the conversational text
5. In the Swagger UI response JSON, you should see `tool_calls` as a non-null list

Example Swagger request:

```json
{
  "agent_id": "test",
  "messages": [
    {"role": "user", "content": "Use the calculator to compute 15% of 2500"}
  ],
  "agent_config": {
    "id": "test",
    "name": "Math Agent",
    "instructions": "You are a math assistant. Always use your calculator tool for computations.",
    "tools": ["calculator"]
  }
}
```

Expected response structure:

```json
{
  "message": "15% of 2500 is 375.",
  "tool_calls": [
    {
      "tool": "calculator",
      "input": "0.15 * 2500",
      "output": "375"
    }
  ]
}
```

The exact wording will vary since GPT generates the tool usage descriptions, but the structure should match.

<details><summary>Full Solution</summary>

The complete `chat_with_tools` function with both Layer 1 and Layer 2:

```python
def chat_with_tools(
    messages: list[dict],
    system_instructions: str,
    tools: list[str],
) -> dict:
    client = _get_client()
    deployment = settings.AZURE_OPENAI_DEPLOYMENT

    system_msg = {
        "role": "system",
        "content": (
            f"{system_instructions}\n\n"
            f"You have access to these tools: {', '.join(tools)}. "
            "When you would use a tool, describe what tool you'd call and what the result would be. "
            "Format tool usage as: [TOOL: tool_name] Input: ... Result: ..."
        ),
    }

    response = client.chat.completions.create(
        model=deployment,
        messages=[system_msg, *messages],
        temperature=0.7,
        max_tokens=1000,
    )

    content = response.choices[0].message.content or ""

    import re
    tool_calls = []
    for match in re.finditer(
        r"\[TOOL:\s*(\w+)\]\s*Input:\s*(.*?)\s*Result:\s*(.*?)(?=\[TOOL:|$)",
        content,
        re.DOTALL,
    ):
        tool_calls.append({
            "tool": match.group(1),
            "input": match.group(2).strip(),
            "output": match.group(3).strip(),
        })

    clean_content = re.sub(
        r"\[TOOL:.*?\].*?(?=\[TOOL:|$)", "", content, flags=re.DOTALL
    ).strip()
    if not clean_content:
        clean_content = content

    return {"message": clean_content, "tool_calls": tool_calls}
```

</details>

### Exam Tips

- The exam distinguishes between **simulated tool calling** (what this lab does — parsing text output) and **native function calling** (where the API returns structured `tool_calls` in the response object). Know both approaches.
- Native function calling uses the `tools` parameter in the API request with JSON schemas for each function. The model returns a `tool_calls` array with `function.name` and `function.arguments`. You then execute the function and send the result back in a `tool` role message.
- The exam may present scenarios where you choose between function calling, plugins, and code interpreter. Function calling is for custom integrations; code interpreter is a built-in sandbox for running Python code.

---

## Layer 3: Grounding with Knowledge Sources

- [ ] Review grounding concepts (RAG, code interpreter, function calling)
- [ ] Understand Foundry Agent Service capabilities
- [ ] Answer self-check questions

### What You Will Learn

- How agents use grounding to provide accurate, up-to-date answers
- The role of Azure AI Foundry Agent Service in production agent development
- How this connects to RAG (Lab 02) and Knowledge Mining (Lab 03)

This maps to AI-102 exam objective: **"Implement grounding for an agentic solution"** — understanding how agents access external data through tools and knowledge sources.

### Concepts

The `AgentConfig` model includes a `knowledgeSources` field that this lab does not implement in code. This is intentional — grounding is the bridge between the Agent Workshop and the RAG pattern you built (or will build) in Lab 02.

**What is grounding?**

Grounding means connecting an AI model to external data sources so its responses are based on facts, not just its training data. Without grounding, a model can only answer from what it learned during training (which has a cutoff date and may contain inaccuracies).

Three ways to ground an agent:

| Method | How It Works | Azure Service |
|--------|-------------|---------------|
| **RAG (retrieval-augmented generation)** | Search a knowledge base, inject results into the prompt | Azure AI Search + Azure OpenAI |
| **Code interpreter** | Run Python code to analyze data, read files | Azure AI Foundry Agent Service |
| **Function calling** | Call external APIs for real-time data | Azure OpenAI function calling |

**Azure AI Foundry Agent Service**

In production, you would not build agents by hand-parsing tool call text. Microsoft provides the Foundry Agent Service (SDK: `azure-ai-projects`) which handles:

- Agent creation with instructions and tool definitions
- Automatic tool execution (the service calls your functions)
- Conversation threading with persistent state
- Built-in tools: code interpreter, file search, Bing search, Azure AI Search
- Function calling with structured JSON schemas

The pattern in this lab (system message + simulated tools) teaches the underlying concept. The Foundry Agent Service automates the infrastructure around it.

**How grounding connects to RAG**

If you completed Lab 02 (RAG Engine), you built a pipeline that:

1. Takes a user question
2. Searches Azure AI Search for relevant documents
3. Injects the search results into the prompt as context
4. Sends the grounded prompt to Azure OpenAI

An agent's knowledge sources work the same way. When a production agent has `knowledgeSources: ["product-catalog"]`, the agent service automatically searches that data source and grounds the response. This is RAG running inside the agent framework.

### Implementation

There is no code to write for this layer. Instead, think about how you would extend `chat_with_tools()` to support grounding:

1. If `knowledgeSources` were passed to the function, you could call `search_service.search_documents()` (from Lab 02) to retrieve relevant context
2. You would add the search results to the system message as additional context
3. The agent would then answer based on both its instructions and the retrieved data

This is exactly what the Foundry Agent Service does automatically. The exam tests whether you understand this pattern conceptually.

### Test It

No functional test for this layer. Instead, answer these self-check questions:

1. What is the difference between grounding and fine-tuning?
2. Name three built-in tools available in Azure AI Foundry Agent Service.
3. If an agent needs to answer questions about a company's internal documents, which grounding method would you use?
4. Why is grounding important for responsible AI? (Hint: it reduces hallucination.)

<details><summary>Answers</summary>

1. **Grounding** provides context at inference time (in the prompt). **Fine-tuning** changes the model's weights during training. Grounding is dynamic and does not require retraining; fine-tuning is permanent and requires training data.

2. Code interpreter, file search (Azure AI Search), Bing grounding (web search). Also: Azure Functions, OpenAPI tools.

3. RAG with Azure AI Search — index the documents, then use search results as grounding context in the agent's prompt.

4. Grounding reduces hallucination by giving the model factual data to reference. Without grounding, the model may generate plausible-sounding but incorrect information. This is a core responsible AI concern because inaccurate outputs can cause harm.

</details>

### Exam Tips

- The exam heavily tests the difference between grounding, fine-tuning, and prompt engineering. Grounding = external data at inference time. Fine-tuning = modified model weights. Prompt engineering = crafting better instructions. Know when to use each.
- Know the built-in tools in Foundry Agent Service: **code interpreter** (runs Python in a sandbox), **file search** (searches uploaded files or Azure AI Search indexes), **Bing grounding** (web search for current information).
- The exam may ask about the `azure-ai-projects` SDK for creating agents. Key classes: `AIProjectClient`, `AgentThread`, `ThreadMessage`. You create an agent, create a thread, add messages, and run the agent on the thread.

---

## Checkpoint

After completing all three layers, verify everything works:

- [ ] **Agent chat works**: Go to `/agents`, configure an agent, send a message, get a response
- [ ] **System instructions shape behavior**: An agent with instructions "You are a pirate" should respond in pirate style
- [ ] **Tool calls are parsed**: When the agent uses tools, the response includes a `tool_calls` list with structured data
- [ ] **Clean content is separated**: The conversational response does not contain raw `[TOOL: ...]` markup
- [ ] **No errors in backend terminal**: The uvicorn output should show 200 status codes for `/api/agents/chat`

Your `openai_service.py` should now have four implemented pieces:

1. `_get_client()` — helper that creates an `AzureOpenAI` client (from Lab 01)
2. `chat_completion()` — sends messages with tuning parameters (from Lab 01)
3. `generate_image()` — generates images with DALL-E (from Lab 01)
4. `chat_with_tools()` — agent chat with system instructions and tool call parsing (this lab)

<details><summary>Complete openai_service.py (after Lab 06 — all functions implemented)</summary>

```python
import logging
import re

from openai import AzureOpenAI

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> AzureOpenAI:
    if not settings.AZURE_OPENAI_ENDPOINT or not settings.AZURE_OPENAI_KEY:
        raise RuntimeError(
            "Azure OpenAI not configured. "
            "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY."
        )
    return AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )


def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    top_p: float = 1.0,
    max_tokens: int = 800,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0,
) -> str:
    client = _get_client()
    deployment = model if model else settings.AZURE_OPENAI_DEPLOYMENT
    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
    )
    return response.choices[0].message.content or ""


def generate_image(prompt: str) -> str:
    client = _get_client()
    response = client.images.generate(
        model=settings.AZURE_OPENAI_DALLE_DEPLOYMENT,
        prompt=prompt,
        n=1,
        size="1024x1024",
    )
    return response.data[0].url or ""


def chat_with_tools(
    messages: list[dict],
    system_instructions: str,
    tools: list[str],
) -> dict:
    client = _get_client()
    deployment = settings.AZURE_OPENAI_DEPLOYMENT

    system_msg = {
        "role": "system",
        "content": (
            f"{system_instructions}\n\n"
            f"You have access to these tools: {', '.join(tools)}. "
            "When you would use a tool, describe what tool you'd call "
            "and what the result would be. "
            "Format tool usage as: [TOOL: tool_name] Input: ... Result: ..."
        ),
    }

    response = client.chat.completions.create(
        model=deployment,
        messages=[system_msg, *messages],
        temperature=0.7,
        max_tokens=1000,
    )

    content = response.choices[0].message.content or ""

    tool_calls = []
    for match in re.finditer(
        r"\[TOOL:\s*(\w+)\]\s*Input:\s*(.*?)\s*Result:\s*(.*?)(?=\[TOOL:|$)",
        content,
        re.DOTALL,
    ):
        tool_calls.append({
            "tool": match.group(1),
            "input": match.group(2).strip(),
            "output": match.group(3).strip(),
        })

    clean_content = re.sub(
        r"\[TOOL:.*?\].*?(?=\[TOOL:|$)", "", content, flags=re.DOTALL
    ).strip()
    if not clean_content:
        clean_content = content

    return {"message": clean_content, "tool_calls": tool_calls}
```

</details>

## What You Learned

| Concept | How You Used It | Exam Relevance |
|---------|----------------|----------------|
| System messages for agents | Built a system prompt with instructions + tool list | Core agent design pattern |
| Simulated tool calling | Parsed `[TOOL: ...]` patterns from model output | Understanding the tool call flow |
| Native function calling | Discussed as the production alternative | Exam tests structured function definitions |
| Grounding with data | Conceptual connection to RAG and search | "When to use grounding" questions |
| Foundry Agent Service | Discussed as the Azure-managed agent platform | Exam tests service selection |

## Next Lab

Continue to **[Lab 07: Responsible AI](07-responsible-ai.md)** where you will implement Azure Content Safety to analyze text for harmful content and detect prompt injection attempts.

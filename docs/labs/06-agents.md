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

<!-- section:overview -->
## Overview

In this lab you implement tool-augmented chat for the Agent Workshop page. You will extend the existing `openai_service.py` (from Lab 01) with a new function, `chat_with_tools()`, that turns a basic GPT conversation into a simulated agent with system instructions and tool awareness.

Agentic AI is a growing portion of the AI-102 exam. The exam tests your understanding of how agents use instructions, tools, and grounding data to act autonomously. This lab covers the first two concepts directly and introduces the third conceptually.

**What you will implement:**

| Layer | What You Build | What It Teaches |
|-------|---------------|-----------------|
| 1 | System instructions for agent persona | How system messages shape agent behavior |
| 2 | Simulated tool call parsing | How agents invoke and report tool usage |
| 3 | (Conceptual) Grounding with knowledge sources | How real agents use data for accurate answers |

<!-- section:prerequisites -->
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

<!-- section:setup -->
## Azure Setup

- Verify Lab 01 Azure OpenAI resource is working
- No new Azure resources needed

No additional Azure setup is required. This lab reuses the Azure OpenAI resource you created in Lab 01.

<checkpoint id="setup-verify-openai"></checkpoint>

---

<!-- section:layer:1 -->
## Layer 1: System Instructions

- Build system message with instructions and tool list
- Call Chat Completions API with system message
- Return result as dict with "message" and "tool_calls" keys
- Test via frontend or Swagger UI

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

<checkpoint id="l1-system-msg"></checkpoint>

**Step 2: Call the Chat Completions API**

- Use `_get_client()` to get your existing Azure OpenAI client
- Call `client.chat.completions.create()` with the system message prepended to the user's messages
- Use `settings.AZURE_OPENAI_DEPLOYMENT` as the model
- Set `temperature=0.7` and `max_tokens=1000`

<checkpoint id="l1-api-call"></checkpoint>

**Step 3: Return the result**

For Layer 1, return a dict with `"message"` set to the response content and `"tool_calls"` set to an empty list (tool call parsing comes in Layer 2).

<checkpoint id="l1-return-dict"></checkpoint>

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

<checkpoint id="l1-test"></checkpoint>

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

<!-- section:layer:2 -->
## Layer 2: Simulated Tool Calls

- Add regex parsing for `[TOOL: ...]` patterns
- Build tool_calls list from parsed matches
- Clean tool patterns from display content
- Test with prompts that trigger tool usage

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

<checkpoint id="l2-regex"></checkpoint>

**Step 2: Build the tool calls list**

For each regex match, create a dict with keys `tool`, `input`, and `output`.

<checkpoint id="l2-tool-list"></checkpoint>

**Step 3: Clean the content**

Remove the tool call patterns from the response text so the `clean_content` return value contains only the conversational part. If removing patterns leaves an empty string, fall back to returning the full original content.

<checkpoint id="l2-clean"></checkpoint>

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

<checkpoint id="l2-test"></checkpoint>

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

<!-- section:layer:3 -->
## Layer 3: Grounding with Knowledge Sources

- Review grounding concepts (RAG, code interpreter, function calling)
- Understand Foundry Agent Service capabilities
- Answer self-check questions

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

<checkpoint id="l3-review"></checkpoint>

**Azure AI Foundry Agent Service**

In production, you would not build agents by hand-parsing tool call text. Microsoft provides the Foundry Agent Service (SDK: `azure-ai-projects`) which handles:

- Agent creation with instructions and tool definitions
- Automatic tool execution (the service calls your functions)
- Conversation threading with persistent state
- Built-in tools: code interpreter, file search, Bing search, Azure AI Search
- Function calling with structured JSON schemas

The pattern in this lab (system message + simulated tools) teaches the underlying concept. The Foundry Agent Service automates the infrastructure around it.

<checkpoint id="l3-foundry"></checkpoint>

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

<checkpoint id="l3-questions"></checkpoint>

### Exam Tips

- The exam heavily tests the difference between grounding, fine-tuning, and prompt engineering. Grounding = external data at inference time. Fine-tuning = modified model weights. Prompt engineering = crafting better instructions. Know when to use each.
- Know the built-in tools in Foundry Agent Service: **code interpreter** (runs Python in a sandbox), **file search** (searches uploaded files or Azure AI Search indexes), **Bing grounding** (web search for current information).
- The exam may ask about the `azure-ai-projects` SDK for creating agents. Key classes: `AIProjectClient`, `AgentThread`, `ThreadMessage`. You create an agent, create a thread, add messages, and run the agent on the thread.

---

## Checkpoint

After completing all three layers, verify everything works:

- **Agent chat works**: Go to `/agents`, configure an agent, send a message, get a response
- **System instructions shape behavior**: An agent with instructions "You are a pirate" should respond in pirate style
- **Tool calls are parsed**: When the agent uses tools, the response includes a `tool_calls` list with structured data
- **Clean content is separated**: The conversational response does not contain raw `[TOOL: ...]` markup
- **No errors in backend terminal**: The uvicorn output should show 200 status codes for `/api/agents/chat`

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

<!-- section:layer:4 -->
## Layer 4: Function Calling with Tool Definitions

- Replace Core L2's regex simulation with native function calling
- Define `tools` array with JSON Schema function definitions
- Implement `tool_choice` to control when functions are called
- Build the complete tool-call → execute → respond loop

### What You Will Learn

- How to define functions using JSON Schema for the Azure OpenAI `tools` parameter
- How `tool_choice` controls whether and which functions the model invokes
- How to implement the full tool-call loop: API call → parse tool_calls → execute → send result → get final response

These map to AI-102 exam objective: **"Define available functions and their parameters for an agent"** — specifically defining tool schemas, choosing invocation behavior, and implementing the execution loop.

### Concepts

In Layer 2, you simulated tool calls by parsing `[TOOL: ...]` text patterns from the model's output. This works for learning, but production agents use **native function calling** where the API returns structured `tool_calls` objects that you can parse reliably without regex.

**Defining Tools with JSON Schema**

The `tools` parameter accepts a list of function definitions. Each definition describes a function the model can call:

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city name, e.g. 'Helsinki'"
                    },
                    "units": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature units"
                    }
                },
                "required": ["city"]
            }
        }
    }
]
```

Key elements of a function definition:

| Field | Required | Purpose |
|-------|----------|---------|
| `type` | Yes | Always `"function"` |
| `function.name` | Yes | Identifier the model uses to invoke the function |
| `function.description` | Yes | Tells the model when and why to use this function |
| `function.parameters` | Yes | JSON Schema object describing accepted arguments |
| `parameters.properties` | Yes | Each argument with its type and description |
| `parameters.required` | No | List of mandatory argument names |

The `description` field is critical — the model uses it to decide when to call the function. Vague descriptions lead to unreliable tool selection.

<checkpoint id="l4-tool-schema"></checkpoint>

**Controlling Tool Invocation with `tool_choice`**

The `tool_choice` parameter controls when the model calls functions:

| Value | Behavior | Use Case |
|-------|----------|----------|
| `"auto"` | Model decides whether to call a function (default) | General-purpose agents |
| `"none"` | Model will never call functions | When you want text-only responses |
| `"required"` | Model must call at least one function | When every request needs an action |
| `{"type": "function", "function": {"name": "get_weather"}}` | Model must call this specific function | Forcing a particular tool |

```python
response = client.chat.completions.create(
    model=deployment,
    messages=messages,
    tools=tools,
    tool_choice="auto",  # or "none", "required", or a specific function
)
```

<checkpoint id="l4-tool-choice"></checkpoint>

**The Tool-Call Loop**

Native function calling uses a multi-turn loop. The model does not execute functions — it tells you which function to call and with what arguments. You execute the function and send the result back.

```
1. Send messages + tools to API
2. Model returns response with tool_calls
3. For each tool_call:
   a. Read tool_call.id, tool_call.function.name, tool_call.function.arguments
   b. Parse arguments (JSON string → dict)
   c. Execute your local function
   d. Append assistant message (with tool_calls) to messages
   e. Append tool result as {"role": "tool", "tool_call_id": ..., "content": result}
4. Send updated messages back to API
5. Model returns final text response incorporating tool results
```

The response object structure:

```python
choice = response.choices[0]
message = choice.message

if message.tool_calls:
    for tool_call in message.tool_calls:
        name = tool_call.function.name          # e.g. "get_weather"
        args = json.loads(tool_call.function.arguments)  # JSON string → dict
        call_id = tool_call.id                  # unique ID for this call
```

### Implementation

Open `backend/app/services/openai_service.py`. Add a new function `chat_with_native_tools()` below the existing `chat_with_tools()` function.

**Step 1: Define the tools array**

Create a list of tool definitions with JSON Schema. For testing, define two functions: `get_weather` (takes `city` and optional `units`) and `calculate` (takes `expression`).

**Step 2: Call the API with tools and tool_choice**

Pass the `tools` list and `tool_choice="auto"` to `client.chat.completions.create()`.

**Step 3: Implement the tool-call loop**

Check if `response.choices[0].message.tool_calls` is not empty. If the model wants to call functions:

1. Append the assistant's message (including its `tool_calls`) to the messages list
2. For each tool call, parse the arguments and simulate execution (return a placeholder result)
3. Append each result as a `{"role": "tool", "tool_call_id": ..., "content": ...}` message
4. Call the API again with the updated messages
5. Return the final response

<checkpoint id="l4-tool-loop"></checkpoint>

<details><summary>Hint</summary>

```python
import json

def chat_with_native_tools(
    messages: list[dict],
    system_instructions: str,
) -> dict:
    client = _get_client()
    deployment = settings.AZURE_OPENAI_DEPLOYMENT

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a city",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "City name"},
                        "units": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                    "required": [___],  # Which field is required?
                },
            },
        },
    ]

    system_msg = {"role": "system", "content": system_instructions}
    all_messages = [system_msg, *messages]

    response = client.chat.completions.create(
        model=deployment,
        messages=all_messages,
        tools=___,         # What list do you pass here?
        tool_choice="auto",
    )

    choice = response.choices[0].message

    if choice.tool_calls:
        # Append the assistant message WITH its tool_calls
        all_messages.append(choice)
        for tool_call in choice.tool_calls:
            name = tool_call.function.___
            args = json.loads(tool_call.function.___)
            # Simulate execution
            result = f"Simulated result for {name}({args})"
            all_messages.append({
                "role": "tool",
                "tool_call_id": tool_call.___,
                "content": result,
            })
        # Second API call for final response
        response = client.chat.completions.create(
            model=deployment, messages=all_messages, tools=tools
        )

    content = response.choices[0].message.content or ""
    return {"message": content, "tool_calls_made": bool(choice.tool_calls)}
```

Fill in the blanks to complete the function.

</details>

### Test It

This function is not wired to a route in the core lab, but you can test it directly in a Python shell:

```bash
cd backend && source venv/bin/activate
python -c "
from app.services.openai_service import chat_with_native_tools
result = chat_with_native_tools(
    messages=[{'role': 'user', 'content': 'What is the weather in Paris?'}],
    system_instructions='You are a helpful assistant.',
)
print(result)
"
```

If function calling works correctly, the response should indicate that `get_weather` was invoked and the final answer incorporates the simulated result.

<details><summary>Full Solution</summary>

```python
import json

def chat_with_native_tools(
    messages: list[dict],
    system_instructions: str,
) -> dict:
    client = _get_client()
    deployment = settings.AZURE_OPENAI_DEPLOYMENT

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a city",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "City name"},
                        "units": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "Temperature units",
                        },
                    },
                    "required": ["city"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "calculate",
                "description": "Evaluate a mathematical expression",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "Math expression to evaluate, e.g. '2 + 2'",
                        },
                    },
                    "required": ["expression"],
                },
            },
        },
    ]

    # Simulated function implementations
    def execute_tool(name: str, args: dict) -> str:
        if name == "get_weather":
            city = args.get("city", "Unknown")
            units = args.get("units", "celsius")
            return f"Weather in {city}: 18 degrees {units}, partly cloudy"
        elif name == "calculate":
            # WARNING: NEVER use eval() with untrusted input in production.
            # eval() can execute arbitrary code and is a critical security risk.
            # Here we use ast.literal_eval wrapped in a simple arithmetic
            # evaluator for safety. For production, use a dedicated math
            # parsing library (e.g., simpleeval, numexpr).
            import ast
            import operator

            try:
                expression = args.get("expression", "0")

                # Simple safe arithmetic evaluator
                allowed_operators = {
                    ast.Add: operator.add,
                    ast.Sub: operator.sub,
                    ast.Mult: operator.mul,
                    ast.Div: operator.truediv,
                    ast.Pow: operator.pow,
                    ast.USub: operator.neg,
                }

                def _safe_eval(node: ast.AST) -> float:
                    if isinstance(node, ast.Expression):
                        return _safe_eval(node.body)
                    elif isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                        return node.value
                    elif isinstance(node, ast.BinOp) and type(node.op) in allowed_operators:
                        return allowed_operators[type(node.op)](
                            _safe_eval(node.left), _safe_eval(node.right)
                        )
                    elif isinstance(node, ast.UnaryOp) and type(node.op) in allowed_operators:
                        return allowed_operators[type(node.op)](_safe_eval(node.operand))
                    else:
                        raise ValueError(f"Unsupported expression: {ast.dump(node)}")

                tree = ast.parse(expression, mode="eval")
                result = _safe_eval(tree)
                return str(result)
            except Exception:
                return "Error: could not evaluate expression"
        return f"Unknown function: {name}"

    system_msg = {"role": "system", "content": system_instructions}
    all_messages = [system_msg, *messages]

    response = client.chat.completions.create(
        model=deployment,
        messages=all_messages,
        tools=tools,
        tool_choice="auto",
        temperature=0.7,
        max_tokens=1000,
    )

    choice = response.choices[0].message
    tool_calls_made = []

    if choice.tool_calls:
        all_messages.append(choice)
        for tool_call in choice.tool_calls:
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            result = execute_tool(name, args)
            tool_calls_made.append({"tool": name, "input": args, "output": result})
            all_messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

        # Second call with tool results
        response = client.chat.completions.create(
            model=deployment,
            messages=all_messages,
            tools=tools,
            temperature=0.7,
            max_tokens=1000,
        )

    content = response.choices[0].message.content or ""
    return {"message": content, "tool_calls": tool_calls_made}
```

</details>

### Exam Tips

- The exam expects you to know the exact structure of a function definition: `type`, `function.name`, `function.description`, and `function.parameters` (JSON Schema). Memorize the nesting.
- Know all four `tool_choice` values and when to use each. `"auto"` is the default. `"required"` guarantees a function call. A specific function object forces one particular call.
- The tool-call loop is a common exam scenario: "What should the developer do after receiving `tool_calls` in the response?" The answer is always: execute the function locally, then send the result back as a `tool` role message with the matching `tool_call_id`.
- The model returns `function.arguments` as a **JSON string**, not a dict. You must parse it with `json.loads()`. This is a common exam distractor.

<!-- section:layer:5 -->
## Layer 5: Multi-Agent Patterns

- Extend a single agent to multi-agent architectures
- Understand router/supervisor, sequential handoff, and parallel patterns
- Learn agent handoff protocols and context passing
- Explore the Foundry Agent Service SDK for multi-agent orchestration

### What You Will Learn

- Three architectural patterns for multi-agent systems and when to choose each
- How agents pass context during handoffs (conversation history, extracted data, task status)
- How the Foundry Agent Service SDK (`azure-ai-projects`) supports multi-agent scenarios with threads and runs

This maps to AI-102 exam objective: **"Design and implement an agentic solution"** — specifically understanding multi-agent orchestration, agent delegation, and the Foundry Agent Service architecture.

### Concepts

Layers 1-4 focused on a single agent interacting with a user. In production, complex tasks often require multiple specialized agents working together. Each agent has its own instructions, tools, and domain expertise.

**Pattern 1: Router / Supervisor**

A "manager" agent receives every user request, analyzes it, and delegates to the appropriate specialist agent. The manager does not perform tasks itself — it routes and aggregates.

```
User → [Router Agent] → decides which specialist to call
                ├── [Code Agent]      → handles code questions
                ├── [Research Agent]  → handles search queries
                └── [Math Agent]      → handles calculations
```

| Aspect | Detail |
|--------|--------|
| When to use | Tasks span multiple domains; user intent is ambiguous |
| Pros | Clean separation of concerns; easy to add new specialists |
| Cons | Router adds latency; router must be accurate in classification |
| Exam keyword | "Supervisor agent", "routing agent", "orchestrator" |

```python
# Illustrative router pattern (pseudocode)
def route_request(user_message: str, agents: dict) -> str:
    # Step 1: Ask the router agent to classify the task
    classification = chat_completion(
        messages=[
            {"role": "system", "content": (
                "Classify the user's request into one of: "
                "code, research, math. Respond with only the category."
            )},
            {"role": "user", "content": user_message},
        ]
    )
    category = classification.strip().lower()

    # Step 2: Delegate to the specialist
    specialist = agents.get(category, agents["default"])
    return specialist.handle(user_message)
```

<checkpoint id="l5-routing"></checkpoint>

**Pattern 2: Sequential Handoff**

Agents process the request in a defined order, each adding to or transforming the context before passing it to the next agent.

```
User → [Intake Agent] → [Analysis Agent] → [Summary Agent] → Response
         extracts         processes           formats
         key facts        and reasons         final answer
```

| Aspect | Detail |
|--------|--------|
| When to use | Tasks have clear stages (extract → analyze → format) |
| Pros | Each agent is simple; pipeline is easy to debug |
| Cons | Strictly sequential; one slow agent blocks the whole chain |
| Exam keyword | "Agent chain", "sequential processing", "pipeline" |

**Agent Handoff Protocol**

When one agent hands off to another, it must pass context. A handoff payload typically includes:

| Field | Purpose | Example |
|-------|---------|---------|
| `conversation_history` | Full or summarized chat so far | List of messages |
| `extracted_data` | Structured data the agent produced | `{"city": "Helsinki", "date": "2026-02-23"}` |
| `task_status` | What has been done, what remains | `"weather_fetched, needs_summary"` |
| `instructions` | Specific guidance for the next agent | `"Summarize in 2 sentences"` |

```python
# Illustrative sequential handoff
def sequential_pipeline(user_message: str) -> str:
    # Agent 1: Extract key entities
    extraction = chat_completion(messages=[
        {"role": "system", "content": "Extract entities (people, places, dates) as JSON."},
        {"role": "user", "content": user_message},
    ])

    # Agent 2: Analyze using extracted data
    analysis = chat_completion(messages=[
        {"role": "system", "content": "Given these entities, provide a detailed analysis."},
        {"role": "user", "content": f"Entities: {extraction}\n\nOriginal: {user_message}"},
    ])

    # Agent 3: Summarize
    summary = chat_completion(messages=[
        {"role": "system", "content": "Summarize the analysis in 2 concise sentences."},
        {"role": "user", "content": analysis},
    ])
    return summary
```

<checkpoint id="l5-handoff"></checkpoint>

**Pattern 3: Parallel Execution**

Multiple agents work on the same request simultaneously. A merge step combines their outputs.

```
User → [Agent A] ──┐
     → [Agent B] ──┤── [Merge] → Response
     → [Agent C] ──┘
```

| Aspect | Detail |
|--------|--------|
| When to use | Independent subtasks that can run concurrently |
| Pros | Faster than sequential; each agent works independently |
| Cons | Merge logic can be complex; results may conflict |
| Exam keyword | "Parallel agents", "fan-out/fan-in" |

**Foundry Agent Service Multi-Agent Example**

The `azure-ai-projects` SDK provides the infrastructure for multi-agent systems. Key classes:

| Class / Method | Purpose |
|-------|---------|
| `AIProjectClient` | Entry point; connects to your Azure AI project |
| `client.agents.create_agent()` | Creates an agent with instructions, model, and tools |
| `client.agents.threads.create()` | Creates a conversation thread (persistent state) |
| `client.agents.messages.create()` | Adds a message to a thread |
| `client.agents.runs.create()` | Runs an agent on a thread (processes messages) |
| `client.agents.runs.create_and_process()` | Creates and polls a run to completion |
| `client.agents.messages.list()` | Lists messages in a thread |
| `client.agents.files.upload_and_poll()` | Uploads a file and waits for processing |
| `client.agents.vector_stores.create_and_poll()` | Creates a vector store and waits for indexing |
| `client.agents.runs.submit_tool_outputs()` | Submits function call results back to a run |
| `client.agents.runs.get()` | Gets the current status of a run |

```python
# Illustrative Foundry Agent Service multi-agent setup
from azure.ai.projects import AIProjectClient
from azure.ai.agents.models import BingGroundingTool
from azure.identity import DefaultAzureCredential

client = AIProjectClient(
    credential=DefaultAzureCredential(),
    endpoint="https://your-project.services.ai.azure.com",
)

# Create specialist agents
bing = BingGroundingTool(connection_id="<your-bing-connection-id>")
research_agent = client.agents.create_agent(
    model="gpt-4o",
    name="Research Agent",
    instructions="You are a research specialist. Find relevant information.",
    tools=bing.definitions,
)

summary_agent = client.agents.create_agent(
    model="gpt-4o",
    name="Summary Agent",
    instructions="You summarize research findings into concise bullet points.",
)

# Create a thread and run agents sequentially
thread = client.agents.threads.create()
client.agents.messages.create(thread_id=thread.id, role="user", content="Explain quantum computing")

# Run research agent first
run = client.agents.runs.create_and_process(thread_id=thread.id, agent_id=research_agent.id)

# Run summary agent on the same thread (sees research agent's output)
run = client.agents.runs.create_and_process(thread_id=thread.id, agent_id=summary_agent.id)

# Get the final messages
messages = client.agents.messages.list(thread_id=thread.id)
```

<checkpoint id="l5-foundry-agents"></checkpoint>

### Test It

No code to run for this layer. Answer these self-check questions:

1. A user asks an AI system to "analyze this sales CSV and then write a blog post about the trends." Which multi-agent pattern is most appropriate?
2. In the router pattern, what happens if the router agent misclassifies a request?
3. What is the minimum context an agent must pass during a handoff for the receiving agent to continue meaningfully?

<details><summary>Answers</summary>

1. **Sequential handoff** — the task has two clear stages (data analysis, then writing). A data agent processes the CSV first, then a writing agent uses the analysis to compose the blog post. Each stage depends on the previous one.

2. The request goes to the wrong specialist, which produces an irrelevant or incorrect response. This is why the router's system prompt must include clear classification criteria and examples. Some designs add a "confidence threshold" — if the router is uncertain, it asks the user for clarification instead of guessing.

3. At minimum: the **original user request** and **any data the previous agent produced**. Without the original request, the next agent lacks context. Without the extracted data, the next agent would have to redo the work. Task status is optional but useful for complex pipelines.

</details>

### Exam Tips

- The exam may describe a scenario and ask you to choose the correct multi-agent pattern. Look for keywords: "classify first" = router, "step by step" = sequential, "independent tasks" = parallel.
- Know the Foundry Agent Service lifecycle: create agent → create thread → add message → create run → poll/process run → read messages. Threads are persistent and can be shared between agents.
- The exam tests your understanding of when to use multi-agent vs. single agent. A single agent with multiple tools is simpler and preferred unless the task genuinely requires specialized personas or the combined tool set would be too large for one system prompt.

<!-- section:layer:6 -->
## Layer 6: Code Interpreter & File Search

- Understand the Assistants API (now part of Foundry Agent Service) vs. Chat Completions API
- Learn code interpreter capabilities, sandbox constraints, and output types
- Learn file search with automatic vector store creation
- Master the run lifecycle and its status transitions

### What You Will Learn

- How the Assistants API differs from the Chat Completions API in terms of state management and capabilities
- What the code interpreter tool can and cannot do inside its secure sandbox
- How file search provides built-in RAG with automatic chunking and embedding
- The complete run lifecycle: queued → in_progress → terminal states

This maps to AI-102 exam objective: **"Implement tool use for an agentic solution"** — specifically understanding built-in tools (code interpreter, file search) and the Assistants API lifecycle.

### Concepts

**Chat Completions vs. Assistants API**

Layers 1-4 used the Chat Completions API — a stateless, single-turn interface where you manage conversation history yourself. The Assistants API (now part of Foundry Agent Service) adds persistent state and built-in tool execution.

| Aspect | Chat Completions API | Assistants API / Agent Service |
|--------|---------------------|-------------------------------|
| State | Stateless — you send full history each call | Stateful — threads store conversation history |
| Tool execution | You execute functions locally | Service executes built-in tools automatically |
| Tools available | Function calling only | Code interpreter, file search, function calling |
| Context window | Limited by model's token limit | Automatic truncation of long threads |
| Cost model | Pay per token per call | Pay per token + tool execution time |
| Use case | Simple chat, quick integrations | Complex agents with file processing, data analysis |

The Assistants API is being unified into the Foundry Agent Service. The concepts (agents, threads, runs) are the same; the SDK is `azure-ai-projects`.

<checkpoint id="l6-assistants-api"></checkpoint>

**Code Interpreter**

The code interpreter tool runs Python in a secure, sandboxed environment. When an agent has code interpreter enabled, it can write and execute Python code to fulfill user requests.

What code interpreter **can** do:

| Capability | Example |
|-----------|---------|
| Data analysis | Load a CSV with pandas, compute statistics |
| Visualization | Generate charts with matplotlib, return as image files |
| File processing | Read uploaded XLSX, PDF, or text files |
| Math and computation | Complex calculations, symbolic math with sympy |
| Data transformation | Convert between formats (CSV → JSON, etc.) |
| File generation | Create new files (CSVs, images) as downloadable output |

What code interpreter **cannot** do:

| Limitation | Reason |
|-----------|--------|
| No network access | Sandbox is isolated — cannot call APIs or download files |
| No pip install | Only pre-installed packages are available |
| No persistent storage | Each session starts fresh; files do not persist between runs |
| Session timeout | Long-running computations are terminated (typically 60s) |
| No GPU access | CPU only — not suitable for model training or inference |

The output of code interpreter can be:

1. **Text** — printed output, computation results
2. **Files** — generated images (charts), CSVs, or other documents

```python
# Illustrative: creating an agent with code interpreter
from azure.ai.agents.models import CodeInterpreterTool, FilePurpose

# Upload a file for the agent to process
file = client.agents.files.upload_and_poll(
    file_path="sales_data.csv",
    purpose=FilePurpose.AGENTS,
)

# Create the code interpreter tool with the uploaded file
code_interpreter = CodeInterpreterTool(file_ids=[file.id])

agent = client.agents.create_agent(
    model="gpt-4o",
    name="Data Analyst",
    instructions="Analyze uploaded data files. Create charts when helpful.",
    tools=code_interpreter.definitions,
    tool_resources=code_interpreter.resources,
)

# Create thread with the file attachment
thread = client.agents.threads.create()
client.agents.messages.create(
    thread_id=thread.id,
    role="user",
    content="Analyze the sales trends and create a bar chart.",
    attachments=[{"file_id": file.id, "tools": [{"type": "code_interpreter"}]}],
)
```

<checkpoint id="l6-code-interpreter"></checkpoint>

**File Search**

The file search tool provides built-in RAG (retrieval-augmented generation) without requiring you to set up Azure AI Search separately. It automatically chunks documents, generates embeddings, and stores them in a vector store.

How file search works:

1. **Upload files** — PDF, DOCX, TXT, JSON, MD, and other text-based formats
2. **Create a vector store** — the service automatically chunks the content and generates embeddings
3. **Attach to agent** — the agent can query the vector store when answering questions
4. **Automatic retrieval** — when the user asks a question, the agent searches the vector store and uses matching chunks as context

```python
# Illustrative: creating a vector store and attaching to an agent
from azure.ai.agents.models import FileSearchTool

vector_store = client.agents.vector_stores.create_and_poll(
    name="Product Documentation",
    file_ids=[file1.id, file2.id, file3.id],
)
# create_and_poll waits for chunking + embedding to complete automatically

# Create the file search tool with the vector store
file_search = FileSearchTool(vector_store_ids=[vector_store.id])

agent = client.agents.create_agent(
    model="gpt-4o",
    name="Product Expert",
    instructions="Answer questions about our products using the documentation.",
    tools=file_search.definitions,
    tool_resources=file_search.resources,
)
```

File search vs. Azure AI Search:

| Aspect | File Search (built-in) | Azure AI Search |
|--------|----------------------|-----------------|
| Setup | Automatic — upload files and go | Manual — create index, configure analyzers |
| Customization | Limited — default chunking and embeddings | Full control — custom analyzers, scoring, filters |
| Scale | Small to medium document sets | Enterprise-scale with billions of documents |
| Metadata filtering | Basic | Advanced — facets, filters, geospatial |
| Use case | Quick prototyping, small knowledge bases | Production RAG with complex requirements |

<checkpoint id="l6-file-search"></checkpoint>

**Run Lifecycle**

When you run an agent on a thread, the run transitions through several states:

```
queued → in_progress → completed
                     → failed
                     → requires_action → (submit outputs) → in_progress
                     → cancelling → cancelled
                     → incomplete
                     → expired
```

| Status | Meaning | What You Do |
|--------|---------|-------------|
| `queued` | Waiting for processing capacity | Wait |
| `in_progress` | Agent is processing (reading messages, calling tools) | Wait / poll |
| `completed` | Agent finished successfully | Read the response messages |
| `failed` | An error occurred | Check `run.last_error` for details |
| `requires_action` | Agent wants to call a function you defined | Execute the function and submit the result |
| `cancelling` | Cancel request received, transitioning to cancelled | Wait |
| `cancelled` | Run was cancelled by the user | No action needed |
| `incomplete` | Run ended because token limits (`max_prompt_tokens` or `max_completion_tokens`) were exceeded | Adjust token limits and retry |
| `expired` | Run timed out waiting for action | Resubmit if needed |

The `requires_action` status is critical for function calling. When an agent has custom functions (not built-in tools), it pauses and asks you to execute the function:

```python
# Illustrative: handling requires_action
run = client.agents.runs.create(thread_id=thread.id, agent_id=agent.id)

# Poll until terminal state
while run.status in ("queued", "in_progress", "requires_action"):
    if run.status == "requires_action":
        tool_calls = run.required_action.submit_tool_outputs.tool_calls
        tool_outputs = []
        for tc in tool_calls:
            result = execute_my_function(tc.function.name, tc.function.arguments)
            tool_outputs.append({"tool_call_id": tc.id, "output": result})

        run = client.agents.runs.submit_tool_outputs(
            thread_id=thread.id, run_id=run.id, tool_outputs=tool_outputs,
        )
    else:
        import time
        time.sleep(1)
        run = client.agents.runs.get(thread_id=thread.id, run_id=run.id)
```

### Test It

No code to run for this layer. Answer these self-check questions:

1. A user uploads a 50-page PDF and asks an agent to "summarize the key findings." Which built-in tool should the agent use: code interpreter or file search?
2. An agent with code interpreter is asked to "fetch the latest stock price for MSFT from the web." Can it do this? Why or why not?
3. During a run, the status changes to `requires_action`. What does this mean and what must you do?
4. You need to build a production RAG system that searches across 10 million documents with custom relevance scoring. Would you use file search or Azure AI Search?

<details><summary>Answers</summary>

1. **File search** — for summarization of document content, file search retrieves the most relevant chunks from the PDF and provides them as context. Code interpreter could also read the file, but file search is purpose-built for document Q&A and handles large documents better through chunking.

2. **No** — code interpreter has no network access. The sandbox is completely isolated. The agent would need a separate tool (like Bing grounding or a custom function) to fetch real-time data from the web. Code interpreter can only process data that has been explicitly uploaded to it.

3. The agent wants to call a **custom function** (one you defined, not a built-in tool). You must: (a) read the `tool_calls` from `run.required_action.submit_tool_outputs.tool_calls`, (b) execute each function locally, (c) submit the results back with `client.agents.runs.submit_tool_outputs()`. If you do not respond before the timeout, the run status changes to `expired`.

4. **Azure AI Search** — file search is designed for small to medium document sets with automatic setup. For 10 million documents with custom relevance scoring, you need the full capabilities of Azure AI Search: custom analyzers, scoring profiles, semantic ranking, and enterprise-scale indexing. File search does not offer this level of customization.

</details>

<checkpoint id="l6-questions"></checkpoint>

### Exam Tips

- The exam frequently asks you to choose between code interpreter and file search. Rule of thumb: **code interpreter** for computation and file generation, **file search** for document Q&A and knowledge retrieval.
- Know the run lifecycle states, especially `requires_action`. The exam may present a scenario where a run is stuck and ask you to diagnose it — the answer is often that function call results were not submitted.
- Understand that code interpreter runs Python in a **sandboxed** environment with no internet. This is a common exam distractor: "An agent needs to call an external API — can it use code interpreter?" The answer is no.
- The Assistants API uses **threads** for persistent conversation state. Unlike Chat Completions where you resend the full history, threads store messages server-side. This is a key architectural difference the exam tests.
- File search creates vector stores automatically. Know that it handles chunking and embedding without manual configuration — this distinguishes it from building a custom RAG pipeline with Azure AI Search.

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** You are designing an AI agent that needs to answer questions about your company's internal documents. Which grounding method should you use?

A) Fine-tune the model on the documents
B) Use RAG with Azure AI Search
C) Increase the model's temperature
D) Use a larger model with a bigger context window

<details><summary>Answer</summary>

**B) Use RAG with Azure AI Search** — RAG is the correct approach for grounding agents in dynamic, frequently-changing documents. Fine-tuning changes the model's weights and is better for teaching style or domain knowledge, not for referencing specific documents. A larger context window doesn't help if you don't have a retrieval mechanism.

</details>

**Q2.** What is the difference between the `system` and `user` roles in Azure OpenAI chat messages?

A) System messages are visible to the user; user messages are not
B) System messages set agent behavior and instructions; user messages are the conversation input
C) System messages are optional; user messages are required
D) Both B and C

<details><summary>Answer</summary>

**D) Both B and C** — System messages define the agent's persona, behavior boundaries, and instructions. User messages contain the actual conversation. System messages are optional (the API works without them), but they are essential for agent behavior control.

</details>

**Q3.** In Azure AI Foundry Agent Service, which built-in tool would you use to let an agent run Python code to analyze uploaded data files?

A) File search
B) Bing grounding
C) Code interpreter
D) Function calling

<details><summary>Answer</summary>

**C) Code interpreter** — The code interpreter tool runs Python in a secure sandbox, allowing the agent to analyze data, generate charts, and process files. File search is for searching uploaded documents. Bing grounding is for web search. Function calling invokes your custom functions.

</details>

**Q4.** A developer is using Azure OpenAI native function calling. The API returns a response with `tool_calls` containing `function.name` and `function.arguments`. What should the developer do next?

A) Send the function arguments directly to the user
B) Execute the function locally and send the result back in a `tool` role message
C) Call the Azure OpenAI API again with the same messages
D) Parse the function name from the response text using regex

<details><summary>Answer</summary>

**B) Execute the function locally and send the result back** — In the native function calling flow: (1) the model returns tool_calls, (2) you execute the function, (3) you send the result back as a `tool` role message, (4) the model uses the result to generate a final response. Option D describes simulated tool calling (like this lab), not native function calling.

</details>

<!-- section:summary -->
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

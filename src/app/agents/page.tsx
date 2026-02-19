"use client"

import { useState, useRef, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { api, ApiError } from "@/lib/api"
import {
  Bot,
  Plus,
  Send,
  Loader2,
  Trash2,
  Settings2,
  MessageSquare,
  GitBranch,
  Wrench,
  ChevronRight,
} from "lucide-react"

interface AgentConfig {
  id: string
  name: string
  instructions: string
  tools: string[]
  knowledgeSources: string[]
}

interface AgentMessage {
  role: "user" | "assistant"
  content: string
  toolCalls?: { tool: string; input: string; output: string }[]
}

const availableTools = [
  "web_search",
  "code_interpreter",
  "file_reader",
  "calculator",
  "knowledge_retrieval",
  "api_caller",
]

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<"config" | "chat" | "workflow">("config")
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem("ai102-agents")
    return saved ? JSON.parse(saved) : []
  })
  const [currentAgent, setCurrentAgent] = useState<AgentConfig | null>(null)
  const [editingAgent, setEditingAgent] = useState<AgentConfig>({
    id: "",
    name: "",
    instructions: "",
    tools: [],
    knowledgeSources: [],
  })
  const [chatMessages, setChatMessages] = useState<AgentMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  function saveAgents(list: AgentConfig[]) {
    setAgents(list)
    localStorage.setItem("ai102-agents", JSON.stringify(list))
  }

  function createNewAgent() {
    setEditingAgent({
      id: Date.now().toString(),
      name: "",
      instructions: "",
      tools: [],
      knowledgeSources: [],
    })
    setActiveTab("config")
  }

  function saveAgent() {
    if (!editingAgent.name.trim()) return
    const exists = agents.find((a) => a.id === editingAgent.id)
    const updated = exists
      ? agents.map((a) => (a.id === editingAgent.id ? editingAgent : a))
      : [...agents, editingAgent]
    saveAgents(updated)
    setCurrentAgent(editingAgent)
  }

  function deleteAgent(id: string) {
    saveAgents(agents.filter((a) => a.id !== id))
    if (currentAgent?.id === id) setCurrentAgent(null)
  }

  function selectAgent(agent: AgentConfig) {
    setCurrentAgent(agent)
    setEditingAgent(agent)
    setChatMessages([])
  }

  function toggleTool(tool: string) {
    setEditingAgent((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }))
  }

  async function sendMessage() {
    if (!chatInput.trim() || loading || !currentAgent) return
    const userMsg: AgentMessage = { role: "user", content: chatInput.trim() }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setLoading(true)
    setError(null)

    try {
      const res = await api.post<{
        message: string
        tool_calls?: { tool: string; input: string; output: string }[]
      }>("/api/agents/chat", {
        agent_id: currentAgent.id,
        messages: [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        agent_config: currentAgent,
      })
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.message, toolCalls: res.tool_calls },
      ])
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to connect to backend"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const workflowSteps = chatMessages.flatMap((msg, i) => {
    const steps: { type: string; label: string; detail: string }[] = []
    if (msg.role === "user") {
      steps.push({ type: "input", label: `User Input #${Math.ceil((i + 1) / 2)}`, detail: msg.content.slice(0, 80) })
    }
    if (msg.toolCalls) {
      for (const tc of msg.toolCalls) {
        steps.push({ type: "tool", label: tc.tool, detail: tc.output.slice(0, 80) })
      }
    }
    if (msg.role === "assistant") {
      steps.push({ type: "output", label: "Agent Response", detail: msg.content.slice(0, 80) })
    }
    return steps
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agent Workshop"
        description="Build, configure, and test AI agents with tools and knowledge sources"
        domain="Agentic Solutions"
        weight="5-10%"
      />

      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === "config" ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("config")}
        >
          <Settings2 className="size-3.5" /> Configure
        </Button>
        <Button
          variant={activeTab === "chat" ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="size-3.5" /> Test Chat
        </Button>
        <Button
          variant={activeTab === "workflow" ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("workflow")}
        >
          <GitBranch className="size-3.5" /> Workflow
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Agent list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Agents</CardTitle>
              <Button variant="ghost" size="icon-xs" onClick={createNewAgent}>
                <Plus className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {agents.length === 0 && (
                <p className="text-xs text-muted-foreground">No agents created yet</p>
              )}
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors ${
                    currentAgent?.id === agent.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-foreground"
                  }`}
                  onClick={() => selectAgent(agent)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && selectAgent(agent)}
                >
                  <Bot className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{agent.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {agent.tools.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAgent(agent.id)
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main area */}
        <div>
          {activeTab === "config" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Agent Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Define the agent's behavior, available tools, and knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">Agent Name</span>
                  <input
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                    placeholder="My Custom Agent"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">System Instructions</span>
                  <textarea
                    value={editingAgent.instructions}
                    onChange={(e) => setEditingAgent({ ...editingAgent, instructions: e.target.value })}
                    placeholder="You are a helpful AI agent that..."
                    rows={5}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">Available Tools</span>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTools.map((tool) => (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                          editingAgent.tools.includes(tool)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <Wrench className="size-3" />
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={saveAgent} disabled={!editingAgent.name.trim()} className="self-start">
                  Save Agent
                </Button>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </CardContent>
            </Card>
          )}

          {activeTab === "chat" && (
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                {!currentAgent ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Select or create an agent to start testing
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Bot className="size-3.5" />
                      Testing: <span className="font-medium text-foreground">{currentAgent.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {currentAgent.tools.length} tools
                      </Badge>
                    </div>
                    <div
                      className="flex flex-col gap-3 overflow-y-auto rounded-md border border-border bg-background p-4"
                      style={{ minHeight: 350, maxHeight: "55vh" }}
                    >
                      {chatMessages.length === 0 && (
                        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                          Start chatting with your agent
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i}>
                          <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                            </div>
                          </div>
                          {msg.toolCalls && msg.toolCalls.length > 0 && (
                            <div className="ml-4 mt-1 flex flex-col gap-1">
                              {msg.toolCalls.map((tc, j) => (
                                <div key={j} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <Wrench className="size-3" />
                                  <span className="font-mono">{tc.tool}</span>
                                  <ChevronRight className="size-2.5" />
                                  <span className="truncate">{tc.output}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" /> Agent processing...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Send a message to your agent..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button onClick={sendMessage} disabled={loading || !chatInput.trim()}>
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "workflow" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Workflow Visualizer</CardTitle>
                <CardDescription className="text-xs">
                  Visual timeline of agent reasoning, tool calls, and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflowSteps.length === 0 ? (
                  <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    Chat with an agent to see the workflow
                  </div>
                ) : (
                  <div className="flex flex-col gap-0">
                    {workflowSteps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`size-3 rounded-full ${
                              step.type === "input"
                                ? "bg-primary"
                                : step.type === "tool"
                                  ? "bg-chart-3"
                                  : "bg-chart-2"
                            }`}
                          />
                          {i < workflowSteps.length - 1 && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{step.label}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {step.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{step.detail}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

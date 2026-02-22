"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { LabChecklist } from "@/components/lab-checklist"
import { LabGuideDrawer } from "@/components/lab-guide-drawer"
import { api, ApiError } from "@/lib/api"
import {
  Send,
  Image as ImageIcon,
  Settings2,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  MessageSquare,
  X,
} from "lucide-react"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface PromptTemplate {
  id: string
  name: string
  content: string
}

const defaultTemplates: PromptTemplate[] = [
  { id: "explain", name: "Explain Concept", content: "Explain the following concept in simple terms:" },
  { id: "compare", name: "Compare & Contrast", content: "Compare and contrast the following two items:" },
  { id: "code", name: "Code Generation", content: "Write code for the following task:" },
  { id: "study", name: "Study Quiz", content: "Create 5 quiz questions about the following topic:" },
]

export default function GenerativePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "image">("chat")
  const [showParams, setShowParams] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Parameters
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(1)
  const [maxTokens, setMaxTokens] = useState(800)
  const [freqPenalty, setFreqPenalty] = useState(0)
  const [presPenalty, setPresPenalty] = useState(0)
  const [selectedModel, setSelectedModel] = useState("gpt-4o")

  // Templates
  const [templates, setTemplates] = useState<PromptTemplate[]>(() => {
    if (typeof window === "undefined") return defaultTemplates
    try {
      const saved = localStorage.getItem("ai102-prompt-templates")
      return saved ? JSON.parse(saved) : defaultTemplates
    } catch {
      return defaultTemplates
    }
  })
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  // Image generation
  const [imagePrompt, setImagePrompt] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const saveTemplates = useCallback((t: PromptTemplate[]) => {
    setTemplates(t)
    localStorage.setItem("ai102-prompt-templates", JSON.stringify(t))
  }, [])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const res = await api.post<{ message: string }>("/api/generative/chat", {
        messages: newMessages,
        model: selectedModel,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        frequency_penalty: freqPenalty,
        presence_penalty: presPenalty,
      })
      setMessages([...newMessages, { role: "assistant", content: res.message }])
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to connect to backend"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function generateImage() {
    if (!imagePrompt.trim() || imageLoading) return
    setImageLoading(true)
    setError(null)
    try {
      const res = await api.post<{ url: string }>("/api/generative/image", {
        prompt: imagePrompt.trim(),
      })
      setImageUrl(res.url)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to generate image"
      setError(msg)
    } finally {
      setImageLoading(false)
    }
  }

  function loadTemplate(t: PromptTemplate) {
    setInput(t.content + "\n")
    setShowTemplates(false)
  }

  function deleteTemplate(id: string) {
    saveTemplates(templates.filter((t) => t.id !== id))
  }

  function saveEditedTemplate() {
    if (!editingTemplate) return
    const exists = templates.find((t) => t.id === editingTemplate.id)
    if (exists) {
      saveTemplates(templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)))
    } else {
      saveTemplates([...templates, editingTemplate])
    }
    setEditingTemplate(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="GenAI Lab"
        description="Chat with AI models, prompt engineering, and image generation"
        domain="Generative AI"
        weight="15-20%"
      />

      <LabChecklist labId="generative" />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === "chat" ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="size-3.5" /> Chat
        </Button>
        <Button
          variant={activeTab === "image" ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("image")}
        >
          <ImageIcon className="size-3.5" /> Image Generation
        </Button>
        <div className="flex-1" />
        <LabGuideDrawer labId="generative" />
        {activeTab === "chat" && (
          <>
            <Button
              variant={showTemplates ? "outline" : "ghost"}
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              Prompts
            </Button>
            <Button
              variant={showParams ? "outline" : "ghost"}
              size="sm"
              onClick={() => setShowParams(!showParams)}
            >
              <Settings2 className="size-3.5" /> Parameters
            </Button>
          </>
        )}
      </div>

      {activeTab === "chat" ? (
        <div className="flex gap-4">
          {/* Chat area */}
          <div className="flex flex-1 flex-col">
            <Card className="flex flex-1 flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 pt-6">
                {/* Messages */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-4" style={{ minHeight: 400, maxHeight: "60vh" }}>
                  {messages.length === 0 && (
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                      Start a conversation with the AI model
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
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
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={sendMessage} disabled={loading || !input.trim()} size="default">
                    <Send className="size-4" />
                  </Button>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Side panels */}
          <div className="flex flex-col gap-4" style={{ width: showParams || showTemplates ? 280 : 0, overflow: "hidden", transition: "width 0.2s" }}>
            {/* Parameter panel */}
            {showParams && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Model Parameters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Model selector */}
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Model</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-35-turbo">GPT-3.5 Turbo</option>
                    </select>
                  </label>
                  <ParamSlider label="Temperature" value={temperature} onChange={setTemperature} min={0} max={2} step={0.1} />
                  <ParamSlider label="Top P" value={topP} onChange={setTopP} min={0} max={1} step={0.05} />
                  <ParamSlider label="Max Tokens" value={maxTokens} onChange={setMaxTokens} min={50} max={4000} step={50} />
                  <ParamSlider label="Frequency Penalty" value={freqPenalty} onChange={setFreqPenalty} min={0} max={2} step={0.1} />
                  <ParamSlider label="Presence Penalty" value={presPenalty} onChange={setPresPenalty} min={0} max={2} step={0.1} />
                </CardContent>
              </Card>
            )}

            {/* Templates */}
            {showTemplates && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Prompt Templates</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setEditingTemplate({
                          id: Date.now().toString(),
                          name: "",
                          content: "",
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1.5">
                  {editingTemplate && (
                    <div className="mb-2 flex flex-col gap-2 rounded-md border border-border p-2">
                      <input
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        placeholder="Template name"
                        className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground"
                      />
                      <textarea
                        value={editingTemplate.content}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                        placeholder="Template content"
                        rows={3}
                        className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground"
                      />
                      <div className="flex gap-1">
                        <Button size="xs" onClick={saveEditedTemplate}>Save</Button>
                        <Button size="xs" variant="ghost" onClick={() => setEditingTemplate(null)}>
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <button onClick={() => loadTemplate(t)} className="flex-1 text-left truncate text-foreground">
                        {t.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => setEditingTemplate(t)}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => deleteTemplate(t.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Image generation */
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex gap-2">
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={3}
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={generateImage} disabled={imageLoading || !imagePrompt.trim()} className="self-end">
                {imageLoading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                Generate
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {imageUrl && (
              <div className="rounded-lg border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Generated image" className="w-full" />
              </div>
            )}
            {!imageUrl && !imageLoading && (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Generated image will appear here
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ParamSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Badge variant="secondary" className="font-mono text-[10px]">
          {value}
        </Badge>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  )
}

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
import { StatusIndicator } from "@/components/status-indicator"
import { api, ApiError } from "@/lib/api"
import {
  Upload,
  FileText,
  MessageSquare,
  Search,
  Database,
  Send,
  Loader2,
  X,
  Trash2,
} from "lucide-react"

interface Document {
  id: string
  name: string
  status: "uploading" | "indexing" | "ready" | "error"
  size?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

interface SearchResult {
  content: string
  source: string
  score: number
}

export default function RagPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "chat" | "search" | "index">("upload")
  const [documents, setDocuments] = useState<Document[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const doc: Document = {
        id: Date.now().toString() + file.name,
        name: file.name,
        status: "uploading",
        size: formatBytes(file.size),
      }
      setDocuments((prev) => [...prev, doc])

      try {
        const formData = new FormData()
        formData.append("file", file)
        await api.postForm("/api/search/upload", formData)
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "ready" as const } : d))
        )
      } catch {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "error" as const } : d))
        )
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || loading) return
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setLoading(true)
    setError(null)

    try {
      const res = await api.post<{ message: string; sources?: string[] }>("/api/generative/chat", {
        messages: [...chatMessages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        use_rag: true,
      })
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.message, sources: res.sources },
      ])
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to connect to backend"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function runSearch() {
    if (!searchQuery.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ results: SearchResult[] }>("/api/search/query", {
        query: searchQuery.trim(),
      })
      setSearchResults(res.results || [])
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to search"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function removeDoc(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const tabs = [
    { id: "upload" as const, label: "Documents", icon: Upload },
    { id: "chat" as const, label: "RAG Chat", icon: MessageSquare },
    { id: "search" as const, label: "Search", icon: Search },
    { id: "index" as const, label: "Index Viewer", icon: Database },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="RAG Engine"
        description="Upload documents, search them, and ask questions grounded in your data"
        domain="GenAI + Knowledge"
        weight="15-20%"
      />

      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-3.5" /> {tab.label}
            </Button>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="icon-xs" onClick={() => setError(null)}>
            <X className="size-3" />
          </Button>
        </div>
      )}

      {/* Document Upload */}
      {activeTab === "upload" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload documents"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-foreground font-medium">Upload Documents</p>
                <p className="text-xs text-muted-foreground">
                  PDF, TXT, or MD files. Click or drag to upload.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Uploaded Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm text-foreground">{doc.name}</span>
                      {doc.size && (
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                      )}
                      <StatusIndicator
                        status={
                          doc.status === "ready"
                            ? "completed"
                            : doc.status === "error"
                              ? "error"
                              : "in-progress"
                        }
                      />
                      <Button variant="ghost" size="icon-xs" onClick={() => removeDoc(doc.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* RAG Chat */}
      {activeTab === "chat" && (
        <Card className="flex flex-col">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div
              className="flex flex-col gap-3 overflow-y-auto rounded-md border border-border bg-background p-4"
              style={{ minHeight: 400, maxHeight: "60vh" }}
            >
              {chatMessages.length === 0 && (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  Ask questions about your uploaded documents
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {msg.sources.map((s, j) => (
                          <Badge key={j} variant="secondary" className="text-[11px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" /> Searching documents...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="Ask a question about your documents..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={sendChatMessage} disabled={loading || !chatInput.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {activeTab === "search" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Search your indexed documents..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={runSearch} disabled={loading || !searchQuery.trim()}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              {searchResults.map((result, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{result.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Source: {result.source}
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono text-[11px] shrink-0">
                        {(result.score * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Index Viewer */}
      {activeTab === "index" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Search Index</CardTitle>
            <CardDescription className="text-xs">
              Overview of indexed document collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-border p-4 text-center">
                <p className="text-2xl font-mono font-semibold text-foreground">
                  {documents.filter((d) => d.status === "ready").length}
                </p>
                <p className="text-xs text-muted-foreground">Documents Indexed</p>
              </div>
              <div className="rounded-md border border-border p-4 text-center">
                <p className="text-2xl font-mono font-semibold text-foreground">--</p>
                <p className="text-xs text-muted-foreground">Total Chunks</p>
              </div>
              <div className="rounded-md border border-border p-4 text-center">
                <p className="text-2xl font-mono font-semibold text-foreground">--</p>
                <p className="text-xs text-muted-foreground">Index Size</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Connect the backend to view live index statistics. The index viewer will show field
              definitions, document counts, and schema details when the backend is running.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

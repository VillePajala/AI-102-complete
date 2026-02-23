"use client"

import { useState, useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { LabChecklist } from "@/components/lab-checklist"
import { LabGuideDrawer } from "@/components/lab-guide-drawer"
import { api, ApiError } from "@/lib/api"
import {
  Shield,
  AlertTriangle,
  Image as ImageIcon,
  ShieldAlert,
  List,
  CheckSquare,
  Loader2,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Circle,
} from "lucide-react"

interface SafetyResult {
  categories: { name: string; severity: number; label: string }[]
}

const governanceChecklist = [
  { id: "fairness", principle: "Fairness", description: "AI systems should treat all people fairly" },
  { id: "reliability", principle: "Reliability & Safety", description: "AI systems should perform reliably and safely" },
  { id: "privacy", principle: "Privacy & Security", description: "AI systems should be secure and respect privacy" },
  { id: "inclusiveness", principle: "Inclusiveness", description: "AI systems should empower everyone and engage people" },
  { id: "transparency", principle: "Transparency", description: "AI systems should be understandable" },
  { id: "accountability", principle: "Accountability", description: "People should be accountable for AI systems" },
]

export default function ResponsibleAiPage() {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "prompt" | "blocklist" | "governance">("text")
  const [textInput, setTextInput] = useState("")
  const [textResult, setTextResult] = useState<SafetyResult | null>(null)
  const [promptInput, setPromptInput] = useState("")
  const [promptResult, setPromptResult] = useState<{ flagged: boolean; reason?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Blocklists
  const [blocklists, setBlocklists] = useState<{ name: string; terms: string[] }[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("ai102-blocklists")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [newListName, setNewListName] = useState("")
  const [newTerm, setNewTerm] = useState("")
  const [activeListIndex, setActiveListIndex] = useState<number | null>(null)

  // Governance
  const [checkedGovernance, setCheckedGovernance] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {}
    try {
      const saved = localStorage.getItem("ai102-governance")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [governanceNotes, setGovernanceNotes] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {}
    try {
      const saved = localStorage.getItem("ai102-governance-notes")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  function saveBlocklists(lists: typeof blocklists) {
    setBlocklists(lists)
    localStorage.setItem("ai102-blocklists", JSON.stringify(lists))
  }

  function toggleGovernance(id: string) {
    const updated = { ...checkedGovernance, [id]: !checkedGovernance[id] }
    setCheckedGovernance(updated)
    localStorage.setItem("ai102-governance", JSON.stringify(updated))
  }

  function saveGovernanceNote(id: string, note: string) {
    const updated = { ...governanceNotes, [id]: note }
    setGovernanceNotes(updated)
    localStorage.setItem("ai102-governance-notes", JSON.stringify(updated))
  }

  async function analyzeText() {
    if (!textInput.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<SafetyResult>("/api/safety/analyze-text", {
        text: textInput.trim(),
      })
      setTextResult(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to analyze")
    } finally {
      setLoading(false)
    }
  }

  async function checkPrompt() {
    if (!promptInput.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ flagged: boolean; reason?: string }>("/api/safety/check-prompt", {
        prompt: promptInput.trim(),
      })
      setPromptResult(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to check prompt")
    } finally {
      setLoading(false)
    }
  }

  function addBlocklist() {
    if (!newListName.trim()) return
    saveBlocklists([...blocklists, { name: newListName.trim(), terms: [] }])
    setNewListName("")
    setActiveListIndex(blocklists.length)
  }

  function addTerm() {
    if (!newTerm.trim() || activeListIndex === null) return
    const updated = blocklists.map((list, i) =>
      i === activeListIndex ? { ...list, terms: [...list.terms, newTerm.trim()] } : list
    )
    saveBlocklists(updated)
    setNewTerm("")
  }

  function removeTerm(listIdx: number, termIdx: number) {
    const updated = blocklists.map((list, i) =>
      i === listIdx ? { ...list, terms: list.terms.filter((_, j) => j !== termIdx) } : list
    )
    saveBlocklists(updated)
  }

  function deleteBlocklist(idx: number) {
    saveBlocklists(blocklists.filter((_, i) => i !== idx))
    if (activeListIndex === idx) setActiveListIndex(null)
    else if (activeListIndex !== null && activeListIndex > idx) setActiveListIndex(activeListIndex - 1)
  }

  const severityColor = (level: number) =>
    level <= 1 ? "bg-chart-2" : level <= 3 ? "bg-chart-3" : level <= 5 ? "bg-destructive/80" : "bg-destructive"

  const tabs = [
    { id: "text" as const, label: "Text Safety", icon: Shield },
    { id: "image" as const, label: "Image Safety", icon: ImageIcon },
    { id: "prompt" as const, label: "Prompt Shield", icon: ShieldAlert },
    { id: "blocklist" as const, label: "Blocklists", icon: List },
    { id: "governance" as const, label: "Governance", icon: CheckSquare },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Responsible AI"
        description="Content moderation, safety filters, prompt shields, and governance"
        domain="Cross-cutting"
        weight="cross-cutting"
      />

      <LabChecklist labId="responsible-ai" />

      <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex-1" />
        <LabGuideDrawer labId="responsible-ai" />
      </div>

      {/* Text Safety */}
      {activeTab === "text" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Content Safety Tester</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to check against content safety filters..."
                rows={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={analyzeText} disabled={!textInput.trim() || loading} className="self-start">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                Analyze
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Safety Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!textResult ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  Analyze text to see safety results
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {textResult.categories.map((cat, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{cat.name}</span>
                        <Badge
                          variant={cat.severity > 3 ? "destructive" : "secondary"}
                          className="text-[11px]"
                        >
                          {cat.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${severityColor(cat.severity)}`}
                            style={{ width: `${(cat.severity / 7) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground w-4">
                          {cat.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Safety */}
      {activeTab === "image" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Image Safety Checker</CardTitle>
            <CardDescription className="text-xs">
              Upload an image to analyze it for content safety violations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50 hover:bg-accent/30">
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-foreground font-medium">Upload Image for Safety Check</p>
              <p className="text-xs text-muted-foreground">JPG or PNG files</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Shield */}
      {activeTab === "prompt" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Prompt Shield Tester</CardTitle>
              <CardDescription className="text-xs">
                Check if a prompt would be flagged as jailbreak or prompt injection
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter a prompt to test for injection attacks..."
                rows={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={checkPrompt} disabled={!promptInput.trim() || loading} className="self-start">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
                Check Prompt
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shield Result</CardTitle>
            </CardHeader>
            <CardContent>
              {!promptResult ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  Enter a prompt and check it
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  {promptResult.flagged ? (
                    <>
                      <AlertTriangle className="size-12 text-destructive" />
                      <p className="text-lg font-semibold text-destructive">Flagged</p>
                      {promptResult.reason && (
                        <p className="text-sm text-muted-foreground text-center">{promptResult.reason}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <Shield className="size-12 text-chart-2" />
                      <p className="text-lg font-semibold text-chart-2">Safe</p>
                      <p className="text-sm text-muted-foreground">
                        No injection attack detected
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blocklist Manager */}
      {activeTab === "blocklist" && (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Blocklists</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex gap-1.5">
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBlocklist()}
                  placeholder="New list name"
                  className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground"
                />
                <Button variant="ghost" size="icon-xs" onClick={addBlocklist}>
                  <Plus className="size-3.5" />
                </Button>
              </div>
              {blocklists.map((list, i) => (
                <div
                  key={i}
                  className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer ${
                    activeListIndex === i
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => setActiveListIndex(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActiveListIndex(i)}
                >
                  <List className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{list.name}</span>
                  <Badge variant="secondary" className="text-[11px]">{list.terms.length}</Badge>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBlocklist(i)
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
              {blocklists.length === 0 && (
                <p className="text-xs text-muted-foreground">No blocklists created yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {activeListIndex !== null ? blocklists[activeListIndex]?.name : "Select a blocklist"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeListIndex !== null && blocklists[activeListIndex] ? (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1.5">
                    <input
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTerm()}
                      placeholder="Add blocked term..."
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button onClick={addTerm} disabled={!newTerm.trim()}>
                      <Plus className="size-4" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {blocklists[activeListIndex].terms.map((term, j) => (
                      <Badge key={j} variant="secondary" className="gap-1 text-xs">
                        {term}
                        <button onClick={() => removeTerm(activeListIndex, j)} className="ml-0.5 hover:text-destructive">
                          <Trash2 className="size-2.5" />
                        </button>
                      </Badge>
                    ))}
                    {blocklists[activeListIndex].terms.length === 0 && (
                      <p className="text-xs text-muted-foreground">No terms added yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Select or create a blocklist
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Governance */}
      {activeTab === "governance" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Responsible AI Governance Checklist</CardTitle>
            <CardDescription className="text-xs">
              Track compliance with Microsoft's 6 Responsible AI principles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {governanceChecklist.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => toggleGovernance(item.id)}>
                      {checkedGovernance[item.id] ? (
                        <CheckCircle2 className="size-5 text-chart-2" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.principle}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <textarea
                    value={governanceNotes[item.id] || ""}
                    onChange={(e) => saveGovernanceNote(item.id, e.target.value)}
                    placeholder="Add notes about compliance with this principle..."
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Progress
                value={(Object.values(checkedGovernance).filter(Boolean).length / governanceChecklist.length) * 100}
                className="h-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {Object.values(checkedGovernance).filter(Boolean).length}/{governanceChecklist.length} principles addressed
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

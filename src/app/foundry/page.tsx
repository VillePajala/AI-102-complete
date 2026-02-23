"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { StatusIndicator } from "@/components/status-indicator"
import { api } from "@/lib/api"
import { RefreshCw, ExternalLink, CheckCircle2, Circle } from "lucide-react"

const serviceReference = [
  { service: "Azure AI Services (multi-service)", use: "Single endpoint for Vision, Language, Speech, Decision", tier: "S0" },
  { service: "Azure OpenAI Service", use: "GPT models, DALL-E, embeddings", tier: "S0" },
  { service: "Azure AI Search", use: "Full-text search, vector search, knowledge mining", tier: "Basic/S1" },
  { service: "Document Intelligence", use: "Form/document extraction, OCR", tier: "S0" },
  { service: "Content Safety", use: "Content moderation, prompt shields", tier: "S0" },
  { service: "Azure AI Foundry", use: "Hub & project management, prompt flow, model catalog", tier: "N/A" },
  { service: "Storage Account", use: "Blob storage for documents, images, training data", tier: "Standard" },
]

const resourceChecklist = [
  { id: "rg", label: "Resource Group created" },
  { id: "ai-services", label: "Azure AI Services resource provisioned" },
  { id: "openai", label: "Azure OpenAI resource provisioned" },
  { id: "search", label: "Azure AI Search resource provisioned" },
  { id: "doc-intel", label: "Document Intelligence resource provisioned" },
  { id: "content-safety", label: "Content Safety resource provisioned" },
  { id: "storage", label: "Storage Account created" },
  { id: "foundry", label: "AI Foundry hub and project configured" },
  { id: "backend", label: "Backend API running and connected" },
]

export default function FoundryPage() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    checkBackend()
    const savedChecks = localStorage.getItem("ai102-foundry-checks")
    const savedNotes = localStorage.getItem("ai102-foundry-notes")
    if (savedChecks) {
      try { setCheckedItems(JSON.parse(savedChecks)) } catch { /* ignore corrupt data */ }
    }
    if (savedNotes) setNotes(savedNotes)
  }, [])

  async function checkBackend() {
    setBackendStatus("checking")
    const healthy = await api.health()
    setBackendStatus(healthy ? "online" : "offline")
  }

  function toggleCheck(id: string) {
    setCheckedItems((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      localStorage.setItem("ai102-foundry-checks", JSON.stringify(next))
      return next
    })
  }

  function saveNotes(value: string) {
    setNotes(value)
    localStorage.setItem("ai102-foundry-notes", value)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Foundry Hub"
        description="Azure resource management, service reference, and provisioning status"
        domain="Plan & Manage"
        weight="20-25%"
      />

      {/* Backend status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Backend Connection</CardTitle>
            <Button variant="ghost" size="icon-xs" onClick={checkBackend} aria-label="Refresh status">
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <StatusIndicator
              status={
                backendStatus === "checking"
                  ? "in-progress"
                  : backendStatus === "online"
                    ? "completed"
                    : "error"
              }
            />
            <span className="font-mono text-xs text-muted-foreground">
              {backendStatus === "checking" && "Checking..."}
              {backendStatus === "online" && "http://localhost:8000 — Connected"}
              {backendStatus === "offline" && "http://localhost:8000 — Unreachable"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Service reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Azure Service Reference</CardTitle>
            <CardDescription className="text-xs">
              Services needed for AI-102 topics and this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Service</th>
                    <th className="pb-2 pr-4 font-medium">Use Case</th>
                    <th className="pb-2 font-medium">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceReference.map((s) => (
                    <tr key={s.service} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium text-foreground">{s.service}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{s.use}</td>
                      <td className="py-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {s.tier}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Resource checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resource Checklist</CardTitle>
            <CardDescription className="text-xs">
              Track which Azure resources have been provisioned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {resourceChecklist.map((item) => {
                const checked = checkedItems.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    {checked ? (
                      <CheckCircle2 className="size-4 shrink-0 text-chart-2" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={checked ? "text-muted-foreground line-through" : "text-foreground"}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {checkedItems.length}/{resourceChecklist.length} provisioned
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Azure Portal Notes</CardTitle>
            <a
              href="https://portal.azure.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open Portal <ExternalLink className="size-3" />
            </a>
          </div>
          <CardDescription className="text-xs">
            Document procedures and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            placeholder="Write notes about Azure portal procedures, resource configurations, etc."
            className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </CardContent>
      </Card>
    </div>
  )
}

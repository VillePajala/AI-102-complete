"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { useModuleProgress } from "@/hooks/use-progress"
import { labModules, examDomains } from "@/lib/modules"
import { api } from "@/lib/api"
import {
  CheckSquare,
  Square,
  Loader2,
  FlaskConical,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BarChart3,
} from "lucide-react"

interface ValidationResult {
  lab: string
  status: "pass" | "fail" | "not-implemented"
  message?: string
}

const featureLabels: Record<string, string> = {
  "service-reference": "Service Reference",
  "resource-checklist": "Resource Checklist",
  "health-check": "Health Check",
  notes: "Notes",
  chat: "Chat Completion",
  parameters: "Parameter Tuning",
  "prompt-templates": "Prompt Templates",
  "image-gen": "Image Generation",
  models: "Model Selection",
  "doc-upload": "Document Upload",
  "rag-chat": "RAG Chat",
  search: "Search",
  "index-viewer": "Index Viewer",
  "agent-config": "Agent Config",
  "agent-chat": "Agent Chat",
  "workflow-viz": "Workflow Viz",
  "agent-list": "Agent List",
  "image-analysis": "Image Analysis",
  ocr: "OCR",
  "custom-vision": "Custom Vision",
  "text-analysis": "Text Analysis",
  translation: "Translation",
  "speech-to-text": "Speech to Text",
  "text-to-speech": "Text to Speech",
  "index-mgmt": "Index Management",
  "data-source": "Data Source",
  skillset: "Skillset",
  "query-explorer": "Query Explorer",
  "doc-intelligence": "Document Intelligence",
  "content-safety": "Content Safety",
  "image-safety": "Image Safety",
  "prompt-shield": "Prompt Shield",
  blocklists: "Blocklists",
  governance: "Governance Dashboard",
}

export default function ProgressPage() {
  const {
    progress,
    toggleFeature,
    getModuleProgress,
    getDomainProgress,
    overallReadiness,
    moduleFeatures,
  } = useModuleProgress()

  const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function runValidation() {
    setValidating(true)
    setValidationError(null)
    try {
      const results = await api.get<ValidationResult[]>("/api/validate")
      setValidationResults(results)
    } catch {
      setValidationError("Could not reach the backend. Is it running on port 8000?")
    } finally {
      setValidating(false)
    }
  }

  const readinessColor =
    overallReadiness >= 80
      ? "text-emerald-400"
      : overallReadiness >= 40
        ? "text-amber-400"
        : "text-red-400"

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <PageHeader
        title="Progress Tracker"
        description="Track your hands-on lab completion and exam domain coverage across all modules."
      />

      {/* Overall Readiness */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Overall Exam Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tabular-nums ${readinessColor}`}>
              {overallReadiness}%
            </span>
            <span className="text-sm text-muted-foreground">features completed</span>
          </div>
          <Progress value={overallReadiness} className="h-3" />
        </CardContent>
      </Card>

      {/* Module Cards Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Module Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const pct = getModuleProgress(mod.id)
            const completedFeatures = progress.modules[mod.id] || []
            const features = moduleFeatures[mod.id]?.features || []

            return (
              <Card key={mod.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className={`h-4 w-4 ${mod.color}`} />
                      {mod.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono text-muted-foreground"
                    >
                      {pct}%
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-1" />
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-1">
                    {features.map((featureId) => {
                      const checked = completedFeatures.includes(featureId)
                      return (
                        <li key={featureId}>
                          <button
                            type="button"
                            onClick={() => toggleFeature(mod.id, featureId)}
                            className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-accent/50 transition-colors"
                          >
                            {checked ? (
                              <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span
                              className={
                                checked ? "text-foreground" : "text-muted-foreground"
                              }
                            >
                              {featureLabels[featureId] || featureId}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Domain Coverage */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Exam Domain Coverage</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {examDomains.map((domain) => {
              const pct = getDomainProgress(domain.number)
              return (
                <div key={domain.number} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      D{domain.number}: {domain.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-mono text-muted-foreground"
                      >
                        {domain.weight}
                      </Badge>
                      <span className="text-sm tabular-nums font-semibold w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      {/* Validate Labs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Backend Lab Validation</h2>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Validate Labs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Check which lab backend implementations are working by running automated
              validation against the API.
            </p>
            <Button onClick={runValidation} disabled={validating} size="sm">
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Run Validation"
              )}
            </Button>

            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}

            {validationResults && (
              <ul className="space-y-2 pt-2">
                {validationResults.map((r) => (
                  <li
                    key={r.lab}
                    className="flex items-center gap-2 text-sm"
                  >
                    {r.status === "pass" && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    {r.status === "fail" && (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    {r.status === "not-implemented" && (
                      <MinusCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium">{r.lab}</span>
                    {r.message && (
                      <span className="text-muted-foreground">-- {r.message}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

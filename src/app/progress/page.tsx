"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { useModuleProgress } from "@/hooks/use-progress"
import { labModules, examDomains } from "@/lib/modules"
import {
  getLabDefinition,
  getLayersForTier,
  getAllStepIdsForTier,
  TIER_HIERARCHY,
  TIER_META,
  type LabTier,
} from "@/lib/lab-steps"
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
  Layers,
} from "lucide-react"

interface ValidationResult {
  lab: string
  status: "pass" | "fail" | "not-implemented"
  message?: string
}

const TIER_COLORS: Record<LabTier, string> = {
  core: "text-emerald-600 dark:text-emerald-400",
  advanced: "text-amber-600 dark:text-amber-400",
  expert: "text-red-600 dark:text-red-400",
}

const TIER_BADGE_CLASSES: Record<LabTier, string> = {
  core: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  advanced: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  expert: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10",
}

function TierSelector({ value, onChange }: { value: LabTier; onChange: (t: LabTier) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {TIER_HIERARCHY.map((tier) => {
        const active = tier === value
        return (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(tier)}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
              active
                ? "bg-background shadow-sm " + TIER_COLORS[tier]
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TIER_META[tier].label}
          </button>
        )
      })}
    </div>
  )
}

export default function ProgressPage() {
  const {
    progress,
    toggleFeature,
    getModuleProgressForTier,
    getModuleLayerProgress,
    getDomainProgress,
    getLabTier,
    setLabTier,
    overallReadiness,
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
            <span className="text-sm text-muted-foreground">steps completed</span>
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
            const pct = getModuleProgressForTier(mod.id)
            const lab = getLabDefinition(mod.id)
            const layerProgress = getModuleLayerProgress(mod.id)
            const selectedTier = getLabTier(mod.id)
            const completedSteps = progress.modules[mod.id] || []
            const completedSet = new Set(completedSteps)
            const filteredLayers = lab ? getLayersForTier(mod.id, selectedTier) : []

            return (
              <Card key={mod.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className={`h-4 w-4 ${mod.color}`} />
                      {mod.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      {lab && (
                        <Badge variant="outline" className="text-[11px] font-mono">
                          <Layers className="h-3 w-3 mr-0.5" />
                          {layerProgress.completed}/{layerProgress.total}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[11px] font-mono text-muted-foreground"
                      >
                        {pct}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-1" />
                  {/* Tier selector for this module */}
                  {lab && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground font-medium">Difficulty</span>
                      <TierSelector value={selectedTier} onChange={(t) => setLabTier(mod.id, t)} />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  {lab ? (
                    <div className="space-y-2">
                      {/* Setup steps */}
                      {lab.setup.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Setup
                          </p>
                          <ul className="space-y-0.5">
                            {lab.setup.map((step) => {
                              const checked = completedSet.has(step.id)
                              return (
                                <li key={step.id}>
                                  <button
                                    type="button"
                                    onClick={() => toggleFeature(mod.id, step.id)}
                                    className="flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left text-xs hover:bg-accent/50 transition-colors"
                                  >
                                    {checked ? (
                                      <CheckSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                                    ) : (
                                      <Square className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    )}
                                    <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                                      {step.label}
                                    </span>
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                      {/* Layers — filtered by tier */}
                      {filteredLayers.map((layer) => {
                        const allDone = layer.steps.every((s) => completedSet.has(s.id))
                        const layerDone = layer.steps.filter((s) => completedSet.has(s.id)).length
                        return (
                          <div key={layer.id}>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                              {allDone ? (
                                <CheckSquare className="h-3 w-3 text-primary" />
                              ) : (
                                <span className="w-3 text-center font-mono">{layer.id}</span>
                              )}
                              {layer.title}
                              {layer.tier !== "core" && (
                                <Badge variant="outline" className={`text-[9px] px-1 py-0 font-semibold ${TIER_BADGE_CLASSES[layer.tier]}`}>
                                  {TIER_META[layer.tier].label}
                                </Badge>
                              )}
                              <span className="font-mono text-muted-foreground/60">
                                {layerDone}/{layer.steps.length}
                              </span>
                            </p>
                            <ul className="space-y-0.5">
                              {layer.steps.map((step) => {
                                const checked = completedSet.has(step.id)
                                return (
                                  <li key={step.id}>
                                    <button
                                      type="button"
                                      onClick={() => toggleFeature(mod.id, step.id)}
                                      className="flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left text-xs hover:bg-accent/50 transition-colors"
                                    >
                                      {checked ? (
                                        <CheckSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                                      ) : (
                                        <Square className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                      )}
                                      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                                        {step.label}
                                      </span>
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No lab steps defined</p>
                  )}
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

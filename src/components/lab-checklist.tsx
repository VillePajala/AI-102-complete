"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getLabDefinition,
  getCompletedLayerCountForTier,
  getLayersForTier,
  getAllStepIdsForTier,
  TIER_HIERARCHY,
  TIER_META,
  type LabTier,
} from "@/lib/lab-steps"
import { ChevronDown, CheckSquare, Square, Wrench, Layers } from "lucide-react"

const STORAGE_KEY = "ai102-lab-progress"
const TIER_KEY = "ai102-lab-tiers"

interface LabProgressData {
  [labId: string]: string[] // completed step IDs
}

interface LabTierData {
  [labId: string]: LabTier
}

function loadLabProgress(): LabProgressData {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLabProgress(data: LabProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
}

function loadLabTier(labId: string): LabTier {
  if (typeof window === "undefined") return "core"
  try {
    const raw = localStorage.getItem(TIER_KEY)
    if (!raw) return "core"
    const data: LabTierData = JSON.parse(raw)
    return data[labId] || "core"
  } catch {
    return "core"
  }
}

function saveLabTier(labId: string, tier: LabTier) {
  let data: LabTierData = {}
  try {
    const raw = localStorage.getItem(TIER_KEY)
    if (raw) data = JSON.parse(raw)
  } catch {
    // ignore
  }
  data[labId] = tier
  localStorage.setItem(TIER_KEY, JSON.stringify(data))
  window.dispatchEvent(new StorageEvent("storage", { key: TIER_KEY }))
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

// --- TierSelector ---

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
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
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

export function LabChecklist({ labId }: { labId: string }) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedTier, setSelectedTier] = useState<LabTier>("core")

  const lab = getLabDefinition(labId)

  useEffect(() => {
    const allProgress = loadLabProgress()
    setCompletedSteps(allProgress[labId] || [])
    setSelectedTier(loadLabTier(labId))

    // Remember open/closed state per lab
    try {
      const openState = localStorage.getItem(`ai102-checklist-open-${labId}`)
      if (openState === "true") setIsOpen(true)
    } catch {
      // ignore
    }
    setMounted(true)
  }, [labId])

  // Listen for storage changes from LabGuideDrawer / other components
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        const progress = loadLabProgress()
        setCompletedSteps(progress[labId] || [])
      }
      if (e.key === TIER_KEY) {
        setSelectedTier(loadLabTier(labId))
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [labId])

  const toggleStep = useCallback(
    (stepId: string) => {
      setCompletedSteps((prev) => {
        const updated = prev.includes(stepId)
          ? prev.filter((id) => id !== stepId)
          : [...prev, stepId]
        const allProgress = loadLabProgress()
        allProgress[labId] = updated
        saveLabProgress(allProgress)
        return updated
      })
    },
    [labId]
  )

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      try {
        localStorage.setItem(`ai102-checklist-open-${labId}`, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [labId])

  const handleTierChange = useCallback(
    (tier: LabTier) => {
      setSelectedTier(tier)
      saveLabTier(labId, tier)
    },
    [labId]
  )

  if (!lab) return null
  if (!mounted) return null

  const completedSet = new Set(completedSteps)
  const filteredLayers = getLayersForTier(labId, selectedTier)
  const completedLayerCount = getCompletedLayerCountForTier(labId, selectedTier, completedSet)
  const totalLayers = filteredLayers.length
  const allStepIds = getAllStepIdsForTier(labId, selectedTier)
  const totalSteps = allStepIds.length
  const completedCount = completedSteps.filter((id) => allStepIds.includes(id)).length

  return (
    <Card className="py-0 gap-0">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="h-4 w-4 text-primary" />
              Lab Progress
              <Badge variant="outline" className="ml-1 text-[11px] font-mono">
                {completedLayerCount}/{totalLayers} layers
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                {completedCount}/{totalSteps} steps
              </Badge>
            </CardTitle>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>
      </button>

      {isOpen && (
        <CardContent className="pt-0 pb-4 space-y-4">
          {/* Tier selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Difficulty</span>
            <TierSelector value={selectedTier} onChange={handleTierChange} />
          </div>

          {/* Setup section */}
          {lab.setup.length > 0 && (
            <StepSection
              title="Azure Setup"
              icon={<Wrench className="h-3.5 w-3.5" />}
              steps={lab.setup}
              completedSet={completedSet}
              onToggle={toggleStep}
            />
          )}

          {/* Layer sections — filtered by tier */}
          {filteredLayers.map((layer) => {
            const allDone = layer.steps.every((s) => completedSet.has(s.id))
            return (
              <StepSection
                key={layer.id}
                title={`Layer ${layer.id}: ${layer.title}`}
                tierBadge={layer.tier !== "core" ? layer.tier : undefined}
                icon={
                  allDone ? (
                    <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground w-3.5 text-center">
                      {layer.id}
                    </span>
                  )
                }
                steps={layer.steps}
                completedSet={completedSet}
                onToggle={toggleStep}
              />
            )
          })}
        </CardContent>
      )}
    </Card>
  )
}

function StepSection({
  title,
  icon,
  tierBadge,
  steps,
  completedSet,
  onToggle,
}: {
  title: string
  icon: React.ReactNode
  tierBadge?: LabTier
  steps: { id: string; label: string }[]
  completedSet: Set<string>
  onToggle: (stepId: string) => void
}) {
  const doneCount = steps.filter((s) => completedSet.has(s.id)).length

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {tierBadge && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold ${TIER_BADGE_CLASSES[tierBadge]}`}>
            {TIER_META[tierBadge].label}
          </Badge>
        )}
        <span className="text-[11px] text-muted-foreground font-mono">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {steps.map((step) => {
          const checked = completedSet.has(step.id)
          return (
            <li key={step.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onToggle(step.id)}
                className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-accent/50 transition-colors"
              >
                {checked ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
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
}

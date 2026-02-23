"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Loader2, CheckSquare, Square, Wrench, Lightbulb, ChevronDown, GripVertical, Minus, Plus } from "lucide-react"
import { parseLabMarkdown, type LabSection } from "@/lib/parse-lab-markdown"
import {
  getLabDefinition,
  getLayersForTier,
  getAllStepIdsForTier,
  TIER_HIERARCHY,
  TIER_META,
  type LabTier,
} from "@/lib/lab-steps"

const STORAGE_KEY = "ai102-lab-progress"
const TIER_KEY = "ai102-lab-tiers"
const DRAWER_STATE_PREFIX = "ai102-lab-guide-open-"
const DRAWER_WIDTH_KEY = "ai102-lab-guide-width"
const MIN_WIDTH = 360
const MAX_WIDTH = 1400
const DEFAULT_WIDTH = 540
const FONT_SIZE_KEY = "ai102-lab-guide-font-size"
const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24] as const
const DEFAULT_FONT_INDEX = 3 // 18px

interface LabProgressData {
  [labId: string]: string[]
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
  // Dispatch storage event so other components (LabChecklist, use-progress) sync
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

export function LabGuideDrawer({ labId }: { labId: string }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [drawerWidth, setDrawerWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_INDEX)
  const [selectedTier, setSelectedTier] = useState<LabTier>("core")
  const fetchedRef = useRef(false)
  const prevLabIdRef = useRef(labId)

  const lab = getLabDefinition(labId)

  // Reset fetch cache when labId changes
  useEffect(() => {
    if (prevLabIdRef.current !== labId) {
      fetchedRef.current = false
      setContent(null)
      prevLabIdRef.current = labId
    }
  }, [labId])

  // Load initial state
  useEffect(() => {
    setMounted(true)
    const progress = loadLabProgress()
    setCompletedSteps(progress[labId] || [])
    setSelectedTier(loadLabTier(labId))

    // Restore drawer open/closed state
    try {
      const saved = localStorage.getItem(DRAWER_STATE_PREFIX + labId)
      if (saved === "true") setOpen(true)
    } catch {
      // ignore
    }
  }, [labId])

  // Listen for storage changes from LabChecklist
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

  // Fetch content when drawer opens (static files served from public/labs/)
  useEffect(() => {
    if (!open || fetchedRef.current || !lab) return
    setLoading(true)
    setError(null)
    // lab.labFile is like "docs/labs/01-genai.md" — strip "docs/" prefix for public path
    const publicPath = "/" + lab.labFile.replace(/^docs\//, "")
    fetch(publicPath)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load")
        return res.text()
      })
      .then((text) => {
        setContent(text)
        fetchedRef.current = true
      })
      .catch(() => setError("Failed to load lab content"))
      .finally(() => setLoading(false))
  }, [open, labId, lab])

  // Persist open/closed state
  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      try {
        localStorage.setItem(DRAWER_STATE_PREFIX + labId, String(next))
      } catch {
        // ignore
      }
    },
    [labId]
  )

  // Keyboard shortcut: Ctrl+Shift+G
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "G") {
        e.preventDefault()
        handleOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, handleOpenChange])

  // Load saved drawer width
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAWER_WIDTH_KEY)
      if (saved) {
        const w = parseInt(saved, 10)
        if (!Number.isNaN(w) && w >= MIN_WIDTH && w <= MAX_WIDTH) setDrawerWidth(w)
      }
    } catch {
      // ignore
    }
  }, [])

  // Load saved font size
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FONT_SIZE_KEY)
      if (saved) {
        const idx = parseInt(saved, 10)
        if (!Number.isNaN(idx) && idx >= 0 && idx < FONT_SIZES.length) setFontSizeIndex(idx)
      }
    } catch {
      // ignore
    }
  }, [])

  const changeFontSize = useCallback((delta: number) => {
    setFontSizeIndex((prev) => {
      const next = Math.max(0, Math.min(FONT_SIZES.length - 1, prev + delta))
      try { localStorage.setItem(FONT_SIZE_KEY, String(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  // Resize handle logic
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const onMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - ev.clientX))
      setDrawerWidth(newWidth)
    }
    const onMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [])

  // Save width when resizing ends
  useEffect(() => {
    if (!isResizing) {
      try {
        localStorage.setItem(DRAWER_WIDTH_KEY, String(drawerWidth))
      } catch {
        // ignore
      }
    }
  }, [isResizing, drawerWidth])

  const toggleStep = useCallback(
    (stepId: string) => {
      // Read current progress from localStorage (source of truth)
      const allProgress = loadLabProgress()
      const current = allProgress[labId] || []
      const updated = current.includes(stepId)
        ? current.filter((id: string) => id !== stepId)
        : [...current, stepId]
      allProgress[labId] = updated
      saveLabProgress(allProgress)
      setCompletedSteps(updated)
    },
    [labId]
  )

  const handleTierChange = useCallback(
    (tier: LabTier) => {
      setSelectedTier(tier)
      saveLabTier(labId, tier)
    },
    [labId]
  )

  if (!lab || !mounted) return null

  const parsed = content ? parseLabMarkdown(content) : null
  const completedSet = new Set(completedSteps)

  // Get tier-filtered layers
  const filteredLayers = getLayersForTier(labId, selectedTier)
  const filteredLayerIds = new Set(filteredLayers.map((l) => l.id))

  // Collect all checkable steps for the sidebar (filtered by tier)
  const allStepGroups = [
    ...(lab.setup.length > 0 ? [{ title: "Setup", tierBadge: undefined as LabTier | undefined, steps: lab.setup }] : []),
    ...filteredLayers.map((layer) => ({
      title: `Layer ${layer.id}`,
      tierBadge: layer.tier !== "core" ? layer.tier : undefined as LabTier | undefined,
      steps: layer.steps,
    })),
  ]
  const totalSteps = allStepGroups.reduce((s, g) => s + g.steps.length, 0)
  const totalDone = allStepGroups.reduce(
    (s, g) => s + g.steps.filter((st) => completedSet.has(st.id)).length, 0
  )

  // Filter markdown sections: show non-layer sections always, layer sections only if in selected tier
  const filteredSections = parsed?.sections.filter((section) => {
    if (section.type !== "layer") return true
    if (section.layerNumber === undefined) return true
    return filteredLayerIds.has(section.layerNumber)
  }) ?? []

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenChange(true)}
        className="gap-1.5"
      >
        <BookOpen className="size-3.5" />
        Lab Guide
        <kbd className="ml-1 hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
          Ctrl+Shift+G
        </kbd>
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="p-0 flex flex-col"
          style={{ width: `min(92vw, ${drawerWidth}px)`, maxWidth: 'none' }}
        >
          {/* Resize drag strip */}
          <div
            onMouseDown={startResize}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-primary/15 active:bg-primary/25 transition-colors border-r border-transparent hover:border-primary/30"
          />

          <SheetHeader className="px-5 pt-4 pb-3 border-b border-border shrink-0">
            <SheetTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Lab Guide
            </SheetTitle>
            <div className="flex items-center justify-between">
              <SheetDescription className="text-xs">
                {lab.labFile}
              </SheetDescription>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => changeFontSize(-1)}
                  disabled={fontSizeIndex === 0}
                  className="p-1 rounded hover:bg-accent/50 transition-colors disabled:opacity-30"
                  title="Decrease font size"
                >
                  <Minus className="size-3.5 text-muted-foreground" />
                </button>
                <span className="text-[10px] font-mono text-muted-foreground w-7 text-center">
                  {FONT_SIZES[fontSizeIndex]}
                </span>
                <button
                  type="button"
                  onClick={() => changeFontSize(1)}
                  disabled={fontSizeIndex === FONT_SIZES.length - 1}
                  className="p-1 rounded hover:bg-accent/50 transition-colors disabled:opacity-30"
                  title="Increase font size"
                >
                  <Plus className="size-3.5 text-muted-foreground" />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                  type="button"
                  onMouseDown={startResize}
                  className="cursor-col-resize p-1 rounded hover:bg-accent/50 transition-colors"
                  title="Drag to resize panel"
                >
                  <GripVertical className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </SheetHeader>

          {/* Two-column body: content + progress sidebar */}
          <div className="flex-1 min-h-0 flex">
            {/* Main content — scrollable */}
            <div className="flex-1 min-w-0 overflow-y-auto" style={{ fontSize: `${FONT_SIZES[fontSizeIndex]}px` }}>
              <div className="px-6 py-5 max-w-prose mx-auto">
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading lab content...
                  </div>
                )}

                {error && (
                  <div className="py-16 text-center text-sm text-destructive">
                    {error}
                  </div>
                )}

                {parsed && (
                  <div className="space-y-5">
                    {parsed.header && (
                      <div className="pb-4 border-b border-border mb-4">
                        <MarkdownBlock content={parsed.header} />
                      </div>
                    )}

                    {filteredSections.map((section, i) => (
                      <SectionRenderer
                        key={i}
                        section={section}
                        labId={labId}
                        completedSet={completedSet}
                        onToggleStep={toggleStep}
                        lab={lab}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress sidebar — right side, scrolls independently */}
            <div className="w-[300px] shrink-0 border-l border-border overflow-y-auto bg-muted/20 hidden sm:block" style={{ fontSize: `${FONT_SIZES[fontSizeIndex]}px` }}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[1em] font-semibold text-foreground">
                    Your Progress
                  </span>
                  <Badge variant={totalDone === totalSteps ? "default" : "outline"} className="text-[0.8em] font-mono">
                    {totalDone}/{totalSteps}
                  </Badge>
                </div>

                {/* Tier selector */}
                <div className="mb-4">
                  <TierSelector value={selectedTier} onChange={handleTierChange} />
                </div>

                <p className="text-[0.8em] text-muted-foreground mb-4 leading-normal">
                  Check off steps as you complete them. Progress is saved automatically.
                </p>
                <div className="space-y-4">
                  {allStepGroups.map((group) => {
                    const groupDone = group.steps.filter((s) => completedSet.has(s.id)).length
                    return (
                      <ProgressGroup
                        key={group.title}
                        title={group.title}
                        tierBadge={group.tierBadge}
                        steps={group.steps}
                        doneCount={groupDone}
                        completedSet={completedSet}
                        onToggle={toggleStep}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

// --- Progress sidebar group ---

function ProgressGroup({
  title,
  tierBadge,
  steps,
  doneCount,
  completedSet,
  onToggle,
}: {
  title: string
  tierBadge?: LabTier
  steps: { id: string; label: string }[]
  doneCount: number
  completedSet: Set<string>
  onToggle: (stepId: string) => void
}) {
  const allDone = doneCount === steps.length
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`rounded-lg border bg-background ${allDone ? "border-primary/30" : "border-border/60"}`}>
      {/* Group header — click to collapse/expand */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/30 transition-colors rounded-lg"
      >
        <span className={`text-[0.9em] font-semibold flex-1 ${allDone ? "text-primary" : "text-foreground"}`}>
          {title}
        </span>
        {tierBadge && (
          <Badge variant="outline" className={`text-[0.7em] px-1.5 py-0 font-semibold ${TIER_BADGE_CLASSES[tierBadge]}`}>
            {TIER_META[tierBadge].label}
          </Badge>
        )}
        <span className={`text-[0.8em] font-mono ${allDone ? "text-primary" : "text-muted-foreground"}`}>
          {doneCount}/{steps.length}
        </span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      {!collapsed && (
        <div className="px-2.5 pb-2.5">
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted mb-2 mx-0.5">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${steps.length > 0 ? (doneCount / steps.length) * 100 : 0}%` }}
            />
          </div>
          {/* Steps */}
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
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[0.85em] leading-normal transition-colors ${
                      checked
                        ? "text-muted-foreground"
                        : "text-foreground/80 hover:bg-accent/50"
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="size-4 shrink-0 text-primary mt-0.5" />
                    ) : (
                      <Square className="size-4 shrink-0 text-muted-foreground/40 mt-0.5" />
                    )}
                    <span className={checked ? "line-through decoration-muted-foreground/30" : ""}>
                      {step.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

// --- Section titles ---

const SECTION_TITLES: Record<string, string> = {
  overview: "Overview",
  prerequisites: "Prerequisites",
  setup: "Azure Setup",
  "exam-tips": "Exam Tips & Quiz",
  summary: "Summary",
}

function getSectionTitle(section: LabSection, lab: NonNullable<ReturnType<typeof getLabDefinition>>): string {
  if (section.type === "layer") {
    const layer = lab.layers.find((l) => l.id === section.layerNumber)
    return layer ? `Layer ${layer.id}: ${layer.title}` : `Layer ${section.layerNumber}`
  }
  return SECTION_TITLES[section.type] || section.type
}

function getSectionTierBadge(section: LabSection, lab: NonNullable<ReturnType<typeof getLabDefinition>>): LabTier | undefined {
  if (section.type !== "layer") return undefined
  const layer = lab.layers.find((l) => l.id === section.layerNumber)
  if (!layer || layer.tier === "core") return undefined
  return layer.tier
}

function getSectionIcon(section: LabSection) {
  switch (section.type) {
    case "setup": return <Wrench className="size-4" />
    case "exam-tips": return <Lightbulb className="size-4" />
    case "layer": return (
      <span className="size-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
        {section.layerNumber}
      </span>
    )
    default: return null
  }
}

// --- Section Renderer (collapsible) ---

function SectionRenderer({
  section,
  lab,
  completedSet,
  onToggleStep,
}: {
  section: LabSection
  labId: string
  completedSet: Set<string>
  onToggleStep: (stepId: string) => void
  lab: ReturnType<typeof getLabDefinition>
}) {
  // Layers and setup start expanded; overview/prerequisites start collapsed
  const [expanded, setExpanded] = useState(
    section.type === "layer" || section.type === "setup" || section.type === "exam-tips"
  )

  if (!lab) return null

  const title = getSectionTitle(section, lab)
  const icon = getSectionIcon(section)
  const isExamTips = section.type === "exam-tips"
  const tierBadge = getSectionTierBadge(section, lab)

  return (
    <div className={`rounded-lg border ${isExamTips ? "border-primary/20 bg-primary/5" : "border-border"}`}>
      {/* Section header — click to expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-2.5 text-left px-4 py-3 hover:bg-accent/30 transition-colors rounded-lg ${
          expanded ? "border-b border-border" : ""
        }`}
      >
        {icon}
        <span className={`text-[1em] font-semibold flex-1 ${isExamTips ? "text-primary" : "text-foreground"}`}>
          {title}
        </span>
        {tierBadge && (
          <Badge variant="outline" className={`text-[0.7em] px-1.5 py-0 font-semibold ${TIER_BADGE_CLASSES[tierBadge]}`}>
            {TIER_META[tierBadge].label}
          </Badge>
        )}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Section body — markdown content with inline checkpoints */}
      {expanded && (
        <div className="px-5 py-5">
          <MarkdownBlock content={section.content} completedSet={completedSet} onToggleStep={onToggleStep} />
        </div>
      )}
    </div>
  )
}

// --- Markdown Renderer ---

function MarkdownBlock({ content, completedSet, onToggleStep }: {
  content: string
  completedSet?: Set<string>
  onToggleStep?: (stepId: string) => void
}) {
  return (
    <div className="lab-guide-prose leading-[1.85] text-foreground/80">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Inline checkpoint — rendered from <checkpoint id="step-id"></checkpoint> in markdown
          checkpoint: ({ id }: { id?: string }) => {
            if (!id || !completedSet || !onToggleStep) return null
            const checked = completedSet.has(id)
            return (
              <div className={`my-5 flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 transition-colors ${
                checked ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/40"
              }`}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggleStep(id)}
                  className="flex items-center gap-2.5 w-full text-left"
                >
                  {checked ? (
                    <CheckSquare className="size-4 shrink-0 text-primary" />
                  ) : (
                    <Square className="size-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className={`text-[0.85em] font-medium ${checked ? "text-primary line-through decoration-primary/30" : "text-muted-foreground"}`}>
                    {checked ? "Done!" : "Mark this step as done"}
                  </span>
                </button>
              </div>
            )
          },
          // Headings — use em for relative sizing, generous spacing for clear separation
          h1: ({ children }) => (
            <h2 className="text-[1.2em] font-bold text-foreground mt-8 mb-4 pb-2 border-b border-border/40 first:mt-0">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-[1.12em] font-semibold text-foreground mt-8 mb-3 first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-[1.05em] font-semibold text-foreground mt-6 mb-2.5 first:mt-0">{children}</h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-[1em] font-medium text-foreground mt-5 mb-2 first:mt-0">{children}</h5>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60"
            >
              {children}
            </a>
          ),

          // Code blocks
          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-lg bg-muted/60 border border-border/50 p-4 text-[0.78em] leading-relaxed">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-")
            if (isBlock) {
              return (
                <code className="font-mono text-foreground/90" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded-sm bg-muted/80 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground/90" {...props}>
                {children}
              </code>
            )
          },

          // Tables
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-[0.9em]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/40">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-[0.85em] font-medium text-muted-foreground border-b border-border/60">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-foreground/80 border-b border-border/40">
              {children}
            </td>
          ),

          // Lists — generous spacing between items for readability
          ul: ({ children }) => (
            <ul className="my-4 ml-5 list-disc space-y-2.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-5 list-decimal space-y-2.5">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,

          // Blockquotes — styled as callout cards
          blockquote: ({ children }) => (
            <div className="my-5 rounded-lg border border-border/60 bg-muted/30 px-4 py-3.5 text-[0.92em] text-muted-foreground">
              {children}
            </div>
          ),

          // Horizontal rules
          hr: () => <hr className="my-8 border-border/40" />,

          // Strong
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),

          // Images — SVGs scale to container width
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ""}
              className="my-4 w-full h-auto rounded-lg border border-border/50 bg-white p-3"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

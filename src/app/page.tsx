"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Rocket, BookOpen, CheckCircle, X } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

const GETTING_STARTED_KEY = "ai102-getting-started-dismissed"

/* Accent per module — tonal palette */
const accent: Record<string, { icon: string; bg: string; strip: string }> = {
  foundry:          { icon: "text-indigo-500 dark:text-indigo-400",    bg: "bg-indigo-500/8 dark:bg-indigo-400/10",    strip: "bg-indigo-500 dark:bg-indigo-400" },
  generative:       { icon: "text-sky-500 dark:text-sky-400",          bg: "bg-sky-500/8 dark:bg-sky-400/10",          strip: "bg-sky-500 dark:bg-sky-400" },
  rag:              { icon: "text-slate-500 dark:text-slate-400",      bg: "bg-slate-500/8 dark:bg-slate-400/10",      strip: "bg-slate-400 dark:bg-slate-500" },
  agents:           { icon: "text-violet-500 dark:text-violet-400",    bg: "bg-violet-500/8 dark:bg-violet-400/10",    strip: "bg-violet-500 dark:bg-violet-400" },
  vision:           { icon: "text-blue-500 dark:text-blue-400",        bg: "bg-blue-500/8 dark:bg-blue-400/10",        strip: "bg-blue-500 dark:bg-blue-400" },
  language:         { icon: "text-zinc-500 dark:text-zinc-400",        bg: "bg-zinc-500/8 dark:bg-zinc-400/10",        strip: "bg-zinc-400 dark:bg-zinc-500" },
  search:           { icon: "text-indigo-400 dark:text-indigo-300",    bg: "bg-indigo-400/8 dark:bg-indigo-300/10",    strip: "bg-indigo-400 dark:bg-indigo-300" },
  "responsible-ai": { icon: "text-slate-600 dark:text-slate-300",      bg: "bg-slate-600/8 dark:bg-slate-300/10",      strip: "bg-slate-500 dark:bg-slate-400" },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  const completedCount = labModules.filter(m => getModuleStatus(m.id) === "completed").length
  const activeCount = labModules.filter(m => getModuleStatus(m.id) === "in-progress").length

  /* SVG gauge math */
  const r = 54
  const circ = 2 * Math.PI * r

  return (
    <div className="flex flex-col gap-10">

      {/* ── HERO ── */}
      <section className="glass relative overflow-hidden rounded-3xl border border-border bg-card">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.28_275/0.25)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.42_0.25_275/0.40)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.60_0.20_200/0.18)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.35_0.18_200/0.30)_0%,transparent_65%)]" />

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          {/* Left: copy */}
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
              AI-102 &middot; Azure AI Engineer
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-balance md:text-4xl leading-[1.1]">
              Command Center
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Track progress across all lab modules and exam domains.
            </p>

            {/* Stat strip */}
            <div className="mt-3 flex items-center gap-5">
              {[
                { label: "Labs", value: labModules.length },
                { label: "Completed", value: completedCount },
                { label: "Active", value: activeCount },
                { label: "Domains", value: examDomains.length },
              ].map(s => (
                <div key={s.label} className="glass flex flex-col items-center rounded-lg border border-border bg-card px-4 py-2.5">
                  <span className="text-xl font-bold tabular-nums text-foreground">{s.value}</span>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: gauge */}
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="relative flex size-44 items-center justify-center md:size-48">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" strokeWidth="6" className="stroke-secondary" />
                <circle
                  cx="60" cy="60" r={r} fill="none"
                  strokeWidth="7" strokeLinecap="round"
                  className="stroke-primary"
                  style={{
                    strokeDasharray: circ,
                    strokeDashoffset: circ * (1 - overallReadiness / 100),
                    transition: "stroke-dashoffset 1s ease-out",
                    filter: "drop-shadow(0 0 6px oklch(0.72 0.22 275 / 0.4))",
                  }}
                />
              </svg>
              <div className="relative flex flex-col items-center">
                <span className="text-5xl font-black tabular-nums text-foreground tracking-tighter md:text-6xl">
                  {overallReadiness}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary -mt-0.5">percent</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">Exam Readiness</span>
          </div>
        </div>
      </section>

      {/* ── GETTING STARTED ── */}
      <GettingStarted />

      {/* ── DOMAIN COVERAGE ── */}
      <section className="glass rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Domain Coverage</h2>
          <span className="text-[11px] font-mono text-muted-foreground/50">{examDomains.length} domains</span>
        </div>

        <div className="flex flex-col gap-3.5">
          {examDomains.map((d) => {
            const pct = getDomainProgress(d.number)
            return (
              <div key={d.number} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-[11px] font-bold tabular-nums text-muted-foreground/70">{d.number}</span>
                <span className="w-44 shrink-0 truncate text-[13px] text-foreground/70 max-sm:w-24">{d.name}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.max(pct, 2)}%`, transition: "width 0.7s ease-out" }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-semibold font-mono tabular-nums text-foreground/80">{pct}%</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── LAB MODULES ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lab Modules</h2>
          <span className="text-[11px] font-mono text-muted-foreground/50">{labModules.length} modules</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            const a = accent[mod.id] || accent.foundry
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div className={cn(
                  "glass relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
                  "transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                )}>
                  {/* Colored top strip */}
                  <div className={cn("h-1 w-full", a.strip)} />

                  <div className="flex flex-1 flex-col gap-4 p-4">
                    {/* Icon + status row */}
                    <div className="flex items-start justify-between">
                      <div className={cn("flex size-10 items-center justify-center rounded-lg", a.bg)}>
                        <Icon className={cn("size-5", a.icon)} strokeWidth={1.75} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{mod.name}</h3>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
                      <span className="text-[11px] font-medium text-muted-foreground/70">D{mod.domainNumber} &middot; {mod.weight}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground/30 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ── Getting Started CTA ── */

const SETUP_STEPS = [
  {
    title: "Install prerequisites",
    desc: "Node.js 20+, Python 3.11+, and VS Code. Open this project in VS Code — it will prompt you to install recommended extensions.",
  },
  {
    title: "Install dependencies",
    desc: "Run npm install at the repo root for the frontend. Then set up the Python backend: create a venv and pip install -r requirements.txt.",
  },
  {
    title: "Start both servers",
    desc: "Start the frontend (port 3000) and backend (port 8000). Azure resource setup and .env configuration happen inside each lab.",
  },
]

const WORKFLOW_STEPS = [
  {
    icon: Rocket,
    title: "Pick a module",
    desc: "Start with GenAI Lab — it's the recommended first module. Each module maps directly to an AI-102 exam domain.",
  },
  {
    icon: BookOpen,
    title: "Open the Lab Guide",
    desc: "Click \"Lab Guide\" on any module page for step-by-step instructions, expandable hints, and full solutions.",
  },
  {
    icon: CheckCircle,
    title: "Build & track progress",
    desc: "Implement Azure AI services in your code editor, check off steps as you go. Building the app IS the studying.",
  },
]

function GettingStarted() {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(GETTING_STARTED_KEY) === "true")
    } catch {
      setDismissed(false)
    }
  }, [])

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    try { localStorage.setItem(GETTING_STARTED_KEY, "true") } catch { /* ignore */ }
  }

  return (
    <section className="glass relative rounded-2xl border border-primary/20 bg-card overflow-hidden">
      {/* Subtle accent glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-[radial-gradient(circle,oklch(0.58_0.25_275/0.12)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.50_0.22_275/0.20)_0%,transparent_65%)]" />

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Rocket className="size-4.5 text-primary" />
              Getting Started
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              This project is a hands-on lab for the AI-102 exam. You work in two windows: your <strong className="text-foreground font-medium">code editor</strong> (to build Azure AI services) and this <strong className="text-foreground font-medium">browser</strong> (to test and track progress). Building the app is the studying.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
            title="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Setup section */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Setup</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {SETUP_STEPS.map((step, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{step.title}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">{step.desc}</span>
                  </div>
                </div>
              ))
            }
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground">
            Full setup guide with Azure resource creation:{" "}
            <a href="https://github.com/VillePajala/AI-102-complete/blob/main/docs/labs/README.md" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60">
              docs/labs/README.md
            </a>
          </p>
        </div>

        {/* Workflow section */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Workflow</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="size-3.5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{step.title}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">{step.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Difficulty Tiers section */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Difficulty Tiers</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Each lab has three tiers. Use the tier selector on any module page to choose your depth.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                C
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Core</span>
                <span className="text-xs leading-relaxed text-muted-foreground">Essential hands-on implementation. Covers the skills tested on the AI-102 exam. Enough to pass.</span>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400">
                A
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Advanced</span>
                <span className="text-xs leading-relaxed text-muted-foreground">Production patterns and deeper service features — vector search, streaming, function calling, custom models.</span>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-xs font-bold text-red-600 dark:text-red-400">
                E
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Expert</span>
                <span className="text-xs leading-relaxed text-muted-foreground">Exam-edge architecture, authentication, governance, and troubleshooting. Conceptual deep-dives with self-check questions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/40">
          <Link
            href="/generative"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start GenAI Lab
            <ChevronRight className="size-3.5" />
          </Link>
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Don&apos;t show again
          </button>
        </div>
      </div>
    </section>
  )
}

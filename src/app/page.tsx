"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/* Left-bar accent per module -- a single strong color for the vertical bar + icon */
const accent: Record<string, { bar: string; icon: string; bg: string }> = {
  foundry:          { bar: "bg-indigo-500",  icon: "text-indigo-500 dark:text-indigo-400",  bg: "bg-indigo-500/10" },
  generative:       { bar: "bg-sky-500",     icon: "text-sky-500 dark:text-sky-400",        bg: "bg-sky-500/10" },
  rag:              { bar: "bg-slate-400",   icon: "text-slate-500 dark:text-slate-400",    bg: "bg-slate-500/10" },
  agents:           { bar: "bg-violet-500",  icon: "text-violet-500 dark:text-violet-400",  bg: "bg-violet-500/10" },
  vision:           { bar: "bg-blue-500",    icon: "text-blue-500 dark:text-blue-400",      bg: "bg-blue-500/10" },
  language:         { bar: "bg-zinc-400",    icon: "text-zinc-500 dark:text-zinc-400",      bg: "bg-zinc-500/10" },
  search:           { bar: "bg-indigo-400",  icon: "text-indigo-400 dark:text-indigo-300",  bg: "bg-indigo-400/10" },
  "responsible-ai": { bar: "bg-slate-500",   icon: "text-slate-600 dark:text-slate-300",    bg: "bg-slate-500/10" },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()
  const circ = 2 * Math.PI * 58
  const completedCount = labModules.filter(m => getModuleStatus(m.id) === "completed").length
  const activeCount = labModules.filter(m => getModuleStatus(m.id) === "in-progress").length

  return (
    <div className="flex flex-col gap-8">

      {/* ── HERO ── */}
      <section className="glass relative overflow-hidden rounded-3xl border border-border bg-card">
        {/* Vivid background glow orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.28_275/0.25)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.42_0.25_275/0.40)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.60_0.20_200/0.18)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.35_0.18_200/0.30)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute right-1/4 top-0 size-64 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.18_330/0.12)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,oklch(0.40_0.16_330/0.20)_0%,transparent_60%)]" />

        <div className="relative flex flex-col gap-10 p-8 md:p-12">
          {/* Top row: copy + gauge */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit rounded-full bg-primary/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary ring-1 ring-primary/20">
                AI-102 &middot; Azure AI Engineer
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground text-balance md:text-5xl leading-[1.05]">
                Command Center
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                Your mission control for exam readiness. Track modules, domains, and overall progress.
              </p>
            </div>

            {/* Readiness gauge */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="relative flex size-44 items-center justify-center md:size-48">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="58" fill="none" strokeWidth="4" className="stroke-secondary" />
                  <circle
                    cx="64" cy="64" r="58" fill="none"
                    strokeWidth="5" strokeLinecap="round"
                    className="stroke-primary"
                    style={{
                      strokeDasharray: circ,
                      strokeDashoffset: circ * (1 - overallReadiness / 100),
                      transition: "stroke-dashoffset 0.8s ease-out",
                      filter: "drop-shadow(0 0 8px oklch(0.72 0.22 275 / 0.5))",
                    }}
                  />
                </svg>
                <div className="relative flex flex-col items-center">
                  <span className="text-6xl font-black tabular-nums text-foreground tracking-tighter md:text-7xl">
                    {overallReadiness}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground -mt-1">percent</span>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80">Exam Readiness</span>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            <div className="glass flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <span className="text-2xl font-black tabular-nums text-foreground">{labModules.length}</span>
              <span className="text-xs text-muted-foreground leading-tight">Total<br />Labs</span>
            </div>
            <div className="glass flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <span className="text-2xl font-black tabular-nums text-emerald-500">{completedCount}</span>
              <span className="text-xs text-muted-foreground leading-tight">Labs<br />Done</span>
            </div>
            <div className="glass flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <span className="text-2xl font-black tabular-nums text-amber-500">{activeCount}</span>
              <span className="text-xs text-muted-foreground leading-tight">In<br />Progress</span>
            </div>
            <div className="glass flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <span className="text-2xl font-black tabular-nums text-foreground">{examDomains.length}</span>
              <span className="text-xs text-muted-foreground leading-tight">Exam<br />Domains</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section className="glass rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-foreground">Domain Coverage</h2>
          <span className="text-xs text-muted-foreground">{examDomains.length} domains</span>
        </div>

        <div className="flex flex-col gap-4">
          {examDomains.map((d) => {
            const pct = getDomainProgress(d.number)
            return (
              <div key={d.number} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold tabular-nums text-primary">
                      {d.number}
                    </span>
                    <span className="text-sm font-medium text-foreground">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold font-mono tabular-nums text-foreground">{pct}%</span>
                </div>
                <div className="ml-10 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.max(pct, 2)}%`, transition: "width 0.7s ease-out" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-foreground">Lab Modules</h2>
          <span className="text-xs text-muted-foreground">{labModules.length} labs</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            const a = accent[mod.id] || accent.foundry
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div className={cn(
                  "glass relative flex h-full overflow-hidden rounded-2xl border border-border bg-card",
                  "transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                )}>
                  {/* Bold left accent bar */}
                  <div className={cn("w-1.5 shrink-0", a.bar)} />

                  <div className="flex flex-1 items-center gap-4 p-5">
                    {/* Icon */}
                    <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", a.bg)}>
                      <Icon className={cn("size-6", a.icon)} strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground truncate">{mod.name}</h3>
                        <StatusIndicator status={status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 transition-all duration-200 group-hover:text-primary group-hover:translate-x-1" />
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

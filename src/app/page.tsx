"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/*
 * Tonal palette -- all modules use shades from the same slate-indigo family.
 * Differentiation comes from lightness/warmth shifts, not hue variety.
 */
const accent: Record<string, { icon: string; bg: string; strip: string }> = {
  foundry:          { icon: "text-indigo-500 dark:text-indigo-400",  bg: "bg-indigo-500/8 dark:bg-indigo-400/10",  strip: "bg-indigo-500 dark:bg-indigo-400" },
  generative:       { icon: "text-sky-500 dark:text-sky-400",        bg: "bg-sky-500/8 dark:bg-sky-400/10",        strip: "bg-sky-500 dark:bg-sky-400" },
  rag:              { icon: "text-slate-500 dark:text-slate-400",    bg: "bg-slate-500/8 dark:bg-slate-400/10",    strip: "bg-slate-400 dark:bg-slate-500" },
  agents:           { icon: "text-violet-500 dark:text-violet-400",  bg: "bg-violet-500/8 dark:bg-violet-400/10",  strip: "bg-violet-500 dark:bg-violet-400" },
  vision:           { icon: "text-blue-500 dark:text-blue-400",      bg: "bg-blue-500/8 dark:bg-blue-400/10",      strip: "bg-blue-500 dark:bg-blue-400" },
  language:         { icon: "text-zinc-500 dark:text-zinc-400",      bg: "bg-zinc-500/8 dark:bg-zinc-400/10",      strip: "bg-zinc-400 dark:bg-zinc-500" },
  search:           { icon: "text-indigo-400 dark:text-indigo-300",  bg: "bg-indigo-400/8 dark:bg-indigo-300/10",  strip: "bg-indigo-400 dark:bg-indigo-300" },
  "responsible-ai": { icon: "text-slate-600 dark:text-slate-300",    bg: "bg-slate-600/8 dark:bg-slate-300/10",    strip: "bg-slate-500 dark:bg-slate-400" },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()
  const circ = 2 * Math.PI * 54

  return (
    <div className="flex flex-col gap-10">

      {/* ── HERO ── */}
      <section className="glass relative overflow-hidden rounded-3xl border border-border bg-card">
        {/* Background washes */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.58_0.25_275/0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,oklch(0.45_0.22_275/0.28)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.18_200/0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,oklch(0.38_0.16_200/0.22)_0%,transparent_70%)]" />

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          {/* Left: copy */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                AI-102
              </span>
              <span className="h-px flex-1 max-w-16 bg-border" />
              <span className="text-[11px] font-medium text-muted-foreground">Azure AI Engineer</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-balance md:text-4xl leading-[1.1]">
              Command Center
            </h1>
            <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Your mission control for certification readiness. Track progress across all lab modules and exam domains.
            </p>
          </div>

          {/* Right: readiness gauge */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exam Readiness</span>
            <div className="relative flex size-32 items-center justify-center md:size-36">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="5" className="stroke-secondary" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  strokeWidth="6" strokeLinecap="round"
                  className="stroke-primary"
                  style={{
                    strokeDasharray: circ,
                    strokeDashoffset: circ * (1 - overallReadiness / 100),
                    transition: "stroke-dashoffset 0.8s ease-out",
                    filter: "drop-shadow(0 0 6px oklch(0.72 0.20 275 / 0.4))",
                  }}
                />
              </svg>
              <span className="relative text-4xl font-black font-mono tabular-nums text-foreground md:text-5xl">
                {overallReadiness}
                <span className="text-base font-semibold text-muted-foreground">%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section className="glass rounded-2xl border border-border bg-card px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Domain Coverage</h2>
          <span className="text-[10px] font-mono text-muted-foreground/50">{examDomains.length} domains</span>
        </div>

        <div className="flex flex-col gap-3">
          {examDomains.map((d) => {
            const pct = getDomainProgress(d.number)
            return (
              <div key={d.number} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-[11px] font-bold tabular-nums text-muted-foreground/70">{d.number}</span>
                <span className="w-44 shrink-0 truncate text-[12px] text-foreground/70 max-sm:w-20">{d.name}</span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.max(pct, 2)}%`, transition: "width 0.7s ease-out" }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] font-semibold font-mono tabular-nums text-foreground/80">{pct}%</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lab Modules</h2>
          <span className="text-[10px] font-mono text-muted-foreground/50">{labModules.length} labs</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  <div className={cn("h-[3px] w-full", a.strip)} />

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    {/* Icon + status row */}
                    <div className="flex items-start justify-between">
                      <div className={cn("flex size-9 items-center justify-center rounded-lg", a.bg)}>
                        <Icon className={cn("size-[18px]", a.icon)} strokeWidth={1.75} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Title + description */}
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[13px] font-semibold text-foreground leading-snug">{mod.name}</h3>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">{mod.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
                      <span className="text-[10px] font-medium text-muted-foreground/70">D{mod.domainNumber} &middot; {mod.weight}</span>
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

"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/* Simple color map per module -- just an accent color for the icon + left strip */
const accent: Record<string, { icon: string; bg: string; strip: string }> = {
  foundry:          { icon: "text-violet-500 dark:text-violet-400",  bg: "bg-violet-500/10",  strip: "bg-violet-500" },
  generative:       { icon: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", strip: "bg-emerald-500" },
  rag:              { icon: "text-amber-500 dark:text-amber-400",    bg: "bg-amber-500/10",   strip: "bg-amber-500" },
  agents:           { icon: "text-cyan-500 dark:text-cyan-400",      bg: "bg-cyan-500/10",    strip: "bg-cyan-500" },
  vision:           { icon: "text-rose-500 dark:text-rose-400",      bg: "bg-rose-500/10",    strip: "bg-rose-500" },
  language:         { icon: "text-blue-500 dark:text-blue-400",      bg: "bg-blue-500/10",    strip: "bg-blue-500" },
  search:           { icon: "text-teal-500 dark:text-teal-400",      bg: "bg-teal-500/10",    strip: "bg-teal-500" },
  "responsible-ai": { icon: "text-orange-500 dark:text-orange-400",  bg: "bg-orange-500/10",  strip: "bg-orange-500" },
}

const domainAccent: Record<number, { bar: string; text: string; badge: string }> = {
  1: { bar: "bg-violet-500",  text: "text-violet-500 dark:text-violet-400",  badge: "bg-violet-500/12 text-violet-600 dark:text-violet-300" },
  2: { bar: "bg-emerald-500", text: "text-emerald-500 dark:text-emerald-400", badge: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300" },
  3: { bar: "bg-cyan-500",    text: "text-cyan-500 dark:text-cyan-400",       badge: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300" },
  4: { bar: "bg-rose-500",    text: "text-rose-500 dark:text-rose-400",       badge: "bg-rose-500/12 text-rose-600 dark:text-rose-300" },
  5: { bar: "bg-blue-500",    text: "text-blue-500 dark:text-blue-400",       badge: "bg-blue-500/12 text-blue-600 dark:text-blue-300" },
  6: { bar: "bg-teal-500",    text: "text-teal-500 dark:text-teal-400",       badge: "bg-teal-500/12 text-teal-600 dark:text-teal-300" },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()
  const circ = 2 * Math.PI * 58

  return (
    <div className="flex flex-col gap-10">

      {/* ── HERO ── */}
      <div className="glass relative overflow-hidden rounded-3xl border border-border bg-card">
        {/* Soft color washes behind glass */}
        <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-[radial-gradient(circle,oklch(0.60_0.24_280/0.20)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,oklch(0.45_0.22_280/0.30)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.18_175/0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,oklch(0.40_0.18_175/0.25)_0%,transparent_70%)]" />

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Microsoft AI-102
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground text-balance md:text-5xl leading-[1.1]">
              Command Center
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Your mission control for the Azure AI Engineer Associate certification.
            </p>
          </div>

          {/* Readiness gauge */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="relative flex size-36 items-center justify-center md:size-40">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" fill="none" strokeWidth="4" className="stroke-border" />
                <circle
                  cx="64" cy="64" r="58" fill="none"
                  strokeWidth="5" strokeLinecap="round"
                  className="stroke-primary"
                  style={{
                    strokeDasharray: circ,
                    strokeDashoffset: circ * (1 - overallReadiness / 100),
                    transition: "stroke-dashoffset 0.8s ease-out",
                    filter: "drop-shadow(0 0 4px var(--primary))",
                  }}
                />
              </svg>
              <div className="relative flex flex-col items-center">
                <span className="text-5xl font-black font-mono tabular-nums text-foreground md:text-6xl">{overallReadiness}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground -mt-0.5">percent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DOMAINS ── */}
      <section className="glass flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Exam Domains</h2>
          <span className="text-xs font-mono text-muted-foreground/60">{examDomains.length} domains</span>
        </div>

        <div className="flex flex-col gap-5">
          {examDomains.map((d) => {
            const pct = getDomainProgress(d.number)
            const c = domainAccent[d.number] || domainAccent[1]
            return (
              <div key={d.number} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums", c.badge)}>
                      {d.number}
                    </span>
                    <span className="truncate text-[13px] font-medium text-foreground">{d.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground">{d.weight}</span>
                    <span className={cn("min-w-[3ch] text-right text-sm font-bold font-mono tabular-nums", c.text)}>{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${Math.max(pct, 3)}%`, transition: "width 0.7s ease-out" }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lab Modules</h2>
          <span className="text-xs font-mono text-muted-foreground/60">{labModules.length} labs</span>
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
                  "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5",
                )}>
                  {/* Colored top strip */}
                  <div className={cn("h-1 w-full", a.strip)} />

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("flex size-9 items-center justify-center rounded-lg", a.bg)}>
                        <Icon className={cn("size-[18px]", a.icon)} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-foreground">{mod.name}</h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground">{mod.description}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-[10px] font-medium text-muted-foreground">D{mod.domainNumber} &middot; {mod.weight}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground/40 transition-colors group-hover:text-primary" />
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

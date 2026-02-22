"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/* Accent per module — tonal palette */
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
  const { getModuleStatus, getModuleProgress, getDomainProgress, overallReadiness } = useModuleProgress()

  const completedCount = labModules.filter(m => getModuleStatus(m.id) === "completed").length
  const activeCount = labModules.filter(m => getModuleStatus(m.id) === "in-progress").length
  const labCompletionPct = Math.round((completedCount / labModules.length) * 100)

  /* SVG gauge math — dual rings */
  const outerR = 62
  const innerR = 50
  const outerCirc = 2 * Math.PI * outerR
  const innerCirc = 2 * Math.PI * innerR

  /* Group modules by domain */
  const domainGroups = examDomains.map(d => ({
    ...d,
    modules: labModules.filter(m => m.domainNumber === d.number),
    progress: getDomainProgress(d.number),
  }))

  return (
    <div className="flex flex-col gap-10">

      {/* ── HERO ── */}
      <section className="animate-fade-up glass relative overflow-hidden rounded-3xl border border-border bg-card">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.28_275/0.25)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.42_0.25_275/0.40)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.60_0.20_200/0.18)_0%,transparent_65%)] dark:bg-[radial-gradient(circle,oklch(0.35_0.18_200/0.30)_0%,transparent_65%)]" />

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          {/* Left: copy */}
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit rounded-full bg-primary/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary ring-1 ring-primary/20">
              AI-102
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground text-balance md:text-5xl leading-[1.05]">
              Command Center
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Track your journey to Azure AI Engineer certification.
            </p>

            {/* Stat strip — integrated, not separate floaters */}
            <div className="mt-2 flex items-center gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-2xl font-black tabular-nums text-foreground">{completedCount}<span className="text-base font-normal text-muted-foreground">/{labModules.length}</span></span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Labs done</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tabular-nums text-amber-500 dark:text-amber-400">{activeCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">In progress</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tabular-nums text-foreground">{examDomains.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Domains</span>
              </div>
            </div>
          </div>

          {/* Right: dual-ring gauge */}
          <div className="flex shrink-0 flex-col items-center gap-4">
            <div className="relative flex size-48 items-center justify-center md:size-52">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                {/* Outer ring track */}
                <circle cx="70" cy="70" r={outerR} fill="none" strokeWidth="6" className="stroke-secondary" />
                {/* Outer ring — overall readiness */}
                <circle
                  cx="70" cy="70" r={outerR} fill="none"
                  strokeWidth="7" strokeLinecap="round"
                  className="stroke-primary"
                  style={{
                    strokeDasharray: outerCirc,
                    strokeDashoffset: outerCirc * (1 - overallReadiness / 100),
                    transition: "stroke-dashoffset 1s ease-out",
                    filter: "drop-shadow(0 0 6px oklch(0.72 0.22 275 / 0.4))",
                  }}
                />
                {/* Inner ring track */}
                <circle cx="70" cy="70" r={innerR} fill="none" strokeWidth="4" className="stroke-secondary" />
                {/* Inner ring — lab completion */}
                <circle
                  cx="70" cy="70" r={innerR} fill="none"
                  strokeWidth="5" strokeLinecap="round"
                  className="stroke-indigo-400 dark:stroke-indigo-300"
                  style={{
                    strokeDasharray: innerCirc,
                    strokeDashoffset: innerCirc * (1 - labCompletionPct / 100),
                    transition: "stroke-dashoffset 1s ease-out 0.2s",
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

            {/* Gauge legend */}
            <div className="flex items-center gap-5 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-primary" />
                <span>Readiness</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-indigo-400 dark:bg-indigo-300" />
                <span>Lab Completion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAINS WITH THEIR MODULES ── */}
      <section className="flex flex-col gap-8">
        <h2 className="animate-fade-up text-lg font-bold text-foreground" style={{ animationDelay: "100ms" }}>
          Domains & Modules
        </h2>

        <div className="flex flex-col gap-6 stagger">
          {domainGroups.map((domain) => (
            <div key={domain.number} className="animate-fade-up flex flex-col gap-4">
              {/* Domain header bar */}
              <div className="glass flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-black tabular-nums text-primary">
                  {domain.number}
                </span>
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-foreground truncate">{domain.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{domain.weight}</span>
                      <span className="text-base font-bold font-mono tabular-nums text-foreground">{domain.progress}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.max(domain.progress, 2)}%`, transition: "width 0.8s ease-out" }}
                    />
                  </div>
                </div>
              </div>

              {/* Module cards for this domain */}
              {domain.modules.length > 0 && (
                <div className="grid gap-3 pl-4 sm:grid-cols-2 sm:pl-6">
                  {domain.modules.map((mod) => {
                    const Icon = mod.icon
                    const status = getModuleStatus(mod.id)
                    const modPct = getModuleProgress(mod.id)
                    const a = accent[mod.id] || accent.foundry
                    const isCompleted = status === "completed"
                    const isActive = status === "in-progress"

                    return (
                      <Link key={mod.id} href={mod.href} className="group">
                        <div className={cn(
                          "glass relative flex overflow-hidden rounded-xl border bg-card",
                          "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
                          isCompleted && "border-emerald-500/20 hover:border-emerald-500/40",
                          isActive && "border-amber-500/20 hover:border-amber-500/40",
                          !isCompleted && !isActive && "border-border hover:border-primary/30",
                        )}>
                          {/* Left accent bar */}
                          <div className={cn("w-1.5 shrink-0", isCompleted ? "bg-emerald-500" : isActive ? "bg-amber-500" : a.bar)} />

                          <div className="flex flex-1 items-center gap-4 p-4">
                            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", a.bg)}>
                              <Icon className={cn("size-5", a.icon)} strokeWidth={1.5} />
                            </div>

                            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-foreground truncate">{mod.name}</h3>
                                <StatusIndicator status={status} />
                              </div>
                              {/* Mini progress bar inside each card */}
                              <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    isCompleted ? "bg-emerald-500" : isActive ? "bg-amber-500" : "bg-muted-foreground/20",
                                  )}
                                  style={{ width: `${Math.max(modPct, 2)}%`, transition: "width 0.5s ease-out" }}
                                />
                              </div>
                            </div>

                            <ArrowRight className="size-4 shrink-0 text-muted-foreground/20 transition-all duration-200 group-hover:text-primary group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

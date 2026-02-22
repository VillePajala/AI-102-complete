"use client"

import Link from "next/link"
import { ArrowUpRight, Zap } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/*
  Each module gets a unique accent color for its card strip and icon tint.
  Colors are theme-aware via Tailwind dark: variant.
*/
const moduleAccents: Record<string, {
  strip: string
  iconBg: string
  iconText: string
  hoverBorder: string
}> = {
  foundry: {
    strip: "bg-violet-500",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
    iconText: "text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-500/40",
  },
  generative: {
    strip: "bg-emerald-500",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    iconText: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-500/40",
  },
  rag: {
    strip: "bg-amber-500",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    iconText: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-500/40",
  },
  agents: {
    strip: "bg-cyan-500",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    iconText: "text-cyan-600 dark:text-cyan-400",
    hoverBorder: "hover:border-cyan-500/40",
  },
  vision: {
    strip: "bg-rose-500",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    iconText: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-500/40",
  },
  language: {
    strip: "bg-blue-500",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconText: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-500/40",
  },
  search: {
    strip: "bg-teal-500",
    iconBg: "bg-teal-500/10 dark:bg-teal-500/15",
    iconText: "text-teal-600 dark:text-teal-400",
    hoverBorder: "hover:border-teal-500/40",
  },
  "responsible-ai": {
    strip: "bg-orange-500",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
    iconText: "text-orange-600 dark:text-orange-400",
    hoverBorder: "hover:border-orange-500/40",
  },
}

const domainAccents: Record<number, {
  bar: string
  text: string
  bg: string
}> = {
  1: { bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/8 dark:bg-violet-500/10" },
  2: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10" },
  3: { bar: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/8 dark:bg-cyan-500/10" },
  4: { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/8 dark:bg-rose-500/10" },
  5: { bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/8 dark:bg-blue-500/10" },
  6: { bar: "bg-teal-500", text: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/8 dark:bg-teal-500/10" },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()
  const circ = 2 * Math.PI * 54

  return (
    <div className="flex flex-col gap-12">

      {/* ───── HERO ───── */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

        {/* Left column: heading + stats */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-4 text-primary" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                AI-102 Exam Prep
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              Command Center
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Track your progress across all exam domains, practice with Azure AI services, and build confidence before exam day.
            </p>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-3">
            <StatPill label="Modules" value={String(labModules.length)} />
            <StatPill label="Domains" value={String(examDomains.length)} />
            <StatPill label="Ready" value={`${overallReadiness}%`} accent />
          </div>
        </div>

        {/* Right column: readiness ring */}
        <div className="flex shrink-0 items-center justify-center md:justify-end">
          <div className="relative flex size-40 items-center justify-center md:size-44">
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" strokeWidth="4" className="stroke-border" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                strokeWidth="5" strokeLinecap="round"
                className="stroke-primary"
                style={{
                  strokeDasharray: circ,
                  strokeDashoffset: circ * (1 - overallReadiness / 100),
                  transition: "stroke-dashoffset 0.8s ease-out",
                }}
              />
            </svg>
            <div className="relative flex flex-col items-center gap-0.5">
              <span className="text-4xl font-bold font-mono tabular-nums text-foreground">
                {overallReadiness}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                percent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── DOMAINS ───── */}
      <section className="flex flex-col gap-4">
        <SectionHeading>Domain Coverage</SectionHeading>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examDomains.map((d) => {
            const pct = getDomainProgress(d.number)
            const accent = domainAccents[d.number] || domainAccents[1]
            return (
              <div
                key={d.number}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex size-6 items-center justify-center rounded-md text-[11px] font-bold",
                        accent.bg, accent.text
                      )}>
                        {d.number}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {d.weight}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground leading-snug truncate">
                      {d.name}
                    </span>
                  </div>
                  <span className={cn("text-2xl font-bold font-mono tabular-nums", accent.text)}>
                    {pct}<span className="text-sm text-muted-foreground">%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", accent.bar)}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ───── MODULES ───── */}
      <section className="flex flex-col gap-4">
        <SectionHeading>Lab Modules</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            const accent = moduleAccents[mod.id] || moduleAccents.foundry
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
                  accent.hoverBorder,
                  "hover:shadow-lg dark:hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
                )}>
                  {/* Color strip at top */}
                  <div className={cn("h-1 w-full", accent.strip)} />

                  <div className="flex flex-1 flex-col gap-4 p-5">
                    {/* Icon + status */}
                    <div className="flex items-start justify-between">
                      <div className={cn("flex size-10 items-center justify-center rounded-xl", accent.iconBg)}>
                        <Icon className={cn("size-5", accent.iconText)} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Copy */}
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-foreground">{mod.name}</h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">{mod.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Domain {mod.domainNumber}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground transition-colors duration-200 group-hover:text-primary">
                        <span className="text-[10px] font-medium">{mod.weight}</span>
                        <ArrowUpRight className="size-3" />
                      </div>
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

/* ── Reusable sub-components ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg border px-3 py-1.5",
      accent
        ? "border-primary/25 bg-primary/5"
        : "border-border bg-card"
    )}>
      <span className={cn(
        "text-sm font-bold font-mono tabular-nums",
        accent ? "text-primary" : "text-foreground"
      )}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

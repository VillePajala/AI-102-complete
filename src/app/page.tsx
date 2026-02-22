"use client"

import Link from "next/link"
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/* Domain bar colors */
const domainBarColors: Record<number, string> = {
  1: "from-chart-1/80 to-chart-1",
  2: "from-chart-2/80 to-chart-2",
  3: "from-chart-4/80 to-chart-4",
  4: "from-chart-5/80 to-chart-5",
  5: "from-chart-3/80 to-chart-3",
  6: "from-chart-1/80 to-chart-1",
}

const domainDotColors: Record<number, string> = {
  1: "bg-chart-1", 2: "bg-chart-2", 3: "bg-chart-4",
  4: "bg-chart-5", 5: "bg-chart-3", 6: "bg-chart-1",
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  return (
    <div className="flex flex-col gap-10">
      {/* ===== HERO ===== */}
      <section className="noise relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-primary/[0.07] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-60 rounded-full bg-chart-2/[0.06] blur-[80px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 size-40 rounded-full bg-chart-5/[0.04] blur-[60px]" />

        {/* Dot grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-60" />

        <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          {/* Left content */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25 animate-float">
                <Zap className="size-4 text-primary" />
              </div>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/[0.06] text-[10px] font-mono text-primary"
              >
                AI Engineer Associate
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              AI-102 Command Center
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Track your progress across all exam domains, practice with real Azure AI
              services, and build the confidence you need to pass.
            </p>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Target className="size-3.5 text-chart-2" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{labModules.length}</span> modules
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-3.5 text-chart-3" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{examDomains.length}</span> domains
                </span>
              </div>
            </div>
          </div>

          {/* Readiness ring */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex size-36 items-center justify-center md:size-40">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-primary/[0.06] blur-xl animate-glow-pulse" />

              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                {/* Track */}
                <circle
                  cx="70" cy="70" r="58" fill="none"
                  strokeWidth="4"
                  className="stroke-border"
                />
                {/* Progress arc */}
                <circle
                  cx="70" cy="70" r="58" fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="stroke-primary drop-shadow-[0_0_6px_var(--primary)] transition-all duration-1000 ease-out"
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={`${2 * Math.PI * 58 * (1 - overallReadiness / 100)}`}
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
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">
              Overall Readiness
            </span>
          </div>
        </div>
      </section>

      {/* ===== DOMAIN COVERAGE ===== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Domain Coverage</h2>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
            Exam Weight
          </span>
        </div>

        <div className="noise relative overflow-hidden rounded-xl border border-border bg-card p-6">
          <div className="relative flex flex-col gap-4">
            {examDomains.map((d) => {
              const progress = getDomainProgress(d.number)
              const gradient = domainBarColors[d.number] || "from-primary/80 to-primary"
              const dotColor = domainDotColors[d.number] || "bg-primary"
              return (
                <div key={d.number} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-2 rounded-full", dotColor)} />
                      <span className="text-xs font-medium text-foreground/80 truncate max-w-[320px]">
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold tabular-nums text-foreground">
                        {progress}%
                      </span>
                      <span className="w-14 text-right text-[10px] tabular-nums text-muted-foreground/50">
                        {d.weight}
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} relative overflow-hidden transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.max(progress, 1)}%` }}
                    >
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== MODULE CARDS ===== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lab Modules</h2>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            {labModules.length} modules
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div className="noise relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/[0.04] hover:-translate-y-0.5">
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06]" />

                  <div className="relative flex flex-col gap-3.5">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-surface ring-1 ring-border transition-colors group-hover:ring-primary/20">
                        <Icon className={cn("size-4 transition-colors", mod.color, "group-hover:text-primary")} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Title + description */}
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        {mod.name}
                      </h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                        {mod.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] tabular-nums text-muted-foreground/50">
                        Domain {mod.domainNumber} / {mod.weight}
                      </span>
                      <ArrowRight className="size-3.5 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
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

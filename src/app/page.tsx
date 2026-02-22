"use client"

import Link from "next/link"
import { ArrowRight, Zap, Hexagon, Activity } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

const domainColors: Record<number, string> = {
  1: "from-chart-1 to-chart-1/60",
  2: "from-chart-2 to-chart-2/60",
  3: "from-chart-4 to-chart-4/60",
  4: "from-chart-5 to-chart-5/60",
  5: "from-chart-3 to-chart-3/60",
  6: "from-chart-1 to-chart-2/60",
}
const domainGlows: Record<number, string> = {
  1: "shadow-chart-1/30",
  2: "shadow-chart-2/30",
  3: "shadow-chart-4/30",
  4: "shadow-chart-5/30",
  5: "shadow-chart-3/30",
  6: "shadow-chart-1/30",
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  const circumference = 2 * Math.PI * 62
  const dashOffset = circumference * (1 - overallReadiness / 100)

  return (
    <div className="flex flex-col gap-10">
      {/* ===== HERO BANNER ===== */}
      <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Animated gradient mesh */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 size-96 rounded-full bg-primary/20 blur-[100px] animate-glow-pulse" />
          <div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-chart-5/15 blur-[100px] animate-glow-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute left-1/2 top-0 size-64 rounded-full bg-chart-2/10 blur-[80px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

        {/* Decorative spinning hexagon */}
        <div className="pointer-events-none absolute right-12 top-8 opacity-[0.04]">
          <Hexagon className="size-48 animate-spin-slow" strokeWidth={0.5} />
        </div>

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="flex flex-col gap-5">
            {/* Label */}
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 animate-float">
                <Zap className="size-5 text-primary" />
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-glow-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  AI-102
                </span>
                <span className="rounded-full border border-border bg-surface/50 px-3 py-0.5 text-[10px] font-mono text-muted-foreground">
                  Engineer Associate
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
                Command{" "}
                <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-5 bg-clip-text text-transparent animate-gradient-x">
                  Center
                </span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Track every exam domain, practice with real Azure AI services,
                and build unstoppable confidence.
              </p>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5">
                <Activity className="size-3.5 text-chart-2" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{labModules.length}</span> modules
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5">
                <Hexagon className="size-3.5 text-chart-5" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{examDomains.length}</span> domains
                </span>
              </div>
            </div>
          </div>

          {/* Giant readiness gauge */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex size-44 items-center justify-center md:size-48">
              {/* Outer pulse ring */}
              <div className="absolute inset-[-8px] rounded-full border border-primary/10 animate-pulse-ring" />
              <div className="absolute inset-[-16px] rounded-full border border-primary/5 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />

              {/* Glow behind ring */}
              <div className="absolute inset-0 rounded-full bg-primary/[0.08] blur-2xl" />

              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                {/* Track ring */}
                <circle
                  cx="70" cy="70" r="62" fill="none"
                  strokeWidth="3" className="stroke-border/50"
                />
                {/* Faint secondary track */}
                <circle
                  cx="70" cy="70" r="56" fill="none"
                  strokeWidth="1" className="stroke-border/20"
                />
                {/* Main progress arc */}
                <circle
                  cx="70" cy="70" r="62" fill="none"
                  strokeWidth="4" strokeLinecap="round"
                  className="stroke-primary transition-all duration-1000 ease-out"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                    filter: "drop-shadow(0 0 8px var(--primary))",
                  }}
                />
              </svg>

              <div className="relative flex flex-col items-center">
                <span className="text-5xl font-bold font-mono tabular-nums text-foreground md:text-6xl">
                  {overallReadiness}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  percent ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DOMAIN COVERAGE ===== */}
      <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Domain Coverage
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examDomains.map((d, i) => {
            const progress = getDomainProgress(d.number)
            const gradient = domainColors[d.number] || "from-primary to-primary/60"
            const glow = domainGlows[d.number] || "shadow-primary/30"
            return (
              <div
                key={d.number}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20",
                  `stagger-${i + 1}`
                )}
              >
                {/* Top accent line */}
                <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${gradient}`} />

                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Domain {d.number}
                    </span>
                    <span className="text-xs font-medium leading-snug text-foreground/90">
                      {d.name}
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {progress}
                    <span className="text-sm text-muted-foreground">%</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out relative overflow-hidden",
                      gradient,
                      progress > 0 && `shadow-sm ${glow}`
                    )}
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  >
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {d.weight}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== MODULE CARDS ===== */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Lab Modules
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod, i) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            return (
              <Link key={mod.id} href={mod.href} className={`group stagger-${i + 1}`}>
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1">
                  {/* Hover gradient reveal */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-chart-5/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-primary/[0.04] group-hover:to-chart-5/[0.03]" />

                  {/* Top color bar */}
                  <div className={cn("h-[2px] w-full transition-all duration-300", mod.color.replace("text-", "bg-"), "opacity-40 group-hover:opacity-100")} />

                  <div className="relative flex flex-1 flex-col gap-4 p-5">
                    {/* Icon + status row */}
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <div className={cn("flex size-11 items-center justify-center rounded-xl border border-border bg-surface transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary/[0.06]")}>
                          <Icon className={cn("size-5 transition-all duration-300", mod.color, "group-hover:text-primary group-hover:scale-110")} />
                        </div>
                        {/* Icon glow on hover */}
                        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Title + description */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-bold tracking-tight text-foreground">{mod.name}</h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">{mod.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[10px] font-mono text-muted-foreground/40">
                        D{mod.domainNumber} / {mod.weight}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/40 transition-all duration-300 group-hover:text-primary group-hover:gap-2">
                        <span className="hidden group-hover:inline">Open</span>
                        <ArrowRight className="size-3" />
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

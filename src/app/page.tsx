"use client"

import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"

/* Color map for domain bars */
const domainColors: Record<number, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-4",
  4: "bg-chart-5",
  5: "bg-chart-3",
  6: "bg-chart-1",
}

/* Map module color classes to border-left accent classes */
const colorToBorder: Record<string, string> = {
  "text-chart-1": "border-l-chart-1",
  "text-chart-2": "border-l-chart-2",
  "text-chart-3": "border-l-chart-3",
  "text-chart-4": "border-l-chart-4",
  "text-chart-5": "border-l-chart-5",
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-warm/8 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                <Zap className="size-4 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border">
                AI Engineer Associate
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              AI-102 Command Center
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Hands-on lab and study tracker for the Microsoft AI-102 certification exam.
              Track your progress, practice with real Azure AI services, and build confidence.
            </p>
          </div>

          {/* Readiness ring */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex size-28 items-center justify-center">
              {/* Background circle */}
              <svg className="absolute inset-0 size-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" strokeWidth="6" className="stroke-muted/40" />
                <circle
                  cx="56" cy="56" r="48" fill="none" strokeWidth="6"
                  strokeLinecap="round"
                  className="stroke-primary transition-all duration-700 ease-out"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallReadiness / 100)}`}
                />
              </svg>
              <div className="relative flex flex-col items-center">
                <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                  {overallReadiness}%
                </span>
              </div>
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Readiness
            </span>
          </div>
        </div>
      </div>

      {/* Domain Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Domain Coverage</CardTitle>
          <CardDescription className="text-xs">Exam weight breakdown per domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {examDomains.map((d) => {
              const progress = getDomainProgress(d.number)
              const barColor = domainColors[d.number] || "bg-primary"
              return (
                <div key={d.number} className="group flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded text-[10px] font-bold text-muted-foreground bg-muted/60 tabular-nums">
                        {d.number}
                      </span>
                      <span className="text-xs text-foreground/80 font-medium truncate max-w-[280px]">
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono tabular-nums text-foreground">
                        {progress}%
                      </span>
                      <span className="rounded-sm bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                        {d.weight}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
                    <div
                      className={`h-full rounded-full ${barColor} relative overflow-hidden transition-all duration-700 ease-out`}
                      style={{ width: `${Math.max(progress, 2)}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Module grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lab Modules</h2>
          <span className="text-[11px] text-muted-foreground">
            {labModules.length} modules
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            const borderClass = colorToBorder[mod.color] || "border-l-primary"
            return (
              <Link key={mod.id} href={mod.href}>
                <Card
                  className={`group h-full border-l-[3px] ${borderClass} transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10">
                        <Icon className={`size-4.5 ${mod.color} transition-colors group-hover:text-primary`} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>
                    <CardTitle className="text-sm font-semibold tracking-tight">{mod.name}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] bg-muted/50 text-muted-foreground">
                        Domain {mod.domainNumber} &middot; {mod.weight}
                      </Badge>
                      <ArrowRight className="size-3.5 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

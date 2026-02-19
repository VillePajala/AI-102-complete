"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          AI-102 Command Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Hands-on lab and study tracker for the Microsoft AI-102 AI Engineer Associate exam
        </p>
      </div>

      {/* Readiness overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Overall Readiness</CardDescription>
            <CardTitle className="text-3xl font-mono">{overallReadiness}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallReadiness} className="h-2" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Domain Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {examDomains.map((d) => {
                const progress = getDomainProgress(d.number)
                return (
                  <div key={d.number} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-muted-foreground font-mono">
                      D{d.number}
                    </span>
                    <div className="flex-1">
                      <Progress value={progress} className="h-1.5" />
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground font-mono tabular-nums">
                      {progress}%
                    </span>
                    <span className="w-14 text-right text-[10px] text-muted-foreground">
                      {d.weight}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Lab Modules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            return (
              <Link key={mod.id} href={mod.href}>
                <Card className="group h-full transition-colors hover:border-primary/30 hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                        <Icon className={`size-4 ${mod.color}`} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>
                    <CardTitle className="text-sm">{mod.name}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">
                        Domain {mod.domainNumber} &middot; {mod.weight}
                      </Badge>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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

"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/*
  Each module card gets a unique inner glow color -- a radial gradient positioned
  at the top-right that shines THROUGH the frosted glass surface.
  The glass card has bg-card (which is semi-transparent), so the glow is visible.
*/
const moduleGlow: Record<string, string> = {
  foundry:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.65_0.25_280/0.25)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.50_0.25_280/0.35)_0%,transparent_60%)]",
  generative:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.70_0.20_160/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.45_0.20_160/0.35)_0%,transparent_60%)]",
  rag:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.78_0.17_60/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.55_0.17_60/0.35)_0%,transparent_60%)]",
  agents:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.72_0.18_200/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.48_0.18_200/0.35)_0%,transparent_60%)]",
  vision:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.68_0.22_340/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.48_0.22_340/0.35)_0%,transparent_60%)]",
  language:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.62_0.24_250/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.45_0.24_250/0.35)_0%,transparent_60%)]",
  search:
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.68_0.18_175/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.45_0.18_175/0.35)_0%,transparent_60%)]",
  "responsible-ai":
    "before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.74_0.17_30/0.22)_0%,transparent_60%)] dark:before:bg-[radial-gradient(circle_at_100%_0%,oklch(0.52_0.17_30/0.35)_0%,transparent_60%)]",
}

const moduleIconColor: Record<string, string> = {
  foundry: "text-violet-500",
  generative: "text-emerald-500",
  rag: "text-amber-500",
  agents: "text-cyan-500",
  vision: "text-rose-500",
  language: "text-blue-500",
  search: "text-teal-500",
  "responsible-ai": "text-orange-500",
}

const moduleIconBg: Record<string, string> = {
  foundry: "bg-violet-500/15 dark:bg-violet-500/20",
  generative: "bg-emerald-500/15 dark:bg-emerald-500/20",
  rag: "bg-amber-500/15 dark:bg-amber-500/20",
  agents: "bg-cyan-500/15 dark:bg-cyan-500/20",
  vision: "bg-rose-500/15 dark:bg-rose-500/20",
  language: "bg-blue-500/15 dark:bg-blue-500/20",
  search: "bg-teal-500/15 dark:bg-teal-500/20",
  "responsible-ai": "bg-orange-500/15 dark:bg-orange-500/20",
}

const domainColors: Record<number, { bar: string; text: string; num: string }> = {
  1: { bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", num: "bg-violet-500/15 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" },
  2: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", num: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
  3: { bar: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", num: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300" },
  4: { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", num: "bg-rose-500/15 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300" },
  5: { bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", num: "bg-blue-500/15 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300" },
  6: { bar: "bg-teal-500", text: "text-teal-600 dark:text-teal-400", num: "bg-teal-500/15 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300" },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()
  const circ = 2 * Math.PI * 62

  return (
    <div className="flex flex-col gap-10">

      {/* ──────────── HERO ──────────── */}
      <div className="glass relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12">
        {/* Inner glow orbs behind glass */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.58_0.25_275/0.30)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,oklch(0.45_0.25_275/0.45)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.20_175/0.20)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,oklch(0.40_0.20_175/0.35)_0%,transparent_70%)]" />

        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Left: text */}
          <div className="flex flex-col gap-4 max-w-lg">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Microsoft AI-102
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance leading-[0.9]">
              Command<br />Center
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground max-w-sm">
              Your mission control for the Azure AI Engineer certification. Track every domain, drill every lab.
            </p>
          </div>

          {/* Right: massive readiness gauge */}
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="relative flex size-44 items-center justify-center md:size-52">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="62" fill="none" strokeWidth="5" className="stroke-border" />
                <circle
                  cx="70" cy="70" r="62" fill="none"
                  strokeWidth="6" strokeLinecap="round"
                  className="stroke-primary"
                  style={{
                    strokeDasharray: circ,
                    strokeDashoffset: circ * (1 - overallReadiness / 100),
                    transition: "stroke-dashoffset 0.8s ease-out",
                    filter: "drop-shadow(0 0 6px var(--primary))",
                  }}
                />
              </svg>
              <div className="relative flex flex-col items-center">
                <span className="text-6xl font-black font-mono tabular-nums text-foreground md:text-7xl">
                  {overallReadiness}
                </span>
                <span className="text-sm font-semibold text-muted-foreground -mt-1">percent</span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Overall Readiness
            </span>
          </div>
        </div>
      </div>

      {/* ──────────── DOMAINS ──────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-foreground">Domains</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examDomains.map((d) => {
            const pct = getDomainProgress(d.number)
            const clr = domainColors[d.number] || domainColors[1]
            return (
              <div key={d.number} className="glass flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
                {/* Top row: domain number + weight */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("flex size-8 items-center justify-center rounded-lg text-sm font-black", clr.num)}>
                      {d.number}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {d.weight}
                    </span>
                  </div>
                  <span className={cn("text-3xl font-black font-mono tabular-nums leading-none", clr.text)}>
                    {pct}<span className="text-base text-muted-foreground">%</span>
                  </span>
                </div>

                {/* Domain name */}
                <p className="text-sm font-semibold text-foreground leading-snug">{d.name}</p>

                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full", clr.bar)}
                    style={{ width: `${Math.max(pct, 3)}%`, transition: "width 0.7s ease-out" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ──────────── MODULES ──────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-foreground">Lab Modules</h2>
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-mono text-muted-foreground">{labModules.length} labs</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            const glow = moduleGlow[mod.id] || ""
            const iconClr = moduleIconColor[mod.id] || "text-primary"
            const iconBg = moduleIconBg[mod.id] || "bg-primary/15"
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div className={cn(
                  "glass relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                  /* The before pseudo-element is the per-card radial glow -- sits behind content via z-0 */
                  "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-2xl before:transition-opacity before:duration-300",
                  glow,
                )}>
                  {/* z-10 ensures all text content renders above the glow layer */}
                  <div className="relative z-10 flex flex-1 flex-col gap-4 p-5">
                    <div className="flex items-start justify-between">
                      <div className={cn("flex size-11 items-center justify-center rounded-xl", iconBg)}>
                        <Icon className={cn("size-5", iconClr)} />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold text-foreground leading-snug">{mod.name}</h3>
                      <p className="text-[13px] leading-relaxed text-foreground/60">{mod.description}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">D{mod.domainNumber}</span>
                        <span className="text-[10px] text-foreground/35 font-mono">{mod.weight}</span>
                      </div>
                      <ArrowUpRight className="size-4 text-foreground/30 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

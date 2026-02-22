"use client"

import Link from "next/link"
import { ArrowRight, Zap, Activity } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/* Each module card gets a unique gradient combo baked in */
const moduleGradients: Record<string, string> = {
  foundry:
    "from-[#2e1065] via-[#1e1b4b] to-[#0c1a3d]",
  generative:
    "from-[#042f2e] via-[#0c2d48] to-[#1a1033]",
  rag:
    "from-[#422006] via-[#27150a] to-[#1c1917]",
  agents:
    "from-[#052e16] via-[#0a2520] to-[#0f172a]",
  vision:
    "from-[#4a044e] via-[#2e1065] to-[#172554]",
  language:
    "from-[#172554] via-[#1e1b4b] to-[#0f172a]",
  search:
    "from-[#134e4a] via-[#0c4a6e] to-[#1e1b4b]",
  "responsible-ai":
    "from-[#451a03] via-[#422006] to-[#1c1917]",
}

/* Bright accent dot color for each module */
const moduleAccents: Record<string, string> = {
  foundry: "bg-violet-500",
  generative: "bg-teal-400",
  rag: "bg-amber-400",
  agents: "bg-emerald-400",
  vision: "bg-fuchsia-400",
  language: "bg-blue-400",
  search: "bg-cyan-400",
  "responsible-ai": "bg-orange-400",
}

/* Bright glow for each module's inner light */
const moduleGlows: Record<string, string> = {
  foundry: "bg-violet-500/30",
  generative: "bg-teal-400/25",
  rag: "bg-amber-400/20",
  agents: "bg-emerald-400/25",
  vision: "bg-fuchsia-500/25",
  language: "bg-blue-400/25",
  search: "bg-cyan-400/25",
  "responsible-ai": "bg-orange-400/20",
}

/* Domain cards get unique top-left radial glows */
const domainGradients: Record<number, string> = {
  1: "from-violet-500/20 via-transparent to-transparent",
  2: "from-teal-500/20 via-transparent to-transparent",
  3: "from-emerald-500/20 via-transparent to-transparent",
  4: "from-fuchsia-500/20 via-transparent to-transparent",
  5: "from-blue-500/20 via-transparent to-transparent",
  6: "from-cyan-500/20 via-transparent to-transparent",
}

const domainBarColors: Record<number, string> = {
  1: "from-violet-500 to-violet-400",
  2: "from-teal-500 to-teal-400",
  3: "from-emerald-500 to-emerald-400",
  4: "from-fuchsia-500 to-fuchsia-400",
  5: "from-blue-500 to-blue-400",
  6: "from-cyan-500 to-cyan-400",
}

const domainDotColors: Record<number, string> = {
  1: "bg-violet-500",
  2: "bg-teal-500",
  3: "bg-emerald-500",
  4: "bg-fuchsia-500",
  5: "bg-blue-500",
  6: "bg-cyan-500",
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  const circumference = 2 * Math.PI * 62
  const dashOffset = circumference * (1 - overallReadiness / 100)

  return (
    <div className="flex flex-col gap-10">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-border">
        {/* Big dramatic radial gradient fill */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#042f2e]" />
        {/* Bright accent orb top-left */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-violet-600/30 blur-[100px]" />
        {/* Bright accent orb bottom-right */}
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-teal-500/20 blur-[80px]" />
        {/* Center warmth */}
        <div className="pointer-events-none absolute left-1/3 top-1/2 size-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <Zap className="size-5 text-violet-400" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-300 backdrop-blur-sm">
                AI-102
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono text-white/50 backdrop-blur-sm">
                Engineer Associate
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl text-balance">
                Command{" "}
                <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent">
                  Center
                </span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-white/50">
                Track every exam domain, practice with real Azure AI services,
                and build unstoppable confidence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <Activity className="size-3.5 text-teal-400" />
                <span className="text-xs text-white/50">
                  <span className="font-bold text-white">{labModules.length}</span> modules
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <div className="size-2 rounded-full bg-fuchsia-400" />
                <span className="text-xs text-white/50">
                  <span className="font-bold text-white">{examDomains.length}</span> domains
                </span>
              </div>
            </div>
          </div>

          {/* Readiness gauge */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex size-44 items-center justify-center md:size-48">
              {/* Glow behind the ring */}
              <div className="absolute inset-[-20px] rounded-full bg-violet-500/15 blur-2xl" />

              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="62" fill="none" strokeWidth="3" className="stroke-white/[0.06]" />
                <circle
                  cx="70" cy="70" r="62" fill="none"
                  strokeWidth="5" strokeLinecap="round"
                  stroke="url(#ring-gradient)"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                    filter: "drop-shadow(0 0 12px rgba(139,92,246,0.5))",
                  }}
                />
                <defs>
                  <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative flex flex-col items-center">
                <span className="text-5xl font-bold font-mono tabular-nums text-white md:text-6xl">
                  {overallReadiness}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-300/80">
                  percent ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DOMAIN COVERAGE ===== */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Domain Coverage
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examDomains.map((d) => {
            const progress = getDomainProgress(d.number)
            const radialGlow = domainGradients[d.number] || "from-primary/20 via-transparent to-transparent"
            const barColor = domainBarColors[d.number] || "from-primary to-primary"
            const dotColor = domainDotColors[d.number] || "bg-primary"
            return (
              <div
                key={d.number}
                className="group relative overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Internal radial gradient glow -- top-left corner light */}
                <div className={cn("pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-radial-[at_30%_30%]", radialGlow)} />

                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-2 rounded-full", dotColor)} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          Domain {d.number}
                        </span>
                        <span className="text-xs font-medium leading-snug text-foreground/90">
                          {d.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                      {progress}
                      <span className="text-sm text-muted-foreground">%</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border/30">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
                      style={{ width: `${Math.max(progress, 2)}%` }}
                    />
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-[10px] font-mono text-muted-foreground/40">{d.weight}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== MODULE CARDS ===== */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Lab Modules
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {labModules.map((mod) => {
            const Icon = mod.icon
            const status = getModuleStatus(mod.id)
            const gradient = moduleGradients[mod.id] || "from-[#1e1b4b] via-[#0f172a] to-[#0c1a3d]"
            const glow = moduleGlows[mod.id] || "bg-violet-500/20"
            const accent = moduleAccents[mod.id] || "bg-violet-500"
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:-translate-y-1">
                  {/* Bold gradient background -- each card is unique */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

                  {/* Internal radial glow orb -- this is what makes it POP */}
                  <div className={cn("pointer-events-none absolute -right-12 -top-12 size-48 rounded-full blur-[60px]", glow)} />
                  <div className={cn("pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full blur-[50px] opacity-50", glow)} />

                  <div className="relative flex flex-1 flex-col gap-4 p-5">
                    {/* Icon + status */}
                    <div className="flex items-start justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <Icon className="size-5 text-white/80" />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Title & description */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-bold tracking-tight text-white">{mod.name}</h3>
                      <p className="text-[12px] leading-relaxed text-white/40 line-clamp-2">{mod.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-1.5 rounded-full", accent)} />
                        <span className="text-[10px] font-mono text-white/25">
                          D{mod.domainNumber} / {mod.weight}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-white/20 transition-all duration-300 group-hover:text-white/70 group-hover:gap-2">
                        <span className="text-[10px] font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">Open</span>
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

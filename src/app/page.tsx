"use client"

import Link from "next/link"
import { ArrowRight, Zap, Activity } from "lucide-react"
import { StatusIndicator } from "@/components/status-indicator"
import { labModules, examDomains } from "@/lib/modules"
import { useModuleProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

/*
  Each module card has a LIGHT gradient and a DARK gradient.
  These are strong, visible, and unique per card -- not tints.
*/
const moduleStyles: Record<
  string,
  { light: string; dark: string; iconBg: string; accentDot: string }
> = {
  foundry: {
    light: "bg-gradient-to-br from-violet-200 via-indigo-100 to-purple-200",
    dark: "dark:bg-gradient-to-br dark:from-violet-950 dark:via-indigo-950 dark:to-purple-950",
    iconBg: "bg-violet-500/15 dark:bg-violet-400/15",
    accentDot: "bg-violet-500",
  },
  generative: {
    light: "bg-gradient-to-br from-teal-200 via-cyan-100 to-emerald-200",
    dark: "dark:bg-gradient-to-br dark:from-teal-950 dark:via-cyan-950 dark:to-emerald-950",
    iconBg: "bg-teal-500/15 dark:bg-teal-400/15",
    accentDot: "bg-teal-500",
  },
  rag: {
    light: "bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-200",
    dark: "dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950",
    iconBg: "bg-amber-500/15 dark:bg-amber-400/15",
    accentDot: "bg-amber-500",
  },
  agents: {
    light: "bg-gradient-to-br from-emerald-200 via-green-100 to-teal-200",
    dark: "dark:bg-gradient-to-br dark:from-emerald-950 dark:via-green-950 dark:to-teal-950",
    iconBg: "bg-emerald-500/15 dark:bg-emerald-400/15",
    accentDot: "bg-emerald-500",
  },
  vision: {
    light: "bg-gradient-to-br from-fuchsia-200 via-pink-100 to-rose-200",
    dark: "dark:bg-gradient-to-br dark:from-fuchsia-950 dark:via-pink-950 dark:to-rose-950",
    iconBg: "bg-fuchsia-500/15 dark:bg-fuchsia-400/15",
    accentDot: "bg-fuchsia-500",
  },
  language: {
    light: "bg-gradient-to-br from-blue-200 via-sky-100 to-indigo-200",
    dark: "dark:bg-gradient-to-br dark:from-blue-950 dark:via-sky-950 dark:to-indigo-950",
    iconBg: "bg-blue-500/15 dark:bg-blue-400/15",
    accentDot: "bg-blue-500",
  },
  search: {
    light: "bg-gradient-to-br from-cyan-200 via-teal-100 to-sky-200",
    dark: "dark:bg-gradient-to-br dark:from-cyan-950 dark:via-teal-950 dark:to-sky-950",
    iconBg: "bg-cyan-500/15 dark:bg-cyan-400/15",
    accentDot: "bg-cyan-500",
  },
  "responsible-ai": {
    light: "bg-gradient-to-br from-orange-200 via-rose-100 to-amber-200",
    dark: "dark:bg-gradient-to-br dark:from-orange-950 dark:via-rose-950 dark:to-amber-950",
    iconBg: "bg-orange-500/15 dark:bg-orange-400/15",
    accentDot: "bg-orange-500",
  },
}

/* Domain card gradients -- each domain has its own light/dark color wash */
const domainStyles: Record<
  number,
  { light: string; dark: string; bar: string; dot: string }
> = {
  1: {
    light: "bg-gradient-to-br from-violet-100 via-card to-indigo-100",
    dark: "dark:bg-gradient-to-br dark:from-violet-950/60 dark:via-card dark:to-indigo-950/40",
    bar: "from-violet-600 to-violet-400 dark:from-violet-500 dark:to-violet-300",
    dot: "bg-violet-500",
  },
  2: {
    light: "bg-gradient-to-br from-teal-100 via-card to-cyan-100",
    dark: "dark:bg-gradient-to-br dark:from-teal-950/60 dark:via-card dark:to-cyan-950/40",
    bar: "from-teal-600 to-teal-400 dark:from-teal-500 dark:to-teal-300",
    dot: "bg-teal-500",
  },
  3: {
    light: "bg-gradient-to-br from-emerald-100 via-card to-green-100",
    dark: "dark:bg-gradient-to-br dark:from-emerald-950/60 dark:via-card dark:to-green-950/40",
    bar: "from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-300",
    dot: "bg-emerald-500",
  },
  4: {
    light: "bg-gradient-to-br from-fuchsia-100 via-card to-pink-100",
    dark: "dark:bg-gradient-to-br dark:from-fuchsia-950/60 dark:via-card dark:to-pink-950/40",
    bar: "from-fuchsia-600 to-fuchsia-400 dark:from-fuchsia-500 dark:to-fuchsia-300",
    dot: "bg-fuchsia-500",
  },
  5: {
    light: "bg-gradient-to-br from-blue-100 via-card to-sky-100",
    dark: "dark:bg-gradient-to-br dark:from-blue-950/60 dark:via-card dark:to-sky-950/40",
    bar: "from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300",
    dot: "bg-blue-500",
  },
  6: {
    light: "bg-gradient-to-br from-cyan-100 via-card to-teal-100",
    dark: "dark:bg-gradient-to-br dark:from-cyan-950/60 dark:via-card dark:to-teal-950/40",
    bar: "from-cyan-600 to-cyan-400 dark:from-cyan-500 dark:to-cyan-300",
    dot: "bg-cyan-500",
  },
}

export default function DashboardPage() {
  const { getModuleStatus, getDomainProgress, overallReadiness } = useModuleProgress()

  const circumference = 2 * Math.PI * 62
  const dashOffset = circumference * (1 - overallReadiness / 100)

  return (
    <div className="flex flex-col gap-10">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-border">
        {/* Hero gradient -- vivid in both themes */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-200 via-indigo-100 to-teal-200 dark:from-indigo-950 dark:via-violet-950 dark:to-teal-950" />
        {/* Big radial glow orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-violet-400/40 blur-[100px] dark:bg-violet-500/25" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-teal-400/30 blur-[80px] dark:bg-teal-400/15" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 size-56 rounded-full bg-fuchsia-400/20 blur-[80px] dark:bg-fuchsia-500/10" />

        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <Zap className="size-5 text-violet-700 dark:text-violet-400" />
              </div>
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-800 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-violet-300">
                AI-102
              </span>
              <span className="rounded-full border border-violet-400/15 bg-violet-500/5 px-3 py-0.5 text-[10px] font-mono text-violet-700/70 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                Engineer Associate
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-violet-950 md:text-5xl text-balance dark:text-white">
                Command{" "}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-teal-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-teal-300">
                  Center
                </span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-violet-900/50 dark:text-white/50">
                Track every exam domain, practice with real Azure AI services,
                and build unstoppable confidence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <Activity className="size-3.5 text-teal-600 dark:text-teal-400" />
                <span className="text-xs text-violet-800/60 dark:text-white/50">
                  <span className="font-bold text-violet-950 dark:text-white">{labModules.length}</span> modules
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <div className="size-2 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400" />
                <span className="text-xs text-violet-800/60 dark:text-white/50">
                  <span className="font-bold text-violet-950 dark:text-white">{examDomains.length}</span> domains
                </span>
              </div>
            </div>
          </div>

          {/* Readiness gauge */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex size-44 items-center justify-center md:size-48">
              <div className="absolute inset-[-20px] rounded-full bg-violet-500/15 blur-2xl dark:bg-violet-500/10" />

              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="62" fill="none" strokeWidth="3" className="stroke-violet-400/10 dark:stroke-white/[0.06]" />
                <circle
                  cx="70" cy="70" r="62" fill="none"
                  strokeWidth="5" strokeLinecap="round"
                  stroke="url(#ring-grad)"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                    filter: "drop-shadow(0 0 10px rgba(139,92,246,0.4))",
                  }}
                />
                <defs>
                  <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative flex flex-col items-center">
                <span className="text-5xl font-bold font-mono tabular-nums text-violet-950 md:text-6xl dark:text-white">
                  {overallReadiness}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-300/80">
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
            const style = domainStyles[d.number] || domainStyles[1]
            return (
              <div
                key={d.number}
                className={cn(
                  "relative overflow-hidden rounded-xl border border-border",
                  style.light,
                  style.dark
                )}
              >
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-2.5 rounded-full", style.dot)} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
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

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", style.bar)}
                      style={{ width: `${Math.max(progress, 3)}%` }}
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
            const style = moduleStyles[mod.id] || moduleStyles.foundry
            return (
              <Link key={mod.id} href={mod.href} className="group">
                <div
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-xl border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                    style.light,
                    style.dark
                  )}
                >
                  {/* Internal radial glow orbs */}
                  <div className={cn("pointer-events-none absolute -right-12 -top-12 size-40 rounded-full blur-[50px]", style.iconBg)} />
                  <div className={cn("pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full blur-[50px] opacity-60", style.iconBg)} />

                  <div className="relative flex flex-1 flex-col gap-4 p-5">
                    {/* Icon + status */}
                    <div className="flex items-start justify-between">
                      <div className={cn("flex size-11 items-center justify-center rounded-xl", style.iconBg)}>
                        <Icon className="size-5 text-foreground/70" />
                      </div>
                      <StatusIndicator status={status} />
                    </div>

                    {/* Title & description */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-bold tracking-tight text-foreground">{mod.name}</h3>
                      <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">{mod.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-foreground/[0.06] pt-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-1.5 rounded-full", style.accentDot)} />
                        <span className="text-[10px] font-mono text-muted-foreground/60">
                          D{mod.domainNumber} / {mod.weight}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground/40 transition-all duration-300 group-hover:text-foreground group-hover:gap-2">
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

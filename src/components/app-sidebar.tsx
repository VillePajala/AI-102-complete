"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Hexagon,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { labModules, studyPages } from "@/lib/modules"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useSidebar } from "@/components/sidebar-context"

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen } = useSidebar()

  if (isMobile) {
    return (
      <>
        <div className="fixed left-4 top-4 z-50">
          <Button
            variant="outline" size="icon-xs"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="glass bg-card border-border shadow-lg"
          >
            <Menu className="size-4" />
          </Button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <aside className="glass relative flex h-full w-72 flex-col bg-sidebar border-r border-sidebar-border shadow-2xl">
              <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Hexagon className="size-3.5" />
                  </div>
                  <span className="text-sm font-bold tracking-tight">AI-102</span>
                </Link>
                <Button variant="ghost" size="icon-xs" onClick={() => setMobileOpen(false)} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </div>
              <NavContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <ThemeFooter theme={theme} toggleTheme={toggleTheme} />
            </aside>
          </div>
        )}
      </>
    )
  }

  return (
    <aside className={cn(
      "glass flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[52px]" : "w-56"
    )}>
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="size-4" />
          </button>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Hexagon className="size-3.5" />
              </div>
              <span className="text-sm font-bold tracking-tight">AI-102</span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-3.5" />
            </button>
          </>
        )}
      </div>

      <NavContent pathname={pathname} collapsed={collapsed} />
      <ThemeFooter theme={theme} toggleTheme={toggleTheme} collapsed={collapsed} />
    </aside>
  )
}

function NavContent({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="flex-1 overflow-y-auto py-3">
      {!collapsed && (
        <div className="px-4 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Modules</span>
        </div>
      )}

      <nav className="flex flex-col gap-0.5 px-2" role="navigation" aria-label="Lab modules">
        {labModules.map((mod) => {
          const active = pathname === mod.href
          const Icon = mod.icon
          return (
            <Link
              key={mod.id} href={mod.href} onClick={onNavigate}
              title={collapsed ? mod.name : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-150",
                active
                  ? "bg-primary/12 text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon className={cn("size-4 shrink-0", active ? "text-primary" : cn(mod.color, "group-hover:text-foreground"))} />
              {!collapsed && <span className="truncate">{mod.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="mx-3 my-3 h-px bg-sidebar-border" />

      {!collapsed && (
        <div className="px-4 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Study</span>
        </div>
      )}

      <nav className="flex flex-col gap-0.5 px-2" role="navigation" aria-label="Study pages">
        {studyPages.map((page) => {
          const active = pathname === page.href
          const Icon = page.icon
          return (
            <Link
              key={page.id} href={page.href} onClick={onNavigate}
              title={collapsed ? page.name : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-150",
                active
                  ? "bg-primary/12 text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "group-hover:text-foreground")} />
              {!collapsed && <span className="truncate">{page.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function ThemeFooter({
  theme, toggleTheme, collapsed = false,
}: {
  theme: string; toggleTheme: () => void; collapsed?: boolean
}) {
  return (
    <div className="border-t border-sidebar-border p-2">
      <button
        onClick={toggleTheme}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
          "bg-accent/50 text-foreground hover:bg-accent",
          collapsed && "justify-center"
        )}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <div className="relative flex size-5 items-center justify-center">
          {theme === "dark" ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5 text-indigo-500" />}
        </div>
        {!collapsed && <span className="text-[12px] font-medium">{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
      </button>
    </div>
  )
}

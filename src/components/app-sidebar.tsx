"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  GraduationCap,
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

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <>
        <div className="fixed left-3 top-3 z-50">
          <Button
            variant="outline" size="icon-xs"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="bg-card"
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
            <aside className="relative flex h-full w-72 flex-col bg-sidebar border-r border-sidebar-border shadow-2xl">
              <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <GraduationCap className="size-5 text-primary" />
                  <span className="text-sm font-bold text-foreground tracking-tight">AI-102</span>
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

  /* ── Desktop ── */
  return (
    <aside className={cn(
      "flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[52px]" : "w-56"
    )}>
      {/* Header */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="size-4" />
          </button>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <span className="text-sm font-bold text-foreground tracking-tight">AI-102</span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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

/* ── Nav ── */
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
        <div className="px-4 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Modules
          </span>
        </div>
      )}

      <nav className="flex flex-col gap-px px-2" role="navigation" aria-label="Lab modules">
        {labModules.map((mod) => {
          const active = pathname === mod.href
          const Icon = mod.icon
          return (
            <Link
              key={mod.id} href={mod.href} onClick={onNavigate}
              title={collapsed ? mod.name : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] transition-colors",
                active
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon className={cn("size-4 shrink-0", active ? "text-primary" : cn(mod.color, "group-hover:text-foreground"))} />
              {!collapsed && (
                <span className="truncate">{mod.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mx-3 my-3 h-px bg-sidebar-border" />

      {!collapsed && (
        <div className="px-4 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Study
          </span>
        </div>
      )}

      <nav className="flex flex-col gap-px px-2" role="navigation" aria-label="Study pages">
        {studyPages.map((page) => {
          const active = pathname === page.href
          const Icon = page.icon
          return (
            <Link
              key={page.id} href={page.href} onClick={onNavigate}
              title={collapsed ? page.name : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] transition-colors",
                active
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
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

/* ── Theme toggle footer ── */
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
          "flex w-full items-center gap-2 rounded-lg px-2 py-[7px] text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          collapsed && "justify-center"
        )}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
      </button>
    </div>
  )
}

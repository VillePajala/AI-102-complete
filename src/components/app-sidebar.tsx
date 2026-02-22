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
  const { collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen } =
    useSidebar()

  /* ---- Mobile ---- */
  if (isMobile) {
    return (
      <>
        <div className="fixed left-3 top-3 z-50">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-muted-foreground hover:text-foreground backdrop-blur-sm bg-background/50 border border-border"
          >
            <Menu className="size-5" />
          </Button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <aside className="relative flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl shadow-primary/10 border-r border-sidebar-border animate-in slide-in-from-left duration-200">
              {/* Sidebar glow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-primary/[0.02] to-transparent" />

              <div className="relative flex h-14 items-center justify-between border-b border-sidebar-border px-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <Logo />
                  <span className="text-sm font-bold tracking-tight text-foreground">AI-102</span>
                </Link>
                <Button
                  variant="ghost" size="icon-xs"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter theme={theme} toggleTheme={toggleTheme} collapsed={false} />
            </aside>
          </div>
        )}
      </>
    )
  }

  /* ---- Desktop ---- */
  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border",
        collapsed ? "w-[56px]" : "w-60"
      )}
    >
      {/* Glow edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary/[0.015] to-transparent" />

      {/* Header */}
      <div className="relative flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <Logo />
            <span className="truncate text-sm font-bold tracking-tight text-foreground">AI-102</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto">
            <Logo />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost" size="icon-xs"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-3.5" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-sidebar-border">
          <Button
            variant="ghost" size="icon-xs"
            onClick={() => setCollapsed(false)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="size-3.5" />
          </Button>
        </div>
      )}

      <SidebarNav pathname={pathname} collapsed={collapsed} />
      <SidebarFooter theme={theme} toggleTheme={toggleTheme} collapsed={collapsed} />
    </aside>
  )
}

/* ---- Logo icon ---- */
function Logo() {
  return (
    <div className="relative flex size-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
      <GraduationCap className="size-3.5 text-primary" />
      <div className="absolute inset-0 rounded-lg bg-primary/10 blur-sm" />
    </div>
  )
}

/* ---- Nav ---- */
function SidebarNav({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="relative flex-1 overflow-y-auto py-3">
      <div className="px-3 pb-2">
        {!collapsed && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            Modules
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 px-2" role="navigation" aria-label="Lab modules">
        {labModules.map((mod) => {
          const isActive = pathname === mod.href
          const Icon = mod.icon
          return (
            <Link
              key={mod.id}
              href={mod.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-200",
                isActive
                  ? "bg-primary/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? `${mod.name} (${mod.weight})` : undefined}
            >
              {/* Glowing active bar */}
              {isActive && (
                <>
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary blur-sm" />
                </>
              )}
              <div className={cn(
                "flex size-6 items-center justify-center rounded-md transition-all duration-200",
                isActive ? "bg-primary/15" : "bg-transparent group-hover:bg-accent"
              )}>
                <Icon className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : cn(mod.color, "group-hover:text-foreground")
                )} />
              </div>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{mod.name}</span>
                  <span className="ml-2 text-[10px] font-mono tabular-nums text-muted-foreground/30">
                    {mod.weight}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mx-3 my-3">
        <div className="h-px bg-gradient-to-r from-sidebar-border via-sidebar-border to-transparent" />
      </div>

      <div className="px-3 pb-2">
        {!collapsed && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            Study
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 px-2" role="navigation" aria-label="Study pages">
        {studyPages.map((page) => {
          const isActive = pathname === page.href
          const Icon = page.icon
          return (
            <Link
              key={page.id}
              href={page.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-200",
                isActive
                  ? "bg-primary/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? page.name : undefined}
            >
              {isActive && (
                <>
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary blur-sm" />
                </>
              )}
              <div className={cn(
                "flex size-6 items-center justify-center rounded-md transition-all duration-200",
                isActive ? "bg-primary/15" : "bg-transparent group-hover:bg-accent"
              )}>
                <Icon className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-foreground"
                )} />
              </div>
              {!collapsed && <span className="truncate">{page.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/* ---- Footer ---- */
function SidebarFooter({
  theme, toggleTheme, collapsed,
}: {
  theme: string; toggleTheme: () => void; collapsed: boolean
}) {
  return (
    <div className="border-t border-sidebar-border p-2">
      <Button
        variant="ghost"
        size={collapsed ? "icon-xs" : "sm"}
        onClick={toggleTheme}
        className={cn(
          "w-full text-muted-foreground hover:text-foreground",
          collapsed && "mx-auto"
        )}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        {!collapsed && (
          <span className="ml-2 text-xs">{theme === "dark" ? "Light" : "Dark"}</span>
        )}
      </Button>
    </div>
  )
}

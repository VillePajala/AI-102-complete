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

/* Desktop sidebar: collapsible icon rail */
export function AppSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen } =
    useSidebar()

  /* ---- Mobile overlay sidebar ---- */
  if (isMobile) {
    return (
      <>
        {/* Hamburger trigger - fixed top-left */}
        <div className="fixed left-3 top-3 z-50">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-muted-foreground"
          >
            <Menu className="size-5" />
          </Button>
        </div>

        {/* Backdrop + drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Scrim */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />

            {/* Drawer panel */}
            <aside className="relative flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl animate-in slide-in-from-left duration-200">
              {/* Top glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.04] to-transparent" />

              {/* Close button */}
              <div className="relative flex h-14 items-center justify-between border-b border-sidebar-border px-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 overflow-hidden"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="size-4 shrink-0 text-primary" />
                  </div>
                  <span className="truncate font-semibold text-sm tracking-tight">
                    AI-102 Command Center
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-muted-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Nav content */}
              <MobileSidebarContent
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />

              {/* Theme toggle */}
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full text-muted-foreground"
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  <span className="ml-2 text-xs">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </>
    )
  }

  /* ---- Desktop sidebar ---- */
  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* Subtle top glow accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.04] to-transparent" />

      {/* Header */}
      <div className="relative flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="size-4 shrink-0 text-primary" />
            </div>
            <span className="truncate font-semibold text-sm tracking-tight">AI-102 Command Center</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("shrink-0 text-muted-foreground hover:text-foreground transition-colors", collapsed && "mx-auto")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      {/* Lab Modules */}
      <div className="relative flex-1 overflow-y-auto py-3">
        <div className="px-3 py-1">
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Lab Modules
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
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
                title={collapsed ? `${mod.name} — Domain ${mod.domainNumber} (${mod.weight})` : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
                <div className={cn(
                  "flex size-6 items-center justify-center rounded-md transition-colors",
                  isActive ? "bg-primary/15" : "bg-transparent group-hover:bg-sidebar-accent"
                )}>
                  <Icon className={cn("size-3.5 shrink-0 transition-colors", isActive ? "text-primary" : mod.color)} />
                </div>
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{mod.name}</span>
                    <span className="ml-1 rounded-sm bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                      {mod.weight}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mx-3 my-3">
          <div className="h-px bg-border/60" />
        </div>

        <div className="px-3 py-1">
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
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
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
                title={collapsed ? page.name : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
                <div className={cn(
                  "flex size-6 items-center justify-center rounded-md transition-colors",
                  isActive ? "bg-primary/15" : "bg-transparent group-hover:bg-sidebar-accent"
                )}>
                  <Icon className={cn("size-3.5 shrink-0 transition-colors", isActive && "text-primary")} />
                </div>
                {!collapsed && <span className="truncate">{page.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size={collapsed ? "icon-xs" : "sm"}
          onClick={toggleTheme}
          className={cn("w-full text-muted-foreground hover:text-foreground transition-colors", collapsed && "mx-auto")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {!collapsed && (
            <span className="ml-2 text-xs">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>
      </div>
    </aside>
  )
}

/* Shared navigation links used in the mobile drawer */
function MobileSidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="relative flex-1 overflow-y-auto py-3">
      <div className="px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Lab Modules
        </span>
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
                "group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              )}
              <div className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-primary/15" : "bg-transparent"
              )}>
                <Icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-primary" : mod.color)} />
              </div>
              <div className="flex flex-1 items-center justify-between overflow-hidden">
                <span className="truncate">{mod.name}</span>
                <span className="ml-1 rounded-sm bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                  {mod.weight}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="mx-3 my-3">
        <div className="h-px bg-border/60" />
      </div>

      <div className="px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Study
        </span>
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
                "group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              )}
              <div className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-primary/15" : "bg-transparent"
              )}>
                <Icon className={cn("size-4 shrink-0 transition-colors", isActive && "text-primary")} />
              </div>
              <span className="truncate">{page.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

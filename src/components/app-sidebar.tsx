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

  /* ---- Mobile overlay sidebar ---- */
  if (isMobile) {
    return (
      <>
        {/* Hamburger trigger */}
        <div className="fixed left-3 top-3 z-50">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-muted-foreground hover:text-foreground"
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
            <aside className="noise relative flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground shadow-2xl shadow-primary/5 animate-in slide-in-from-left duration-200">
              <div className="relative flex h-14 items-center justify-between border-b border-sidebar-border px-3">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 overflow-hidden"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                    <GraduationCap className="size-3.5 text-primary" />
                  </div>
                  <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                    AI-102
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
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

  /* ---- Desktop sidebar ---- */
  return (
    <aside
      className={cn(
        "noise relative flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border",
        collapsed ? "w-[52px]" : "w-60"
      )}
    >
      {/* Header */}
      <div className="relative flex h-12 items-center gap-2 border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/20">
              <GraduationCap className="size-3 text-primary" />
            </div>
            <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">
              AI-102
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "shrink-0 text-muted-foreground hover:text-foreground",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </Button>
      </div>

      <SidebarNav pathname={pathname} collapsed={collapsed} />
      <SidebarFooter theme={theme} toggleTheme={toggleTheme} collapsed={collapsed} />
    </aside>
  )
}

/* ---- Shared nav section ---- */
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
    <div className="flex-1 overflow-y-auto py-3">
      {/* Section label */}
      <div className="px-3 pb-1">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Modules
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-px px-2" role="navigation" aria-label="Lab modules">
        {labModules.map((mod) => {
          const isActive = pathname === mod.href
          const Icon = mod.icon
          return (
            <Link
              key={mod.id}
              href={mod.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-all duration-150",
                isActive
                  ? "bg-primary/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? `${mod.name} (${mod.weight})` : undefined}
            >
              {/* Active bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : mod.color + " group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{mod.name}</span>
                  <span className="ml-2 text-[10px] tabular-nums text-muted-foreground/50">
                    {mod.weight}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-2.5">
        <div className="h-px bg-sidebar-border" />
      </div>

      {/* Study section */}
      <div className="px-3 pb-1">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Study
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-px px-2" role="navigation" aria-label="Study pages">
        {studyPages.map((page) => {
          const isActive = pathname === page.href
          const Icon = page.icon
          return (
            <Link
              key={page.id}
              href={page.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-all duration-150",
                isActive
                  ? "bg-primary/[0.08] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? page.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-foreground"
                )}
              />
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
  theme,
  toggleTheme,
  collapsed,
}: {
  theme: string
  toggleTheme: () => void
  collapsed: boolean
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
        {theme === "dark" ? (
          <Sun className="size-3.5" />
        ) : (
          <Moon className="size-3.5" />
        )}
        {!collapsed && (
          <span className="ml-2 text-xs">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        )}
      </Button>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { labModules, studyPages } from "@/lib/modules"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useSidebar } from "@/components/sidebar-context"

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <GraduationCap className="size-5 shrink-0 text-primary" />
            <span className="truncate font-semibold text-sm">AI-102 Command Center</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("shrink-0 text-muted-foreground", collapsed && "mx-auto")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      {/* Lab Modules */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-1.5">
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? `${mod.name} — Domain ${mod.domainNumber} (${mod.weight})` : undefined}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : mod.color)} />
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{mod.name}</span>
                    <span className="ml-1 text-[10px] text-muted-foreground tabular-nums">
                      {mod.weight}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mx-3 my-2">
          <div className="h-px bg-border" />
        </div>

        <div className="px-3 py-1.5">
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? page.name : undefined}
              >
                <Icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="truncate">{page.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size={collapsed ? "icon-xs" : "sm"}
          onClick={toggleTheme}
          className={cn("w-full text-muted-foreground", collapsed && "mx-auto")}
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

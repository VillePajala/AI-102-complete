"use client"

import { useCallback } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { AppSidebar } from "@/components/app-sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ShellLayout>{children}</ShellLayout>
      </SidebarProvider>
    </ThemeProvider>
  )
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, setShellEl } = useSidebar()

  const callbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      setShellEl(node)
    },
    [setShellEl]
  )

  return (
    <div ref={callbackRef} className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className={`mx-auto max-w-7xl p-6 ${isMobile ? "pt-14" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

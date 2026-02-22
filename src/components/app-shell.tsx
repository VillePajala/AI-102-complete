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
    (node: HTMLDivElement | null) => { setShellEl(node) },
    [setShellEl]
  )

  return (
    <div ref={callbackRef} className="mesh-bg flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className={`mx-auto max-w-6xl px-5 py-8 lg:px-8 ${isMobile ? "pt-16" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

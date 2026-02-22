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
      <main className="relative flex-1 overflow-y-auto">
        {/* Ambient gradient orbs */}
        <div className="pointer-events-none fixed right-[-10%] top-[-5%] h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="pointer-events-none fixed bottom-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-chart-5/[0.03] blur-[120px]" />
        <div className="pointer-events-none fixed left-[50%] top-[30%] h-[400px] w-[400px] rounded-full bg-chart-2/[0.02] blur-[100px]" />

        {/* Grid pattern */}
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" />

        <div className={`relative mx-auto max-w-7xl px-6 py-8 ${isMobile ? "pt-16" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

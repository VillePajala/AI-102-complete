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
        {/* Ambient glows */}
        <div className="pointer-events-none fixed right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/[0.02] blur-[120px]" />
        <div className="pointer-events-none fixed bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-chart-5/[0.015] blur-[100px]" />

        {/* Dot grid */}
        <div className="pointer-events-none fixed inset-0 bg-dot-pattern opacity-30" />

        <div className={`relative mx-auto max-w-7xl px-6 py-8 ${isMobile ? "pt-14" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

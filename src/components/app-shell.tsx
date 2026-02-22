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
        {/* Subtle radial glow in the background */}
        <div className="pointer-events-none fixed right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className={`relative mx-auto max-w-7xl p-6 ${isMobile ? "pt-14" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

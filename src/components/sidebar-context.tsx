"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const MOBILE_BREAKPOINT = 768

const SidebarContext = createContext<{
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
  isMobile: false,
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) {
        setMobileOpen(false)
      }
    }

    onChange(mql)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const handleSetCollapsed = useCallback((v: boolean) => {
    if (isMobile) {
      setMobileOpen(!v)
    } else {
      setCollapsed(v)
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider
      value={{
        collapsed: isMobile ? true : collapsed,
        setCollapsed: handleSetCollapsed,
        isMobile,
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)

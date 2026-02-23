"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"

const MOBILE_BREAKPOINT = 768

const SidebarContext = createContext<{
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
  setShellEl: (el: HTMLDivElement | null) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
  isMobile: false,
  mobileOpen: false,
  setMobileOpen: () => {},
  setShellEl: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null)
  const roRef = useRef<ResizeObserver | null>(null)

  /* Observe the shell container with ResizeObserver so it works inside iframes */
  useEffect(() => {
    if (roRef.current) {
      roRef.current.disconnect()
      roRef.current = null
    }

    if (!shellEl) return

    let wasMobile = shellEl.offsetWidth < MOBILE_BREAKPOINT
    const check = () => {
      const narrow = shellEl.offsetWidth < MOBILE_BREAKPOINT
      setIsMobile(narrow)
      // Only close mobile menu on transition from desktop to mobile, not on every resize
      if (narrow && !wasMobile) setMobileOpen(false)
      wasMobile = narrow
    }

    check()

    const ro = new ResizeObserver(check)
    ro.observe(shellEl)
    roRef.current = ro

    return () => {
      ro.disconnect()
      roRef.current = null
    }
  }, [shellEl])

  /* Fallback: matchMedia for SSR hydration & before shell mounts */
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      if (!shellEl) {
        setIsMobile(mql.matches)
        if (mql.matches) setMobileOpen(false)
      }
    }
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [shellEl])

  const handleSetCollapsed = useCallback(
    (v: boolean) => {
      if (isMobile) {
        setMobileOpen(!v)
      } else {
        setCollapsed(v)
      }
    },
    [isMobile]
  )

  return (
    <SidebarContext.Provider
      value={{
        collapsed: isMobile ? true : collapsed,
        setCollapsed: handleSetCollapsed,
        isMobile,
        mobileOpen,
        setMobileOpen,
        setShellEl,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)

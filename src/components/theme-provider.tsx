"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: "light", toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always init as "light" to match SSR (blocking script handles visual correctness)
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai102-theme") as Theme | null
      if (stored === "light" || stored === "dark") setTheme(stored)
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("ai102-theme", theme)
  }, [theme, mounted])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

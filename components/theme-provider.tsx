"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"
type ThemeContextValue = { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  // Persist & apply on mount
  useEffect(() => {
    const saved = localStorage.getItem("lunaris-theme") as Theme | null
    if (saved === "light" || saved === "dark") {
      setTheme(saved)
      applyTheme(saved)
    } else {
      applyTheme("light")
    }
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(t)
  }

  function toggle() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      applyTheme(next)
      localStorage.setItem("lunaris-theme", next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

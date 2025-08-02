// contexts/dark-mode-context.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

type DarkModeContextType = {
  darkMode: boolean
  toggleDarkMode: () => void
  isInitialized: boolean
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem("darkMode")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    const initialMode = savedMode !== null 
      ? savedMode === "true" 
      : prefersDark
    
    setDarkMode(initialMode)
    setIsInitialized(true)
    
    // Apply class to HTML element
    document.documentElement.classList.toggle("dark", initialMode)
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("darkMode") === null) {
        setDarkMode(e.matches)
        document.documentElement.classList.toggle("dark", e.matches)
      }
    }
    mediaQuery.addEventListener("change", handler)
    
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("darkMode", String(newMode))
    document.documentElement.classList.toggle("dark", newMode)
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, isInitialized }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider")
  }
  return context
}
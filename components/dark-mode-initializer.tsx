// components/dark-mode-initializer.tsx
"use client"

import { useDarkMode } from "@/contexts/dark-mode-context"

export function DarkModeInitializer() {
  const { isInitialized } = useDarkMode()
  
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="animate-pulse">Loading theme...</div>
      </div>
    )
  }
  
  return null
}
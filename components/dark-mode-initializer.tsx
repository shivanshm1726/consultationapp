// components/dark-mode-initializer.tsx
"use client"

import { useDarkMode } from "@/contexts/dark-mode-context"

export function DarkModeInitializer() {
  // This component just ensures the dark mode context is initialized
  // No blocking overlay needed - the theme will apply once the effect runs
  useDarkMode()
  return null
}
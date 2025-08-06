// layout.tsx
import { ThemeProvider } from 'next-themes'
import { DarkModeInitializer } from "@/components/dark-mode-initializer"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DarkModeProvider } from "@/contexts/dark-mode-context"
import RegisterSW from "@/components/RegisterSW"

export const metadata: Metadata = {
  title: "Dr. Nitin Mishra - Skin Specialist",
  description: "Expert dermatological care with 20+ years of experience",
  generator: "v0.dev",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 🔹 PWA & mobile support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* 🔹 Apple iOS support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <AuthProvider>
          <DarkModeProvider>
            <DarkModeInitializer /> {/* Add this line */}
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
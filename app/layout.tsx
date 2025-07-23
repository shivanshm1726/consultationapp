import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "Dr. Nitin Mishra - Skin Specialist",
  description: "Expert dermatological care with 20+ years of experience",
  generator: "v0.dev",
  themeColor: "#1976d2",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔹 PWA & mobile support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* 🔹 Apple iOS support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <AuthProvider>
          <RegisterSW />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

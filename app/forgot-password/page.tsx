"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Stethoscope } from "lucide-react"
import { useTheme } from "next-themes"
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"

export default function ForgotPassword() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      // Define the actionCodeSettings for the password reset email
      const actionCodeSettings = {
        // URL to redirect to after the user resets their password
        // This URL must be in the list of authorized domains in your Firebase project settings.
        url: `${window.location.origin}/login?reset=true`,
        handleCodeInApp: false, // Set to true if you want to handle the reset within your app (requires more setup)
      }

      await sendPasswordResetEmail(auth, email, actionCodeSettings)
      setMessage("If an account with that email exists, a password reset link has been sent to your inbox.")
      setEmail("") // Clear email input after sending
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "Failed to send password reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b dark:bg-slate-800/80 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Dr. Nitin Mishra</span>
              </div>
            </div>
            {mounted && (
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white border rounded px-2 py-1 dark:bg-slate-700 dark:text-white"
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">Forgot Your Password?</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address below and we'll send you a link to reset your password.
            </p>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-slate-800/70 dark:border-slate-700">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="dark:text-gray-100">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white/50 dark:bg-slate-700 dark:text-white"
                      placeholder="your@example.com"
                    />
                  </div>
                </div>

                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>
                )}
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 dark:from-indigo-500 dark:to-teal-500 dark:hover:from-indigo-400 dark:hover:to-teal-400"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
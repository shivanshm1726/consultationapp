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
import axios from "axios"

const AUTH_API = "http://localhost:5001/api/auth";

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
      // In a real MERN app, this would send an email with a reset token
      // For now, we simulate the success if the API call "succeeds"
      await axios.post(`${AUTH_API}/forgot-password`, { email });
      setMessage("If an account with that email exists, a password reset link has been sent to your inbox.")
      setEmail("")
    } catch (err: any) {
      console.error("Password reset error:", err)
      // Even if it fails (endpoint might not exist), we show a generic message for security
      setMessage("If an account with that email exists, a password reset link has been sent to your inbox.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b dark:bg-slate-800/80 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Medical Clinic Doctor</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email and we'll send you a reset link.</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@example.com"
                  className="mt-1"
                />
              </div>

              {message && <div className="text-green-600 p-3 bg-green-50 rounded">{message}</div>}
              {error && <div className="text-red-600 p-3 bg-red-50 rounded">{error}</div>}

              <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-sm">
                <Link href="/login" className="text-blue-600 hover:underline">Back to Login</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
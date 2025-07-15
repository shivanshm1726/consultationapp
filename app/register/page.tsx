"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Stethoscope, User, Eye, EyeOff } from "lucide-react"
import { registerUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    age: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Clear error when user types

    // Validate age
    if (field === "age") {
      const ageNum = Number.parseInt(value)
      if (value && (ageNum < 5 || ageNum > 100)) {
        setErrors((prev) => ({ ...prev, age: "Age must be between 5 and 100" }))
      } else {
        setErrors((prev) => ({ ...prev, age: "" }))
      }
    }

    // Validate password match
    if (field === "confirmPassword" || field === "password") {
      const password = field === "password" ? value : formData.password
      const confirmPassword = field === "confirmPassword" ? value : formData.confirmPassword

      if (confirmPassword && password !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      setLoading(false)
      return
    }

    const ageNum = Number.parseInt(formData.age)
    if (ageNum < 5 || ageNum > 100) {
      setErrors((prev) => ({ ...prev, age: "Age must be between 5 and 100" }))
      setLoading(false)
      return
    }

    try {
      await registerUser(formData.email, formData.password, formData.fullName, ageNum)
      router.push("/") // Redirect to home page after successful registration
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-blue-900 dark:text-slate-100">Register</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-slate-100 mb-2">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Join us to access our medical services</p>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-center text-blue-900 dark:text-slate-100">Patient Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-blue-900 dark:text-slate-200">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                    className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-blue-900 dark:text-slate-200">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                    className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                    min="5"
                    max="100"
                    placeholder="Your age"
                  />
                  {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-blue-900 dark:text-slate-200">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-blue-900 dark:text-slate-200">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="bg-white/50 dark:bg-slate-700 dark:text-slate-50 pr-10"
                      placeholder="Create a password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-blue-900 dark:text-slate-200">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="bg-white/50 dark:bg-slate-700 dark:text-slate-50 pr-10"
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:bg-blue-400"
                  size="lg"
                >
                  {loading ? "Registering..." : "Register"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">Need help with registration?</p>
            <div className="flex justify-center space-x-4">
              <a
                href="tel:9258924611"
                className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
              >
                📞 9258924611
              </a>
              <a
                href="mailto:dermanitin@gmail.com"
                className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
              >
                ✉️ dermanitin@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

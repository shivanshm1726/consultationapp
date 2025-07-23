"use client"


import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { ArrowLeft, User, Stethoscope } from "lucide-react"
import { loginUser } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("") // Clear error when user types
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const userCredential = await loginUser(formData.email, formData.password);
    const user = userCredential;

    // 🔄 Fetch user role from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("User profile not found in Firestore");
    }

    const userData = docSnap.data();
    const role = userData.role;

    // ✅ Redirect based on role
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "receptionist") {
      router.push("/reception");
    } else {
      router.push("/"); // patient
    }

  } catch (error: any) {
    setError(error.message || "Login failed.");
  } finally {
    setLoading(false);
  }
};

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
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to access your account</p>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-slate-800/70 dark:border-slate-700">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 dark:bg-indigo-900">
                    <User className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Patient Login</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access your appointments and medical records
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient-email" className="dark:text-gray-100">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="patient-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="pl-10 bg-white/50 dark:bg-slate-700 dark:text-white"
                        placeholder="patient@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="patient-password" className="dark:text-gray-100">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="patient-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="pl-10 pr-10 bg-white/50 dark:bg-slate-700 dark:text-white"
                        placeholder="Enter your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility()}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
                  )}

                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 dark:from-indigo-500 dark:to-teal-500 dark:hover:from-indigo-400 dark:hover:to-teal-400"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In as Patient"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">Need immediate assistance?</p>
            <div className="flex justify-center space-x-4">
              <a
                href="tel:9258924611"
                className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                📞 9258924611
              </a>
              <a
                href="mailto:drnitinmishraderma@gmail.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                ✉️ drnitinmishraderma@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Eye, EyeOff, Activity, UserPlus, Shield, Fingerprint, Sun, Moon } from "lucide-react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    age: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");

    if (field === "age") {
      const ageNum = Number.parseInt(value);
      if (value && (ageNum < 5 || ageNum > 100)) {
        setErrors((prev) => ({ ...prev, age: "Age must be between 5 and 100" }));
      } else {
        setErrors((prev) => ({ ...prev, age: "" }));
      }
    }

    if (field === "password" || field === "confirmPassword") {
      const password = field === "password" ? value : formData.password;
      const confirmPassword = field === "confirmPassword" ? value : formData.confirmPassword;
      if (confirmPassword && password !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (field === "phone") {
      if (value && !/^\+?\d{0,12}$/.test(value)) {
        setErrors((prev) => ({ ...prev, phone: "Enter a valid phone number" }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      setLoading(false);
      return;
    }

    const ageNum = Number.parseInt(formData.age);
    if (ageNum < 5 || ageNum > 100) {
      setErrors((prev) => ({ ...prev, age: "Age must be between 5 and 100" }));
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData.email, formData.password, formData.fullName, ageNum, formData.phone || undefined);
      window.location.href = "/";
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"}`}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 dark:opacity-20 mix-blend-screen pointer-events-none blur-[120px] rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-800/20" />
      </div>

      {/* Floating Navigation */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <div className="transition-all duration-500 mx-4 w-full max-w-3xl rounded-2xl border flex items-center justify-between px-6 py-3 shadow-2xl backdrop-blur-xl bg-white/80 border-slate-200 dark:bg-[#0a0a0a]/80 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white hidden sm:block">Nexus Health</span>
          </Link>
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5 transition-all">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400">
                <ArrowLeft className="h-4 w-4 mr-2" /> Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <section className="relative pt-36 pb-20 px-4 z-10 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-white/20">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">Account</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Join the platform to access medical services</p>
          </div>

          {/* Form Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                    className="h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                      min="5"
                      max="100"
                      className="h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                      placeholder="Age"
                    />
                    {errors.age && <p className="text-red-400 text-xs">{errors.age}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                      placeholder="Optional"
                    />
                    {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-12 pr-11 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                      placeholder="Create a password"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="h-12 pr-11 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                      placeholder="Confirm password"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !!errors.age || !!errors.confirmPassword || !!errors.phone}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-xl hover:opacity-90 transition-all font-semibold text-sm tracking-wide disabled:opacity-40"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Patient Account"
                  )}
                </Button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 dark:text-slate-600">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> SSL Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3 h-3" /> HIPAA Compliant
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
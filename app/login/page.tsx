"use client"
import { useDarkMode } from "@/contexts/dark-mode-context";
import { Sun, Moon } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, User, Stethoscope, Shield, Activity, Fingerprint } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { loginUser } from "@/lib/auth";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PortalType = "patient" | "doctor" | "assistant" | "admin";

export default function Login() {
  const [selectedPortal, setSelectedPortal] = useState<PortalType>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await loginUser(formData.email, formData.password);
      const role = userData.role || "patient";
      localStorage.setItem("role", role);

      if (selectedPortal === "doctor" && role !== "doctor" && role !== "admin" && role !== "superadmin") {
        throw new Error("Unauthorized: Doctor access required.");
      }
      if (selectedPortal === "assistant" && role !== "receptionist") {
        throw new Error("Unauthorized: Assistant access required.");
      }
      if (selectedPortal === "patient" && (role === "admin" || role === "receptionist" || role === "doctor")) {
        if (role === "admin") window.location.href = "/admin";
        if (role === "receptionist") window.location.href = "/reception";
        if (role === "doctor") window.location.href = "/doctor";
        return;
      }

      if (role === "admin") window.location.href = "/admin";
      else if (role === "receptionist") window.location.href = "/reception";
      else if (role === "doctor") window.location.href = "/doctor";
      else window.location.href = "/";
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const portalConfig = {
    patient: {
      title: "Patient Portal",
      desc: "Access health records & book consultations",
      icon: <User className="h-5 w-5" />,
      gradient: "from-emerald-400 to-teal-500"
    },
    doctor: {
      title: "Doctor Portal",
      desc: "Manage patient flow & live consultations",
      icon: <Stethoscope className="h-5 w-5" />,
      gradient: "from-indigo-400 to-purple-500"
    },
    assistant: {
      title: "Assistant Portal",
      desc: "Queue management & appointment triage",
      icon: <Shield className="h-5 w-5" />,
      gradient: "from-amber-400 to-orange-500"
    },
    admin: {
      title: "Admin Portal",
      desc: "Platform analytics & system controls",
      icon: <Lock className="h-5 w-5" />,
      gradient: "from-slate-400 to-slate-600"
    }
  };

  const currentPortal = portalConfig[selectedPortal];

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"}`}>

      {/* Background — same as landing page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 dark:opacity-20 mix-blend-screen pointer-events-none blur-[120px] rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-800/20" />
      </div>

      {/* Floating Navigation — matching landing page */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <div className="transition-all duration-500 mx-4 w-full max-w-3xl rounded-2xl border flex items-center justify-between px-6 py-3 shadow-2xl backdrop-blur-xl bg-white/80 border-slate-200 dark:bg-[#0a0a0a]/80 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
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
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:bg-transparent hover:text-emerald-500 dark:hover:text-emerald-400 group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
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
              <Fingerprint className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Secure <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">Access</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Authenticate to enter the healthcare platform</p>
          </div>

          {/* Login Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-2xl">
            {/* Portal gradient strip */}
            <div className={`h-1.5 bg-gradient-to-r ${currentPortal.gradient} transition-all duration-500`} />
            
            <div className="p-8 space-y-6">
              {/* Portal selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Access Portal</Label>
                <Select value={selectedPortal} onValueChange={(v) => setSelectedPortal(v as PortalType)}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl h-12">
                    <SelectValue placeholder="Select Portal" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0a0a0a] dark:border-white/10">
                    <SelectItem value="patient">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-500" /> Patient Portal
                      </span>
                    </SelectItem>
                    <SelectItem value="doctor">
                      <span className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-indigo-500" /> Doctor Portal
                      </span>
                    </SelectItem>
                    <SelectItem value="assistant">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-500" /> Assistant Portal
                      </span>
                    </SelectItem>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-500" /> Platform Admin
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="pl-11 h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                      placeholder={`Enter ${selectedPortal} email`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="pl-11 pr-11 h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Forgot password */}
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className={`w-full h-12 rounded-xl bg-gradient-to-r ${currentPortal.gradient} text-white shadow-xl hover:opacity-90 transition-all font-semibold text-sm tracking-wide`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {currentPortal.icon}
                      Sign In to {currentPortal.title}
                    </div>
                  )}
                </Button>

                {/* Footer links */}
                {selectedPortal === "patient" && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    New patient?{" "}
                    <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold">
                      Create an account
                    </Link>
                  </p>
                )}
                {selectedPortal === "doctor" && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Applying to join?{" "}
                    <Link href="/doctor/signup" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 font-semibold">
                      Submit application
                    </Link>
                  </p>
                )}
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
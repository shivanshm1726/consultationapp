"use client"
import { useDarkMode } from "@/contexts/dark-mode-context";
import { Sun, Moon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ArrowLeft, User, Stethoscope, HeartPulse, Smartphone, CalendarCheck, Shield, Heart } from "lucide-react";
import { loginUser } from "@/lib/auth";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

type PortalType = "patient" | "doctor" | "assistant" | null;

export default function Login() {
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await loginUser(formData.email, formData.password);
      
      const role = userData.role || "patient";
      localStorage.setItem("role", role);

      // Verify they selected the correct portal for their role
      if (selectedPortal === "doctor" && role !== "admin" && role !== "superadmin") {
        throw new Error("Unauthorized: Admin access required.");
      }
      if (selectedPortal === "assistant" && role !== "receptionist") {
        throw new Error("Unauthorized: Assistant access required. Please use Patient Portal.");
      }
      if (selectedPortal === "patient" && (role === "admin" || role === "receptionist")) {
        // Automatically route staff correctly if they use the patient portal by accident
        if (role === "admin") router.push("/admin");
        if (role === "receptionist") router.push("/reception");
        return;
      }

      if (role === "admin") {
        router.push("/admin");
      } else if (role === "superadmin") {
        router.push("/superadmin");
      } else if (role === "receptionist") {
        router.push("/reception");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const portalConfig = {
    patient: {
      title: "Patient Portal",
      desc: "Access your health records and appointments",
      icon: <User className="h-6 w-6" />,
      color: "from-blue-600 to-teal-500"
    },
    doctor: {
      title: "Doctor Portal",
      desc: "Manage patients, access live consultations",
      icon: <Stethoscope className="h-6 w-6" />,
      color: "from-indigo-600 to-purple-600"
    },
    assistant: {
      title: "Assistant Portal",
      desc: "Manage clinic bookings and triage patients",
      icon: <Shield className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-600"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md shadow-sm border-b dark:bg-slate-800/90 dark:border-slate-700"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="group hover:bg-blue-50 dark:hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <motion.div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Medical Clinic</span>
            </div>
          </motion.div>
          {mounted && (
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-2">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!selectedPortal ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    Select Your <span className="text-blue-600 dark:text-blue-400">Portal</span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Please choose a portal to access your customized dashboard and tools.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-4">
                  {(Object.keys(portalConfig) as PortalType[]).map((portal) => {
                    const conf = portalConfig[portal!];
                    return (
                      <motion.div
                        key={portal}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="h-full cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors dark:bg-slate-800"
                          onClick={() => setSelectedPortal(portal)}
                        >
                          <CardContent className="p-6 text-center space-y-4">
                            <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${conf.color} flex items-center justify-center text-white shadow-lg`}>
                              {conf.icon}
                            </div>
                            <h2 className="text-xl font-bold dark:text-white">{conf.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{conf.desc}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto"
              >
                <div className="mb-6">
                  <Button variant="ghost" onClick={() => setSelectedPortal(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portals
                  </Button>
                </div>
                
                <Card className="border-0 shadow-xl overflow-hidden dark:bg-slate-800/90 dark:border-slate-700">
                  <div className={`bg-gradient-to-r ${portalConfig[selectedPortal].color} p-4 text-white text-center`}>
                    <h2 className="text-xl font-semibold">{portalConfig[selectedPortal].title} Login</h2>
                    <p className="text-sm opacity-90">{portalConfig[selectedPortal].desc}</p>
                  </div>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              required
                              className="pl-10 dark:bg-slate-700 dark:border-slate-600"
                              placeholder={`Enter ${selectedPortal} email`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="password">Password</Label>
                          <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              required
                              className="pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600"
                              placeholder="Enter password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                            {error}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            Forgot password?
                          </Link>
                        </div>

                        <Button
                          type="submit"
                          className={`w-full bg-gradient-to-r ${portalConfig[selectedPortal].color} hover:opacity-90 text-white shadow-md transition-opacity`}
                          disabled={loading}
                        >
                          {loading ? "Authenticating..." : "Sign In"}
                        </Button>

                        {selectedPortal === "patient" && (
                          <div className="text-center pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              New patient?{" "}
                              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400">
                                Create an account
                              </Link>
                            </p>
                          </div>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
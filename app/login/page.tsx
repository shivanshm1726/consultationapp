"use client"
import { useDarkMode } from "@/contexts/dark-mode-context";
import { Sun, Moon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { ArrowLeft, User, Stethoscope, HeartPulse, Smartphone, CalendarCheck } from "lucide-react";
import { loginUser } from "@/lib/auth";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
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
      const userCredential = await loginUser(formData.email, formData.password);
      const user = userCredential;

      const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "drnitinmishraderma@gmail.com";
      if (user.email === ADMIN_EMAIL) {
        router.push("/admin");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("User profile not found in Firestore");
      }

      const userData = docSnap.data();
      const role = userData.role;

      if (role === "receptionist") {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md shadow-sm border-b dark:bg-slate-800/90 dark:border-slate-700"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <Link href="/">
                <Button variant="ghost" size="sm" className="group hover:bg-blue-50 dark:hover:bg-slate-700">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, 0],
                    transition: { repeat: Infinity, duration: 3 }
                  }}
                  className="w-9 h-9 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center shadow-md"
                >
                  <Stethoscope className="h-5 w-5 text-white" />
                </motion.div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Dr. Nitin Mishra</span>
              </div>
            </motion.div>
            {mounted && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="p-2"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Features */}
            <motion.div
              ref={ref}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  Secure Patient <span className="text-blue-600 dark:text-blue-400">Portal</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Access your medical records, appointments, and health information securely.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                    <HeartPulse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Health Records</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      View your complete medical history and test results.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-900/50 p-3 rounded-full">
                    <CalendarCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Appointments</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Schedule, reschedule or cancel appointments anytime.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                    <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Mobile Friendly</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Access your health information on any device.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-800 px-4 text-sm text-gray-500 dark:text-gray-400">
                      Emergency Contact
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex flex-col space-y-3 text-center">
                  <a
                    href="tel:9258924611"
                    className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300 text-lg"
                  >
                    📞 Emergency: 9258924611
                  </a>
                  <a
                    href="mailto:drnitinmishraderma@gmail.com"
                    className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    ✉️ drnitinmishraderma@gmail.com
                  </a>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Login Form */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl overflow-hidden dark:bg-slate-800/90 dark:border-slate-700">
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-4 text-white text-center">
                  <h2 className="text-xl font-semibold">Patient Login</h2>
                  <p className="text-sm opacity-90">Secure access to your health portal</p>
                </div>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="patient-email" className="dark:text-gray-300">
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
                              className="pl-10 bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                              placeholder="patient@example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="patient-password" className="dark:text-gray-300">
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
                              className="pl-10 pr-10 bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600"
                              placeholder="Enter your password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400"
                              onClick={() => togglePasswordVisibility()}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
                          >
                            {error}
                          </motion.div>
                        )}

                        <div className="flex items-center justify-between">
                          <Link
                            href="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-md"
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                              </span>
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </motion.div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            New patient?{" "}
                            <Link
                              href="/register"
                              className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Create an account
                            </Link>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
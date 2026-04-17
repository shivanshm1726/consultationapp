"use client";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePatients } from "@/hooks/usePatients";
import { logoutUser } from "@/lib/auth";
import {
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  User,
  Activity,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  Microscope,
  Cpu,
  Fingerprint
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, userData, loading } = useAuth();
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  
  const { linkedPatients, activePatient, addPatient, selectPatient } = usePatients(
    user?.email || "", 
    userData?.phone || "", 
    user?.uid || ""
  );

  // Monitor Scroll for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCheckingRedirect(false);
      return;
    }

    if (userData?.role === "admin") router.replace("/admin");
    else if (userData?.role === "receptionist") router.replace("/reception");
    else setCheckingRedirect(false);
  }, [user, userData, loading, router]);

  if (checkingRedirect || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030303]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("role");
      localStorage.removeItem("activePatientId");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"}`}>

      {/* Futuristic Background Patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 dark:opacity-20 mix-blend-screen pointer-events-none blur-[120px] rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-800/20" />
      </div>

      {/* Floating Pill Navigation */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <div className={`transition-all duration-500 mx-4 w-full max-w-6xl rounded-2xl border flex items-center justify-between px-6 py-3 shadow-2xl backdrop-blur-xl ${
          scrolled 
            ? "bg-white/80 border-slate-200 dark:bg-[#0a0a0a]/80 dark:border-white/10 shadow-emerald-900/5 py-4" 
            : "bg-white/50 border-white/20 dark:bg-[#0a0a0a]/50 dark:border-white/5"
        }`}>
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white hidden sm:block">
              Nexus Health
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Doctors", "Treatments", "Contact"].map(link => (
              <Link key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                {link}
              </Link>
            ))}
          </nav>

          {/* Interaction Area */}
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5 transition-all">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-4">
                <Link href="/profile">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-slate-200 dark:border-white/10">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                </Link>
                <Link href="/appointment">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 shadow-lg shadow-emerald-500/25">
                    Book Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-600 dark:text-slate-300 hover:bg-transparent hover:text-emerald-500 dark:hover:text-emerald-400">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 rounded-full px-6 shadow-xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 md:pt-52 md:pb-32 px-4 z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse inline-block" />
            Clinic Operations Platform V2.0
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
            Next-Generation <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600">
              Healthcare Architecture.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience frictionless digital health routing. Instant appointments, secure patient queuing, and direct line-of-sight communication with leading specialists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/appointment">
              <Button size="lg" className="h-14 px-8 text-base rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 group">
                Schedule Consultation
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white/5 dark:bg-black/20 border-slate-200 dark:border-white/10 backdrop-blur-xl hover:bg-slate-100 dark:hover:bg-white/5 group">
                <Fingerprint className="mr-2 w-4 h-4 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                Access Portal
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Bento Box Feature Layout */}
      <section className="relative py-20 z-10 container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 p-8 shadow-2xl hover:border-emerald-500/50 transition-colors duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/10 transition-colors duration-700" />
            <CalendarDays className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Smart Scheduling Engine</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">Our algorithm intelligently manages doctor availability, eliminating double-bookings and enforcing strictly synchronized time blocks.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="relative group overflow-hidden rounded-3xl bg-slate-900 dark:bg-[#0a0a0a] border border-slate-800 dark:border-white/5 p-8 shadow-2xl hover:border-teal-500/50 transition-colors duration-500"
          >
            <ShieldCheck className="w-10 h-10 text-teal-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Encrypted Records</h3>
            <p className="text-slate-400 text-sm">Enterprise-grade security ensuring your medical data remains completely localized.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative group overflow-hidden rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 p-8 shadow-2xl hover:border-emerald-500/50 transition-colors duration-500 flex flex-col justify-between"
          >
            <div>
              <Cpu className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Live WebSockets</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Virtual waiting rooms powered by bi-directional socket connections.</p>
            </div>
            <div className="mt-8 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">System Live</span>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 p-8 shadow-2xl hover:border-teal-500/50 transition-colors duration-500"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 group-hover:bg-teal-500/10 transition-colors duration-700" />
            <Microscope className="w-10 h-10 text-teal-500 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Role Segregation Protocol</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">Dedicated environments for Patients, Doctors, Assistants, and Platform Admins. No tangled routes, mathematical precision.</p>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#030303] py-12 mt-20 z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">Nexus Health</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Architectural Healthcare Platforms. All rights strictly reserved.</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useAuth } from "@/contexts/auth-context";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Activity,
  CalendarDays,
  Video,
  MessageSquare,
  Settings,
  LogOut,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { logoutUser } from "@/lib/auth";

const AUTH_API = "http://localhost:5001/api/auth";

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
       const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
       const token = tokenMatch ? tokenMatch[1] : null;
       axios.get("http://localhost:5001/api/appointments", { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setMyAppointments(res.data))
         .catch(console.error)
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: user?.email || "",
        age: userData.age?.toString() || "",
        phone: userData.phone || "",
      });
    }
  }, [user, userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.put(`${AUTH_API}/profile`, {
        fullName: formData.fullName,
        age: Number(formData.age),
        phone: formData.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Profile updated successfully!");
      toast({ title: "Success", description: "Your profile has been updated." });
      
      // Force refresh to grab updated context
      window.location.reload();
    } catch (error: any) {
      console.error("Update error:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("role");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030303]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"}`}>
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 mix-blend-screen pointer-events-none blur-[100px] rounded-full bg-gradient-to-l from-emerald-500 to-teal-800" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        
        <header className="flex justify-between items-center mb-12">
           <Link href="/">
             <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 backdrop-blur-md rounded-full">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Hub
             </Button>
           </Link>
           <Button variant="outline" onClick={handleLogout} className="rounded-full bg-white/5 dark:bg-black/20 border-slate-200 dark:border-white/10 backdrop-blur-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
             <LogOut className="h-4 w-4 mr-2" /> End Session
           </Button>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Sidebar / Profile Component */}
           <div className="lg:col-span-4 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                 <Card className="p-8 border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                    
                    <div className="flex flex-col items-center mb-8 relative z-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white dark:border-[#0a0a0a]">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                         {userData?.fullName || "Patient Profile"}
                      </h1>
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                         <Fingerprint className="h-4 w-4 mr-1" /> Authenticated
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</Label>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Secure Email</Label>
                        <Input value={formData.email} disabled className="bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 rounded-xl opacity-70" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Age</Label>
                          <Input
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            required
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</Label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl"
                          />
                        </div>
                      </div>

                      {error && <div className="text-red-500 text-sm flex items-center bg-red-500/10 p-3 rounded-lg"><AlertCircle className="mr-2 h-4 w-4" />{error}</div>}
                      {success && <div className="text-emerald-500 text-sm flex items-center bg-emerald-500/10 p-3 rounded-lg"><CheckCircle className="mr-2 h-4 w-4" />{success}</div>}

                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl mt-4" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Configuration"}
                      </Button>
                    </form>
                 </Card>
              </motion.div>
           </div>

           {/* Appointments Panel */}
           <div className="lg:col-span-8 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-xl min-h-[600px]"
              >
                 <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                       <CalendarDays className="w-6 h-6 text-emerald-500" />
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Consultations</h2>
                    </div>
                    <Link href="/appointment">
                       <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
                         Book New
                       </Button>
                    </Link>
                 </div>

                 {myAppointments.length > 0 ? (
                   <div className="grid gap-4">
                      {myAppointments.map((apt: any, i: number) => (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                           key={apt._id} 
                           className="group relative overflow-hidden bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-all"
                        >
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                           <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                              
                              <div>
                                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                 </h3>
                                 <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1 bg-slate-200 dark:bg-white/10 px-2 py-1 rounded-md font-mono">
                                       <CalendarDays className="w-3 h-3" /> {apt.timeSlot}
                                    </span>
                                    <span className="capitalize text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                                       • {apt.status}
                                    </span>
                                 </div>
                                 <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 italic bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                    "{apt.reason}"
                                 </p>
                              </div>

                              <div className="flex flex-row md:flex-col items-center justify-end gap-3 Shrink-0">
                                 {apt.status === 'in-progress' && (
                                   <Link href={`/call?roomId=${apt._id}&type=video`} className="w-full">
                                     <Button className="w-full bg-emerald-500 hover:bg-emerald-600 animate-pulse text-white shadow-lg shadow-emerald-500/20 rounded-xl">
                                       <Video className="w-4 h-4 mr-2" /> Join Video
                                     </Button>
                                   </Link>
                                 )}
                                 <Link href={`/chat?appointmentId=${apt._id}`} className="w-full">
                                   <Button variant="outline" className="w-full rounded-xl bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:border-emerald-500/30">
                                     <MessageSquare className="w-4 h-4 mr-2" /> Live Chat
                                   </Button>
                                 </Link>
                              </div>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                         <Activity className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Consultations</h3>
                         <p className="text-slate-500">Your health routing queue is currently empty.</p>
                      </div>
                   </div>
                 )}
              </motion.div>
           </div>
        </div>
      </div>
    </div>
  );
}
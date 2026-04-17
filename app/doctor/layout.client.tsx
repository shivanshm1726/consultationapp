"use client"
import { ThemeProvider } from 'next-themes'
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import { Switch } from "@/components/ui/switch"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Calendar, Users, DollarSign, LogOut, Bell, Stethoscope, Phone, Clock, UserCheck, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface DoctorLayoutProps {
  children: React.ReactNode
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const CHAT_API = `${API_BASE_URL}/api/chats`;
export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const { user, userData, logout } = useAuth()
  const [waitingPatients, setWaitingPatients] = useState<number>(0)
  const [isOnline, setIsOnline] = useState<boolean>(userData?.isAvailableOnline ?? true)

  const handleToggleOnline = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;
      const res = await axios.put(`${API_BASE_URL}/api/auth/availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsOnline(res.data.isAvailableOnline);
    } catch (err) {
      console.error("Failed to toggle availability", err);
    }
  }
  const pathname = usePathname()
  const router = useRouter()

  const fetchWaitingCount = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${CHAT_API}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Simplified: just counting sessions for now
      setWaitingPatients(response.data.length)
    } catch (err) {
      console.error("Error fetching waiting count:", err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWaitingCount()
      const interval = setInterval(fetchWaitingCount, 10000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = async () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/doctor",
      isActive: pathname === "/doctor",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      href: "/doctor/messages",
      isActive: pathname === "/doctor/messages",
      badge: waitingPatients > 0 ? waitingPatients : undefined,
    },
    {
      title: "Calls",
      icon: Phone,
      href: "/doctor/calls",
      isActive: pathname === "/doctor/calls",
    },
    {
      title: "Appointments",
      icon: Calendar,
      href: "/doctor/appointments",
      isActive: pathname === "/doctor/appointments",
    },
    {
      title: "Schedule",
      icon: Clock,
      href: "/doctor/schedule",
      isActive: pathname === "/doctor/schedule",
    },
    {
      title: "Patients Data",
      icon: Users,
      href: "/doctor/patients",
      isActive: pathname === "/doctor/patients",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-800/60 p-6">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Doctor Panel</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Medical Dashboard</p>
              </div>
            </motion.div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 dark:hover:from-teal-950/50 dark:hover:to-blue-950/50 group"
                      >
                        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto animate-pulse">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-800/60 p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-xl border border-teal-100 dark:border-teal-800/30">
                <Avatar className="h-10 w-10 ring-2 ring-teal-200 dark:ring-teal-700">
                  <AvatarFallback className="bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold">
                    {userData?.fullName?.split(" ").map(n => n[0]).join("") || "DR"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {userData?.fullName || "Doctor"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Physician</p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-sm">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isOnline ? 'Accepting Patients' : 'Offline'}
                </span>
                <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className={isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} />
              </div>
              
              {waitingPatients > 0 && (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/30">
                <Bell className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">
                  {waitingPatients} active session{waitingPatients > 1 ? "s" : ""}
                </span>
              </div>
            )}
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
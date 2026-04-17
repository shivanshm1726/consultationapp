"use client"
import { ThemeProvider } from 'next-themes'
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTodayNotifications } from "./hooks/useTodayNotifications"
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
import { LayoutDashboard, LogOut, Bell, ClipboardList, Wallet, CalendarDays, Users, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import "../globals.css"

interface ReceptionLayoutProps {
  children: React.ReactNode
}

export default function ReceptionLayout({ children }: ReceptionLayoutProps) {
  const { userData, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { notifications, unread, markAsRead, audioRef } = useTodayNotifications()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    logout()
    router.push("/login")
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
    if (unread) markAsRead()
  }

  const menuItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      href: "/reception/overview",
      isActive: pathname === "/reception/overview",
    },
    {
      title: "Appointments",
      icon: CalendarDays,
      href: "/admin/appointments", // Reusing the unified table from admin if possible, else standard routes
      isActive: pathname === "/admin/appointments",
    },
    {
      title: "Payments",
      icon: Wallet,
      href: "/reception/payments",
      isActive: pathname === "/reception/payments",
    },
    {
      title: "Live Queues",
      icon: Users,
      href: "/reception/queue",
      isActive: pathname === "/reception/queue",
    },
    {
      title: "Doctor Timings",
      icon: CalendarClock,
      href: "/reception/schedules",
      isActive: pathname === "/reception/schedules",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-6">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Front Desk</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Assistant Panel</p>
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
                        className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-950/50 dark:hover:to-emerald-950/50 group"
                      >
                        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-xl border border-teal-100 dark:border-teal-800/30">
                <Avatar className="h-10 w-10 ring-2 ring-teal-200 dark:ring-teal-700">
                  <AvatarFallback className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold">
                    {userData?.fullName?.split(" ").map(n => n[0]).join("") || "AS"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {userData?.fullName || "Assistant"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Receptionist</p>
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
            <SidebarTrigger className="-ml-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" />
            
            <div className="relative">
              <button onClick={toggleDropdown} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                {unread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden z-50"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800/50 font-semibold px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-slate-900 dark:text-white">Today's Appointments</span>
                      <Badge variant="secondary">{notifications.length}</Badge>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No new appointments booked today
                      </div>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notif) => (
                          <li key={notif.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-slate-900 dark:text-white">{notif.name}</span>
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{notif.time}</span>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{notif.phone}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              Booked at: {new Date(notif.createdAt).toLocaleTimeString()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>

      <audio ref={audioRef} preload="auto" src="/notification.mp3" />
    </SidebarProvider>
  )
}

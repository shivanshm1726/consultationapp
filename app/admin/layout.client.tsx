"use client"
import { ThemeProvider } from 'next-themes'
import type React from "react"
import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { collection, query, where } from "firebase/firestore"
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
import { LayoutDashboard, Calendar, Users, DollarSign, LogOut, Bell, Stethoscope, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface DoctorLayoutProps {
  children: React.ReactNode
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const [user] = useAuthState(auth)
  const [doctorName, setDoctorName] = useState<string>("")
  const [waitingPatients, setWaitingPatients] = useState<number>(0)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchDoctorInfo()
      const waitingQuery = query(collection(db, "chats"), where("status", "==", "waiting"))
      const unsubscribe = onSnapshot(waitingQuery, (snapshot) => {
        setWaitingPatients(snapshot.size)
      })

      return () => unsubscribe()
    }
  }, [user])

  const fetchDoctorInfo = async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setDoctorName(userData.fullName || "Doctor")
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      isActive: pathname === "/admin",
    },
    {
      title: "Chat Logs",
      icon: Stethoscope,
      href: "/admin/chatLogs",
      isActive: pathname === "/admin/chatLogs",
      badge: waitingPatients > 0 ? waitingPatients : undefined,
    },
    {
      title: "Calls",
      icon: Phone,
      href: "/admin/calls",
      isActive: pathname === "/admin/call",
    },
    {
      title: "Appointments",
      icon: Calendar,
      href: "/admin/appointments",
      isActive: pathname === "/admin/appointments",
    },
    {
      title: "Patients Data",
      icon: Users,
      href: "/admin/patients",
      isActive: pathname === "/admin/patients",
    },
    {
      title: "Revenue",
      icon: DollarSign,
      href: "/admin/revenue",
      isActive: pathname === "/admin/revenue",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-teal-950/20">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-800/60 p-6">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
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
                  transition={{ delay: index * 0.1 + 0.2 }}
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
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* Doctor Info */}
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-xl border border-teal-100 dark:border-teal-800/30">
                <Avatar className="h-10 w-10 ring-2 ring-teal-200 dark:ring-teal-700">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold">
                    {doctorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "DR"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {doctorName || "Loading..."}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Dermatologist</p>
                </div>
                {waitingPatients > 0 && (
                  <div className="relative">
                    <Bell className="h-5 w-5 text-amber-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 bg-transparent transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </motion.div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content using SidebarInset for proper full-width layout */}
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            <SidebarTrigger className="-ml-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" />
            <div className="flex-1" />
            {waitingPatients > 0 && (
              <motion.div
                className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Bell className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">
                  {waitingPatients} patient{waitingPatients > 1 ? "s" : ""} waiting
                </span>
              </motion.div>
            )}
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
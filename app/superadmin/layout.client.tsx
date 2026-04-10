"use client"
import type React from "react"
import { useAuth } from "@/contexts/auth-context"
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
import { LayoutDashboard, LogOut, Building, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface SuperAdminLayoutProps {
  children: React.ReactNode
}

export default function SuperAdminLayoutClient({ children }: SuperAdminLayoutProps) {
  const { userData, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    {
      title: "Platform Overview",
      icon: LayoutDashboard,
      href: "/superadmin",
      isActive: pathname === "/superadmin",
    },
    {
      title: "Manage Clinics",
      icon: Building,
      href: "/superadmin/clinics",
      isActive: pathname === "/superadmin/clinics",
    },
    {
      title: "System Logs",
      icon: Activity,
      href: "/superadmin/logs",
      isActive: pathname === "/superadmin/logs",
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SaaS Admin</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Global Control</p>
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
                        className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 group"
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

          <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-800/60 p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <Avatar className="h-10 w-10 ring-2 ring-indigo-200 dark:ring-indigo-800">
                  <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
                    {userData?.fullName?.split(" ").map((n: string) => n[0]).join("") || "SA"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {userData?.fullName || "SuperAdmin"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Owner</p>
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
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

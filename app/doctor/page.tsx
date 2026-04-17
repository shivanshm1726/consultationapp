"use client"
import { motion } from "framer-motion"
import { Users, Calendar, MessageSquare, Video } from "lucide-react"
import Link from "next/link"

export default function DoctorDashboard() {
  const stats = [
    { title: "Today's Appointments", value: "8", icon: Calendar, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/40" },
    { title: "Active Chats", value: "3", icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    { title: "Waiting Room", value: "2", icon: Users, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/40" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Clinical Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back to your workspace. Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-400">{stat.title}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/doctor/messages">
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg cursor-pointer"
          >
            <div className="relative z-10">
              <MessageSquare className="w-10 h-10 mb-4 opacity-80" />
              <h2 className="text-2xl font-bold mb-2">Patient Messages</h2>
              <p className="text-indigo-100">View all patient conversations, reply to messages, and manage consultations.</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="w-48 h-48" />
            </div>
          </motion.div>
        </Link>
        <Link href="/doctor/calls">
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-8 text-white shadow-lg cursor-pointer"
          >
            <div className="relative z-10">
              <Video className="w-10 h-10 mb-4 opacity-80" />
              <h2 className="text-2xl font-bold mb-2">Live Video Calls</h2>
              <p className="text-teal-100">Connect with patients face-to-face from your digital clinic room.</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Video className="w-48 h-48" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}

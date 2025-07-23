"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Phone,
  Video,
} from "lucide-react"

const statsCards = [
  {
    title: "Total Consultations",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Activity,
    color: "from-blue-600 to-blue-700",
  },
  {
    title: "Active Doctors",
    value: "156",
    change: "+3.2%",
    trend: "up",
    icon: UserCheck,
    color: "from-green-600 to-green-700",
  },
  {
    title: "Registered Patients",
    value: "8,924",
    change: "+18.7%",
    trend: "up",
    icon: Users,
    color: "from-purple-600 to-purple-700",
  },
  {
    title: "Monthly Revenue",
    value: "₹4,52,890",
    change: "+24.1%",
    trend: "up",
    icon: DollarSign,
    color: "from-orange-600 to-orange-700",
  },
]

const recentAppointments = [
  {
    id: "APT001",
    patient: "Rahul Sharma",
    doctor: "Dr. Nitin Mishra",
    time: "10:30 AM",
    status: "completed",
    type: "video",
  },
  {
    id: "APT002",
    patient: "Priya Patel",
    doctor: "Dr. Nitin Mishra",
    time: "11:15 AM",
    status: "ongoing",
    type: "audio",
  },
  {
    id: "APT003",
    patient: "Amit Kumar",
    doctor: "Dr. Nitin Mishra",
    time: "2:00 PM",
    status: "scheduled",
    type: "video",
  },
  {
    id: "APT004",
    patient: "Sneha Gupta",
    doctor: "Dr. Nitin Mishra",
    time: "3:30 PM",
    status: "scheduled",
    type: "chat",
  },
]

const systemAlerts = [
  {
    type: "warning",
    message: "Server load is at 85% - consider scaling",
    time: "5 minutes ago",
  },
  {
    type: "success",
    message: "Daily backup completed successfully",
    time: "1 hour ago",
  },
  {
    type: "info",
    message: "New doctor verification pending",
    time: "2 hours ago",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Appointments</span>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        {appointment.type === "video" ? (
                          <Video className="h-5 w-5 text-white" />
                        ) : appointment.type === "audio" ? (
                          <Phone className="h-5 w-5 text-white" />
                        ) : (
                          <Activity className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{appointment.patient}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          with {appointment.doctor} • {appointment.time}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "completed"
                          ? "default"
                          : appointment.status === "ongoing"
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        appointment.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : appointment.status === "ongoing"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : ""
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status & Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* System Status */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Video Calls</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chat Service</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    {alert.type === "warning" ? (
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    ) : alert.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

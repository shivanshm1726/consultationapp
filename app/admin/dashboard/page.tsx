"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, where, getDocs, orderBy, limit, Timestamp, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Phone,
  MessageSquare,
  Shield,
  Search,
  UserCheck,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface DashboardStats {
  totalConsultations: number
  pendingAppointments: number
  totalRevenue: number
  activePatients: number
  todayAppointments: number
}

interface RecentActivity {
  id: string
  type: "chat" | "appointment" | "call"
  patient: string
  time: string
  status: string
}

interface UserRecord {
  id: string
  fullName: string
  email: string
  role: "admin" | "patient" | "receptionist"
}

export default function AdminDashboard() {
  const [user] = useAuthState(auth)
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultations: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    activePatients: 0,
    todayAppointments: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [allUsers, setAllUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"analytics" | "users">("analytics")

  const doctorFee = Number.parseInt(process.env.NEXT_PUBLIC_DOCTOR_FEE || "500")

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUsers()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Get total consultations from chats collection
      const chatsQuery = query(collection(db, "chats"))
      const chatsSnapshot = await getDocs(chatsQuery)
      const totalConsultations = chatsSnapshot.size

      // Get pending appointments
      const appointmentsQuery = query(collection(db, "appointments"), where("status", "!=", "completed"))
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const pendingAppointments = appointmentsSnapshot.size

      // Calculate revenue (completed consultations * fee)
      const completedQuery = query(collection(db, "appointments"), where("status", "==", "completed"))
      const completedSnapshot = await getDocs(completedQuery)
      const totalRevenue = completedSnapshot.size * doctorFee

      // Get active patients in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentChatsQuery = query(
        collection(db, "chats"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo)),
      )
      const recentChatsSnapshot = await getDocs(recentChatsQuery)
      const activePatients = new Set(recentChatsSnapshot.docs.map((doc) => doc.data().patientEmail)).size

      // Get today's appointments
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayQuery = query(
        collection(db, "appointments"),
        where("date", ">=", Timestamp.fromDate(today)),
        where("date", "<", Timestamp.fromDate(tomorrow)),
      )
      const todaySnapshot = await getDocs(todayQuery)
      const todayAppointments = todaySnapshot.size

      setStats({
        totalConsultations,
        pendingAppointments,
        totalRevenue,
        activePatients,
        todayAppointments,
      })

      // Get recent activity
      const recentQuery = query(collection(db, "appointments"), orderBy("createdAt", "desc"), limit(5))
      const recentSnapshot = await getDocs(recentQuery)
      const activities: RecentActivity[] = recentSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          type: "appointment",
          patient: data.patientName || "Unknown Patient",
          time: data.createdAt?.toDate?.()?.toLocaleTimeString() || "Unknown",
          status: data.status || "pending",
        }
      })
      setRecentActivity(activities)

      // Generate chart data (mock data for demo - you can replace with real data)
      const mockChartData = [
        { name: "Mon", patients: 12, revenue: 6000 },
        { name: "Tue", patients: 19, revenue: 9500 },
        { name: "Wed", patients: 15, revenue: 7500 },
        { name: "Thu", patients: 22, revenue: 11000 },
        { name: "Fri", patients: 18, revenue: 9000 },
        { name: "Sat", patients: 25, revenue: 12500 },
        { name: "Sun", patients: 8, revenue: 4000 },
      ]
      setChartData(mockChartData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const data: UserRecord[] = usersSnapshot.docs.map((docSnap) => {
        const docData = docSnap.data()
        const { id: _id, ...rest } = docData // avoid duplicate id assignment
        return {
          id: docSnap.id,
          ...(rest as Omit<UserRecord, "id">),
        }
      })
      setAllUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleRoleChange = async (uid: string, role: UserRecord["role"]) => {
    try {
      setUpdating(uid)
      await updateDoc(doc(db, "users", uid), { role })
      await fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = allUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase()),
  )

  const statsCards = [
    {
      title: "Total Consultations",
      value: stats.totalConsultations.toString(),
      change: "+12.5%",
      icon: Activity,
      color: "from-blue-600 to-blue-700",
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments.toString(),
      change: "+3.2%",
      icon: Calendar,
      color: "from-orange-600 to-orange-700",
    },
    {
      title: "Active Patients (30d)",
      value: stats.activePatients.toString(),
      change: "+18.7%",
      icon: Users,
      color: "from-green-600 to-green-700",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+24.1%",
      icon: DollarSign,
      color: "from-purple-600 to-purple-700",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "analytics" ? "default" : "outline"}
          onClick={() => setActiveTab("analytics")}
          className="flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Analytics Dashboard</span>
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "outline"}
          onClick={() => setActiveTab("users")}
          className="flex items-center space-x-2"
        >
          <Shield className="h-4 w-4" />
          <span>User Management</span>
        </Button>
      </div>

      {activeTab === "analytics" ? (
        <>
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

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Patients Chart */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Patients This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Revenue This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Status & Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Today's Schedule */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Appointments</span>
                    <Badge variant="secondary">{stats.todayAppointments}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clinic Hours</span>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">10 AM - 2 PM</p>
                      <p className="text-xs text-gray-500">6 PM - 8 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Chat Service</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Online</span>
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
                    <span className="text-sm font-medium">Database</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          {activity.type === "chat" ? (
                            <MessageSquare className="h-4 w-4 text-white" />
                          ) : activity.type === "call" ? (
                            <Phone className="h-4 w-4 text-white" />
                          ) : (
                            <Calendar className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.patient}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.type} • {activity.time}
                          </p>
                          <Badge variant={activity.status === "completed" ? "default" : "secondary"} className="mt-1">
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      ) : (
        /* User Management Tab */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{allUsers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                    <p className="text-2xl font-bold text-red-600">
                      {allUsers.filter((u) => u.role === "admin").length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients</p>
                    <p className="text-2xl font-bold text-green-600">
                      {allUsers.filter((u) => u.role === "patient").length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receptionists</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {allUsers.filter((u) => u.role === "receptionist").length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Table */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                User Role Management
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10 bg-white/50 dark:bg-gray-700/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 font-semibold">Full Name</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Current Role</th>
                      <th className="text-left p-3 font-semibold">Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userRecord, index) => (
                      <motion.tr
                        key={userRecord.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="p-3 font-medium">{userRecord.fullName}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{userRecord.email}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              userRecord.role === "admin"
                                ? "destructive"
                                : userRecord.role === "receptionist"
                                  ? "secondary"
                                  : "default"
                            }
                            className={
                              userRecord.role === "admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : userRecord.role === "receptionist"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }
                          >
                            {userRecord.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <select
                            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userRecord.role}
                            disabled={updating === userRecord.id}
                            onChange={(e) => handleRoleChange(userRecord.id, e.target.value as UserRecord["role"])}
                          >
                            <option value="patient">Patient</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updating === userRecord.id && (
                            <div className="ml-2 inline-block">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                          {search ? "No users found matching your search." : "No users found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

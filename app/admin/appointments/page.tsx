"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import {
  Search,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
} from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  age: string
  gender: string
  symptoms: string
  urgency: string
  date: any
  time: string
  status: string
  createdAt: any
}

export default function AppointmentsPage() {
  const [user] = useAuthState(auth)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, urgencyFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const appointmentsQuery = query(collection(db, "appointments"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(appointmentsQuery)
      const appointmentsData: Appointment[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Appointment,
      )

      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    if (urgencyFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.urgency === urgencyFilter)
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)))
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {appointments.filter((apt) => apt.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter((apt) => apt.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {appointments.filter((apt) => apt.status === "cancelled").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Appointments Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment.status)}
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{appointment.patientName}</h3>
                      <Badge variant="secondary" className={getUrgencyColor(appointment.urgency)}>
                        {appointment.urgency} urgency
                      </Badge>
                      <Badge
                        variant={
                          appointment.status === "completed"
                            ? "default"
                            : appointment.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {appointment.age} years, {appointment.gender}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {appointment.patientEmail}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {appointment.patientPhone}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      <span className="font-medium">Scheduled:</span>{" "}
                      {appointment.date?.toDate?.()?.toLocaleDateString()} at {appointment.time}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, "pending")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Mark Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Phone, Clock, MapPin, CreditCard, AlertTriangle, Users, Loader2 } from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Appointment {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  clinic: string
  clinicId: string
  time: string
  symptoms: string
  paymentStatus: "paid" | "pending" | "failed"
  urgency: "low" | "medium" | "high" | ""
  date: Date
  createdAt: Date
}

type FilterType = "today" | "all"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("today")
  const [acceptingAppointments, setAcceptingAppointments] = useState(false)

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Apply date filter based on when appointment was booked (createdAt)
    const now = new Date()
    switch (activeFilter) {
      case "today":
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)
        filtered = filtered.filter((apt) => apt.createdAt >= todayStart && apt.createdAt <= todayEnd)
        break
      case "all":
        // Keep all appointments - no date filtering
        break
      default:
        break
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (apt) =>
          `${apt.firstName} ${apt.lastName}`.toLowerCase().includes(searchLower) ||
          apt.phone.includes(searchTerm.trim()) ||
          apt.email.toLowerCase().includes(searchLower),
      )
    }

    setFilteredAppointments(filtered)
  }

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const a = doc.data()
        return {
          id: doc.id,
          firstName: a.firstName || "",
          lastName: a.lastName || "",
          phone: a.phone || "",
          email: a.email || "",
          clinic: a.clinic || "",
          patientId: a.patientId || "",
          clinicId: a.clinicId || "",
          time: a.time || "",
          symptoms: a.symptoms || "",
          paymentStatus: a.paymentStatus || "pending",
          urgency: a.urgency || "",
          date: a.date instanceof Date ? a.date : a.date?.toDate?.() || new Date(a.date),
          createdAt: a.createdAt?.toDate?.() || new Date(),
        }
      })
      setAppointments(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, activeFilter, searchTerm])

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300"
    }
  }

  const filterButtons = [
    { key: "today" as FilterType, label: "Today", icon: Calendar },
    { key: "all" as FilterType, label: "All", icon: Clock },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-slate-600 dark:text-slate-400">Loading appointments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-slate-600 dark:text-slate-400">View all patient appointments</p>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.key)}
              className={`transition-all duration-300 ${
                activeFilter === filter.key
                  ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <filter.icon className="h-4 w-4 mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60"
          />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {activeFilter === "today" ? "Today's Bookings" : "Current Appointments"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredAppointments.length}</p>
                </div>
                <Users className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Appointments</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{appointments.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Appointments List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-600" />
              Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-all duration-300 border border-slate-200/60 dark:border-slate-600/60"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {/* Patient Info */}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {appointment.firstName} {appointment.lastName}
                            </p>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.phone}
                            </div>
                          </div>

                          {/* Clinic & Time */}
                          <div>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              {appointment.clinic}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.time}
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div>
                            <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              {appointment.paymentStatus}
                            </Badge>
                          </div>

                          {/* Urgency Level */}
                          <div>
                            <Badge className={getUrgencyColor(appointment.urgency)}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {appointment.urgency || "Not specified"}
                            </Badge>
                          </div>

                          {/* Booking Date */}
                          <div className="text-right">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              <div className="font-medium">Booked for:</div>
                              <div>{format(appointment.createdAt, "MMM dd, yyyy")}</div>
                              <div>{format(appointment.createdAt, "hh:mm a")}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No appointments found</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : activeFilter === "today"
                        ? "No appointments booked today"
                        : "No appointments found"}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

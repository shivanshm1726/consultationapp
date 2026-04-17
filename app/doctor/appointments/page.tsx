"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Phone, Clock, MapPin, CreditCard, AlertTriangle, Users, Loader2, PlayCircle, CheckCircle, Video, MessageCircle } from "lucide-react"
import { format, startOfDay, endOfDay, isToday, isFuture, isPast } from "date-fns"
import axios from "axios"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

interface Appointment {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  timeSlot: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  symptoms: string
  date: Date
}

type FilterType = "today" | "upcoming" | "completed" | "all"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("today")

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
      const token = tokenMatch ? tokenMatch[1] : null

      const response = await axios.get(`${API_BASE_URL}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = response.data.map((a: any) => ({
        id: a._id,
        firstName: a.patientId?.firstName || "Unknown",
        lastName: a.patientId?.lastName || "",
        phone: a.patientId?.phone || "",
        email: a.patientId?.email || "",
        timeSlot: a.timeSlot,
        symptoms: a.reason || "",
        status: a.status || "scheduled",
        date: new Date(a.appointmentDate),
      }))

      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
      const token = tokenMatch ? tokenMatch[1] : null

      await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      fetchAppointments()
    } catch (error) {
       console.error("Error updating status:", error)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]
    filtered.sort((a, b) => {
      if (a.date.getTime() === b.date.getTime()) {
        return a.timeSlot.localeCompare(b.timeSlot)
      }
      return a.date.getTime() - b.date.getTime()
    })

    switch (activeFilter) {
      case "today":
        filtered = filtered.filter((apt) => isToday(apt.date) && apt.status !== "completed")
        break
      case "upcoming":
        filtered = filtered.filter((apt) => (isFuture(apt.date) || isToday(apt.date)) && apt.status === "scheduled")
        break
      case "completed":
         filtered = filtered.filter((apt) => apt.status === "completed")
         break
      case "all":
        break
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (apt) =>
          `${apt.firstName} ${apt.lastName}`.toLowerCase().includes(searchLower) ||
          apt.phone.includes(searchTerm.trim())
      )
    }

    setFilteredAppointments(filtered)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, activeFilter, searchTerm])


  const filterButtons = [
    { key: "today" as FilterType, label: "Today's Queue" },
    { key: "upcoming" as FilterType, label: "Upcoming" },
    { key: "completed" as FilterType, label: "Completed" },
    { key: "all" as FilterType, label: "All" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const activePatient = appointments.find(a => isToday(a.date) && a.status === 'in-progress')

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Queue & Appointments</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage patient flow and live consultations</p>
        </div>
      </div>

      {activePatient && (
         <Card className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-lg">
            <CardContent className="p-6">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                     </span>
                     <div>
                        <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Live Consultation</h2>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">{activePatient.firstName} {activePatient.lastName}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <Link href={`/doctor/chat?appointmentId=${activePatient.id}`}>
                        <Button className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg">
                           <MessageCircle className="w-4 h-4 mr-2" /> Chat
                        </Button>
                     </Link>
                     <Link href={`/doctor/call?roomId=${activePatient.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                           <Video className="w-4 h-4 mr-2" /> Join Video Call
                        </Button>
                     </Link>
                     <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" onClick={() => handleStatusChange(activePatient.id, "completed")}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-1">
          {filterButtons.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "ghost"}
              onClick={() => setActiveFilter(filter.key)}
              className={activeFilter === filter.key ? "bg-slate-900 text-white dark:bg-emerald-600" : "text-slate-600"}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
         <AnimatePresence>
         {filteredAppointments.length > 0 ? filteredAppointments.map((apt, idx) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1 flex gap-6 w-full">
                     <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700 text-center min-w-[100px]">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{format(apt.date, "MMM dd")}</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-emerald-400">{apt.timeSlot}</div>
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {apt.firstName} {apt.lastName}
                           {activeFilter === 'today' && apt.status === 'scheduled' && <Badge variant="secondary" className="ml-2">#Queue {idx + 1}</Badge>}
                           {apt.status === 'completed' && <Badge className="bg-emerald-100 text-emerald-800 ml-2">Completed</Badge>}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center mt-1"><Phone className="w-3 h-3 mr-1"/> {apt.phone}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><span className="font-semibold">Reason:</span> {apt.symptoms}</p>
                     </div>
                  </div>
                  <div>
                     {apt.status === "scheduled" && isToday(apt.date) && !activePatient && (
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700" onClick={() => handleStatusChange(apt.id, "in-progress")}>
                           <PlayCircle className="w-4 h-4 mr-2" /> Start Consultation
                        </Button>
                     )}
                  </div>
               </div>
            </motion.div>
         )) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
               <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
               <h3 className="text-lg font-medium text-slate-900 dark:text-white">Empty Queue</h3>
               <p className="text-slate-500">No appointments fit the current criteria.</p>
            </div>
         )}
         </AnimatePresence>
      </div>

    </div>
  )
}

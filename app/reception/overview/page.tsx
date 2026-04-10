"use client"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useAppointments } from "../hooks/useAppointments"
import { Switch } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Users as UsersIcon, CheckCircle2, Clock } from "lucide-react"
import axios from "axios"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import AppointmentCard from "../components/AppointmentCard"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export default function ReceptionOverview() {
  const router = useRouter()
  const [active, setActive] = useState(true)
  const toggleStatus = () => setActive(!active)
  const { appointments, loading, updateAppointmentStatus } = useAppointments()
  const [sortDesc, setSortDesc] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [applySearch, setApplySearch] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const formatDate = (value: any): string => {
    if (!value) return "N/A"
    return new Date(value).toLocaleDateString()
  }

  const formatTime = (value: any): string => {
    if (!value) return "N/A"
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleDeleteConfirmed = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
      await axios.delete(`${API_BASE_URL}/api/appointments/bulk/last-month`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDeleteSuccess(true)
      setShowConfirmModal(false)
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  // Filter & Search Logic
  const filteredAppointments = appointments
    .filter((apt) => {
      if (filter === "calendar" && selectedDate) {
        const aptDate = new Date(apt.appointmentDate).toDateString()
        const selDate = selectedDate.toDateString()
        return aptDate === selDate
      }
      return true
    })
    .filter((apt) => {
      const name = `${apt.patientId?.firstName ?? ""} ${apt.patientId?.lastName ?? ""}`.toLowerCase()
      const phone = apt.patientId?.phone ?? ""
      return name.includes(applySearch) || phone.includes(applySearch)
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortDesc ? dateB - dateA : dateA - dateB
    })

  const statsCards = [
    {
      title: "Filtered Appointments",
      value: filteredAppointments.length.toString(),
      icon: CalendarIcon,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Total Registered",
      value: appointments.length.toString(),
      icon: UsersIcon,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ]

  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Front Desk Overview
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Manage today's schedule and clinic flow.
        </p>
      </motion.div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">New Bookings</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Toggle to freeze the appointment calendar for today.
                </p>
              </div>
              <Switch
                checked={active}
                onChange={toggleStatus}
                className={`${active ? "bg-emerald-500" : "bg-red-500"
                  } relative inline-flex h-8 w-14 items-center rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-75`}
              >
                <span className="sr-only">Toggle bookings</span>
                <span
                  className={`${active ? "translate-x-7" : "translate-x-1"
                    } inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm`}
                />
              </Switch>
            </div>
            {active ? (
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Bookings are open and accepting patients.
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium mt-2">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Bookings are closed for the day.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl flex items-center">
          <CardContent className="p-6 w-full">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Patient Lookup</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setApplySearch(searchQuery.toLowerCase())
                  }
                }}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 transition-all"
              />
              <Button
                size="lg"
                onClick={() => setApplySearch(searchQuery.toLowerCase())}
                className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
              >
                <Search className="w-5 h-5 mr-2" /> Find
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -3 }}
          >
            <Card className={`${stat.bgColor} border-0 shadow-xl overflow-hidden relative group`}>
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <stat.icon className="h-7 w-7 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sort + Filter Toolbar */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">View All Appointments</option>
            <option value="lastMonth">Last Month's</option>
            <option value="calendar">By Specific Date</option>
          </select>

          {filter === "calendar" && (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-slate-200 dark:border-slate-800" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                    }
                  }}
                  initialFocus
                  className="bg-white dark:bg-slate-900"
                />
              </PopoverContent>
            </Popover>
          )}

          <Button 
            variant="secondary" 
            onClick={() => setSortDesc((prev) => !prev)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            {sortDesc ? "↓ Newest First" : "↑ Oldest First"}
          </Button>
        </div>

        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors mt-4 sm:mt-0"
          onClick={() => setShowConfirmModal(true)}
        >
          Clear Historic Data (Last Month)
        </Button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Confirm Deletion</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete last month’s appointments? This action permanently removes data from the database.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirmed}
                className="bg-red-600 text-white hover:bg-red-700 shadow-md"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Historic appointments purged.</span>
          <button className="ml-2 font-bold hover:text-emerald-200 transition-colors" onClick={() => setDeleteSuccess(false)}>
            ✕
          </button>
        </div>
      )}

      {/* Appointment Gallery */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 pb-20">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Fetching clinic schedule...</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-900 dark:text-white font-semibold text-lg">No Appointments Found</p>
            <p className="text-slate-500 dark:text-slate-400 text-center mt-1">
              Adjust your search filters or check the booking system.
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={{
                id: appointment.id,
                patientName: `${appointment.firstName ?? "?"} ${appointment.lastName ?? "?"}`,
                patientPhone: appointment.phone ?? "N/A",
                appointmentDate: formatDate(appointment.date),
                appointmentTime: formatTime(appointment.time),
                clinic: appointment.clinic ?? "N/A",
                urgency: appointment.urgency ?? "low",
                symptoms: appointment.symptoms && appointment.symptoms.trim() !== "" ? appointment.symptoms : "N/A",
              }}
              onDelete={() => { }}
            />
          ))
        )}
      </div>
    </div>
  )
}

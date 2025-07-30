"use client"
import { Search } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { db } from "@/lib/firebase"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { collection, onSnapshot, query, orderBy, type Timestamp, getDocs } from "firebase/firestore"
import { CalendarIcon, UsersIcon } from "../components/Icons"
import StatsCard from "../components/StatsCard"
import AppointmentCard from "../components/AppointmentCard"
import { useAppointmentStatus } from "../hooks/useAppointmentStatus"
import { Switch } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { deleteDoc } from "firebase/firestore"
import { logoutUser } from "@/lib/firebaseLogout"
import { LogOut } from "lucide-react"

type Appointment = {
  id: string
  firstName: string
  lastName: string
  phone: string
  date: Timestamp
  time: Timestamp
  clinic: string
  urgency: string
  createdAt: Timestamp
  status: string
  symptoms: string
}

export default function ReceptionOverview() {
  const { active, toggleStatus } = useAppointmentStatus()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [sortDesc, setSortDesc] = useState(true)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const calendarRef = useRef<HTMLButtonElement>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const todayDate = new Date()
  const [applySearch, setApplySearch] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [prevIds, setPrevIds] = useState<string[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isUserInteracted, setIsUserInteracted] = useState(false)

  // Helper to check Firestore Timestamp
  const isFirestoreTimestamp = (value: any): boolean => {
    return value && typeof value === "object" && "seconds" in value && "nanoseconds" in value
  }

  // Convert date/timestamp safely with better error handling
  const getSafeDate = (value: string | Timestamp | null | undefined): Date => {
    if (!value) {
      return new Date() // Return current date if value is null/undefined
    }

    if (typeof value === "string") {
      const date = new Date(value + "T00:00:00")
      return isNaN(date.getTime()) ? new Date() : date
    } else if (value && typeof value === "object" && "seconds" in value) {
      const date = new Date(value.seconds * 1000)
      return isNaN(date.getTime()) ? new Date() : date
    } else {
      return new Date()
    }
  }

  const formatDate = (value: string | Timestamp | null | undefined): string => {
    try {
      const date = getSafeDate(value)
      return date.toLocaleDateString()
    } catch (error) {
      console.warn("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const formatDateISO = (value: string | Timestamp | null | undefined): string => {
    try {
      const date = getSafeDate(value)
      return date.toISOString().split("T")[0]
    } catch (error) {
      console.warn("Error formatting date to ISO:", error)
      return new Date().toISOString().split("T")[0] // Return today's date as fallback
    }
  }

  const formatTime = (value: string | Timestamp | null | undefined): string => {
    try {
      if (!value) {
        return "Time not set"
      }

      const date = getSafeDate(value)
      if (isNaN(date.getTime())) {
        return "Invalid Time"
      }

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.warn("Error formatting time:", error)
      return "Invalid Time"
    }
  }

  useEffect(() => {
    const handleInteraction = () => {
      setIsUserInteracted(true)
      window.removeEventListener("click", handleInteraction)
    }

    window.addEventListener("click", handleInteraction)

    return () => {
      window.removeEventListener("click", handleInteraction)
    }
  }, [])

  useEffect(() => {
    if (isUserInteracted && !audioRef.current) {
      audioRef.current = new Audio("/notification.mp3")
    }
  }, [isUserInteracted])

  useEffect(() => {
    // Automatically open calendar when filter is set to "calendar"
    if (filter === "calendar" && calendarRef.current) {
      calendarRef.current.click()
    }
  }, [filter])

  useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("createdAt", sortDesc ? "desc" : "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[]

      setAppointments(data)
      setPrevIds(data.map((a) => a.id))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [sortDesc])

  // Filter logic
  const formattedSelectedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : ""

  const filteredAppointments = appointments
    .filter((apt) => {
      if (filter === "calendar" && formattedSelectedDate) {
        const aptDateISO = formatDateISO(apt.date) // Use ISO format for comparison
        return aptDateISO === formattedSelectedDate
      }
      if (filter === "lastMonth") {
        const aptDate = getSafeDate(apt.date)
        const now = new Date()
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
        return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === year
      }
      return true
    })
    .filter((apt) => {
      const name = `${apt.firstName ?? ""} ${apt.lastName ?? ""}`.toLowerCase()
      const phone = apt.phone ?? ""
      return name.includes(applySearch) || phone.includes(applySearch)
    })
    .sort((a, b) => {
      const dateA = getSafeDate(a.createdAt ?? a.date)
      const dateB = getSafeDate(b.createdAt ?? b.date)
      return sortDesc ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })

  // State for delete confirmation
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const handleDeleteConfirmed = async () => {
    try {
      const now = new Date()
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

      const snapshot = await getDocs(collection(db, "appointments"))
      const toDelete = snapshot.docs.filter((doc) => {
        const data = doc.data()
        const dateObj = getSafeDate(data.date)
        return dateObj.getMonth() === lastMonth && dateObj.getFullYear() === lastMonthYear
      })

      const deletions = toDelete.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletions)

      setDeleteSuccess(true)
      setShowConfirmModal(false)
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reception Dashboard</h1>
          <button
            onClick={() => logoutUser()}
            className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="flex items-center gap-2 mt-4">
        <input
          type="text"
          placeholder="Search appointments, patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setApplySearch(searchQuery.toLowerCase())
            }
          }}
          className="flex-1 px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
        />
        <Button
          size="sm"
          onClick={() => setApplySearch(searchQuery.toLowerCase())}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Search className="w-4 h-4 mr-2" />
        </Button>
      </div>

      {/* Toggle New Appointments */}
      <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Allow New Appointments</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Toggle to stop patients from booking appointments for today.
          </p>
        </div>
        <Switch
          checked={active}
          onChange={toggleStatus}
          className={`${
            active ? "bg-green-500" : "bg-red-500"
          } relative inline-flex h-6 w-11 items-center rounded-full transition`}
        >
          <span
            className={`${
              active ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Appointments (Filtered)"
          value={filteredAppointments.length}
          icon={CalendarIcon}
          color="blue"
        />
        <StatsCard title="Total Appointments Overall" value={appointments.length} icon={UsersIcon} color="purple" />
      </div>

      {/* Sort + Filter */}

      <div className="flex justify-end items-center mt-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ml-2 p-2 rounded border dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All</option>
          <option value="lastMonth">Last Month</option>
          <option value="calendar">By Date</option>
        </select>
        {filter === "calendar" && (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-sm bg-transparent">
                {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    setIsCalendarOpen(false) // ✅ close calendar
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
        <Button className="ml-2" onClick={() => setSortDesc((prev) => !prev)}>
          Sort: {sortDesc ? "Newest First" : "Oldest First"}
        </Button>
        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white ml-2"
          onClick={() => setShowConfirmModal(true)}
        >
          Delete Last Month’s Appointments
        </Button>

        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Deletion</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete last month’s appointments? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {deleteSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50">
            Last month’s appointments deleted successfully!
            <button className="ml-3 font-bold" onClick={() => setDeleteSuccess(false)}>
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Appointment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto mt-4">
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No appointments found.</div>
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
              onDelete={() => {}}
            />
          ))
        )}
      </div>
    </div>
  )
}

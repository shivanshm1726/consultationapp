"use client"

import { CalendarIcon, ClockIcon, UsersIcon, CheckCircleIcon } from "../components/Icons"
import StatsCard from "../components/StatsCard"
import AppointmentCard from "../components/AppointmentCard"
import { useAppointments } from "../hooks/useAppointments"

export default function OverviewPage() {
  const { appointments, loading } = useAppointments()

  const confirmed = appointments.filter((a) => a.status === "confirmed").length
  const pending = appointments.filter((a) => a.status === "pending").length
  const completed = appointments.filter((a) => a.status === "completed").length
  const totalToday = appointments.filter((a) => {
    const today = new Date().toLocaleDateString()
    const aptDate = new Date(a.appointmentDate).toLocaleDateString()
    return today === aptDate
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Appointments Today" value={totalToday} icon={CalendarIcon} color="blue" />
        <StatsCard title="Confirmed" value={confirmed} icon={CheckCircleIcon} color="green" />
        <StatsCard title="Pending" value={pending} icon={ClockIcon} color="yellow" />
        <StatsCard title="Completed" value={completed} icon={UsersIcon} color="purple" />
      </div>

      {/* Show Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading appointments...</div>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onDelete={() => {}}
              // You can later add confirm/delete actions here if needed
            />
          ))
        )}
      </div>
    </div>
  )
}

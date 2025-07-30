"use client"

import { ClockIcon, UserIcon, PhoneIcon, XIcon } from "./Icons"

export type Appointment = {
  id: string
  patientName: string
  patientPhone: string
  appointmentDate: string
  appointmentTime: string
  clinic: string
  urgency: string
  symptoms: string
}

interface AppointmentCardProps {
  appointment: Appointment
  onDelete: (id: string) => void
}

export default function AppointmentCard({ appointment, onDelete }: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.patientName}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <PhoneIcon className="h-4 w-4 mr-1" />
              {appointment.patientPhone}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(appointment.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ClockIcon className="h-4 w-4 mr-2" />
            {appointment.appointmentDate} at {appointment.appointmentTime}
          </div>
          <div className="flex space-x-2">
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(appointment.urgency)}`}>
              {appointment.urgency}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Symptoms:</strong> {appointment.symptoms}
          </p>
        </div>
      </div>
    </div>
  )
}

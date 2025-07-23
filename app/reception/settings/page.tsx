"use client"

import { useState } from "react"
import { SaveIcon, ClockIcon, BellIcon, UsersIcon, CalendarIcon } from "../components/Icons"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
    appointmentDuration: 30,
    maxAppointmentsPerDay: 20,
    enableNotifications: true,
    autoConfirmAppointments: false,
    allowOnlineBooking: true,
    consultationFee: 500,
    emergencyContact: "+91-9876543210",
  })

  const handleSave = () => {
    console.log("Saving settings:", settings)
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reception Settings</h1>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Working Hours</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value },
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value },
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Appointment Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appointment Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.appointmentDuration}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    appointmentDuration: Number.parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Appointments Per Day
              </label>
              <input
                type="number"
                value={settings.maxAppointmentsPerDay}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxAppointmentsPerDay: Number.parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={settings.consultationFee}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    consultationFee: Number.parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Notifications</span>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    enableNotifications: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-confirm Appointments</span>
              <input
                type="checkbox"
                checked={settings.autoConfirmAppointments}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoConfirmAppointments: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Online Booking</span>
              <input
                type="checkbox"
                checked={settings.allowOnlineBooking}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    allowOnlineBooking: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={settings.emergencyContact}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emergencyContact: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

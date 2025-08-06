"use client"

import type React from "react"
import { useState } from "react"
import { Bell } from "lucide-react"
import { useTodayNotifications } from "./hooks/useTodayNotifications"
import { ThemeProvider } from "./components/ThemeProvider"
import Sidebar from "./components/Sidebar"
import "../globals.css"

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const { notifications, unread, markAsRead, audioRef } = useTodayNotifications()
  const [showDropdown, setShowDropdown] = useState(false)

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
    if (unread) markAsRead()
  }

  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Notification Header */}
          <div className="flex justify-end items-center p-4 border-b shadow-sm bg-white relative">
            <button onClick={toggleDropdown} className="relative">
              <Bell className="w-6 h-6 text-gray-700" />
              {unread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-4 top-14 z-50 w-72 bg-white shadow-lg border rounded-md overflow-hidden">
                <div className="text-gray-800 font-semibold px-4 py-2 border-b">Today's Appointments</div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">No new appointments</div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <li key={notif.id} className="px-4 py-2 border-b text-sm">
                        <div className="font-medium">{notif.name}</div>
                        <div className="text-gray-600">{notif.phone}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(notif.createdAt.seconds * 1000).toLocaleTimeString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" src="/notification.mp3" />
    </ThemeProvider>
  )
}

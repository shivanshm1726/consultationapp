"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
  SettingsIcon,
  StethoscopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./Icons"

const navigation = [
  { name: "Overview", href: "/reception/overview", icon: BarChart3Icon },
  { name: "Payments", href: "/reception/payments", icon: CreditCardIcon },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={`${collapsed ? "w-16" : "w-64"} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <StethoscopeIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Dr. Nitin Mishra</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reception Desk</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

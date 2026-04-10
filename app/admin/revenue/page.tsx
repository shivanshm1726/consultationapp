"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  User,
  Download,
  Printer,
  Loader2,
  IndianRupee,
} from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"

interface Payment {
  id: string
  patientName: string
  contactNumber: string
  amount: number
  timeSlot: string
  paymentMethod: string
  transactionId: string
  createdAt: string
}

const STATS_API = "http://localhost:5001/api/stats";

export default function RevenuePage() {
  const { user } = useAuth()
  const [todayPayments, setTodayPayments] = useState<Payment[]>([])
  const [allTimeTotal, setAllTimeTotal] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${STATS_API}/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allPayments: Payment[] = response.data;
      const today = new Date()
      const startOfToday = startOfDay(today)
      const endOfToday = endOfDay(today)

      const todaysPayments = allPayments.filter(
        (payment) => {
          const createdAt = new Date(payment.createdAt);
          return createdAt >= startOfToday && createdAt <= endOfToday;
        }
      )

      const todaySum = todaysPayments.reduce((sum, payment) => sum + payment.amount, 0)
      const allTimeSum = allPayments.reduce((sum, payment) => sum + payment.amount, 0)

      setTodayPayments(todaysPayments)
      setTodayTotal(todaySum)
      setAllTimeTotal(allTimeSum)
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRevenueData()
    }
  }, [user])

  const exportToCSV = () => {
    const headers = ["Patient Name", "Contact", "Amount", "Time Slot", "Transaction ID", "Date"]
    const csvContent = [
      headers.join(","),
      ...todayPayments.map((p) =>
        [p.patientName, p.contactNumber, p.amount, p.timeSlot, p.transactionId, format(new Date(p.createdAt), "yyyy-MM-dd HH:mm")].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-gray-500">Track and manage your earnings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToCSV}><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-emerald-100 uppercase text-xs font-bold">Today's Revenue</p>
                <div className="text-4xl font-bold mt-2">₹{todayTotal.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-emerald-100">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{todayPayments.length} transactions</span>
                </div>
              </div>
              <IndianRupee className="h-12 w-12 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 uppercase text-xs font-bold">Total Revenue</p>
                <div className="text-4xl font-bold mt-2">₹{allTimeTotal.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-blue-100">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>All time</span>
                </div>
              </div>
              <DollarSign className="h-12 w-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {todayPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 px-2">Patient</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Time</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayPayments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-2">
                        <div className="font-semibold">{p.patientName}</div>
                        <div className="text-xs text-gray-500">{p.contactNumber}</div>
                      </td>
                      <td className="py-4 px-2 font-bold">₹{p.amount}</td>
                      <td className="py-4 px-2">{format(new Date(p.createdAt), "hh:mm a")}</td>
                      <td className="py-4 px-2">
                        <Badge className="bg-green-100 text-green-700">Paid</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No transactions recorded today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

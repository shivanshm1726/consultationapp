"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  User,
  Download,
  Printer,
  CreditCard,
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
  createdAt: Date
}

export default function RevenuePage() {
  const [user] = useAuthState(auth)
  const [todayPayments, setTodayPayments] = useState<Payment[]>([])
  const [allTimeTotal, setAllTimeTotal] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const doctorFee = Number.parseInt(process.env.NEXT_PUBLIC_DOCTOR_FEE || "500")

  useEffect(() => {
    if (user) {
      fetchRevenueData()
    }
  }, [user])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)

      // Get today's date range
      const today = new Date()
      const startOfToday = startOfDay(today)
      const endOfToday = endOfDay(today)

      // Fetch all payments
      const paymentsQuery = query(
        collection(db, "payments"),
        where("status", "==", "completed"),
        orderBy("createdAt", "desc"),
      )
      const paymentsSnapshot = await getDocs(paymentsQuery)

      // If no payments collection, try to get from appointments
      let allPayments: Payment[] = []

      if (paymentsSnapshot.empty) {
        // Fallback to appointments with paid status
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("paymentStatus", "==", "paid"),
          orderBy("createdAt", "desc"),
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)

        allPayments = appointmentsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            patientName: data.patientName || "Unknown Patient",
            contactNumber: data.phoneNumber || data.contactNumber || "N/A",
            amount: data.amount || doctorFee,
            timeSlot: data.timeSlot || "N/A",
            paymentMethod: data.paymentMethod || "Online",
            transactionId: data.transactionId || data.paymentId || "N/A",
            createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
          }
        })
      } else {
        allPayments = paymentsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            patientName: data.patientName || data.customerName || "Unknown Patient",
            contactNumber: data.phoneNumber || data.contactNumber || "N/A",
            amount: data.amount || doctorFee,
            timeSlot: data.timeSlot || "N/A",
            paymentMethod: data.paymentMethod || "Online",
            transactionId: data.transactionId || data.id || "N/A",
            createdAt: data.createdAt?.toDate() || new Date(),
          }
        })
      }

      // Filter today's payments
      const todaysPayments = allPayments.filter(
        (payment) => payment.createdAt >= startOfToday && payment.createdAt <= endOfToday,
      )

      // Calculate totals
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

  const exportToCSV = () => {
    const headers = [
      "Patient Name",
      "Contact Number",
      "Amount",
      "Time Slot",
      "Payment Method",
      "Transaction ID",
      "Date",
    ]
    const csvContent = [
      headers.join(","),
      ...todayPayments.map((payment) =>
        [
          payment.patientName,
          payment.contactNumber,
          payment.amount,
          payment.timeSlot,
          payment.paymentMethod,
          payment.transactionId,
          format(payment.createdAt, "yyyy-MM-dd HH:mm"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-slate-600 dark:text-slate-400">Loading revenue data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Revenue</h1>
          <p className="text-slate-600 dark:text-slate-400">Track your practice's financial performance</p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </motion.div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Today's Online Payments
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    ₹{todayTotal.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-3">
                    <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
                    <span className="text-sm font-semibold text-emerald-600">{todayPayments.length} payments</span>
                  </div>
                </div>
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <IndianRupee className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Total Online Payments
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    ₹{allTimeTotal.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-3">
                    <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-semibold text-blue-600">All time</span>
                  </div>
                </div>
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <DollarSign className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Payments List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
              Today's Payments ({todayPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayPayments.length > 0 ? (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Patient</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Time Slot</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          Payment Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayPayments.map((payment, index) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {payment.patientName}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                              <span>{payment.contactNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                              ₹{payment.amount.toLocaleString()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                              <Clock className="h-4 w-4 mr-2" />
                              {payment.timeSlot}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {format(payment.createdAt, "hh:mm a")}
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {todayPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600/60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{payment.patientName}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{payment.contactNumber}</p>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {payment.timeSlot}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {format(payment.createdAt, "hh:mm a")}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 ml-2">
                          ₹{payment.amount.toLocaleString()}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No payments today</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Payments will appear here once patients make online payments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

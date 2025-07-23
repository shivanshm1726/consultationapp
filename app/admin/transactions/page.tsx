"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  DollarSign,
  TrendingUp,
  Download,
  MoreVertical,
  CreditCard,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

const transactions = [
  {
    id: "TXN001",
    type: "consultation",
    patient: "Rahul Sharma",
    doctor: "Dr. Nitin Mishra",
    amount: 500,
    fee: 50,
    doctorPayout: 450,
    date: "2024-01-20",
    time: "10:30 AM",
    status: "completed",
    paymentMethod: "UPI",
    transactionId: "UPI123456789",
  },
  {
    id: "TXN002",
    type: "consultation",
    patient: "Priya Patel",
    doctor: "Dr. Nitin Mishra",
    amount: 400,
    fee: 40,
    doctorPayout: 360,
    date: "2024-01-20",
    time: "11:15 AM",
    status: "completed",
    paymentMethod: "Card",
    transactionId: "CARD987654321",
  },
  {
    id: "TXN003",
    type: "consultation",
    patient: "Amit Kumar",
    doctor: "Dr. Nitin Mishra",
    amount: 300,
    fee: 30,
    doctorPayout: 270,
    date: "2024-01-19",
    time: "2:00 PM",
    status: "pending",
    paymentMethod: "Wallet",
    transactionId: "WAL456789123",
  },
  {
    id: "TXN004",
    type: "refund",
    patient: "Sneha Gupta",
    doctor: "Dr. Nitin Mishra",
    amount: -500,
    fee: 0,
    doctorPayout: 0,
    date: "2024-01-19",
    time: "3:30 PM",
    status: "processed",
    paymentMethod: "UPI",
    transactionId: "REF789123456",
  },
]

const monthlyStats = {
  totalRevenue: 452890,
  totalTransactions: 2847,
  platformFee: 45289,
  doctorPayouts: 407601,
  refunds: 12450,
  growth: 24.1,
}

export default function TransactionsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="payout">Payout</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{monthlyStats.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+{monthlyStats.growth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Fee</p>
                <p className="text-2xl font-bold text-blue-600">₹{monthlyStats.platformFee.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doctor Payouts</p>
                <p className="text-2xl font-bold text-purple-600">₹{monthlyStats.doctorPayouts.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Refunds</p>
                <p className="text-2xl font-bold text-orange-600">₹{monthlyStats.refunds.toLocaleString()}</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {monthlyStats.totalTransactions.toLocaleString()}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "consultation"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    {transaction.type === "consultation" ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{transaction.id}</h3>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : ""
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{transaction.patient}</span>
                      <span>→ {transaction.doctor}</span>
                      <span>
                        {transaction.date} {transaction.time}
                      </span>
                      <span className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {transaction.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span>Transaction ID: {transaction.transactionId}</span>
                      {transaction.type === "consultation" && (
                        <>
                          <span>Platform Fee: ₹{transaction.fee}</span>
                          <span>Doctor Payout: ₹{transaction.doctorPayout}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Receipt className="h-4 w-4 mr-2" />
                        View Receipt
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </DropdownMenuItem>
                      {transaction.status === "pending" && (
                        <DropdownMenuItem>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Process Payment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

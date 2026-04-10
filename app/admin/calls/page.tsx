"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import { Phone, Video, Clock, User, PhoneCall, History, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const CALLS_API = "http://localhost:5001/api/calls";

interface ActiveCall {
  id: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  callType: "audio" | "video"
  status: "waiting" | "connected" | "ended"
  createdAt: string
  channelName: string
  urgency?: "low" | "medium" | "high"
}

interface CallLog {
  id: string
  patientName: string
  patientEmail: string
  callType: "audio" | "video"
  duration: number
  startTime: string
  endTime: string
  status: "completed" | "missed" | "cancelled"
}

export default function CallsPage() {
  const { user } = useAuth()
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([])
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogs, setShowLogs] = useState(false)
  const router = useRouter()

  const fetchCalls = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(CALLS_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const calls = response.data.map((c: any) => ({
        id: c._id,
        patientName: c.patientName,
        patientEmail: c.patientEmail,
        callType: c.callType,
        status: c.status,
        createdAt: c.createdAt,
        channelName: c.channelName,
        urgency: c.urgency || "low"
      }));

      setActiveCalls(calls.filter((c: any) => c.status !== 'ended'))
    } catch (err) {
      console.error("Error fetching calls:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchCalls()
    const interval = setInterval(fetchCalls, 5000)
    return () => clearInterval(interval)
  }, [user])

  const joinCall = async (call: ActiveCall) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.put(`${CALLS_API}/${call.id}`, { status: "connected" }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push(`/admin/call?channel=${call.channelName}&type=${call.callType}&callId=${call.id}`)
    } catch (error) {
      console.error("Error joining call:", error)
      alert("Failed to join call.")
    }
  }

  const endCall = async (call: ActiveCall) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.put(`${CALLS_API}/${call.id}`, { status: "ended" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCalls()
    } catch (error) {
      console.error("Error ending call:", error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calls</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {showLogs ? "Call History" : "Active Calls"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {showLogs ? "View your call history and logs" : "Manage incoming patient calls"}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={showLogs ? "outline" : "default"}
            onClick={() => setShowLogs(false)}
            className="flex items-center space-x-2"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Active Calls</span>
            {activeCalls.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeCalls.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={showLogs ? "default" : "outline"}
            onClick={() => setShowLogs(true)}
            className="flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Call Logs</span>
          </Button>
        </div>
      </div>

      {!showLogs ? (
        <div className="space-y-4">
          {activeCalls.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <PhoneCall className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Active Calls</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  When patients initiate calls, they will appear here for you to join.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeCalls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              call.callType === "video" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                            }`}
                          >
                            {call.callType === "video" ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{call.patientName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{call.patientEmail}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(call.createdAt).toLocaleTimeString()}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {call.urgency && (
                            <Badge className={getUrgencyColor(call.urgency)}>{call.urgency.toUpperCase()}</Badge>
                          )}

                          <Badge
                            variant={call.status === "waiting" ? "secondary" : "default"}
                            className={
                              call.status === "waiting"
                                ? "bg-yellow-100 text-yellow-800 animate-pulse"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {call.status === "waiting" ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Waiting
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </>
                            )}
                          </Badge>

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => joinCall(call)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              {call.callType === "video" ? (
                                <>
                                  <Video className="h-4 w-4 mr-2" />
                                  Join Video Call
                                </>
                              ) : (
                                <>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Join Audio Call
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => endCall(call)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <History className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Call History</h3>
              <p className="text-slate-600 dark:text-slate-400">Your completed calls will appear here.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthState } from "react-firebase-hooks/auth"
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Phone, Video, Clock, User, PhoneCall, History, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ActiveCall {
  id: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  callType: "audio" | "video"
  status: "waiting" | "connected" | "ended"
  createdAt: any
  channelName: string
  urgency?: "low" | "medium" | "high"
  patientUid: string
}

interface CallLog {
  id: string
  patientName: string
  patientEmail: string
  patientUid: string
  callType: "audio" | "video"
  duration: number
  startTime: any
  endTime: any
  status: "completed" | "missed" | "cancelled"
}

export default function CallsPage() {
  const [user] = useAuthState(auth)
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([])
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogs, setShowLogs] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    // Listen to active calls
    const activeCallsQuery = query(collection(db, "activeCalls"), orderBy("createdAt", "desc"))

    const unsubscribeActiveCalls = onSnapshot(activeCallsQuery, (snapshot) => {
      const calls: ActiveCall[] = []
      snapshot.forEach((doc) => {
        calls.push({ id: doc.id, ...doc.data() } as ActiveCall)
      })
      setActiveCalls(calls)
      setLoading(false)
    })

    // Listen to call logs
    const callLogsQuery = query(collection(db, "callLogs"), orderBy("startTime", "desc"))

    const unsubscribeCallLogs = onSnapshot(callLogsQuery, (snapshot) => {
      const logs: CallLog[] = []
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as CallLog)
      })
      setCallLogs(logs)
    })

    return () => {
      unsubscribeActiveCalls()
      unsubscribeCallLogs()
    }
  }, [user])

  const joinCall = async (call: ActiveCall) => {
    try {
      // Update call status to connected
      await updateDoc(doc(db, "activeCalls", call.id), {
        status: "connected",
        doctorJoinedAt: serverTimestamp(),
      })

      // Navigate to call interface
      router.push(`/admin/call?channel=${call.channelName}&type=${call.callType}&callId=${call.id}`)
    } catch (error) {
      console.error("Error joining call:", error)
      alert("Failed to join call. Please try again.")
    }
  }

  const endCall = async (call: ActiveCall) => {
    try {
      // Move to call logs
      await addDoc(collection(db, "callLogs"), {
        patientName: call.patientName,
        patientUid: call.patientUid,
        callType: call.callType,
        duration: 0,
        startTime: call.createdAt,
        endTime: serverTimestamp(),
        status: "cancelled",
      })

      // Remove from active calls
      await deleteDoc(doc(db, "activeCalls", call.id))
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
      {/* Header */}
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
        // Active Calls View
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
                                <span>{call.patientUid}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{call.createdAt?.toDate?.()?.toLocaleTimeString() || "Just now"}</span>
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
        // Call Logs View
        <div className="space-y-4">
          {callLogs.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <History className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Call History</h3>
                <p className="text-slate-600 dark:text-slate-400">Your completed calls will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {callLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              log.callType === "video" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                            }`}
                          >
                            {log.callType === "video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{log.patientName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                              <span>{log.patientEmail}</span>
                              <span>
                                {log.startTime?.toDate?.()?.toLocaleDateString()} at{" "}
                                {log.startTime?.toDate?.()?.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              log.status === "completed"
                                ? "default"
                                : log.status === "missed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {log.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {log.duration > 0 ? formatDuration(log.duration) : "0:00"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

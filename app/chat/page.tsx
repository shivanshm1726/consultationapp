"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useDarkMode } from "@/contexts/dark-mode-context"
import { useChatSocket } from "@/hooks/useChatSocket"
import ChatThread from "@/components/chat/ChatThread"
import ChatInput from "@/components/chat/ChatInput"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Stethoscope, Loader2, AlertCircle, Activity, Sun, Moon } from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

function getToken(): string | null {
  const match = document.cookie.match(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/)
  return match ? match[1] : null
}

function PatientChatContent() {
  const { user: currentUser, userData } = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get("appointmentId")
  const [mounted, setMounted] = useState(false)

  const [appointmentData, setAppointmentData] = useState<any>(null)
  const { messages, isConnected, loadMessages, sendMessage } = useChatSocket(roomId)

  const currentUserId = userData?._id || userData?.uid || currentUser?.uid || ""

  useEffect(() => { setMounted(true); }, [])

  useEffect(() => {
    if (!roomId || !currentUser) return

    const token = getToken()
    if (token) {
      loadMessages(roomId, token)
    }

    const fetchApt = async () => {
      try {
        const token = getToken()
        const res = await axios.get(`${API_BASE_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const apt = res.data.find((a: any) => a._id === roomId)
        if (apt) setAppointmentData(apt)
      } catch (e) {
        console.error(e)
      }
    }
    fetchApt()
  }, [roomId, currentUser, loadMessages])

  const handleSend = async (text: string) => {
    if (!roomId) return
    const token = getToken()
    if (!token) return
    const receiverId = appointmentData?.doctorId?._id || appointmentData?.doctorId || null
    await sendMessage(roomId, text, receiverId, token)
  }

  if (!roomId) {
    return (
      <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"} flex items-center justify-center p-4`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xl p-8 text-center border border-slate-200 dark:border-white/5">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Consultation Selected</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Please select an appointment from your profile to start chatting with your doctor.</p>
            <Button onClick={() => router.push("/profile")} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl shadow-xl hover:opacity-90">
              Go to Profile
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const doctorName = appointmentData?.doctorId?.fullName || "Medical Clinic Doctor"

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"} flex flex-col`}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Header */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <div className="transition-all duration-500 mx-4 w-full max-w-4xl rounded-2xl border flex items-center justify-between px-6 py-3 shadow-2xl backdrop-blur-xl bg-white/80 border-slate-200 dark:bg-[#0a0a0a]/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{doctorName}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {appointmentData?.timeSlot} • {appointmentData?.appointmentDate ? new Date(appointmentData.appointmentDate).toDateString() : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5 transition-all">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Badge className={`text-xs rounded-full ${isConnected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400"}`}>
              {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </div>
        </div>
      </header>

      {/* Status banner */}
      {appointmentData && appointmentData.status !== "in-progress" && (
        <div className="relative z-10 container mx-auto px-4 pt-28 max-w-4xl">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            Your consultation is currently <strong className="mx-1">{appointmentData.status}</strong>. The doctor will respond when available.
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-4 flex-1 flex flex-col max-w-4xl">
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden h-[calc(100vh-200px)]">
          <ChatThread
            messages={messages}
            currentUserId={currentUserId}
            contactName={doctorName}
          />
          <ChatInput
            onSend={handleSend}
            placeholder="Describe your symptoms or ask the doctor..."
          />
        </div>
      </div>
    </div>
  )
}

export default function PatientChat() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#030303]"><Loader2 className="animate-spin w-8 h-8 text-emerald-500" /></div>}>
      <PatientChatContent />
    </Suspense>
  )
}
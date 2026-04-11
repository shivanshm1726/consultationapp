"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, User, Stethoscope, PhoneCall, VideoIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import { io, Socket } from "socket.io-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

type MessageType = {
  _id: string
  text?: string
  senderId: string
  receiverId: string
  timestamp: any
}

function LiveChatContent() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get("appointmentId")
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async (id: string) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
      const token = tokenMatch ? tokenMatch[1] : null

      const response = await axios.get(`${API_BASE_URL}/api/chats/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  useEffect(() => {
    if (roomId) {
      // Setup web socket
      const newSocket = io(API_BASE_URL)
      setSocket(newSocket)

      newSocket.on('connect', () => {
         newSocket.emit('join_chat', { roomId })
      })

      newSocket.on('new_message', (msg: MessageType) => {
         setMessages(prev => {
            if (prev.some(m => m._id === msg._id)) return prev
            return [...prev, msg]
         })
         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      })

      fetchMessages(roomId)

      // Fetch appointment details
      const fetchApt = async () => {
         try {
            const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
            const token = tokenMatch ? tokenMatch[1] : null
            const res = await axios.get(`${API_BASE_URL}/api/appointments/all`, {
               headers: { Authorization: `Bearer ${token}` }
            })
            const apt = res.data.find((a:any) => a._id === roomId)
            if (apt) setAppointmentData(apt)
         } catch (e) {
            console.error(e)
         }
      }
      fetchApt()

      return () => { newSocket.disconnect() }
    }
  }, [roomId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentUser || !roomId || isLoading) return

    setIsLoading(true)
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
      const token = tokenMatch ? tokenMatch[1] : null

      await axios.post(`${API_BASE_URL}/api/chats`, {
        roomId,
        receiverId: appointmentData?.patientId?._id || null, // Doctor sending to patient
        text: message.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage("")
    } catch (err) {
      console.error("Error sending message: ", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCall = async (type: "audio" | "video") => {
    if (!roomId || !currentUser) return
    router.push(`/admin/call?roomId=${roomId}&type=${type}`)
  }

  if (!roomId || !appointmentData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 text-center">
         <Card className="max-w-md w-full border-0 shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Select a Consultation</h2>
            <p className="text-slate-500 mb-6">You must select an appointment from the dashboard to start chatting.</p>
            <Button onClick={() => router.push("/admin/appointments")} className="bg-emerald-600 text-white">Go to Dashboard</Button>
         </Card>
      </div>
    )
  }

  const pt = appointmentData.patientId

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <Button variant="ghost" size="sm" onClick={() => router.push("/admin/appointments")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
             </Button>
             <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-emerald-600 bg-emerald-100 p-1.5 rounded-full" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{pt?.firstName} {pt?.lastName}</div>
                  <div className="text-xs text-slate-500">{appointmentData.timeSlot} • {new Date(appointmentData.appointmentDate).toDateString()}</div>
                </div>
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleCall("video")} className={appointmentData.status !== 'in-progress' ? "opacity-50" : ""}>
               <VideoIcon className="h-4 w-4 mr-1" /> Call
            </Button>
            <Badge className="bg-emerald-100 text-emerald-800 ml-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div> Live Chat
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col max-w-4xl">
         <Card className="flex-1 flex flex-col shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
            <CardContent className="flex-1 p-0 flex flex-col h-[calc(100vh-180px)]">
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                  {messages.length === 0 && (
                     <div className="text-center py-8 text-slate-500 text-sm bg-white dark:bg-slate-800 rounded-lg mx-auto max-w-sm mt-10 p-4 border border-slate-200 dark:border-slate-700">
                        This is the start of your consultation with {pt?.firstName}.
                     </div>
                  )}

                  {messages.map((msg) => {
                     const isMe = msg.senderId === currentUser?.userId || msg.senderId === currentUser?._id || msg.senderId === currentUser?.uid
                     return (
                        <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                           <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${isMe ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm"}`}>
                              <p className="text-[15px] leading-relaxed">{msg.text}</p>
                              <p className={`text-[10px] mt-1 ${isMe ? "text-emerald-100" : "text-slate-400"}`}>
                                 {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                           </div>
                        </div>
                     )
                  })}
                  <div ref={messagesEndRef} />
               </div>

               <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                     <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a medical instruction or question..."
                        className="flex-1 rounded-full px-4 border-slate-300 dark:border-slate-700 focus-visible:ring-emerald-500"
                        disabled={isLoading}
                     />
                     <Button type="submit" size="icon" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10 shrink-0 shadow-md" disabled={isLoading || !message.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-1" />}
                     </Button>
                  </form>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

export default function LiveChat() {
  return (
    <Suspense fallback={<div className="min-h-screen flex text-emerald-600 items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>}>
      <LiveChatContent />
    </Suspense>
  )
}
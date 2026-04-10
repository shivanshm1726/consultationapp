"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Paperclip,
  User,
  Stethoscope,
  AlertCircle,
  UserCheck,
  PhoneCall,
  VideoIcon,
  Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import { Suspense } from "react"
import { toast } from "@/components/ui/use-toast"
import PatientList from "../components/PatientList"

const CHAT_API = "http://localhost:5001/api/chats"

type MessageType = {
  id: string
  text?: string
  senderEmail: string
  timestamp: any
  mediaUrl?: string
  mediaType?: "image" | "video" | "file"
  fileName?: string
}

function LiveChatContent() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<MessageType[]>([])
  const { user: currentUser, userData } = useAuth()
  const [roomId, setRoomId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientEmailFromUrl = searchParams.get("patientEmail")

  const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL || "contact@medicalclinic.com"

  const doctorQuickReplies = [
    "How can I help you?",
    "Please elaborate your symptoms.",
    "I'll prescribe you a medicine.",
    "Thank you for your time.",
    "Do you have any allergies?",
  ]

  const [preFormData, setPreFormData] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    contact: "",
    urgency: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (userData && userData.role) {
      setUserRole(userData.role as string)
    }
  }, [userData])

  const fetchMessages = async (id: string) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${CHAT_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentUser || !roomId || isLoading) return

    setIsLoading(true)
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.post(CHAT_API, {
        roomId,
        text: message.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("")
      fetchMessages(roomId)
    } catch (err) {
      console.error("Error sending message: ", err)
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleCall = async (type: "audio" | "video") => {
    if (!roomId || !currentUser?.email) return
    router.push(`/call?channel=${roomId}&uid=${currentUser.email}&type=${type}`)
  }

  const handleEndConsultation = async () => {
    if (confirm("Are you sure you want to end this consultation?")) {
      router.push("/admin/chat")
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (patientEmailFromUrl && (userRole === "admin" || userRole === "receptionist")) {
      const sortedEmails = [doctorEmail, patientEmailFromUrl].sort()
      const currentRoomId = `${sortedEmails[0]}_${sortedEmails[1]}`
      setRoomId(currentRoomId)
      fetchMessages(currentRoomId)

      const interval = setInterval(() => fetchMessages(currentRoomId), 5000)
      return () => clearInterval(interval)
    }
  }, [patientEmailFromUrl, userRole, doctorEmail])

  if (!patientEmailFromUrl && (userRole === "admin" || userRole === "receptionist")) {
    return <PatientList />
  }

  if (patientEmailFromUrl && !roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Medical Clinic Doctor - Physician
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Chat Active
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-700 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Medical Clinic Doctor</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MD, General Medicine</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall("audio")}
                    className="flex items-center space-x-1"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Audio Call</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall("video")}
                    className="flex items-center space-x-1"
                  >
                    <VideoIcon className="h-4 w-4" />
                    <span>Video Call</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400">Connecting to patient chat...</p>
                  </div>
                )}


                {messages.map((msg: any) => (
                  <div
                    key={msg.id || msg._id}
                    className={`flex ${msg.senderEmail === currentUser?.email ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${msg.senderEmail === currentUser?.email
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : msg.senderEmail === "system"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700"
                        }`}
                    >
                      {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                      {msg.mediaUrl && msg.mediaType === "image" && (
                        <img
                          src={msg.mediaUrl || "/placeholder.svg"}
                          alt={msg.fileName || "Uploaded image"}
                          className="mt-2 rounded-md max-w-full max-h-64 object-contain"
                        />
                      )}
                      
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <div className="border-t p-4 bg-white/50 dark:bg-gray-700/50">
              {doctorQuickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {doctorQuickReplies.map((reply, idx) => (
                    <Button
                      key={idx}
                      variant="secondary"
                      size="sm"
                      className="bg-slate-100 dark:bg-gray-700 dark:text-white text-gray-800 px-3 py-1 text-xs"
                      onClick={() => setMessage(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={handleFileUploadClick}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "Type your message..."}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || (!message.trim() && !selectedFile)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple={false}
                onChange={handleFileChange}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-sm dark:text-gray-100 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium">{preFormData.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age:</span>
                <span className="font-medium">{preFormData.age || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                <span className="font-medium capitalize">{preFormData.gender || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                <span className="font-medium">{preFormData.contact || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                <Badge
                  variant={
                    preFormData.urgency === "high"
                      ? "destructive"
                      : preFormData.urgency === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {preFormData.urgency || "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-sm dark:text-gray-100 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Chief Complaint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{preFormData.symptoms || "N/A"}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-sm dark:text-gray-100">Consultation Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="destructive" className="w-full" onClick={handleEndConsultation}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                End Consultation
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This will clear the chat and reload the page
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LiveChat() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LiveChatContent />
    </Suspense>
  )
}
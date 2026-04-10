"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Paperclip,
  User,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  UserCheck,
  PhoneCall,
  VideoIcon,
  Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Suspense } from "react"

const CHAT_API = "http://localhost:5001/api/chats";
const CALL_API = "http://localhost:5001/api/calls";

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
  const { user, userData } = useAuth()
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [roomId, setRoomId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()
  const INACTIVITY_LIMIT = 10 * 60 * 1000

  const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL! || "contact@medicalclinic.com"

  const patientQuickReplies = [
    "I have a skin issue.",
    "Since last week...",
    "Thank you, Doctor.",
    "Yes, I have an allergy.",
    "What should I apply?",
  ]

  const [preFormData, setPreFormData] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    contact: "",
    urgency: "",
  })

  useEffect(() => {
    if (userData) {
      setPreFormData(prev => ({
        ...prev,
        name: userData.fullName || userData.email.split("@")[0],
        contact: userData.phone || ""
      }))
    }
  }, [userData])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!preFormData.name?.trim()) errors.name = "Name is required"
    if (!preFormData.age?.trim()) {
      errors.age = "Age is required"
    } else {
      const age = Number.parseInt(preFormData.age, 10)
      if (isNaN(age) || age < 5 || age > 100) errors.age = "Please enter a valid age between 5 and 100"
    }
    if (!preFormData.gender) errors.gender = "Gender is required"
    if (!preFormData.contact?.trim()) {
        errors.contact = "Contact number is required"
    }
    if (!preFormData.symptoms?.trim()) errors.symptoms = "Please describe your symptoms"
    if (!preFormData.urgency) errors.urgency = "Please select urgency level"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

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

  const handlePreFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (user?.email) {
      const sortedEmails = [user.email, doctorEmail].sort()
      const currentRoomId = `${sortedEmails[0]}_${sortedEmails[1]}`
      setRoomId(currentRoomId)
      setChatStarted(true)
      
      // Initial message
      setMessages([
        {
          id: uuidv4(),
          senderEmail: "system",
          text: `Hello ${preFormData.name}! Please wait until Medical Clinic Doctor joins the chat.`,
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setPreFormData((prev: any) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev: any) => ({ ...prev, [field]: "" }))
    }
  }

  useEffect(() => {
    if (roomId && chatStarted) {
      fetchMessages(roomId)
      const interval = setInterval(() => fetchMessages(roomId), 5000)
      return () => clearInterval(interval)
    }
  }, [roomId, chatStarted])

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    let inactivityTimer: NodeJS.Timeout

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        toast({
          title: "Session Ended",
          description: "You were inactive for more than 10 minutes.",
          variant: "destructive",
        })
        router.push("/")
      }, INACTIVITY_LIMIT)
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer))
    resetInactivityTimer()

    return () => {
      clearTimeout(inactivityTimer)
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer))
    }
  }, [user])


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.email || !roomId || isSending) return

    setIsSending(true)
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.post(CHAT_API, {
        roomId,
        text: newMessage.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage("")
      fetchMessages(roomId)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleEndConsultation = async () => {
    if (window.confirm("Are you sure you want to end this consultation?")) {
      setChatStarted(false)
      setMessages([])
      setNewMessage("")
      router.push("/")
    }
  }

  const handleCall = async (type: "audio" | "video") => {
    if (!roomId || !user?.email) return
    const tokenBaseURL = "http://localhost:5001/api/calls/get-token";
    if (!tokenBaseURL) {
      console.error("Token base URL is not set.")
      return
    }

    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await fetch(
        `${tokenBaseURL}?channelName=${roomId}&uid=${user.email}&role=patient`,
      )
      const { token: agoraToken } = await response.json()
      
      // Update call status on backend
      await axios.post(CALL_API, {
        patientName: userData?.fullName || "Patient",
        patientEmail: user.email,
        callType: type,
        channelName: roomId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push(`/call?channel=${roomId}&type=${type}`)
    } catch (err) {
      console.error("Failed to initiate call", err)
    }
  }


  if (!chatStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Chat Consultation</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl dark:text-gray-100">Start Live Chat with Medical Clinic Doctor</CardTitle>
                <p className="text-gray-600 mt-2 dark:text-gray-400">
                  Please provide some basic information before connecting with the doctor
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreFormSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="dark:text-gray-100">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={preFormData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.name ? "border-red-500" : ""}`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="dark:text-gray-100">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={preFormData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        className={`bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.age ? "border-red-500" : ""}`}
                        min="5"
                        max="100"
                        placeholder="Your age"
                      />
                      {formErrors.age && <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>}
                    </div>
                    <div>
                      <Label htmlFor="gender" className="dark:text-gray-100">
                        Gender *
                      </Label>
                      <Select value={preFormData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger
                          className={`bg-white/50 dark:bg-gray-700/50 ${formErrors.gender ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select gender" className="dark:text-gray-100" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact" className="dark:text-gray-100">
                      Contact Number *
                    </Label>
                    <Input
                      id="contact"
                      type="tel"
                      value={preFormData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      className={`bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.contact ? "border-red-500" : ""}`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {formErrors.contact && <p className="text-red-500 text-sm mt-1">{formErrors.contact}</p>}
                  </div>

                  <div>
                    <Label htmlFor="symptoms" className="dark:text-gray-100">
                      Symptoms / Chief Complaint *
                    </Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Please describe your symptoms, skin condition, or reason for consultation in detail..."
                      value={preFormData.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      className={`bg-white/50 min-h-[120px] dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.symptoms ? "border-red-500" : ""}`}
                    />
                    {formErrors.symptoms && <p className="text-red-500 text-sm mt-1">{formErrors.symptoms}</p>}
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="dark:text-gray-100">
                      Urgency Level *
                    </Label>
                    <Select value={preFormData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger
                        className={`bg-white/50 dark:bg-gray-700/50 ${formErrors.urgency ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select urgency level" className="dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                        <SelectItem value="low">Low - General inquiry/routine consultation</SelectItem>
                        <SelectItem value="medium">Medium - Concerning symptoms</SelectItem>
                        <SelectItem value="high">High - Urgent consultation needed</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.urgency && <p className="text-red-500 text-sm mt-1">{formErrors.urgency}</p>}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg dark:bg-gray-700">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 dark:text-blue-400" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Important Notes:</p>
                        <ul className="space-y-1">
                          <li>• Consultation fee: ₹500 (payable after consultation)</li>
                          <li>• Average wait time: 5-15 minutes</li>
                          <li>• You can upload images during the chat</li>
                          <li>• For emergencies, please call +1 (555) 123-4567 directly</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg" size="lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Start Chat Consultation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
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
        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            {/* Chat Header */}
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

            {/* Chat Messages */}
            <CardContent className="flex-1 p-0">
              <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400">Connecting to Medical Clinic Doctor...</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderEmail === user?.email ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${msg.senderEmail === user?.email
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
                      {msg.mediaUrl && msg.mediaType === "video" && (
                        <video
                          controls
                          src={msg.mediaUrl}
                          className="mt-2 rounded-md max-w-full max-h-64 object-contain"
                        />
                      )}
                      {msg.mediaUrl && msg.mediaType === "file" && (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 underline text-sm block text-white"
                        >
                          📎 {msg.fileName || "File"}
                        </a>
                      )}

                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp?.toLocaleTimeString?.() ?? new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4 bg-white/50 dark:bg-gray-700/50">
              {patientQuickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {patientQuickReplies.map((reply, idx) => (
                    <Button
                      key={idx}
                      variant="secondary"
                      size="sm"
                      className="bg-slate-100 dark:bg-gray-700 dark:text-white text-gray-800 px-3 py-1 text-xs"
                      onClick={() => setNewMessage(reply)}
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
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "Type your message..."}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSending || (!newMessage.trim() && !selectedFile)}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

        {/* Sidebar */}
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
                <span className="font-medium">{preFormData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age:</span>
                <span className="font-medium">{preFormData.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                <span className="font-medium capitalize">{preFormData.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                <span className="font-medium">{preFormData.contact}</span>
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
                  {preFormData.urgency}
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
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{preFormData.symptoms}</p>
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
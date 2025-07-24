"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
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
  Users,
  Clock,
} from "lucide-react"
import { useTheme } from "next-themes"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuthState } from "react-firebase-hooks/auth"

export default function DoctorChat() {
  const [user] = useAuthState(auth)
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL!

  // Fetch all active chat rooms where patients have started conversations
  useEffect(() => {
    if (user?.email === doctorEmail) {
      fetchActiveChats()
    }
  }, [user])

  // Listen to messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      const messagesRef = collection(db, "chats", selectedChat.id, "messages")
      const q = query(messagesRef, orderBy("timestamp"))

      const unsubMessages = onSnapshot(
        q,
        (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setMessages(newMessages)
        },
        (error) => {
          console.error("Error listening to messages: ", error)
        },
      )

      return () => unsubMessages()
    }
  }, [selectedChat])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchActiveChats = async () => {
    try {
      setLoading(true)
      // Get all chat collections that end with doctor's email
      const chatsSnapshot = await getDocs(collection(db, "chats"))
      
      const chatRooms: any[] = []
      
      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id
        if (chatId.includes(`_to_${doctorEmail}`)) {
          // Get the latest message from this chat
          const messagesRef = collection(db, "chats", chatId, "messages")
          const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"))
          const messagesSnapshot = await getDocs(messagesQuery)
          
          if (!messagesSnapshot.empty) {
            const latestMessage = messagesSnapshot.docs[0].data()
            const patientEmail = chatId.split("_to_")[0]
            
            // Try to get patient info from appointments
            const appointmentsQuery = query(
              collection(db, "appointments"), 
              where("patientEmail", "==", patientEmail)
            )
            const appointmentsSnapshot = await getDocs(appointmentsQuery)
            
            let patientInfo = {
              name: patientEmail.split("@")[0],
              email: patientEmail,
              age: "N/A",
              gender: "N/A",
              symptoms: "N/A",
              contact: "N/A",
              urgency: "medium"
            }
            
            if (!appointmentsSnapshot.empty) {
              const appointmentData = appointmentsSnapshot.docs[0].data()
              patientInfo = {
                name: appointmentData.patientName || patientEmail.split("@")[0],
                email: patientEmail,
                age: appointmentData.age || "N/A",
                gender: appointmentData.gender || "N/A", 
                symptoms: appointmentData.symptoms || "N/A",
                contact: appointmentData.patientPhone || "N/A",
                urgency: appointmentData.urgency || "medium"
              }
            }
            
            chatRooms.push({
              id: chatId,
              patientEmail,
              patientInfo,
              lastMessage: latestMessage.text || "Media file",
              lastMessageTime: latestMessage.timestamp?.toDate?.() || new Date(),
              unreadCount: 0 // You can implement unread count logic later
            })
          }
        }
      }
      
      // Sort by last message time
      chatRooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
      setActiveChats(chatRooms)
      
      // Auto-select first chat if available
      if (chatRooms.length > 0 && !selectedChat) {
        setSelectedChat(chatRooms[0])
      }
    } catch (error) {
      console.error("Error fetching active chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedChat || !user?.email) return

    setIsLoading(true)
    const newMessage = {
      text: message,
      sender: user.email,
      timestamp: serverTimestamp(),
    }

    try {
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), newMessage)
      setMessage("")
    } catch (err) {
      console.error("Error sending message: ", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedChat || !user?.email) return

    const storage = getStorage()

    for (const file of files) {
      const storageRef = ref(storage, `chatMedia/${selectedChat.id}/${Date.now()}-${file.name}`)

      await uploadBytes(storageRef, file)
      const fileURL = await getDownloadURL(storageRef)

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "file"

      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        sender: user.email,
        timestamp: serverTimestamp(),
        mediaUrl: fileURL,
        mediaType,
        fileName: file.name,
      })
    }

    e.target.value = ""
  }

  const handleCall = async (type: "audio" | "video") => {
    if (!selectedChat || !user?.email) return

    try {
      router.push(`/admin/call?channel=${selectedChat.id}&type=${type}`)
    } catch (err) {
      console.error("Failed to start call", err)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Chats</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage conversations with your patients</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          {activeChats.length} Active Chats
        </Badge>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Active Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {activeChats.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No active chats</p>
                    <p className="text-sm text-gray-400">Patients will appear here when they start a chat</p>
                  </div>
                ) : (
                  activeChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedChat?.id === chat.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {chat.patientInfo.name}
                            </h3>
                            <Badge
                              variant={
                                chat.patientInfo.urgency === "high"
                                  ? "destructive"
                                  : chat.patientInfo.urgency === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {chat.patientInfo.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {chat.lastMessageTime.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-700 dark:to-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedChat.patientInfo.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedChat.patientInfo.email}
                      </p>
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
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === user?.email ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                        msg.sender === user?.email
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700"
                      }`}
                    >
                      {/* Text message */}
                      {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                      {/* Image file */}
                      {msg.mediaType === "image" && (
                        <img
                          src={msg.mediaUrl}
                          alt={msg.fileName}
                          className="mt-2 rounded-md max-w-full max-h-64"
                        />
                      )}

                      {/* Video file */}
                      {msg.mediaType === "video" && (
                        <video controls src={msg.mediaUrl} className="mt-2 rounded-md max-w-full max-h-64" />
                      )}

                      {/* Other file types */}
                      {msg.mediaType === "file" && (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 underline text-sm block"
                        >
                          📎 {msg.fileName}
                        </a>
                      )}

                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp?.toDate?.()?.toLocaleTimeString?.() ?? new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4 bg-white/50 dark:bg-gray-700/50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleFileUpload}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading || !message.trim()}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
            </Card>
          ) : (
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Patient Chat
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a patient from the sidebar to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Patient Info Sidebar */}
        <div className="lg:col-span-1">
          {selectedChat ? (
            <div className="space-y-4">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm dark:text-gray-100 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{selectedChat.patientInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-xs">{selectedChat.patientInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Age:</span>
                    <span className="font-medium">{selectedChat.patientInfo.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    <span className="font-medium capitalize">{selectedChat.patientInfo.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                    <span className="font-medium">{selectedChat.patientInfo.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                    <Badge
                      variant={
                        selectedChat.patientInfo.urgency === "high"
                          ? "destructive"
                          : selectedChat.patientInfo.urgency === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {selectedChat.patientInfo.urgency}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm dark:text-gray-100 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Chief Complaint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                    {selectedChat.patientInfo.symptoms}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm dark:text-gray-100">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => fetchActiveChats()}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Refresh Chats
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push("/admin/appointments")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl h-full flex items-center justify-center">
              <CardContent className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a patient to view their information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
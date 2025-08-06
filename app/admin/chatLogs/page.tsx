"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, MessageSquare, Phone, Video, Clock, Eye, Download, ImageIcon } from "lucide-react"
import { collection, query, onSnapshot, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

interface ChatSession {
  id: string
  patient: string
  doctor: string
  date: string
  startTime: string
  endTime: string
  duration: string
  type: string
  status: string
  messageCount: number
  attachments: number
  lastMessage: string
}

interface ChatMessage {
  id: string
  text?: string
  senderEmail: string
  timestamp: any // Firestore Timestamp or Date
  mediaUrl?: string
  mediaType?: "image" | "video" | "file"
  fileName?: string
}

export default function ChatsAndCallsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const chatsRef = collection(db, "chatLogs")
    const q = query(chatsRef, orderBy("date", "desc"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatSession[]
      setChatSessions(sessions)
    }, (error) => {
      console.error("Error fetching chat logs: ", error)
      toast({
        title: "Error",
        description: "Failed to load chat logs. Please check your permissions or try again.",
        variant: "destructive",
      })
    })

    return () => unsubscribe()
  }, [])

  const fetchMessagesForSession = async (roomId: string) => {
    try {
      const messagesRef = collection(db, "chats", roomId, "messages")
      const messagesQuery = query(messagesRef, orderBy("timestamp"))
      const snapshot = await getDocs(messagesQuery)
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]
      setSelectedSessionMessages(messages)
    } catch (error) {
      console.error("Error fetching messages for session: ", error)
      toast({
        title: "Error",
        description: "Failed to load chat messages. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (session: ChatSession) => {
    try {
      const data = {
        id: session.id,
        patient: session.patient,
        doctor: session.doctor,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        type: session.type,
        status: session.status,
        messageCount: session.messageCount,
        attachments: session.attachments,
        lastMessage: session.lastMessage,
        messages: selectedSessionMessages,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `chat_session_${session.id}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast({
        title: "Success",
        description: "Chat session data downloaded successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error downloading session: ", error)
      toast({
        title: "Error",
        description: "Failed to download session data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredSessions = chatSessions.filter((session) => {
    const matchesSearch =
      session.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || session.type === typeFilter

    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />
      case "audio":
        return <Phone className="h-4 w-4 text-green-600" />
      case "chat":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chats and calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="chat">Chat Only</SelectItem>
              <SelectItem value="video">Video Calls</SelectItem>
              <SelectItem value="audio">Audio Calls</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{chatSessions.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chat Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {chatSessions.filter((s) => s.type === "chat").length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Video Calls</p>
                <p className="text-2xl font-bold text-blue-600">
                  {chatSessions.filter((s) => s.type === "video").length}
                </p>
              </div>
              <Video className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audio Calls</p>
                <p className="text-2xl font-bold text-green-600">
                  {chatSessions.filter((s) => s.type === "audio").length}
                </p>
              </div>
              <Phone className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Sessions List */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Chat & Call Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">{getTypeIcon(session.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{session.patient}</h3>
                      <Badge
                        variant={session.status === "completed" ? "default" : "secondary"}
                        className={
                          session.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{session.patient}</span>
                      <span>with {session.doctor}</span>
                      <span>{session.date}</span>
                      <span>
                        {session.startTime} - {session.endTime}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.duration}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      {session.messageCount > 0 && <span>{session.messageCount} messages</span>}
                      {session.attachments > 0 && (
                        <span className="flex items-center">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {session.attachments} attachments
                        </span>
                      )}
                      <span className="truncate max-w-md">{session.lastMessage}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => fetchMessagesForSession(session.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Session Details - {session.patient}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patient</p>
                            <p className="font-semibold">{session.patient}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doctor</p>
                            <p className="font-semibold">{session.doctor}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</p>
                            <p className="font-semibold">
                              {session.date} {session.startTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
                            <p className="font-semibold">{session.duration}</p>
                          </div>
                        </div>
                        {session.type === "chat" && (
                          <div className="space-y-3">
                            <h4 className="font-semibold">Chat Messages</h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                              {selectedSessionMessages.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center">No messages available</p>
                              )}
                              {selectedSessionMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${
                                    msg.senderEmail.includes("drnitinmishraderma") ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs p-3 rounded-lg ${
                                      msg.senderEmail.includes("drnitinmishraderma")
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    }`}
                                  >
                                    {msg.text && <p className="text-sm">{msg.text}</p>}
                                    {msg.mediaUrl && msg.mediaType === "image" && (
                                      <img
                                        src={msg.mediaUrl}
                                        alt={msg.fileName || "Uploaded image"}
                                        className="mt-2 max-w-full h-auto rounded"
                                      />
                                    )}
                                    {msg.mediaUrl && msg.mediaType === "video" && (
                                      <video
                                        src={msg.mediaUrl}
                                        controls
                                        className="mt-2 max-w-full h-auto rounded"
                                      />
                                    )}
                                    {msg.mediaUrl && msg.mediaType === "file" && (
                                      <a
                                        href={msg.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 text-sm underline"
                                      >
                                        📎 {msg.fileName || "File"}
                                      </a>
                                    )}
                                    <p className="text-xs mt-1 opacity-70">
                                      {msg.timestamp?.toDate?.()?.toLocaleTimeString?.() || "Unknown time"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(session)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

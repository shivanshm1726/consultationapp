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
import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

const CHAT_API = "http://localhost:5001/api/chats";

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
  timestamp: string
  mediaUrl?: string
  mediaType?: "image" | "video" | "file"
  fileName?: string
}

export default function ChatsAndCallsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<ChatMessage[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const { user } = useAuth()

  const fetchSessions = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${CHAT_API}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sessions = response.data.map((s: any) => {
        const [email1, email2] = s._id.split('_');
        const patientEmail = email2 || email1; // Simple heuristic
        return {
          id: s._id,
          patient: patientEmail,
          doctor: "Medical Clinic Doctor",
          date: new Date(s.lastTimestamp).toLocaleDateString(),
          startTime: new Date(s.lastTimestamp).toLocaleTimeString(),
          endTime: new Date(s.lastTimestamp).toLocaleTimeString(),
          duration: "N/A",
          type: "chat",
          status: "completed",
          messageCount: s.messageCount,
          attachments: s.attachments,
          lastMessage: s.lastMessage || "Media file",
        };
      });
      setChatSessions(sessions)
    } catch (err) {
      console.error("Error fetching sessions:", err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user])

  const fetchMessagesForSession = async (roomId: string) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${CHAT_API}/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSessionMessages(response.data.map((m: any) => ({
        id: m._id,
        text: m.text,
        senderEmail: m.senderEmail || (m.senderId === user?.userId ? 'medicalclinic' : 'patient'),
        timestamp: m.timestamp,
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType,
        fileName: m.fileName
      })));
      setActiveSessionId(roomId);
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !activeSessionId) return

    setIsReplying(true)
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\\s*)token\\s*\\=\\s*([^;]*).*$)|^.*$/)
      const token = tokenMatch ? tokenMatch[1] : null

      await axios.post(`${CHAT_API}`, {
        roomId: activeSessionId,
        text: replyText.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setReplyText("")
      // Refresh messages
      fetchMessagesForSession(activeSessionId)
    } catch (err) {
      console.error("Error sending reply:", err)
      toast({ title: "Failed to send message", variant: "destructive" })
    } finally {
      setIsReplying(false)
    }
  }

  const handleDownload = (session: ChatSession) => {
    const data = { ...session, messages: selectedSessionMessages };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `chat_session_${session.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredSessions = chatSessions.filter((session) => {
    const matchesSearch =
      session.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || session.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-600" />
      case "audio": return <Phone className="h-4 w-4 text-green-600" />
      default: return <MessageSquare className="h-4 w-4 text-purple-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search chat sessions..."
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
            </SelectContent>
          </Select>
        </div>
      </div>

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
      </div>

      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Chat Session Logs</CardTitle>
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
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{session.date}</span>
                      <span>{session.startTime}</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.messageCount} messages
                      </span>
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
                        <DialogTitle>Session: {session.patient}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                          {selectedSessionMessages.length === 0 && <p className="text-center">No messages</p>}
                          {selectedSessionMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderEmail.includes("medicalclinic") ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-xs p-3 rounded-lg ${msg.senderEmail.includes("medicalclinic") ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700"}`}>
                                {msg.text && <p className="text-sm">{msg.text}</p>}
                                <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={handleReply} className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <Input
                            placeholder="Type your reply to the patient..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={isReplying}
                            className="flex-1"
                          />
                          <Button type="submit" disabled={isReplying || !replyText.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isReplying ? 'Sending...' : 'Send Reply'}
                          </Button>
                        </form>
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

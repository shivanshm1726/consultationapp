"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, MessageSquare, Phone, Video, Clock, Eye, Download, ImageIcon } from "lucide-react"

const chatSessions = [
  {
    id: "CHAT001",
    patient: "Rahul Sharma",
    doctor: "Dr. Nitin Mishra",
    date: "2024-01-20",
    startTime: "10:30 AM",
    endTime: "11:15 AM",
    duration: "45 min",
    type: "chat",
    status: "completed",
    messageCount: 24,
    attachments: 2,
    lastMessage: "Thank you doctor, I'll follow the prescribed treatment.",
  },
  {
    id: "CALL002",
    patient: "Priya Patel",
    doctor: "Dr. Nitin Mishra",
    date: "2024-01-20",
    startTime: "11:15 AM",
    endTime: "12:00 PM",
    duration: "45 min",
    type: "video",
    status: "completed",
    messageCount: 0,
    attachments: 0,
    lastMessage: "Video call completed successfully",
  },
  {
    id: "CALL003",
    patient: "Amit Kumar",
    doctor: "Dr. Nitin Mishra",
    date: "2024-01-19",
    startTime: "2:00 PM",
    endTime: "2:30 PM",
    duration: "30 min",
    type: "audio",
    status: "completed",
    messageCount: 0,
    attachments: 0,
    lastMessage: "Audio call completed successfully",
  },
]

const callLogs = [
  {
    id: "LOG001",
    patient: "Sneha Gupta",
    doctor: "Dr. Nitin Mishra",
    date: "2024-01-18",
    time: "3:30 PM",
    duration: "25 min",
    type: "video",
    quality: "HD",
    status: "completed",
  },
  {
    id: "LOG002",
    patient: "Vikram Singh",
    doctor: "Dr. Nitin Mishra",
    date: "2024-01-18",
    time: "4:15 PM",
    duration: "0 min",
    type: "video",
    quality: "N/A",
    status: "failed",
  },
]

export default function ChatsAndCallsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedSession, setSelectedSession] = useState(null)

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,847</p>
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
                <p className="text-2xl font-bold text-purple-600">892</p>
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
                <p className="text-2xl font-bold text-blue-600">654</p>
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
                <p className="text-2xl font-bold text-green-600">301</p>
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
                      <h3 className="font-semibold text-gray-900 dark:text-white">{session.id}</h3>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Session Details - {session.id}</DialogTitle>
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
                              <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">
                                    Hello doctor, I have been experiencing skin rash on my arms.
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">10:32 AM</p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">Can you describe the rash? When did it start?</p>
                                  <p className="text-xs text-blue-200 mt-1">10:35 AM</p>
                                </div>
                              </div>
                              <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">It started 3 days ago. It's red and itchy.</p>
                                  <p className="text-xs text-gray-500 mt-1">10:36 AM</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call Quality Logs */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Call Quality Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {callLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getTypeIcon(log.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{log.id}</h3>
                      <Badge
                        variant={log.status === "completed" ? "default" : "destructive"}
                        className={
                          log.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
                        }
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {log.patient} with {log.doctor}
                      </span>
                      <span>
                        {log.date} {log.time}
                      </span>
                      <span>{log.duration}</span>
                      <span>Quality: {log.quality}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

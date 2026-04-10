"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"

const CHAT_API = "http://localhost:5001/api/chats";

type ActiveChat = {
  id: string
  patientEmail: string
  patientName: string
  roomId: string
  timestamp: string
  status: string
  urgency?: string
  age?: string
  gender?: string
  symptoms?: string
}

export default function PatientList() {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([])
  const { user } = useAuth()
  const router = useRouter()

  const fetchActiveChats = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${CHAT_API}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const chats = response.data.map((s: any) => {
        const [email1, email2] = s._id.split('_');
        const patientEmail = email2 || email1;
        return {
          id: s._id,
          patientEmail,
          patientName: patientEmail.split('@')[0],
          roomId: s._id,
          timestamp: s.lastTimestamp,
          status: "active",
          messageCount: s.messageCount,
          lastMessage: s.lastMessage
        };
      });

      setActiveChats(chats)
    } catch (err) {
      console.error("Error fetching active chats:", err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchActiveChats()
      const interval = setInterval(fetchActiveChats, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleSelectPatient = (patientEmail: string) => {
    router.push(`/admin/chat?patientEmail=${patientEmail}`)
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high": return "destructive"
      case "medium": return "default"
      default: return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Consultations</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {activeChats.length} Active {activeChats.length === 1 ? 'Chat' : 'Chats'}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl dark:text-gray-100 flex items-center">
              <User className="h-6 w-6 mr-2" />
              Patient Selection
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">Select a patient to begin your consultation</p>
          </CardHeader>
          <CardContent>
            {activeChats.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No active consultations at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="cursor-pointer hover:shadow-md transition-all bg-white dark:bg-gray-800 border"
                    onClick={() => handleSelectPatient(chat.patientEmail)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{chat.patientName}</h3>
                            <p className="text-sm text-gray-500">{chat.patientEmail}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {chat.urgency && <Badge variant={getUrgencyColor(chat.urgency)}>{chat.urgency.toUpperCase()}</Badge>}
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(chat.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button size="sm">Continue Consultation</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
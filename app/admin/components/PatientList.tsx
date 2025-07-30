"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

type ActiveChat = {
  id: string
  patientEmail: string
  patientName: string
  roomId: string
  timestamp: any
  status: string
  urgency?: string
  age?: string
  gender?: string
  symptoms?: string
}

export default function PatientList() {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([])
  const router = useRouter()

  useEffect(() => {
    const q = query(
      collection(db, "activeChats"),
      where("status", "==", "active"),
      orderBy("timestamp", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActiveChat[]
      const uniqueChats = Object.values(
        chats.reduce((acc, chat) => {
          if (!acc[chat.patientEmail] || chat.timestamp > acc[chat.patientEmail].timestamp) {
            acc[chat.patientEmail] = chat
          }
          return acc
        }, {} as Record<string, ActiveChat>)
      )
      setActiveChats(uniqueChats)
    }, (error) => {
      console.error("Error fetching active chats:", error)
    })

    return () => unsubscribe()
  }, [])

  const handleSelectPatient = (patientEmail: string) => {
    router.push(`/admin/chat?patientEmail=${patientEmail}`)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Active Patient Chats</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {activeChats.length} Active {activeChats.length === 1 ? 'Chat' : 'Chats'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl dark:text-gray-100 flex items-center">
              <User className="h-6 w-6 mr-2" />
              Select a Patient to Chat
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Click on any patient below to start or continue the consultation
            </p>
          </CardHeader>
          <CardContent>
            {activeChats.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No active patient chats at the moment.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  New patient consultations will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border"
                    onClick={() => handleSelectPatient(chat.patientEmail)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {chat.patientName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {chat.patientEmail}
                              </p>
                            </div>
                          </div>

                          {chat.symptoms && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                              <strong>Symptoms:</strong> {chat.symptoms}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            {chat.age && (
                              <span>Age: {chat.age}</span>
                            )}
                            {chat.gender && (
                              <span>Gender: {chat.gender}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          {chat.urgency && (
                            <Badge variant={getUrgencyColor(chat.urgency)}>
                              {chat.urgency.toUpperCase()}
                            </Badge>
                          )}
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {chat.timestamp?.toDate?.().toLocaleTimeString() || "Just now"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectPatient(chat.patientEmail)
                          }}
                        >
                          Start/Continue Chat
                        </Button>
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
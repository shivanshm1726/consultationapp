"use client"
import { useState, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BellRing, ArrowRight } from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"

interface QueueBoardProps {
  doctorId: string
  clinicId: string
  token: string // Auth token
}

export default function QueueBoard({ doctorId, clinicId, token }: QueueBoardProps) {
  const [activeToken, setActiveToken] = useState<number>(0)
  const [maxIssued, setMaxIssued] = useState<number>(0)
  const [socket, setSocket] = useState<Socket | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

  useEffect(() => {
    // Initial Fetch
    axios.get(`${API_BASE_URL}/api/queue/${doctorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setActiveToken(res.data.activeToken || 0)
      setMaxIssued(res.data.maxTokenIssued || 0)
    }).catch(console.error)

    // Socket Connection
    const newSocket = io(API_BASE_URL)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      newSocket.emit('join_queue', { clinicId, doctorId })
    })

    newSocket.on('queue_update', (data) => {
      setActiveToken(data.activeToken)
    })

    return () => { newSocket.disconnect() }
  }, [clinicId, doctorId, token])

  const callNextPatient = async () => {
    try {
      if (activeToken >= maxIssued) return alert("Queue is empty")
      await axios.put(`${API_BASE_URL}/api/queue/${doctorId}/next`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // WebSockets will auto-update state via queue_update listener
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate ETA dynamically (e.g. 15 mins per patient)
  const waitingPatients = maxIssued > activeToken ? maxIssued - activeToken : 0
  const estimatedTime = waitingPatients * 15

  return (
    <Card className="w-full max-w-lg shadow-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          Live Clinic Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Now Serving Token</p>
          <motion.div 
            key={activeToken} 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="text-7xl font-bold text-emerald-600 dark:text-emerald-400"
          >
            {activeToken === 0 ? '--' : activeToken}
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Waiting</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{waitingPatients}</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Est. Wait</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{estimatedTime}m</p>
          </div>
        </div>

        <Button 
          onClick={callNextPatient} 
          disabled={waitingPatients === 0}
          className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center justify-center"
        >
          <BellRing className="w-5 h-5 mr-3" />
          Call Next Patient
          <ArrowRight className="w-5 h-5 ml-3 opacity-50" />
        </Button>
      </CardContent>
    </Card>
  )
}

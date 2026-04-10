"use client"
import { useState, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartPulse, BellRing } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"

interface PatientQueueBoardProps {
  doctorId: string
}

export default function PatientQueueBoard({ doctorId }: PatientQueueBoardProps) {
  const [activeToken, setActiveToken] = useState<number>(0)
  const [maxIssued, setMaxIssued] = useState<number>(0)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [justUpdated, setJustUpdated] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

  useEffect(() => {
    // Initial Fetch (Public endpoint or needs auth?) 
    // Wait, the API for queue is /api/queue/:doctorId - if it's protected, we might need a public endpoint or token.
    // Assuming backend lets GET /api/queue/:doctorId be open for patients, if not we rely solely on socket updates.
    axios.get(`${API_BASE_URL}/api/queue/${doctorId}`)
      .then(res => {
        setActiveToken(res.data.activeToken || 0)
        setMaxIssued(res.data.maxTokenIssued || 0)
      }).catch(console.error)

    // Socket Connection
    const newSocket = io(API_BASE_URL)
    setSocket(newSocket)

    newSocket.on('connect', () => {
       // Join queue room specifically
       newSocket.emit('join_queue', { doctorId })
    })

    newSocket.on('queue_update', (data) => {
       if (data.doctorId === doctorId) {
         setActiveToken(data.activeToken)
         setJustUpdated(true)
         
         // Trigger bell sound
         const audio = new Audio('/notification.mp3')
         audio.play().catch(e => console.log('Audio play failed', e))

         setTimeout(() => setJustUpdated(false), 3000)
       }
    })

    return () => { newSocket.disconnect() }
  }, [doctorId])

  const waitingPatients = maxIssued > activeToken ? maxIssued - activeToken : 0
  const estimatedTime = waitingPatients * 15

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 text-center pb-8 pt-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
            <HeartPulse className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white">
          Waiting Room
        </CardTitle>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Please wait for your token to be called</p>
      </CardHeader>
      
      <CardContent className="p-10">
        <div className={`flex flex-col items-center justify-center p-12 rounded-3xl border-2 mb-8 transition-colors duration-500 ${justUpdated ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50' : 'bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-4">
            {justUpdated && <BellRing className="w-5 h-5 text-emerald-500 animate-bounce" />}
            <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">Now Serving</p>
          </div>
          
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={activeToken}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: justUpdated ? 1.2 : 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`text-9xl font-black ${justUpdated ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}
            >
              {activeToken === 0 ? '--' : activeToken}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Waiting in Queue</p>
            <p className="text-4xl font-bold text-slate-700 dark:text-slate-300">{waitingPatients}</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Est. Wait Time</p>
            <p className="text-4xl font-bold text-slate-700 dark:text-slate-300">{estimatedTime} <span className="text-lg font-medium text-slate-500">mins</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

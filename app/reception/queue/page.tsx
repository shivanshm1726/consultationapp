"use client"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import QueueBoard from "@/components/saas/QueueBoard"
import { ExternalLink, Search } from "lucide-react"
import Link from "next/link"

export default function ReceptionQueuePage() {
  const { userData } = useAuth()
  const [doctorIdInput, setDoctorIdInput] = useState("")
  const [activeDoctorId, setActiveDoctorId] = useState("")

  const handleLaunchQueue = () => {
    if (doctorIdInput.trim()) {
      setActiveDoctorId(doctorIdInput.trim())
    }
  }

  // Get token safely
  const getToken = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
      return match ? match[1] : ""
    }
    return ""
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Live Queue Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Control active walk-in tokens for doctors</p>
        </div>
      </div>

      {!activeDoctorId ? (
        <Card className="max-w-md mx-auto mt-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle>Select Doctor</CardTitle>
            <CardDescription>Enter the Doctor's System ID to manage their queue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Doctor ID</Label>
              <div className="flex gap-2">
                <Input 
                  value={doctorIdInput} 
                  onChange={(e) => setDoctorIdInput(e.target.value)} 
                  placeholder="Paste ID here..."
                  onKeyDown={(e) => e.key === 'Enter' && handleLaunchQueue()}
                />
                <Button onClick={handleLaunchQueue} className="bg-emerald-600 hover:bg-emerald-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setActiveDoctorId("")}>
              ← Change Doctor
            </Button>
            <Link href={`/queue/${activeDoctorId}`} target="_blank">
              <Button variant="secondary" className="gap-2">
                <ExternalLink className="w-4 h-4" /> 
                Open Public Screen
              </Button>
            </Link>
          </div>

          <div className="flex justify-center">
             <QueueBoard 
               doctorId={activeDoctorId} 
               clinicId={userData?.clinicId || "unknown"} 
               token={getToken()} 
             />
          </div>
        </div>
      )}
    </div>
  )
}

"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarClock, Save, User as UserIcon, Loader2, AlertCircle } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export default function ReceptionSchedules() {
  const { userData } = useAuth()
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Schedule State variables
  const [slotDuration, setSlotDuration] = useState(30)
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { isWorkingDay: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { isWorkingDay: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { isWorkingDay: true, startTime: "09:00", endTime: "17:00" },
    thursday: { isWorkingDay: true, startTime: "09:00", endTime: "17:00" },
    friday: { isWorkingDay: true, startTime: "09:00", endTime: "17:00" },
    saturday: { isWorkingDay: false, startTime: "09:00", endTime: "13:00" },
    sunday: { isWorkingDay: false, startTime: "09:00", endTime: "13:00" },
  })

  // Fetch doctors on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/doctors`)
      .then(res => setDoctors(res.data))
      .catch(console.error)
  }, [])

  // Fetch schedule when a doctor is selected
  useEffect(() => {
    if (!selectedDoctorId) return
    setIsLoading(true)

    const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
    const token = tokenMatch ? tokenMatch[1] : null

    axios.get(`${API_BASE_URL}/api/schedule/${selectedDoctorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // If schedule exists, load it. Otherwise, defaults remain.
      if (res.data && res.data.weeklySchedule) {
        setWeeklySchedule(res.data.weeklySchedule)
        setSlotDuration(res.data.slotDuration || 30)
      } else {
        // Reset to defaults if new doctor
        setSlotDuration(30)
      }
    })
    .catch(err => {
      // If 404, it means no schedule exists yet, which is fine
      if(err.response?.status !== 404) {
        console.error("Failed to load schedule", err)
      }
    })
    .finally(() => setIsLoading(false))
  }, [selectedDoctorId])

  const handleUpdateDay = (day: string, field: string, value: any) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        //@ts-ignore
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    if (!selectedDoctorId) return
    setIsSaving(true)

    const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
    const token = tokenMatch ? tokenMatch[1] : null

    try {
      await axios.put(`${API_BASE_URL}/api/schedule`, {
        doctorId: selectedDoctorId,
        slotDuration,
        weeklySchedule
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert("Doctor timings successfully updated! Patients can now book appointments strictly in these intervals.")
    } catch (err) {
      console.error(err)
      alert("Failed to save schedule.")
    } finally {
      setIsSaving(false)
    }
  }

  const daysOpen = Object.entries(weeklySchedule)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Doctor Timings & Slots</h2>
          <p className="text-slate-500 dark:text-slate-400">Configure availability intervals for the patient booking portal.</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg dark:bg-slate-900 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 relative" />
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-600" /> Selective Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Doctor</label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800">
                  <SelectValue placeholder="Choose a doctor to configure..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => (
                    <SelectItem key={doc._id} value={doc._id}>
                      Dr. {doc.fullName.replace("Dr. ", "")} — {doc.specialization || "General"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDoctorId && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Slot Interval (Minutes)</label>
                <Select value={slotDuration.toString()} onValueChange={(val) => setSlotDuration(parseInt(val))}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800">
                    <SelectValue placeholder="Time block size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes (Very Fast)</SelectItem>
                    <SelectItem value="20">20 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes (Standard)</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes (Deep consult)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedDoctorId && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl dark:bg-slate-900 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          )}
          
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-emerald-600" /> Weekly Availability Grid
            </CardTitle>
            <CardDescription>Toggle working days and establish start/end business hours.</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {daysOpen.map(([day, config]) => (
                <div key={day} className={`p-4 flex items-center transition-colors ${config.isWorkingDay ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-950/50'}`}>
                  
                  <div className="w-1/4 flex items-center gap-3">
                    <Switch 
                      checked={config.isWorkingDay} 
                      onCheckedChange={(val) => handleUpdateDay(day, 'isWorkingDay', val)} 
                    />
                    <span className={`capitalize font-medium ${config.isWorkingDay ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                      {day}
                    </span>
                  </div>

                  {config.isWorkingDay ? (
                    <div className="w-3/4 flex items-center gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-500">From</span>
                        <Input 
                          type="time" 
                          value={config.startTime} 
                          onChange={(e) => handleUpdateDay(day, 'startTime', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 w-32 font-mono"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-500">To</span>
                        <Input 
                          type="time" 
                          value={config.endTime} 
                          onChange={(e) => handleUpdateDay(day, 'endTime', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 w-32 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-3/4 flex items-center text-slate-400 gap-2">
                      <AlertCircle className="w-4 h-4" /> Doctor is off-duty
                    </div>
                  )}

                </div>
              ))}
            </div>
          </CardContent>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Publish Timings
            </Button>
          </div>
        </Card>
      )}

    </div>
  )
}

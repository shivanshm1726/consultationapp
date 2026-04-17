"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Save, Loader2 } from "lucide-react"

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const DEFAULT_SCHEDULE = DAYS_OF_WEEK.reduce((acc, day) => ({
  ...acc,
  [day]: { isWorkingDay: day !== "sunday", startTime: "09:00", endTime: "17:00" }
}), {})

export default function SchedulePage() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<any>(DEFAULT_SCHEDULE)
  const [slotDuration, setSlotDuration] = useState("30")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

  useEffect(() => {
    if (!user) return

    const fetchSchedule = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const token = tokenMatch ? tokenMatch[1] : null;

        const res = await axios.get(`${API_URL}/api/schedule/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (res.data) {
          if (res.data.weeklySchedule) setSchedule(res.data.weeklySchedule)
          if (res.data.slotDuration) setSlotDuration(res.data.slotDuration.toString())
        }
      } catch (err) {
        console.error("Failed to fetch schedule", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSchedule()
  }, [user])

  const handleDayChange = (day: string, field: string, value: any) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.put(`${API_URL}/api/schedule/${user?.uid}`, {
        weeklySchedule: schedule,
        slotDuration: parseInt(slotDuration, 10)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      alert("Schedule saved successfully!")
    } catch (err) {
      console.error("Failed to save schedule", err)
      alert("Failed to save schedule")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-slate-500" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Working Hours</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Configure your weekly availability for patient bookings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" /> Appointment Settings
          </CardTitle>
          <CardDescription>Set the duration for a typical consultation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label>Slot Duration (minutes)</Label>
            <Select value={slotDuration} onValueChange={setSlotDuration}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Minutes</SelectItem>
                <SelectItem value="20">20 Minutes</SelectItem>
                <SelectItem value="30">30 Minutes</SelectItem>
                <SelectItem value="45">45 Minutes</SelectItem>
                <SelectItem value="60">60 Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => (
          <Card key={day} className={`overflow-hidden transition-all ${!schedule[day]?.isWorkingDay ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}`}>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4 w-full sm:w-48">
                <Switch 
                  checked={schedule[day]?.isWorkingDay} 
                  onCheckedChange={(val) => handleDayChange(day, "isWorkingDay", val)} 
                />
                <span className="font-semibold text-lg capitalize">{day}</span>
              </div>

              {schedule[day]?.isWorkingDay ? (
                <div className="flex flex-1 items-center gap-4 w-full justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <Label className="sr-only">Start Time</Label>
                    <Input 
                      type="time" 
                      value={schedule[day]?.startTime || "09:00"}
                      onChange={(e) => handleDayChange(day, "startTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                  <span className="text-slate-400">to</span>
                  <div className="flex items-center gap-2">
                    <Label className="sr-only">End Time</Label>
                    <Input 
                      type="time" 
                      value={schedule[day]?.endTime || "17:00"}
                      onChange={(e) => handleDayChange(day, "endTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 italic flex-1">Day Off</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

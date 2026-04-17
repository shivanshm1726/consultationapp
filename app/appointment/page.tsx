"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/contexts/auth-context"
import { useDarkMode } from "@/contexts/dark-mode-context"
import axios from "axios"
import { ArrowLeft, CalendarIcon, Clock, User, Stethoscope, CheckCircle, AlertCircle, Activity, Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

type Doctor = {
  _id: string;
  fullName: string;
  isAvailableOnline: boolean;
}

type Slot = {
  time: string;
  available: boolean;
}

export default function AppointmentBooking() {
  const { user, userData } = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [mounted, setMounted] = useState(false)
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    gender: "",
    symptoms: "",
    urgency: "medium",
  })

  useEffect(() => { setMounted(true); }, [])

  // Pre-fill user data
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || (userData.fullName?.split(" ")[0] || ""),
        lastName: prev.lastName || (userData.fullName?.split(" ").slice(1).join(" ") || ""),
        phone: prev.phone || (userData.phone || ""),
        age: prev.age || (userData.age?.toString() || "")
      }))
    }
  }, [userData])

  // Fetch Doctors
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/doctors`)
      .then(res => setDoctors(res.data))
      .catch(console.error)
  }, [])

  // Fetch Slots
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return

    setIsLoadingSlots(true)
    const dateStr = selectedDate.toLocaleDateString('en-CA')
    
    axios.get(`${API_BASE_URL}/api/appointments/slots/${selectedDoctorId}?date=${dateStr}`)
      .then(res => {
        setAvailableSlots(res.data)
        setSelectedTimeSlot("")
      })
      .catch(console.error)
      .finally(() => setIsLoadingSlots(false))
  }, [selectedDoctorId, selectedDate])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      alert("Please complete the form and select a time slot.")
      return
    }

    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/)
      const token = tokenMatch ? tokenMatch[1] : null

      await axios.post(`${API_BASE_URL}/api/appointments`, {
        doctorId: selectedDoctorId,
        patientId: user?.uid || "guest",
        appointmentDate: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        reason: formData.symptoms,
        amount: 500
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      setShowConfirmation(true)
    } catch (err) {
      alert("Error booking appointment. Ensure you're logged in.")
      console.error(err)
    }
  }

  if (showConfirmation) {
    return (
      <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"} flex items-center justify-center p-4`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full"
        >
          <Card className="border-0 shadow-2xl bg-white dark:bg-[#0a0a0a] dark:border-white/5 rounded-3xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Confirmed!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Your consultation has been successfully scheduled. You can join from your profile.
              </p>
              <div className="space-y-3">
                <Link href="/profile">
                  <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-xl hover:opacity-90">View My Appointments</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-12 rounded-xl bg-white/5 dark:bg-black/20 border-slate-200 dark:border-white/10 backdrop-blur-xl hover:bg-slate-100 dark:hover:bg-white/5 mt-2">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? "dark bg-[#030303]" : "bg-slate-50"} pb-20`}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 dark:opacity-20 mix-blend-screen pointer-events-none blur-[120px] rounded-full bg-gradient-to-r from-emerald-500/80 to-teal-800/20" />
      </div>

      {/* Floating Navigation */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <div className="transition-all duration-500 mx-4 w-full max-w-5xl rounded-2xl border flex items-center justify-between px-6 py-3 shadow-2xl backdrop-blur-xl bg-white/80 border-slate-200 dark:bg-[#0a0a0a]/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white hidden sm:block">Nexus Health</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Stethoscope className="h-4 w-4 text-emerald-500" />
            <span>Book Appointment</span>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5 transition-all">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400">
                <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 pt-32 max-w-5xl">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Doctor Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-xl bg-white dark:bg-[#0a0a0a] dark:border-white/5 rounded-3xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                    <Stethoscope className="w-5 h-5 text-emerald-500" />
                    Select Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl">
                      <SelectValue placeholder="Choose your specialist" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#0a0a0a] dark:border-white/10">
                      {doctors.map(doc => (
                        <SelectItem key={doc._id} value={doc._id}>
                          {doc.fullName} {doc.isAvailableOnline ? '(Online)' : '(Offline)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Patient Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-xl bg-white dark:bg-[#0a0a0a] dark:border-white/5 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                    <User className="w-5 h-5 text-emerald-500" />
                    Patient Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">First Name</Label>
                      <Input required value={formData.firstName} onChange={e => handleInputChange("firstName", e.target.value)} className="h-11 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Name</Label>
                      <Input required value={formData.lastName} onChange={e => handleInputChange("lastName", e.target.value)} className="h-11 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</Label>
                      <Input required type="tel" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} className="h-11 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Age</Label>
                      <Input required type="number" value={formData.age} onChange={e => handleInputChange("age", e.target.value)} className="h-11 bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symptoms</Label>
                    <Textarea required className="min-h-[100px] bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 rounded-xl" placeholder="Describe your symptoms..." value={formData.symptoms} onChange={e => handleInputChange("symptoms", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Step 3: Calendar & Slots */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-xl bg-white dark:bg-[#0a0a0a] dark:border-white/5 rounded-3xl sticky top-28 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                    <CalendarIcon className="w-5 h-5 text-emerald-500" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center border-b border-slate-100 dark:border-white/5 pb-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => { if(d) setSelectedDate(d) }}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      className="bg-white dark:bg-[#0a0a0a] rounded-xl pointer-events-auto"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedDoctorId ? 'Available Slots' : 'Select a doctor first'}
                    </Label>
                    
                    {selectedDoctorId ? (
                      isLoadingSlots ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot, i) => (
                            <button
                              type="button"
                              key={i}
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot.time)}
                              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                                !slot.available 
                                  ? "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600 cursor-not-allowed line-through" 
                                  : selectedTimeSlot === slot.time 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> No slots available on this date.
                        </div>
                      )
                    ) : null}
                  </div>
                </CardContent>
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-xl hover:opacity-90 font-semibold disabled:opacity-40" 
                    disabled={!selectedDoctorId || !selectedTimeSlot}
                  >
                    Confirm Appointment (₹500)
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

        </form>
      </div>
    </div>
  )
}

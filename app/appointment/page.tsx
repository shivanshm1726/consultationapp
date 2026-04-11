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
import axios from "axios"
import { ArrowLeft, CalendarIcon, Clock, User, Stethoscope, CheckCircle, AlertCircle } from "lucide-react"

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

  // Fetch Slots dynamically based on Doctor and Date
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return

    setIsLoadingSlots(true)
    const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD
    
    axios.get(`${API_BASE_URL}/api/appointments/slots/${selectedDoctorId}?date=${dateStr}`)
      .then(res => {
        setAvailableSlots(res.data)
        setSelectedTimeSlot("") // reset
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
        patientId: user?.uid || "guest", // or require auth layer explicitly
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full mx-auto border-0 shadow-2xl bg-white dark:bg-slate-900">
          <CardContent className="p-8 text-center animate-in zoom-in duration-500">
            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Confirmed!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Your appointment has been successfully scheduled. You'll be able to join your video consultation at the specified time.
            </p>
            <div className="space-y-3">
              <Link href="/profile">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">View My Appointments</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          </Link>
          <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
            <Stethoscope className="h-5 w-5 text-emerald-600" />
            <span>Book Appointment</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Doctor Selection */}
            <Card className="border-0 shadow-lg dark:bg-slate-900 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 relative" />
              <CardHeader>
                <CardTitle className="text-lg">Select Specialized Doctor</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {doctors.map(doc => (
                  <label key={doc._id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedDoctorId === doc._id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}`}>
                     <input type="radio" className="sr-only" checked={selectedDoctorId === doc._id} onChange={() => setSelectedDoctorId(doc._id)} />
                     <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">{doc.fullName}</div>
                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${doc.isAvailableOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                           {doc.isAvailableOnline ? 'Available Online' : 'Currently Offline'}
                        </div>
                     </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Step 2: Patient Info */}
            <Card className="border-0 shadow-lg dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                   <User className="w-5 h-5 text-slate-400" /> 
                   Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>First Name</Label>
                       <Input required value={formData.firstName} onChange={e => handleInputChange("firstName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Last Name</Label>
                       <Input required value={formData.lastName} onChange={e => handleInputChange("lastName", e.target.value)} />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                       <Label>Phone</Label>
                       <Input required type="tel" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Age</Label>
                       <Input required type="number" value={formData.age} onChange={e => handleInputChange("age", e.target.value)} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label>Reason for Visit / Symptoms</Label>
                    <Textarea required className="min-h-[100px]" placeholder="Briefly describe your health issue..." value={formData.symptoms} onChange={e => handleInputChange("symptoms", e.target.value)} />
                 </div>
              </CardContent>
            </Card>
            
          </div>

          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 3: Calendar & Slots */}
            <Card className="border-0 shadow-lg dark:bg-slate-900 sticky top-24">
              <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                    Date & Time
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex justify-center border-b border-slate-100 dark:border-slate-800 pb-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => { if(d) setSelectedDate(d) }}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      className="bg-white dark:bg-slate-800 rounded-xl pointer-events-auto"
                    />
                 </div>

                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm text-slate-500">
                       <Clock className="w-4 h-4" /> 
                       {selectedDoctorId ? 'Available Time Slots (30 mins)' : 'Select a doctor first'}
                    </Label>
                    
                    {selectedDoctorId ? (
                       isLoadingSlots ? (
                          <div className="text-sm text-slate-500 text-center py-4">Checking availability...</div>
                       ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                             {availableSlots.map((slot, i) => (
                                <button
                                  type="button"
                                  key={i}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                    !slot.available 
                                      ? "bg-slate-100 text-slate-400 dark:bg-slate-800/50 cursor-not-allowed line-through" 
                                      : selectedTimeSlot === slot.time 
                                        ? "bg-emerald-600 text-white shadow-md" 
                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  }`}
                                >
                                   {slot.time}
                                </button>
                             ))}
                          </div>
                       ) : (
                          <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" /> Doctor is unavailable on this date.
                          </div>
                       )
                    ) : null}
                 </div>
              </CardContent>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                 <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700" disabled={!selectedDoctorId || !selectedTimeSlot}>
                    Confirm Appointment (₹500)
                 </Button>
              </div>
            </Card>

          </div>

        </form>
      </div>
    </div>
  )
}

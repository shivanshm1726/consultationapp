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
import { useAppointmentStatus } from "app/reception/hooks/useAppointmentStatus"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  ListChecks,
} from "lucide-react"

const APPOINTMENTS_API = "http://localhost:5001/api/appointments";

export default function AppointmentBooking() {
  const { active, loading: statusLoading } = useAppointmentStatus()
  const { user, userData } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedClinic, setSelectedClinic] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    gender: "",
    symptoms: "",
    urgency: "",
    preferredContact: "",
  })
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isWaitingList, setIsWaitingList] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [fullyBookedSlots, setFullyBookedSlots] = useState<string[]>([])

  const clinics = [
    {
      id: "rampur",
      name: "North Branch Clinic",
      address: "North Branch, City Center",
      timings: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"],
    },
    {
      id: "ddpuram",
      name: "South Branch Clinic",
      address: "South Branch, City Center",
      timings: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "8:30 PM", "9:00 PM", "9:30 PM"],
    },
  ]

  const selectedClinicInfo = clinics.find((c) => c.id === selectedClinic)

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        firstName: userData.fullName.split(" ")[0] || "",
        lastName: userData.fullName.split(" ").slice(1).join(" ") || "",
        phone: userData.phone || ""
      }))
    }
  }, [userData])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedClinic || !selectedDate) return

      try {
        const formattedDate = selectedDate.toISOString().split("T")[0]
        const response = await axios.get(`${APPOINTMENTS_API}?clinicId=${selectedClinic}&date=${formattedDate}`);
        
        const timeSlotCount: Record<string, number> = {}
        response.data.forEach((app: any) => {
          if (app.time) {
            timeSlotCount[app.time] = (timeSlotCount[app.time] || 0) + 1
          }
        })

        const fullSlots = Object.entries(timeSlotCount)
          .filter(([_, count]) => count >= 15)
          .map(([slot]) => slot)

        setFullyBookedSlots(fullSlots)

        const clinic = clinics.find((c) => c.id === selectedClinic)
        if (clinic) {
          setAvailableTimeSlots(clinic.timings)
        }
      } catch (err) {
        console.error("Error fetching available slots:", err)
      }
    }

    fetchAppointments()
  }, [selectedClinic, selectedDate])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClinic || !selectedDate || (!selectedTime && !isWaitingList)) {
      alert("Please fill in all the required fields.")
      return
    }

    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.post(APPOINTMENTS_API, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        clinic: selectedClinicInfo?.name,
        clinicId: selectedClinicInfo?.id,
        date: selectedDate?.toISOString().split("T")[0],
        time: selectedTime,
        urgency: formData.urgency,
        paymentStatus: "paid",
        symptoms: formData.symptoms
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowConfirmation(true)
    } catch (err) {
      alert("Error booking appointment. Please try again.")
      console.error("Booking error:", err)
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 dark:text-slate-100 mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your appointment has been successfully booked.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-slate-800/80 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="group text-gray-800 dark:text-gray-200">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-blue-900 dark:text-slate-100">Book Appointment</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-slate-100 mb-2">Book Your Appointment</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Schedule a consultation with Medical Clinic Doctor</p>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-slate-100">
                    <MapPin className="h-5 w-5" />
                    <span>Select Clinic Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {clinics.map((clinic) => (
                      <div
                        key={clinic.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedClinic === clinic.id
                            ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-700 dark:bg-blue-900 dark:text-gray-50"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                        }`}
                        onClick={() => setSelectedClinic(clinic.id)}
                      >
                        <h3 className="font-semibold text-blue-900 dark:text-slate-100 mb-1">{clinic.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{clinic.address}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-slate-100">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-blue-900 dark:text-slate-200">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-blue-900 dark:text-slate-200">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-blue-900 dark:text-slate-200">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age" className="text-blue-900 dark:text-slate-200">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-blue-900 dark:text-slate-200">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-700 dark:text-slate-50">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-slate-50">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-slate-100">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="symptoms" className="text-blue-900 dark:text-slate-200">Symptoms *</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe your condition..."
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      required
                      className="bg-white/50 dark:bg-slate-700 dark:text-slate-50 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency" className="text-blue-900 dark:text-slate-200">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-700 dark:text-slate-50">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-slate-50">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-slate-100">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Select Date</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border bg-white/50 dark:bg-slate-700"
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-slate-100">
                    <Clock className="h-5 w-5" />
                    <span>Available Times</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedClinic ? (
                    <p className="text-center py-4">Please select a clinic</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimeSlots.map((slot, index) => {
                        const isFull = fullyBookedSlots.includes(slot)
                        const isSelected = selectedTime === slot
                        return (
                          <Button
                            key={index}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => { if (!isFull) setSelectedTime(slot); setIsWaitingList(false); }}
                            disabled={isFull}
                            className={isSelected ? "bg-blue-600 text-white" : ""}
                          >
                            {slot}
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-slate-100">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center border-t pt-4">
                    <span className="font-bold text-blue-600 text-xl dark:text-blue-400">Fee: ₹500</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    disabled={!selectedClinic || !selectedDate || (!selectedTime && !isWaitingList)}
                  >
                    Confirm Booking
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>

          {statusLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <p className="text-white">Loading...</p>
            </div>
          )}

          {!statusLoading && !active && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <Card className="p-6 bg-white dark:bg-slate-800">
                <CardHeader><CardTitle className="text-red-600">Appointments Closed</CardTitle></CardHeader>
                <CardContent>
                  <p>Check again later.</p>
                  <Button onClick={() => window.location.href = '/'} className="mt-4">Close</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

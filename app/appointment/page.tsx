"use client"
import { db } from "@/lib/firebase"  
import { collection, addDoc, serverTimestamp } from "firebase/firestore"  
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getDocs, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { useAppointmentStatus } from "app/reception/hooks/useAppointmentStatus"
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

export default function AppointmentBooking() {
  const { active, loading: statusLoading } = useAppointmentStatus()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedClinic, setSelectedClinic] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
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
  
  const clinics = [
    {
      id: "rampur",
      name: "Rampur Garden Clinic",
      address: "Rampur Garden, Bareilly",
      timings: [
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "1:00 PM",
        "1:30 PM",
        "6:00 PM",
        "6:30 PM",
        "7:00 PM",
        "7:30 PM",
      ],
    },
    {
      id: "ddpuram",
      name: "DD Puram Clinic",
      address: "DD Puram, Bareilly",
      timings: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "8:30 PM", "9:00 PM", "9:30 PM"],
    },
  ]

  const selectedClinicInfo = clinics.find((c) => c.id === selectedClinic)
const [fullyBookedSlots, setFullyBookedSlots] = useState<string[]>([])

useEffect(() => {
  const fetchAppointments = async () => {
    if (!selectedClinic || !selectedDate) return

    const appointmentsRef = collection(db, "appointments")
    const formattedDate = selectedDate.toISOString().split("T")[0] // convert Date → "YYYY-MM-DD"

    const q = query(
      appointmentsRef,
      where("clinicId", "==", selectedClinic),
      where("date", "==", formattedDate)
    )

    const snapshot = await getDocs(q)
    const timeSlotCount: Record<string, number> = {}

    snapshot.forEach((doc) => {
      const time = doc.data().time
      if (typeof time === "string") {
        timeSlotCount[time] = (timeSlotCount[time] || 0) + 1
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
   await addDoc(collection(db, "appointments"), {
  firstName: formData.firstName,
  lastName: formData.lastName,
  phone: formData.phone,
  email: formData.email,
  clinic: selectedClinicInfo?.name,
  clinicId: selectedClinicInfo?.id,
  date: selectedDate?.toISOString().split("T")[0],
  time: selectedTime,
  urgency: formData.urgency,
  paymentStatus: "paid",
  createdAt: serverTimestamp(),
  symptoms: formData.symptoms
})
  

    setShowConfirmation(true)  // 👈 show the UI popup
  } catch (err) {
    alert("Error booking appointment. Please try again.")
    console.error("Firebase error:", err)
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
              Your appointment has been successfully booked. We will contact you shortly to confirm the details.
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
      {/* Header */}
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
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-slate-100 mb-2">
              Book Your Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Schedule a consultation with Dr. Nitin Mishra</p>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clinic Selection */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
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
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600"
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

              {/* Personal Information */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-slate-100">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-blue-900 dark:text-slate-200">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-blue-900 dark:text-slate-200">
                        Last Name *
                      </Label>
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
                      <Label htmlFor="email" className="text-blue-900 dark:text-slate-200">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-blue-900 dark:text-slate-200">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                        placeholder="9258924611"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-blue-900 dark:text-slate-200">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-700 dark:text-slate-50"
                        min="5"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-blue-900 dark:text-slate-200">
                        Gender *
                      </Label>
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
                  </div>

                  
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-slate-100">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="symptoms" className="text-blue-900 dark:text-slate-200">
                      Symptoms / Reason for Visit *
                    </Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Please describe your symptoms, skin condition, or reason for consultation in detail..."
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      required
                      className="bg-white/50 dark:bg-slate-700 dark:text-slate-50 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="text-blue-900 dark:text-slate-200">
                      Urgency Level
                    </Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-700 dark:text-slate-50">
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-slate-50">
                        <SelectItem value="low">Low - Routine checkup/consultation</SelectItem>
                        <SelectItem value="medium">Medium - Concerning symptoms</SelectItem>
                        <SelectItem value="high">High - Urgent care needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Date Selection */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
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
                    className="rounded-md border bg-white/50 dark:bg-slate-700 dark:border-slate-600"
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                  />
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">Sundays are closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-slate-100">
                    <Clock className="h-5 w-5" />
                    <span>Available Times</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
  {!selectedClinic ? (
    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
      Please select a clinic first
    </p>
  ) : (
    <div className="grid grid-cols-2 gap-2">
      {availableTimeSlots.length > 0 ? (
        availableTimeSlots.map((slot, index) => {
  const isFull = fullyBookedSlots.includes(slot)
  const isSelected = selectedTime === slot

  return (
    <Button
      key={index}
      type="button"
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={() => {
        if (!isFull) {
          setSelectedTime(slot)
          setIsWaitingList(false)
        }
      }}
      disabled={isFull}
      className={`text-sm w-full ${
        isSelected
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : isFull
          ? "bg-gray-200 text-gray-500 dark:bg-slate-600/60 dark:text-gray-400 cursor-not-allowed"
          : "bg-white/50 hover:bg-white/80 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-300"
      }`}
    >
      {slot}
    </Button>
  )
})

      ) : (
        <>
          <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-2">
            No available time slots for the selected date.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full col-span-2"
            onClick={() => {
              setIsWaitingList(true)
              setSelectedTime("")
            }}
          >
            <ListChecks className="h-4 w-4 mr-2" />
            Join Waiting List
          </Button>
        </>
      )}
    </div>
  )}
</CardContent>

              </Card>

              {/* Booking Summary */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-slate-100">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedClinicInfo && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-slate-100">{selectedClinicInfo.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedClinicInfo.address}</div>
                      </div>
                    </div>
                  )}

                  {selectedDate && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-slate-100">
                        {selectedDate.toDateString()}
                      </span>
                    </div>
                  )}

                  {selectedTime && !isWaitingList && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-slate-100">{selectedTime}</span>
                    </div>
                  )}

                  {isWaitingList && (
                    <div className="flex items-center space-x-2">
                      <ListChecks className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-slate-100">On Waiting List</span>
                    </div>
                  )}

                  <div className="border-t pt-4 dark:border-slate-700">
                    <div className="text-center">
                      <span className="font-bold text-blue-600 text-xl dark:text-blue-400">Consultation Fee: ₹500</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t dark:border-slate-700">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
                      size="lg"
                      disabled={!selectedClinic || !selectedDate || (!selectedTime && !isWaitingList)}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Book Appointment
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Or call directly:
                        <a href="tel:9258924611" className="text-blue-600 font-medium ml-1 dark:text-blue-400">
                          9258924611
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-transform hover:scale-[1.02] dark:bg-slate-800/70 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-slate-100">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium text-blue-900 dark:text-slate-100">Call Us</div>
                      <div className="text-blue-600 font-bold dark:text-blue-400">9258924611</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Available during clinic hours for immediate assistance
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
          {/* Step 6: Loading Popup */}
{statusLoading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <Card className="p-6 bg-white dark:bg-slate-800 shadow-lg">
      <CardContent className="flex flex-col items-center">
        <div className="loader mb-4 animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
        <p className="text-gray-700 dark:text-gray-300">Checking appointment availability...</p>
      </CardContent>
    </Card>
  </div>
)}

{/* Step 5: Closed Popup */}
{!statusLoading && !active && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <Card className="max-w-sm p-6 bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-red-600 dark:text-red-400">Appointments Closed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Sorry! Appointments are not being accepted right now.
          <br />
          Please check again after 10 AM tomorrow.
        </p>
        <Button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white hover:bg-blue-700">
          Close
        </Button>
      </CardContent>
    </Card>
  </div>
)}

        </div>
      </div>
    </div>
  )
}

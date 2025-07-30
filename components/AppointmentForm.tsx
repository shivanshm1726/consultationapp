import React from "react"
import { CalendarIcon, Clock, ListChecks, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ---------------- Types ----------------
type Clinic = {
  id: string
  name: string
  address: string
  timings: string[]
}

type AppointmentFormProps = {
  clinics: Clinic[]
  selectedClinic: string
  setSelectedClinic: React.Dispatch<React.SetStateAction<string>>
  selectedClinicInfo?: Clinic
  selectedDate?: Date
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  availableTimeSlots: string[]
  selectedTime: string
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>
  isWaitingList: boolean
  setIsWaitingList: React.Dispatch<React.SetStateAction<boolean>>
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    age: string
    gender: string
    symptoms: string
    urgency: string
    preferredContact: string
  }
  handleInputChange: (field: string, value: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
}

// ---------------- Component ----------------
const AppointmentForm: React.FC<AppointmentFormProps> = ({
  clinics,
  selectedClinic,
  setSelectedClinic,
  selectedClinicInfo,
  selectedDate,
  setSelectedDate,
  availableTimeSlots,
  selectedTime,
  setSelectedTime,
  isWaitingList,
  setIsWaitingList,
  formData,
  handleInputChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Left side */}
      <div className="lg:col-span-2 space-y-6">
        {/* Clinic selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Clinic</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                onClick={() => setSelectedClinic(clinic.id)}
                className={`border p-4 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 transition-all ${
                  selectedClinic === clinic.id ? "border-blue-500 bg-blue-100 dark:bg-blue-900" : ""
                }`}
              >
                <div className="font-semibold">{clinic.name}</div>
                <div className="text-sm text-gray-600">{clinic.address}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input type="number" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Symptoms</Label>
              <Textarea value={formData.symptoms} onChange={(e) => handleInputChange("symptoms", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Times</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((slot, i) => (
                <Button
                  type="button"
                  key={i}
                  size="sm"
                  onClick={() => {
                    setSelectedTime(slot)
                    setIsWaitingList(false)
                  }}
                  className={`text-sm ${
                    selectedTime === slot ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700"
                  }`}
                >
                  {slot}
                </Button>
              ))
            ) : (
              <Button
                type="button"
                variant="outline"
                className="col-span-2"
                onClick={() => {
                  setIsWaitingList(true)
                  setSelectedTime("")
                }}
              >
                <ListChecks className="h-4 w-4 mr-2" /> Join Waiting List
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Button type="submit" className="w-full">
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

export default AppointmentForm

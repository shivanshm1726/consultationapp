export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  patientAge: number
  patientGender: "male" | "female" | "other"
  symptoms: string
  urgency: "low" | "medium" | "high"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  appointmentDate: string
  appointmentTime: string
  createdAt: string
  updatedAt: string
  paymentStatus: "pending" | "paid" | "failed"
  consultationFee?: number
  consultationNotes?: string
  prescription?: string
  doctorId?: string
  duration?: number
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: "male" | "female" | "other"
  address?: string
  emergencyContact?: string
  bloodGroup?: string
  allergies?: string[]
  medicalHistory: string[]
  lastVisit?: string
  totalConsultations: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  patientId: string
}

export interface Doctor {
  id: string
  name: string
  specialization: string
  email: string
  phone: string
  isAvailable: boolean
}

export interface Payment {
  id: string
  appointmentId: string
  patientId: string
  amount: number
  paymentMethod: "cash" | "card" | "upi" | "online"
  status: "pending" | "completed" | "failed"
  transactionId?: string
  createdAt: string
}

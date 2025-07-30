"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, getDocs, orderBy, where } from "firebase/firestore"
import { ref, listAll, getDownloadURL } from "firebase/storage"
import { auth, db, storage } from "@/lib/firebase"
import { Search, Users, Eye, Calendar, Phone, Mail, Activity, FileText, ImageIcon, Download } from "lucide-react"

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: string
  gender: string
  location?: string
  totalConsultations: number
  lastConsultation: string
  medicalHistory: string[]
  uploadedFiles: string[]
  status: "active" | "inactive"
}

interface PatientDetails {
  appointments: any[]
  chatHistory: any[]
  uploadedMedia: string[]
}

export default function PatientsPage() {
  const [user] = useAuthState(auth)
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPatients()
    }
  }, [user])

  useEffect(() => {
    filterPatients()
  }, [patients, searchTerm])

  const fetchPatients = async () => {
    try {
      setLoading(true)

      // Get all appointments to extract unique patients
      const appointmentsQuery = query(collection(db, "appointments"), orderBy("createdAt", "desc"))
      const appointmentsSnapshot = await getDocs(appointmentsQuery)

      // Group appointments by patient email
      const patientMap = new Map<string, any>()

      appointmentsSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const email = data.patientEmail

        if (!patientMap.has(email)) {
          patientMap.set(email, {
            id: email,
            name: data.patientName || "Unknown",
            email: email,
            phone: data.patientPhone || "N/A",
            age: data.age || "N/A",
            gender: data.gender || "N/A",
            location: data.location || "N/A",
            totalConsultations: 0,
            lastConsultation: data.createdAt?.toDate?.()?.toISOString().slice(0, 10) || "N/A",
            medicalHistory: [],
            uploadedFiles: [],
            status: "active" as const,
            appointments: [],
          })
        }

        const patient = patientMap.get(email)
        patient.totalConsultations += 1
        patient.appointments.push(data)

        // Update last consultation if this one is more recent
        const currentDate = data.createdAt?.toDate?.()
        const lastDate = new Date(patient.lastConsultation)
        if (currentDate && currentDate > lastDate) {
          patient.lastConsultation = currentDate.toISOString().slice(0, 10)
        }
      })

      const patientsData = Array.from(patientMap.values())
      setPatients(patientsData)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm),
      )
    }

    setFilteredPatients(filtered)
  }

  const fetchPatientDetails = async (patient: Patient) => {
    try {
      setDetailsLoading(true)
      setSelectedPatient(patient)

      // Get patient's appointments
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("patientEmail", "==", patient.email),
        orderBy("createdAt", "desc"),
      )
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointments = appointmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Get patient's chat history
      const chatsQuery = query(
        collection(db, "chats"),
        where("patientEmail", "==", patient.email),
        orderBy("createdAt", "desc"),
      )
      const chatsSnapshot = await getDocs(chatsQuery)
      const chatHistory = chatsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Get uploaded media from Firebase Storage
      let uploadedMedia: string[] = []
      try {
        const mediaRef = ref(storage, `uploads/${patient.email}`)
        const mediaList = await listAll(mediaRef)
        uploadedMedia = await Promise.all(
          mediaList.items.map(async (item) => {
            const url = await getDownloadURL(item)
            return url
          }),
        )
      } catch (error) {
        console.log("No uploaded media found for patient")
      }

      setPatientDetails({
        appointments,
        chatHistory,
        uploadedMedia,
      })
    } catch (error) {
      console.error("Error fetching patient details:", error)
    } finally {
      setDetailsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.status === "active").length}
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    patients.filter((p) => {
                      const lastConsultation = new Date(p.lastConsultation)
                      const thisMonth = new Date()
                      thisMonth.setDate(1)
                      return lastConsultation >= thisMonth
                    }).length
                  }
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Consultations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {patients.reduce((sum, p) => sum + p.totalConsultations, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Patients Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id ? patient.id : `patient-fallback-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                      <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {patient.age} years, {patient.gender}
                      </span>
                      <span className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {patient.totalConsultations} consultations
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last: {typeof patient.lastConsultation === "string" ? patient.lastConsultation : (patient.lastConsultation?.toISOString?.().slice(0, 10) || "N/A")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {patient.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {patient.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => fetchPatientDetails(patient)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Patient Details - {selectedPatient?.name}</DialogTitle>
                    </DialogHeader>
                    {detailsLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      patientDetails && (
                        <div className="space-y-6">
                          {/* Patient Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                              <p className="font-semibold">{selectedPatient?.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</p>
                              <p className="font-semibold">{selectedPatient?.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Age & Gender</p>
                              <p className="font-semibold">
                                {selectedPatient?.age} years, {selectedPatient?.gender}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Consultations
                              </p>
                              <p className="font-semibold">{selectedPatient?.totalConsultations}</p>
                            </div>
                          </div>

                          {/* Appointment History */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Appointment History
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {patientDetails.appointments.map((appointment) => (
                                <div key={appointment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{appointment.symptoms}</p>
                                      <p className="text-sm text-gray-500">
                                        {appointment.createdAt?.toDate?.()?.toISOString().slice(0, 10)} -{" "}
                                        {appointment.urgency} urgency
                                      </p>
                                    </div>
                                    <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Uploaded Media */}
                          {patientDetails.uploadedMedia.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Uploaded Media
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                {patientDetails.uploadedMedia.map((url) => (
                                  <div key={url} className="relative">
                                    <img
                                      src={url || "/placeholder.svg"}
                                      alt={`Upload`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="absolute top-2 right-2"
                                      onClick={() => window.open(url, "_blank")}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chat Summary */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Recent Chat Messages
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {patientDetails.chatHistory.slice(0, 5).map((chat) => (
                                <div key={chat.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <p className="text-sm">{chat.lastMessage || "Chat session"}</p>
                                  <p className="text-xs text-gray-500">
                                    {chat.createdAt?.toDate?.()?.toISOString().slice(0, 10)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

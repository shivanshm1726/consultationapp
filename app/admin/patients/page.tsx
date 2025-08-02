"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, query, getDocs, orderBy, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import {
  Users,
  Search,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Loader2,
  User,
} from "lucide-react"

interface Patient {
  id: string
  patientName: string
  contactNumber: string
  chiefComplaint: string
  email?: string
  age?: number
  gender?: string
  createdAt: Date
}

const ITEMS_PER_PAGE = 10

export default function PatientsPage() {
  const [user] = useAuthState(auth)
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user) {
      fetchPatients()
    }
  }, [user])

  useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, "appointments"), orderBy("createdAt", "desc")),
    (snapshot) => {
      const map = new Map<string, Patient>()

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const email = data.email || ""
        const phone = data.phone || ""
        const key = email || phone || doc.id

        if (!map.has(key)) {
          map.set(key, {
            id: doc.id,
            patientName: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown",
            contactNumber: data.phone || "N/A",
            chiefComplaint: data.symptoms || "Not specified",
            email: data.email || "",
            age: data.age,
            gender: data.gender,
            createdAt: data.createdAt?.toDate() || new Date(),
          })
        }
      })

      setPatients(Array.from(map.values()))
      setLoading(false)
    },
    (error) => {
      console.error("Error in real-time listener:", error)
      setLoading(false)
    }
  )

  return () => unsubscribe()
}, [])



  const fetchPatients = async () => {
    try {
      setLoading(true)

      // Fetch from chats collection (patient conversations)
      const chatsQuery = query(collection(db, "chats"), orderBy("createdAt", "desc"))
      const chatsSnapshot = await getDocs(chatsQuery)

      // Fetch from appointments collection
      const appointmentsQuery = query(collection(db, "appointments"), orderBy("createdAt", "desc"))
      const appointmentsSnapshot = await getDocs(appointmentsQuery)

      const patientsMap = new Map<string, Patient>()

      // Process chats data
      chatsSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const email = data.patientEmail || data.userEmail
        if (email && !patientsMap.has(email)) {
          patientsMap.set(email, {
            id: doc.id,
            patientName: data.patientName || data.userName || "Unknown Patient",
            contactNumber: data.phoneNumber || data.contactNumber || "N/A",
            chiefComplaint: data.chiefComplaint || data.message || "General consultation",
            email: email,
            createdAt: data.createdAt?.toDate() || new Date(),
          })
        }
      })

      // Process appointments data
      appointmentsSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const email = data.patientEmail || data.email
        const phone = data.phoneNumber || data.contactNumber
        const key = email || phone || doc.id

        if (!patientsMap.has(key)) {
          patientsMap.set(key, {
            id: doc.id,
            patientName: data.patientName || "Unknown Patient",
            contactNumber: phone || "N/A",
            chiefComplaint: data.chiefComplaint || data.reason || "Appointment booking",
            email: email,
            age: data.age,
            gender: data.gender,
            createdAt: data.createdAt?.toDate() || new Date(),
          })
        }
      })

      const patientsData = Array.from(patientsMap.values())
      setPatients(patientsData)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }



  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPatients = filteredPatients.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-slate-600 dark:text-slate-400">Loading patients...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patients</h1>
          <p className="text-slate-600 dark:text-slate-400">View and manage patient information</p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone, or complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60"
          />
        </div>
      </motion.div>

      {/* Stats Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Patients</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredPatients.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Showing {currentPatients.length} of {filteredPatients.length}
                </p>
              </div>
              <Users className="h-12 w-12 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patients List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-teal-600" />
              Patient Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPatients.length > 0 ? (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          Patient Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          Registration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPatients.map((patient, index) => (
                        <motion.tr
                          key={patient.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{patient.patientName}</p>
                                {patient.email && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                              <Phone className="h-4 w-4 mr-2" />
                              {patient.contactNumber}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-start">
                              <FileText className="h-4 w-4 mr-2 mt-0.5 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400 line-clamp-2">
                                {patient.chiefComplaint}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {patient.createdAt.toLocaleDateString()}
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {currentPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600/60"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{patient.patientName}</h3>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.contactNumber}
                          </div>
                          <div className="flex items-start text-sm text-slate-600 dark:text-slate-400 mt-2">
                            <FileText className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{patient.chiefComplaint}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Registered: {patient.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No patients found</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm ? "Try adjusting your search terms" : "No patient records available"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

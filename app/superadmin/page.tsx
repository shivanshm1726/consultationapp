"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, Activity } from "lucide-react"

export default function SuperAdminPage() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const token = tokenMatch ? tokenMatch[1] : null;

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/clinics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setClinics(res.data)
      } catch (err) {
        console.error("Failed to fetch clinics", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchClinics()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-800/30">
          <CardHeader>
            <CardTitle className="text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
              <Building className="w-5 h-5" /> Active Clinics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-100">{loading ? '...' : clinics.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Clinics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <p className="text-slate-500">Loading clinics...</p>
          ) : clinics.length === 0 ? (
             <p className="text-slate-500">No clinics registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-slate-800">
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Clinic Name</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Address</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Contact Email</th>
                    <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic) => (
                    <tr key={clinic._id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium">{clinic.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{clinic.address}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{clinic.contactEmail}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

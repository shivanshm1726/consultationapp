"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthState } from "react-firebase-hooks/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Settings, User, DollarSign, Save, Stethoscope } from "lucide-react"

interface DoctorSettings {
  name: string
  email: string
  phone: string
  specialty: string
  qualifications: string
  experience: string
  consultationFee: number
  clinics: {
    name: string
    address: string
    hours: string
  }[]
  emergencyContact: string
  bio: string
  enableVideoCall: boolean
  enableAudioCall: boolean
  enableChatOnly: boolean
  autoReply: boolean
  notificationsEnabled: boolean
}

export default function SettingsPage() {
  const [user] = useAuthState(auth)
  const [settings, setSettings] = useState<DoctorSettings>({
    name: "Dr. Nitin Mishra",
    email: process.env.NEXT_PUBLIC_DOCTOR_EMAIL || "",
    phone: "9258924611",
    specialty: "Dermatology, Venereology & Leprosy",
    qualifications: "MBBS, MD (Skin & VD)",
    experience: "20+ years",
    consultationFee: Number.parseInt(process.env.NEXT_PUBLIC_DOCTOR_FEE || "500"),
    clinics: [
      {
        name: "Rampur Garden Clinic",
        address: "Rampur Garden, Bareilly",
        hours: "Mon–Sat: 10 AM–2 PM, Mon–Fri: 6 PM–8 PM",
      },
      {
        name: "DD Puram Clinic",
        address: "DD Puram, Bareilly",
        hours: "Mon–Sat: 2 PM–4 PM, Mon–Fri: 8:30 PM–9:30 PM",
      },
    ],
    emergencyContact: "9258924611",
    bio: "Experienced dermatologist specializing in skin, hair, and nail disorders with over 20 years of practice.",
    enableVideoCall: true,
    enableAudioCall: true,
    enableChatOnly: true,
    autoReply: false,
    notificationsEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const settingsDoc = await getDoc(doc(db, "doctorSettings", user?.uid || "default"))
      if (settingsDoc.exists()) {
        setSettings((prev) => ({ ...prev, ...settingsDoc.data() }))
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await setDoc(doc(db, "doctorSettings", user?.uid || "default"), settings)
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleClinicChange = (index: number, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      clinics: prev.clinics.map((clinic, i) => (i === index ? { ...clinic, [field]: value } : clinic)),
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
          <TabsTrigger value="consultation">Consultation</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Doctor Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleSettingChange("name", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange("email", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange("phone", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={settings.specialty}
                    onChange={(e) => handleSettingChange("specialty", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input
                    id="qualifications"
                    value={settings.qualifications}
                    onChange={(e) => handleSettingChange("qualifications", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={settings.experience}
                    onChange={(e) => handleSettingChange("experience", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => handleSettingChange("bio", e.target.value)}
                  className="bg-white/50 dark:bg-gray-700/50 min-h-[100px]"
                  placeholder="Brief description of your practice and expertise..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Settings */}
        <TabsContent value="clinics">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.clinics.map((clinic, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-semibold mb-4">Clinic {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`clinic-name-${index}`}>Clinic Name</Label>
                      <Input
                        id={`clinic-name-${index}`}
                        value={clinic.name}
                        onChange={(e) => handleClinicChange(index, "name", e.target.value)}
                        className="bg-white/50 dark:bg-gray-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`clinic-address-${index}`}>Address</Label>
                      <Input
                        id={`clinic-address-${index}`}
                        value={clinic.address}
                        onChange={(e) => handleClinicChange(index, "address", e.target.value)}
                        className="bg-white/50 dark:bg-gray-700/50"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`clinic-hours-${index}`}>Operating Hours</Label>
                    <Input
                      id={`clinic-hours-${index}`}
                      value={clinic.hours}
                      onChange={(e) => handleClinicChange(index, "hours", e.target.value)}
                      className="bg-white/50 dark:bg-gray-700/50"
                      placeholder="e.g., Mon–Sat: 10 AM–2 PM, Mon–Fri: 6 PM–8 PM"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultation Settings */}
        <TabsContent value="consultation">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Consultation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    value={settings.consultationFee}
                    onChange={(e) => handleSettingChange("consultationFee", Number.parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={settings.emergencyContact}
                    onChange={(e) => handleSettingChange("emergencyContact", e.target.value)}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Consultation Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Video Call Consultations</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow patients to book video consultations
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableVideoCall}
                      onCheckedChange={(checked) => handleSettingChange("enableVideoCall", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audio Call Consultations</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow patients to book audio-only consultations
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableAudioCall}
                      onCheckedChange={(checked) => handleSettingChange("enableAudioCall", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Chat-Only Consultations</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Allow text-based consultations</p>
                    </div>
                    <Switch
                      checked={settings.enableChatOnly}
                      onCheckedChange={(checked) => handleSettingChange("enableChatOnly", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Reply Messages</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically send welcome messages to new patients
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoReply}
                    onCheckedChange={(checked) => handleSettingChange("autoReply", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications for new appointments and messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Environment Variables</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Doctor Email:</span>
                    <span className="font-mono">{process.env.NEXT_PUBLIC_DOCTOR_EMAIL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Fee:</span>
                    <span className="font-mono">₹{process.env.NEXT_PUBLIC_DOCTOR_FEE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Firebase Project:</span>
                    <span className="font-mono">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>
    </div>
  )
}

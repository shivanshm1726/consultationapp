"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  CalendarIcon,
  ArrowLeft,
  Stethoscope,
  GraduationCap,
  Building,
  CheckCircle,
} from "lucide-react"
import { useTheme } from "next-themes"

export default function DoctorProfile() {
  const { theme, setTheme } = useTheme()

  const doctor = {
    name: "Dr. Nitin Mishra",
    specialization: "Dermatology, Venereology & Leprosy",
    qualifications: "MBBS, MD (Skin & VD)",
    experience: "20+ years",
    rating: 4.9,
    reviews: 500,
    image: "/placeholder.svg?height=256&width=256",
    about:
      "Dr. Nitin Mishra is a highly experienced dermatologist with over 20 years of specialized practice in Dermatology, Venereology & Leprosy. He holds an MBBS degree and MD in Skin & VD, making him one of the most qualified skin specialists in Bareilly. Dr. Mishra has successfully treated thousands of patients with various skin conditions and is known for his expertise in advanced laser treatments, surgical procedures, and comprehensive skin care.",
    education: [
      "MBBS - Bachelor of Medicine and Bachelor of Surgery",
      "MD (Skin & VD) - Doctor of Medicine in Dermatology, Venereology & Leprosy",
      "Advanced Training in Laser Dermatology",
      "Certification in Cosmetic Dermatology",
    ],
    specialties: [
      "Laser Hair Removal",
      "Chemical Peels",
      "Vitiligo Surgery",
      "Acne Treatment",
      "Tattoo & Pigment Removal",
      "Cryo-surgery",
      "Hair Transplantation",
      "Psoriasis Treatment",
      "Eczema Management",
      "Skin Cancer Screening",
    ],
    languages: ["English", "Hindi", "Urdu"],
    consultationFee: 500,
    clinics: [
      {
        name: "Rampur Garden Clinic",
        address: "Rampur Garden, Bareilly",
        timings: {
          morning: "Mon-Sat: 10:00 AM - 2:00 PM",
          evening: "Mon-Fri: 6:00 PM - 8:00 PM",
        },
      },
      {
        name: "DD Puram Clinic",
        address: "DD Puram, Bareilly",
        timings: {
          afternoon: "Mon-Sat: 2:00 PM - 4:00 PM",
          evening: "Mon-Fri: 8:30 PM - 9:30 PM",
        },
      },
    ],
    timeSlots: [],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Dr. Nitin Mishra</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                {theme === "light" ? "Dark" : "Light"} Mode
              </Button>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="relative">
                    <img
                      src={doctor.image || "/placeholder.svg?height=256&width=256"}
                      alt={doctor.name}
                      className="w-64 h-64 rounded-2xl object-cover mx-auto md:mx-0 shadow-lg"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Available Today
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{doctor.name}</h1>
                      <p className="text-2xl text-teal-500 font-semibold mb-2">{doctor.specialization}</p>
                      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{doctor.qualifications}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{doctor.experience} Experience</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">5000+ Patients Treated</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {doctor.languages.map((language, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                        >
                          {language}
                        </Badge>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-900 p-4 rounded-lg mb-6">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        ₹{doctor.consultationFee}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Consultation Fee</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/appointment" className="flex-1">
                        <Button
                          className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg"
                          size="lg"
                        >
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          Book Appointment
                        </Button>
                      </Link>
                      <Link href="/chat" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                          size="lg"
                        >
                          Start Live Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Users className="h-5 w-5" />
                  <span>About Dr. Nitin Mishra</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{doctor.about}</p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <GraduationCap className="h-5 w-5" />
                  <span>Education & Qualifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-lg">{edu}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Stethoscope className="h-5 w-5" />
                  <span>Specialties & Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {doctor.specialties.map((specialty, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{specialty}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clinic Locations */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Building className="h-5 w-5" />
                  <span>Clinic Locations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {doctor.clinics.map((clinic, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-900 dark:to-teal-900 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{clinic.name}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{clinic.address}</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(clinic.timings).map(([period, timing]) => (
                          <div key={period} className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{timing}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Phone className="h-5 w-5" />
                  <span>Quick Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Call Now</div>
                    <div className="text-green-600 dark:text-green-400 font-bold">9258924611</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                  <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Email</div>
                    <div className="text-indigo-600 dark:text-indigo-400">dermanitin@gmail.com</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Available Time Slots */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Clock className="h-5 w-5" />
                  <span>Today's Available Slots</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">10:00 AM - 2:00 PM</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rampur Garden Clinic</div>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">6:00 PM - 8:00 PM</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rampur Garden Clinic</div>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">2:00 PM - 4:00 PM</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">DD Puram Clinic</div>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">8:30 PM - 9:30 PM</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">DD Puram Clinic</div>
                    </div>
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Available
                    </Badge>
                  </div>
                </div>
                <Link href="/appointment">
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Book Appointment</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Booking Options */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Booking Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-teal-600" asChild>
                  <Link href="/appointment">Book via Website</Link>
                </Button>
                <Button variant="outline" className="w-full bg-white/50 dark:bg-gray-700/50" asChild>
                  <a href="https://www.practo.com" target="_blank" rel="noopener noreferrer">
                    Book via Practo
                  </a>
                </Button>
                <Button variant="outline" className="w-full bg-white/50 dark:bg-gray-700/50" asChild>
                  <a href="tel:9258924611">Call to Book</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

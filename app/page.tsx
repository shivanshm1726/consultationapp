"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  Calendar,
  Stethoscope,
  Shield,
  Heart,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { logoutUser } from "@/lib/auth"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [serviceScrollPosition, setServiceScrollPosition] = useState(0)
  const servicesRef = useRef<HTMLDivElement>(null)

  const { user, userData } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const scrollServices = (direction: "left" | "right") => {
    const maxScroll = Math.max(0, services.length - 3)
    if (direction === "left") {
      setServiceScrollPosition(Math.max(0, serviceScrollPosition - 1))
    } else {
      setServiceScrollPosition(Math.min(maxScroll, serviceScrollPosition + 1))
    }
  }

  const services = [
    {
      title: "Laser Hair Removal",
      description:
        "In Our Clinic, We use the latest laser machine which uses state-of the-art to remove unwanted hair and with greater speed and comfort than other methods. Dr. Nitin Mishra is the best Skin Specialist in Bareilly.",
      icon: "✨",
    },
    {
      title: "Chemical Peeling",
      description:
        "Chemical peels is best method for skin tightning and skin whitening. Chemical peels uses a chemical solution to improve and smooth the texture of the facial skin by removing its damaged outer layer.",
      icon: "🧴",
    },
    {
      title: "Vitiligo Surgery",
      description:
        "Vitiligo is a chronic skin disorder that causes areas of skin to lose colour. It presents as depigmented (white) patches. The goal of vitiligo surgery is to achieve Cultured and Non Cultured Melanocyte Transfer, Blister Grafting, Punch Grafting, Split Thikness etc.",
      icon: "🏥",
    },
    {
      title: "Electro Surgery",
      description:
        "Electro surgery refers to the cutting and coagulation of tissue using high-frequency electrical current. In addition, they should understand the mechanism of action and how to troubleshoot equipment. Visit us at our clinic Infront of Vikash Bhavan, Rampur Garden, Bareilly-243001 (U.P).",
      icon: "⚡",
    },
    {
      title: "Radio Frequency Surgery",
      description:
        "At Our Clinic, all these problems can be cured in one sitting with the help of latest and innovative RADIO FREQUENCY MACHINE. This machine removes the unwanted mole, skin tags, sun spots, warts without any scarring and with no or very minimal bleeding. Dr. Nitin Mishra is the best Skin Specialist.",
      icon: "📡",
    },
    {
      title: "Acne Surgery",
      description:
        "Acne or pimples is a common teenage problem. Medically acne problem is categorized into active acne (comedons, white heads, black heads), acne pigment (red, brown and black) and acne scars (atrophic, hypertrophic and ice-pick). Dr. Nitin Mishra is the best Skin Specialist in Bareilly.",
      icon: "🎯",
    },
  ]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-teal-50 via-white to-indigo-50"}`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          darkMode ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-white/20"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Dr. Nitin Mishra</h1>
                <p className="text-sm text-indigo-600">Skin Specialist</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                Home
              </Link>
              <Link
                href="/doctor-profile"
                className={`${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600"} transition-colors`}
              >
                About Doctor
              </Link>
              <Link
                href="/gallery"
                className={`${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-blue-600"} transition-colors`}
              >
                Gallery
              </Link>
              <Link
                href="/contact"
                className={`${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600"} transition-colors`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="ml-2 hidden md:inline">{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </Button>

              {user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {userData?.fullName || user.displayName}
                  </span>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Link href="/appointment">
                    <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="outline" className="bg-transparent">
                      Login
                    </Button>
                  </Link>
                  <Link href="/appointment">
                    <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              className={`md:hidden mt-4 p-4 rounded-lg backdrop-blur-md ${
                darkMode ? "bg-slate-800/90" : "bg-white/90"
              }`}
            >
              <nav className="flex flex-col space-y-3">
                <Link href="/" className="text-indigo-600 font-medium">
                  Home
                </Link>
                <Link href="/doctor-profile" className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  About Doctor
                </Link>
                <Link href="/treatments" className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Interactive Gallery
                </Link>
                <Link href="/contact" className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Contact
                </Link>
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                  {user ? (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Welcome, {userData?.fullName || user.displayName}
                      </span>
                      <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login">
                      <Button variant="outline" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                  )}
                  <Link href="/appointment">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-teal-600">Book Appointment</Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-teal-600/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative">
            <div className="space-y-8 relative z-20">
              <div className="space-y-4">
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">20+ Years Experience</Badge>
                <h1
                  className={`text-4xl md:text-6xl font-bold leading-tight ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Expert Skin Care with{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                    Dr. Nitin Mishra
                  </span>
                </h1>
                <p className={`text-xl leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  MBBS, MD (Skin & VD) -{" "}
                  <span className="font-bold">Specialist in Dermatology, Venereology & Leprosy</span>. Advanced
                  treatments for all skin conditions with 20 years of expertise.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/appointment">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg text-lg px-8 py-4 group"
                  >
                    Book Consultation
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`text-lg px-8 py-4 backdrop-blur-sm ${
                      darkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                        : "border-white/20 bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    Start Live Chat
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>20+</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Years Experience</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>5000+</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Happy Patients</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>2</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Clinic Locations</div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative z-10">
                <img
                  src="/placeholder.svg?height=500&width=400"
                  alt="Dr. Nitin Mishra"
                  className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className={`font-semibold ${darkMode ? "text-gray-900" : "text-gray-900"}`}>
                      Certified & Licensed
                    </div>
                    <div className="text-sm text-gray-600">MD (Skin & VD)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className={`py-16 ${darkMode ? "bg-slate-800/50" : "bg-white/50"} backdrop-blur-sm`}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Clock className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-indigo-600 group-hover:scale-105 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Flexible Timings
              </h3>
              <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Morning & evening slots available at both clinics
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Award className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-green-600 group-hover:scale-105 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Expert Care
              </h3>
              <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                MBBS, MD qualified with 20+ years experience
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Heart className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-teal-600 group-hover:scale-105 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Patient Care
              </h3>
              <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Personalized treatment plans for every patient
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Phone className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-orange-600 group-hover:scale-105 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Easy Booking
              </h3>
              <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Call 9258924611 or book online instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 mb-4">Why Choose Us</Badge>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Reasons to Trust Dr. Nitin Mishra
            </h2>
            <p className={`text-xl max-w-2xl mx-auto mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Experience, expertise, and personalized care for your skin health
            </p>
            <Button
              onClick={() => setShowServices(!showServices)}
              className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg"
            >
              {showServices ? "Hide Services" : "View Services"}
            </Button>

            {/* Interactive Service Cards */}
            {showServices && (
              <div className="mt-12 relative">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scrollServices("left")}
                    className="rounded-full p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scrollServices("right")}
                    className="rounded-full p-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="overflow-hidden">
                  <div
                    ref={servicesRef}
                    className="flex space-x-6 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${serviceScrollPosition * 320}px)` }}
                  >
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className={`min-w-[350px] group shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 rounded-xl p-6 ${
                          darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">{service.icon}</div>
                          <img
                            src={`/placeholder.svg?height=150&width=300`}
                            alt={service.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                          <h3 className={`text-xl font-semibold mb-3 ${darkMode ? "text-white" : "text-blue-900"}`}>
                            {service.title}
                          </h3>
                          <p className={`mb-4 text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {service.description}
                          </p>
                          <Link href="/appointment">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="text-center font-semibold text-lg mt-8">Consultation Fee: ₹500</p>
          </div>
        </div>
      </section>

      {/* Interactive Gallery Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Clinic Gallery
            </h2>
            <p className={`text-xl max-w-2xl mx-auto mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Take a look at our modern facilities and equipment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((index) => (
              <Card
                key={index}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
                  darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
                }`}
                onClick={() => setShowGallery(true)}
              >
                <div className="relative">
                  <img
                    src={`/placeholder.svg?height=200&width=300`}
                    alt={`Clinic Image ${index}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShowGallery(true)}
              className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg"
            >
              View Full Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Clinic Locations */}
      <section className={`py-20 ${darkMode ? "bg-slate-800/30" : "bg-teal-50/50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Our Clinic Locations
            </h2>
            <p className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Visit us at either of our convenient locations in Bareilly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card
              className={`p-8 ${darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"} border-0 shadow-xl`}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Rampur Garden Clinic
                  </h3>
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                    Main clinic location with full treatment facilities
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Mon-Sat: 10:00 AM - 2:00 PM
                    </div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Mon-Fri: 6:00 PM - 8:00 PM
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>9258924611</span>
                </div>
              </div>
            </Card>

            <Card
              className={`p-8 ${darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"} border-0 shadow-xl`}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    DD Puram Clinic
                  </h3>
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                    Secondary location for convenient access
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Mon-Sat: 2:00 PM - 4:00 PM
                    </div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Mon-Fri: 8:30 PM - 9:30 PM
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>9258924611</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Skin?</h2>
          <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
            Book your consultation with Dr. Nitin Mishra today and take the first step towards healthier, beautiful skin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/appointment">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-4 bg-transparent"
              >
                Start Live Chat
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span className="text-lg font-medium">9258924611</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>dermanitin@gmail.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${darkMode ? "bg-slate-900" : "bg-slate-900"} text-white py-12`}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Dr. Nitin Mishra</span>
              </div>
              <p className="text-gray-400 mb-4">
                Expert dermatologist with 20+ years of experience in advanced skin treatments and care.
              </p>
              <div className="flex space-x-4">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">9258924611</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/doctor-profile" className="hover:text-white transition-colors">
                    About Doctor
                  </Link>
                </li>
                <li>
                  <Link href="/treatments" className="hover:text-white transition-colors">
                    Interactive Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/appointment" className="hover:text-white transition-colors">
                    Book Appointment
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Laser Hair Removal</li>
                <li>Chemical Peels</li>
                <li>Vitiligo Surgery</li>
                <li>Acne Treatment</li>
                <li>Hair Transplantation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 mt-0.5" />
                  <div>
                    <div>Rampur Garden, Bareilly</div>
                    <div>DD Puram, Bareilly</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>dermanitin@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dr. Nitin Mishra - Skin Specialist. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50">
        <div className="flex space-x-3">
          <Link href="/chat" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Chat Now
            </Button>
          </Link>
          <Link href="/appointment" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-teal-600">Book Appointment</Button>
          </Link>
        </div>
      </div>
      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold">Clinic Gallery</h3>
              <Button variant="ghost" onClick={() => setShowGallery(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <img
                  key={index}
                  src={`/placeholder.svg?height=200&width=300`}
                  alt={`Clinic Image ${index}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

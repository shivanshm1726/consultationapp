"use client"

import type React from "react"
import { useDarkMode } from "@/contexts/dark-mode-context"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sun, Moon, ArrowLeft, Stethoscope, Phone, Mail, MapPin, Clock, MessageCircle, Calendar, Send } from "lucide-react"

export default function ContactPage() {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", formData)
    // Handle form submission logic here
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50"}`}>
      {/* Header */}
      <header className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
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
                <span className={`text-lg font-bold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Contact Us</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Get in Touch</h1>
            <p className={`text-xl max-w-2xl mx-auto ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
              Have questions about our services? Need to schedule an appointment? We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl ${darkMode ? "border-slate-700" : ""}`}>
              <CardHeader>
                <CardTitle className={`text-2xl ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className={darkMode ? "text-slate-300" : ""}>Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className={darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white/50"}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className={darkMode ? "text-slate-300" : ""}>Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className={darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white/50"}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className={darkMode ? "text-slate-300" : ""}>Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className={darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white/50"}
                      placeholder="9258924611"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className={darkMode ? "text-slate-300" : ""}>Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      className={`min-h-[120px] ${darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white/50"}`}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg"
                    size="lg"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>

                {/* Action Buttons */}
                <div className={`mt-8 pt-6 ${darkMode ? "border-slate-700" : "border-gray-200"} border-t`}>
                  <p className={`text-center mb-4 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Or take immediate action:</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/appointment" className="flex-1">
                      <Button variant="outline" className={`w-full ${darkMode ? "bg-slate-700 hover:bg-slate-600 border-slate-600" : "bg-white/50 hover:bg-white/80"}`} size="lg">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                    <Link href="/chat" className="flex-1">
                      <Button variant="outline" className={`w-full ${darkMode ? "bg-slate-700 hover:bg-slate-600 border-slate-600" : "bg-white/50 hover:bg-white/80"}`} size="lg">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Chat Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <Card className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl ${darkMode ? "border-slate-700" : ""}`}>
                <CardHeader>
                  <CardTitle className={`text-xl ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center space-x-4 p-4 rounded-lg ${darkMode ? "bg-green-900/20" : "bg-green-50"}`}>
                    <Phone className={`h-6 w-6 ${darkMode ? "text-green-400" : "text-green-600"}`} />
                    <div>
                      <div className={`font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Call Us</div>
                      <div className={`${darkMode ? "text-green-400" : "text-green-600"} font-bold text-lg`}>9258924611</div>
                      <div className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>Available during clinic hours</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-4 p-4 rounded-lg ${darkMode ? "bg-indigo-900/20" : "bg-indigo-50"}`}>
                    <Mail className={`h-6 w-6 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                    <div>
                      <div className={`font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Email Us</div>
                      <div className={`${darkMode ? "text-indigo-400" : "text-indigo-600"} font-bold`}>dermanitin@gmail.com</div>
                      <div className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>We'll respond within 24 hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinic Locations */}
              <Card className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl ${darkMode ? "border-slate-700" : ""}`}>
                <CardHeader>
                  <CardTitle className={`text-xl ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Clinic Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gradient-to-r from-indigo-900/20 to-teal-900/20" : "bg-gradient-to-r from-indigo-50 to-teal-50"}`}>
                    <div className="flex items-start space-x-3 mb-3">
                      <MapPin className={`h-5 w-5 mt-1 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                      <div>
                        <h3 className={`font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>Rampur Garden Clinic</h3>
                        <p className={darkMode ? "text-slate-400" : "text-gray-600"}>Rampur Garden, Bareilly</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className={`h-4 w-4 ${darkMode ? "text-slate-500" : "text-gray-500"}`} />
                        <span className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Mon-Sat: 10:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className={`h-4 w-4 ${darkMode ? "text-slate-500" : "text-gray-500"}`} />
                        <span className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Mon-Fri: 6:00 PM - 8:00 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gradient-to-r from-teal-900/20 to-indigo-900/20" : "bg-gradient-to-r from-teal-50 to-indigo-50"}`}>
                    <div className="flex items-start space-x-3 mb-3">
                      <MapPin className={`h-5 w-5 mt-1 ${darkMode ? "text-teal-400" : "text-teal-600"}`} />
                      <div>
                        <h3 className={`font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>DD Puram Clinic</h3>
                        <p className={darkMode ? "text-slate-400" : "text-gray-600"}>DD Puram, Bareilly</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className={`h-4 w-4 ${darkMode ? "text-slate-500" : "text-gray-500"}`} />
                        <span className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Mon-Sat: 2:00 PM - 4:00 PM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className={`h-4 w-4 ${darkMode ? "text-slate-500" : "text-gray-500"}`} />
                        <span className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Mon-Fri: 8:30 PM - 9:30 PM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Notice */}
              <Card className={`${darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} shadow-xl`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className={`font-semibold ${darkMode ? "text-red-300" : "text-red-800"} mb-2`}>Emergency?</h3>
                    <p className={`${darkMode ? "text-red-400" : "text-red-700"} text-sm mb-4`}>
                      For urgent medical concerns, please call us directly or visit the nearest emergency room.
                    </p>
                    <Button
                      variant="outline"
                      className={`${darkMode ? "border-red-700 text-red-300 hover:bg-red-900/30" : "border-red-300 text-red-700 hover:bg-red-100"} bg-transparent`}
                      asChild
                    >
                      <a href="tel:9258924611">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now: 9258924611
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
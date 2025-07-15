"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Stethoscope, Phone, Mail, MapPin, Clock, MessageCircle, Calendar, Send } from "lucide-react"

export default function ContactPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
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
                <span className="text-lg font-bold text-gray-900">Contact Us</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our services? Need to schedule an appointment? We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="bg-white/50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="bg-white/50"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="bg-white/50"
                      placeholder="9258924611"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      className="bg-white/50 min-h-[120px]"
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
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-600 mb-4">Or take immediate action:</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/appointment" className="flex-1">
                      <Button variant="outline" className="w-full bg-white/50 hover:bg-white/80" size="lg">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                    <Link href="/chat" className="flex-1">
                      <Button variant="outline" className="w-full bg-white/50 hover:bg-white/80" size="lg">
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
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Call Us</div>
                      <div className="text-green-600 font-bold text-lg">9258924611</div>
                      <div className="text-sm text-gray-600">Available during clinic hours</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-lg">
                    <Mail className="h-6 w-6 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Email Us</div>
                      <div className="text-indigo-600 font-bold">dermanitin@gmail.com</div>
                      <div className="text-sm text-gray-600">We'll respond within 24 hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinic Locations */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Clinic Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-teal-50 rounded-lg">
                    <div className="flex items-start space-x-3 mb-3">
                      <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Rampur Garden Clinic</h3>
                        <p className="text-gray-600">Rampur Garden, Bareilly</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mon-Sat: 10:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mon-Fri: 6:00 PM - 8:00 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-teal-50 to-indigo-50 rounded-lg">
                    <div className="flex items-start space-x-3 mb-3">
                      <MapPin className="h-5 w-5 text-teal-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">DD Puram Clinic</h3>
                        <p className="text-gray-600">DD Puram, Bareilly</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mon-Sat: 2:00 PM - 4:00 PM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mon-Fri: 8:30 PM - 9:30 PM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Notice */}
              <Card className="bg-red-50 border-red-200 shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-red-800 mb-2">Emergency?</h3>
                    <p className="text-red-700 text-sm mb-4">
                      For urgent medical concerns, please call us directly or visit the nearest emergency room.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
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

"use client"

import { useState } from "react"
import { useDarkMode } from "@/contexts/dark-mode-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Stethoscope,
  Award,
  Users,
  Clock,
  Shield,
  Star,
  CheckCircle,
  Sun,
  Moon,
  GraduationCap,
  Heart,
  Zap,
} from "lucide-react"

export default function WhyChooseUs() {
  const { darkMode, toggleDarkMode } = useDarkMode()

  const reasons = [
    {
      icon: Award,
      title: "20+ Years of Experience",
      description: "Two decades of specialized expertise in dermatology, venereology & leprosy treatment",
      details: [
        "Extensive experience in complex skin conditions",
        "Thousands of successful treatments",
        "Continuous professional development",
        "Stay updated with latest medical advances",
      ],
    },
    {
      icon: GraduationCap,
      title: "MBBS + MD Qualified",
      description: "Highly qualified with MBBS and MD (Skin & VD) from prestigious medical institutions",
      details: [
        "MBBS - Bachelor of Medicine and Surgery",
        "MD (Skin & VD) - Specialized in Dermatology",
        "Certified by Medical Council of India",
        "Regular participation in medical conferences",
      ],
    },
    {
      icon: Users,
      title: "Trusted by 5000+ Patients",
      description: "A large community of satisfied patients who trust our expertise and care",
      details: [
        "High patient satisfaction rate",
        "Long-term patient relationships",
        "Word-of-mouth referrals",
        "Diverse patient demographics",
      ],
    },
    {
      icon: Zap,
      title: "Modern Equipment & Technology",
      description: "State-of-the-art medical equipment and latest treatment technologies",
      details: [
        "Advanced laser systems",
        "Modern diagnostic equipment",
        "Sterile treatment environment",
        "Latest surgical instruments",
      ],
    },
    {
      icon: Heart,
      title: "Personalized Patient Care",
      description: "Individual attention and customized treatment plans for every patient",
      details: [
        "Detailed consultation process",
        "Customized treatment protocols",
        "Regular follow-up care",
        "Patient education and guidance",
      ],
    },
    {
      icon: Shield,
      title: "Safe & Effective Treatments",
      description: "Proven treatment methods with high success rates and minimal side effects",
      details: [
        "Evidence-based treatment approaches",
        "Strict safety protocols",
        "Minimal invasive procedures",
        "Comprehensive aftercare support",
      ],
    },
    {
      icon: Clock,
      title: "Flexible Timing & Locations",
      description: "Convenient clinic timings and multiple locations for easy accessibility",
      details: [
        "Morning and evening slots available",
        "Two convenient clinic locations",
        "Weekend appointments available",
        "Emergency consultation support",
      ],
    },
    {
      icon: Star,
      title: "Comprehensive Skin Solutions",
      description: "Complete range of dermatological services under one roof",
      details: [
        "Medical dermatology treatments",
        "Cosmetic procedures",
        "Surgical interventions",
        "Preventive skin care guidance",
      ],
    },
  ]

  const stats = [
    { number: "20+", label: "Years Experience" },
    { number: "5000+", label: "Happy Patients" },
    { number: "15+", label: "Treatment Types" },
    { number: "2", label: "Clinic Locations" },
  ]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50"
        }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${darkMode ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"
          }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Why Choose Us</h1>
                  <p className="text-sm text-indigo-600">Dr. Nitin Mishra</p>
                </div>
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
              <Link href="/appointment">
                <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Why Choose Dr. Nitin Mishra?
          </h1>
          <p className={`text-xl max-w-3xl mx-auto mb-8 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Experience excellence in dermatological care with a trusted specialist who combines expertise, compassion,
            and cutting-edge technology to deliver the best possible outcomes for your skin health.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`${darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
                  } border-0 shadow-lg`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {stat.number}
                  </div>
                  <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon
            return (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-300 border-0 ${darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
                  }`}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {reason.title}
                      </h3>
                      <p className={`mb-4 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{reason.description}</p>
                      <div className="space-y-2">
                        {reason.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-teal-600" />
                            <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                              {detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Doctor Profile Section */}
        <Card
          className={`mb-16 ${darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
            } border-0 shadow-xl`}
        >
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                  Meet Dr. Nitin Mishra
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Specialization
                    </h3>
                    <p className={`${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      Dermatology, Venereology & Leprosy
                    </p>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Qualifications
                    </h3>
                    <p className={`${darkMode ? "text-slate-300" : "text-slate-600"}`}>MBBS, MD (Skin & VD)</p>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Experience
                    </h3>
                    <p className={`${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      20+ years in dermatological practice
                    </p>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Contact
                    </h3>
                    <p className={`${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      📞 9258924611 | ✉️ dermanitin@gmail.com
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <img
                  src="/doctor.jpg" // Updated with actual image path
                  alt="Portrait of Dr. Nitin Mishra, Dermatologist"
                  className="w-64 h-64 rounded-2xl mx-auto shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=300" // Fallback image
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card
            className={`max-w-2xl mx-auto ${darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
              } border-0 shadow-xl`}
          >
            <CardContent className="p-8">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Ready to Experience Expert Care?
              </h2>
              <p className={`mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Take the first step towards healthier skin with a consultation from Dr. Nitin Mishra.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/appointment">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                  >
                    Book Appointment
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" size="lg" className="bg-transparent">
                    Start Live Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
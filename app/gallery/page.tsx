"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Stethoscope } from "lucide-react"

export default function GalleryPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [visibleImages, setVisibleImages] = useState<number[]>([])

  const galleryImages = [
    { id: 1, title: "Clinic Reception", category: "Interior" },
    { id: 2, title: "Treatment Room", category: "Interior" },
    { id: 3, title: "Laser Equipment", category: "Equipment" },
    { id: 4, title: "Consultation Room", category: "Interior" },
    { id: 5, title: "Waiting Area", category: "Interior" },
    { id: 6, title: "Advanced Machinery", category: "Equipment" },
    { id: 7, title: "Sterilization Unit", category: "Equipment" },
    { id: 8, title: "Patient Care Area", category: "Interior" },
    { id: 9, title: "Medical Instruments", category: "Equipment" },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = Number.parseInt(entry.target.getAttribute("data-id") || "0")
            setVisibleImages((prev) => [...prev, imageId])
          }
        })
      },
      { threshold: 0.1 },
    )

    const imageElements = document.querySelectorAll("[data-id]")
    imageElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          darkMode ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${darkMode ? "text-slate-100" : "text-blue-900"}`}>
                    Clinic Gallery
                  </h1>
                  <p className="text-sm text-blue-600">Dr. Nitin Mishra</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 transform ${
              darkMode ? "text-slate-100" : "text-blue-900"
            }`}
          >
            Our Modern Facilities
          </h1>
          <p
            className={`text-xl max-w-3xl mx-auto transition-all duration-1000 delay-300 transform ${
              darkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            Take a virtual tour of our state-of-the-art clinic and advanced medical equipment
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              data-id={image.id}
              className={`group cursor-pointer transition-all duration-700 transform ${
                visibleImages.includes(image.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`overflow-hidden rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
                  darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
                }`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={`/placeholder.svg?height=300&width=400`}
                    alt={image.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <h3 className="text-lg font-semibold">{image.title}</h3>
                    <p className="text-sm text-gray-200">{image.category}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-slate-100" : "text-blue-900"}`}>
                    {image.title}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {image.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-20 text-center">
          <div
            className={`max-w-2xl mx-auto p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${
              darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
            }`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-slate-100" : "text-blue-900"}`}>
              Visit Our Clinic
            </h2>
            <p className={`mb-6 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
              Experience our modern facilities and advanced treatments in person. Schedule your appointment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/appointment">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Book Appointment
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="bg-transparent">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

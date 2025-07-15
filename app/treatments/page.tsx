"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Stethoscope, Clock, Star, CheckCircle, Info, Sun, Moon } from "lucide-react"

export default function TreatmentsPage() {
  const [darkMode, setDarkMode] = useState(false)

  const treatments = [
    {
      id: "laser-hair",
      title: "Laser Hair Removal",
      description: "Advanced laser technology for permanent hair reduction with minimal discomfort",
      duration: "30-60 minutes",
      sessions: "6-8 sessions",
      benefits: [
        "Permanent hair reduction",
        "Suitable for all skin types",
        "Minimal pain and discomfort",
        "No ingrown hairs",
        "Smooth, silky skin",
      ],
      process: [
        "Consultation and skin assessment",
        "Preparation and cleaning of treatment area",
        "Laser application with cooling system",
        "Post-treatment care instructions",
      ],
      aftercare: [
        "Avoid sun exposure for 48 hours",
        "Apply prescribed moisturizer",
        "No waxing between sessions",
        "Use sunscreen regularly",
      ],
    },
    {
      id: "chemical-peels",
      title: "Chemical Peels",
      description: "Professional chemical peels for skin rejuvenation and texture improvement",
      duration: "45-60 minutes",
      sessions: "3-6 sessions",
      benefits: [
        "Improved skin texture",
        "Reduced fine lines",
        "Even skin tone",
        "Reduced acne scars",
        "Brighter complexion",
      ],
      process: [
        "Skin analysis and preparation",
        "Application of chemical solution",
        "Neutralization process",
        "Moisturizing and sun protection",
      ],
      aftercare: [
        "Gentle skincare routine",
        "Avoid picking or peeling",
        "Use prescribed moisturizers",
        "Strict sun protection",
      ],
    },
    {
      id: "acne-treatment",
      title: "Acne Treatment",
      description: "Comprehensive acne treatment and scar reduction therapy",
      duration: "30-45 minutes",
      sessions: "4-8 sessions",
      benefits: [
        "Clear, acne-free skin",
        "Reduced inflammation",
        "Minimized scarring",
        "Improved skin texture",
        "Boosted confidence",
      ],
      process: [
        "Detailed skin examination",
        "Customized treatment plan",
        "Topical/oral medications",
        "Regular follow-up sessions",
      ],
      aftercare: [
        "Follow prescribed skincare routine",
        "Avoid touching face",
        "Use non-comedogenic products",
        "Regular follow-up visits",
      ],
    },
    {
      id: "vitiligo-surgery",
      title: "Vitiligo Surgery",
      description: "Specialized surgical treatment for vitiligo with advanced techniques",
      duration: "60-120 minutes",
      sessions: "1-3 procedures",
      benefits: [
        "Restored skin pigmentation",
        "Improved appearance",
        "Long-lasting results",
        "Minimal scarring",
        "Enhanced quality of life",
      ],
      process: ["Comprehensive evaluation", "Pre-surgical preparation", "Surgical procedure", "Post-operative care"],
      aftercare: [
        "Wound care as directed",
        "Avoid sun exposure",
        "Regular follow-up visits",
        "Gradual return to activities",
      ],
    },
    {
      id: "cryo-surgery",
      title: "Cryo-surgery",
      description: "Precise freezing technique for removing skin lesions and warts",
      duration: "15-30 minutes",
      sessions: "1-3 sessions",
      benefits: [
        "Precise lesion removal",
        "Minimal scarring",
        "Quick procedure",
        "Effective results",
        "Minimal downtime",
      ],
      process: [
        "Lesion assessment",
        "Application of liquid nitrogen",
        "Controlled freezing",
        "Post-treatment monitoring",
      ],
      aftercare: [
        "Keep area clean and dry",
        "Apply prescribed ointment",
        "Avoid picking at treated area",
        "Follow-up as needed",
      ],
    },
    {
      id: "hair-transplant",
      title: "Hair Transplantation",
      description: "Advanced hair transplant procedures for natural-looking results",
      duration: "4-8 hours",
      sessions: "1-2 procedures",
      benefits: [
        "Natural hair growth",
        "Permanent solution",
        "Improved appearance",
        "Boosted confidence",
        "Minimal maintenance",
      ],
      process: [
        "Detailed consultation",
        "Donor area preparation",
        "Hair follicle extraction",
        "Transplantation procedure",
      ],
      aftercare: [
        "Gentle hair washing",
        "Avoid strenuous activities",
        "Follow medication schedule",
        "Regular follow-up visits",
      ],
    },
  ]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50"
      }`}
    >
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
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Our Treatments</h1>
                  <p className="text-sm text-indigo-600">Dr. Nitin Mishra</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Advanced Dermatological Treatments
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Comprehensive skin care solutions with 20+ years of expertise in dermatology, venereology & leprosy
          </p>
          <Badge className="mt-4 bg-indigo-100 text-indigo-800 border-indigo-200">
            All treatments performed by Dr. Nitin Mishra (MBBS, MD)
          </Badge>
        </div>

        {/* Treatments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {treatments.map((treatment) => (
            <Card
              key={treatment.id}
              className={`group hover:shadow-xl transition-all duration-300 border-0 ${
                darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-xl mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {treatment.title}
                    </CardTitle>
                    <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {treatment.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{treatment.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-teal-600" />
                    <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{treatment.sessions}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Info className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{treatment.title}</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        <p className="text-slate-600">{treatment.description}</p>

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-slate-900">Benefits</h3>
                          <div className="grid gap-2">
                            {treatment.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-slate-700">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-slate-900">Treatment Process</h3>
                          <div className="space-y-2">
                            {treatment.process.map((step, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <span className="text-slate-700">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-slate-900">Aftercare Instructions</h3>
                          <div className="grid gap-2">
                            {treatment.aftercare.map((instruction, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                                <span className="text-slate-700">{instruction}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-indigo-800">
                            <strong>Note:</strong> Individual results may vary. A consultation with Dr. Nitin Mishra is
                            recommended to determine the best treatment plan for your specific condition.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Link href="/appointment" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <p className="text-center font-semibold text-lg mb-4">Consultation Fee: ₹500</p>
          <Card
            className={`max-w-2xl mx-auto ${
              darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
            } border-0 shadow-xl`}
          >
            <CardContent className="p-8">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Need a Consultation?
              </h2>
              <p className={`mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Schedule a consultation with Dr. Nitin Mishra to discuss the best treatment options for your skin
                concerns.
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
              <div className="mt-4 text-sm text-indigo-600">
                <p>📞 9258924611 | ✉️ dermanitin@gmail.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

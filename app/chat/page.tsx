"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Send,
  Paperclip,
  ImageIcon,
  Video,
  Phone,
  User,
  Clock,
  Stethoscope,
  AlertCircle,
  MessageCircle,
} from "lucide-react"
import { useTheme } from "next-themes"

export default function LiveChat() {
  const [chatStarted, setChatStarted] = useState(false)
  const [message, setMessage] = useState("")
  const [preFormData, setPreFormData] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    contact: "",
    urgency: "",
  })
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      text: "Welcome to Dr. Nitin Mishra's Live Chat Consultation. Please fill out the pre-consultation form to get started.",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [queuePosition, setQueuePosition] = useState(3)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  // Add age validation state
  const [ageError, setAgeError] = useState("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update age validation in handleInputChange
  const handleInputChange = (field: string, value: string) => {
    if (field === "age") {
      const ageNum = Number.parseInt(value)
      if (value && (ageNum < 5 || ageNum > 100)) {
        setAgeError("Age must be between 5 and 100")
      } else {
        setAgeError("")
      }
    }
    setPreFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePreFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setChatStarted(true)
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "system",
        text: `Hello ${preFormData.name}! Thank you for providing your information. You are currently #${queuePosition} in the queue. Dr. Nitin Mishra will be with you shortly. Estimated wait time: 8-12 minutes.`,
        timestamp: new Date(),
      },
    ])

    // Simulate queue updates
    setTimeout(() => {
      setQueuePosition(2)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "system",
          text: "You are now #2 in the queue. Dr. Mishra will be with you in approximately 5-8 minutes.",
          timestamp: new Date(),
        },
      ])
    }, 30000)

    setTimeout(() => {
      setQueuePosition(1)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "system",
          text: "You're next! Dr. Mishra will join the chat in 2-3 minutes.",
          timestamp: new Date(),
        },
      ])
    }, 60000)

    setTimeout(() => {
      setQueuePosition(0)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "doctor",
          text: `Hello ${preFormData.name}! I'm Dr. Nitin Mishra. I've reviewed your symptoms regarding ${preFormData.symptoms}. How can I help you today?`,
          timestamp: new Date(),
        },
      ])
    }, 90000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setIsTyping(true)

    // Simulate doctor response
    setTimeout(() => {
      setIsTyping(false)
      const doctorResponse = {
        id: messages.length + 2,
        sender: "doctor",
        text: "Thank you for sharing that information. Based on what you've described, I'd like to ask a few more questions to better understand your condition. Can you tell me when these symptoms first appeared?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, doctorResponse])
    }, 2000)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  if (!chatStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Chat Consultation</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl dark:text-gray-100">Start Live Chat with Dr. Nitin Mishra</CardTitle>
                <p className="text-gray-600 mt-2 dark:text-gray-400">
                  Please provide some basic information before connecting with the doctor
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreFormSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="dark:text-gray-100">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={preFormData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-gray-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="dark:text-gray-100">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={preFormData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        required
                        className="bg-white/50 dark:bg-gray-700/50 dark:text-gray-100"
                        min="5"
                        max="100"
                        placeholder="Your age"
                      />
                      {ageError && <p className="text-red-600 text-sm mt-1">{ageError}</p>}
                    </div>
                    <div>
                      <Label htmlFor="gender" className="dark:text-gray-100">
                        Gender *
                      </Label>
                      <Select value={preFormData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="bg-white/50 dark:bg-gray-700/50">
                          <SelectValue placeholder="Select gender" className="dark:text-gray-100" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact" className="dark:text-gray-100">
                      Contact Number *
                    </Label>
                    <Input
                      id="contact"
                      type="tel"
                      value={preFormData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      required
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-gray-100"
                      placeholder="9258924611"
                    />
                  </div>

                  <div>
                    <Label htmlFor="symptoms" className="dark:text-gray-100">
                      Symptoms / Chief Complaint *
                    </Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Please describe your symptoms, skin condition, or reason for consultation in detail..."
                      value={preFormData.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      required
                      className="bg-white/50 min-h-[120px] dark:bg-gray-700/50 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="dark:text-gray-100">
                      Urgency Level *
                    </Label>
                    <Select value={preFormData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger className="bg-white/50 dark:bg-gray-700/50">
                        <SelectValue placeholder="Select urgency level" className="dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                        <SelectItem value="low">Low - General inquiry/routine consultation</SelectItem>
                        <SelectItem value="medium">Medium - Concerning symptoms</SelectItem>
                        <SelectItem value="high">High - Urgent consultation needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg dark:bg-gray-700">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 dark:text-blue-400" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Important Notes:</p>
                        <ul className="space-y-1">
                          <li>• Consultation fee: ₹500 (payable after consultation)</li>
                          <li>• Average wait time: 5-15 minutes</li>
                          <li>• You can upload images during the chat</li>
                          <li>• For emergencies, please call 9258924611 directly</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg dark:from-blue-400 dark:to-blue-400 dark:hover:from-blue-300 dark:hover:to-blue-300"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Start Chat Consultation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  End Chat
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Chat - Dr. Nitin Mishra</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {queuePosition === 0 ? "Connected" : `Queue #${queuePosition}`}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)]">
        <div className="grid lg:grid-cols-4 gap-4 h-full">
          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              {/* Chat Header */}
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-700 dark:to-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/placeholder.svg?height=48&width=48"
                      alt="Dr. Nitin Mishra"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dr. Nitin Mishra</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dermatologist • MBBS, MD (Skin & VD)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-700/50">
                      <Phone className="h-4 w-4 mr-2" />
                      Voice Call
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-700/50">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white dark:from-blue-400 dark:to-blue-400"
                          : msg.sender === "doctor"
                            ? "bg-white border shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {msg.sender === "doctor" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <img
                            src="/placeholder.svg?height=24&width=24"
                            alt="Dr. Nitin Mishra"
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Dr. Nitin Mishra</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border shadow-sm px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <img
                          src="/placeholder.svg?height=24&width=24"
                          alt="Dr. Nitin Mishra"
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4 bg-white/50 dark:bg-gray-700/50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileUpload}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileUpload}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileUpload}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"
                    disabled={queuePosition > 0}
                  />
                  <Button type="submit" size="sm" className="bg-blue-600" disabled={queuePosition > 0}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  multiple
                />
                {queuePosition > 0 && (
                  <p className="text-sm text-gray-600 mt-2 text-center dark:text-gray-400">
                    Please wait while you're in the queue. You can type once connected.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Patient Info */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2 dark:text-gray-100">
                  <User className="h-4 w-4" />
                  <span>Patient Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                  <div className="text-gray-900 dark:text-gray-100">{preFormData.name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Age:</span>
                  <div className="text-gray-900 dark:text-gray-100">{preFormData.age} years</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Gender:</span>
                  <div className="text-gray-900 capitalize dark:text-gray-100">{preFormData.gender}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                  <div className="text-gray-900 dark:text-gray-100">{preFormData.contact}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Urgency:</span>
                  <Badge
                    variant={
                      preFormData.urgency === "high"
                        ? "destructive"
                        : preFormData.urgency === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="ml-2"
                  >
                    {preFormData.urgency}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-gray-100">Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300">{preFormData.symptoms}</p>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2 dark:text-gray-100">
                  <Clock className="h-4 w-4" />
                  <span>Queue Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {queuePosition === 0 ? (
                    <>
                      <div className="text-2xl font-bold text-green-600 mb-2 dark:text-green-400">Connected</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You are now chatting with Dr. Nitin Mishra
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-400">#{queuePosition}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Position in queue</p>
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        Estimated wait: {queuePosition * 3}-{queuePosition * 5} minutes
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Consultation Fee */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-gray-100">Consultation Fee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2 dark:text-green-400">₹500</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payable after consultation</p>
                  <div className="mt-3 p-2 bg-green-50 rounded-lg dark:bg-green-900">
                    <p className="text-xs text-green-800 dark:text-green-200">Payment options: UPI, Card, Cash</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl dark:bg-gray-800/70 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-gray-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full bg-white/50 dark:bg-gray-800/50">
                  Request Prescription
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-white/50 dark:bg-gray-800/50">
                  Schedule Follow-up
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-white/50 dark:bg-gray-800/50">
                  End Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

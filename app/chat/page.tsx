"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { auth, db, storage } from "@/lib/firebase"
import { addDoc, collection, orderBy, query, serverTimestamp, onSnapshot, where, updateDoc, getDocs, getDoc, deleteDoc, doc, setDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

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
  User,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  UserCheck,
  PhoneCall,
  VideoIcon,
  Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Suspense } from "react"
import type { User as FirebaseUser } from "firebase/auth"

// Define MessageType interface for better type safety
type MessageType = {
  id: string
  text?: string
  senderEmail: string // Required
  timestamp: any // Firestore Timestamp or Date
  mediaUrl?: string
  mediaType?: "image" | "video" | "file"
  fileName?: string
  uid?: string // Optional: for sender's UID (from auth)
  photoURL?: string | null // Optional: for sender's photo (from auth) - Allow null
}

function LiveChatContent() {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [roomId, setRoomId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL!

  const patientQuickReplies = [
    "I have a skin issue.",
    "Since last week...",
    "Thank you, Doctor.",
    "Yes, I have an allergy.",
    "What should I apply?",
  ]

  const [preFormData, setPreFormData] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    contact: "",
    urgency: "",
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!preFormData.name.trim()) {
      errors.name = "Name is required"
    }
    if (!preFormData.age.trim()) {
      errors.age = "Age is required"
    } else {
      const age = Number.parseInt(preFormData.age, 10)
      if (isNaN(age) || age < 5 || age > 100) {
        errors.age = "Please enter a valid age between 5 and 100"
      }
    }
    if (!preFormData.gender) {
      errors.gender = "Gender is required"
    }
    if (!preFormData.contact.trim()) {
      errors.contact = "Contact number is required"
    } else if (!/^\d{10}$/.test(preFormData.contact.replace(/\D/g, ""))) {
      errors.contact = "Please enter a valid 10-digit contact number"
    }
    if (!preFormData.symptoms.trim()) {
      errors.symptoms = "Please describe your symptoms"
    }
    if (!preFormData.urgency) {
      errors.urgency = "Please select urgency level"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePreFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (user?.email && roomId) {
      try {
        console.log("=== USER AUTHENTICATION DEBUG ===")
        console.log("Current user:", user)
        console.log("User UID:", user.uid)
        console.log("User email:", user.email)
        console.log("User display name:", user.displayName)

        // Check if user document exists and what role they have
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            console.log("User document exists:", userDoc.data())
            console.log("User role:", userDoc.data().role)
          } else {
            console.log("❌ User document does NOT exist in Firestore!")
            console.log("This might be causing permission issues")
          }
        } catch (userError) {
          console.error("❌ Error fetching user document:", userError)
        }

        const activeChatsRef = collection(db, "activeChats")
        const q = query(activeChatsRef, where("patientEmail", "==", user.email), where("status", "==", "active"))
        
        console.log("=== TESTING FIRESTORE PERMISSIONS ===")
        try {
          console.log("Testing read permissions...")
          const testSnapshot = await getDocs(q)
          console.log("✅ Read permission successful, found docs:", testSnapshot.docs.length)
        } catch (readError) {
          console.error("❌ Read permission failed:", readError)
        }

        const snapshot = await getDocs(q)

        const chatData = {
          patientEmail: user.email,
          roomId,
          patientName: preFormData.name,
          age: preFormData.age,
          gender: preFormData.gender,
          contact: preFormData.contact,
          symptoms: preFormData.symptoms,
          urgency: preFormData.urgency,
          timestamp: serverTimestamp(),
          status: "active",
        }

        console.log("=== DEBUG: About to create/update activeChats ===")
        console.log("User email:", user.email)
        console.log("Room ID:", roomId)
        console.log("Chat data:", chatData)
        console.log("Existing documents found:", snapshot.docs.length)

        if (!snapshot.empty) {
          const existingDoc = snapshot.docs[0]
          console.log("🔄 Updating existing document:", existingDoc.id)
          await updateDoc(existingDoc.ref, chatData)
          console.log("✅ Document updated successfully")
        } else {
          console.log("📝 Creating new document")
          
          try {
            console.log("About to call addDoc with:", {
              collection: "activeChats",
              data: chatData
            })
            
            const docRef = await addDoc(activeChatsRef, chatData)
            console.log("✅ addDoc returned successfully with ID:", docRef.id)
            
            // Verify document creation
            setTimeout(async () => {
              try {
                const createdDoc = await getDoc(docRef)
                if (createdDoc.exists()) {
                  console.log("✅ Document verified in Firestore:", createdDoc.data())
                } else {
                  console.log("❌ Document not found after creation!")
                }
              } catch (verifyError) {
                console.error("❌ Error verifying document:", verifyError)
              }
            }, 1000)
            
          } catch (createError) {
            console.error("❌ Document creation failed:", createError)
            if (typeof createError === "object" && createError !== null && "code" in createError) {
              console.error("Error code:", (createError as any).code)
            }
            console.error("Error message:", (createError as Error)?.message)
            throw createError
          }
        }

        console.log("=== Document operation completed successfully ===")

      } catch (error: any) {
        console.error("=== ERROR in handlePreFormSubmit ===")
        console.error("Error type:", error.constructor.name)
        console.error("Error message:", error.message)
        console.error("Error code:", error.code)
        console.error("Full error:", error)
        
        toast({
          title: "Error",
          description: `Failed to start chat: ${error.message}`,
          variant: "destructive",
        })
        return
      }
    }

    setChatStarted(true)
    setMessages([
      {
        id: uuidv4(),
        senderEmail: "system",
        text: `Hello ${preFormData.name}! Please wait until Dr. Nitin Mishra joins the chat.`,
        timestamp: new Date(),
      },
    ])
  }

  const handleInputChange = (field: string, value: string) => {
    setPreFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const removeFromActiveChats = async (force: boolean = false) => {
    if (user?.email && (force || window.confirm("Are you sure you want to end this chat?"))) {
      try {
        const activeChatsRef = collection(db, "activeChats")
        const q = query(activeChatsRef, where("patientEmail", "==", user.email), where("status", "==", "active"))
        const snapshot = await getDocs(q)
        console.log("Removing active chats, found:", snapshot.docs.length, "documents")
        const deletePromises = snapshot.docs.map((doc) => {
          console.log("Deleting document:", doc.id, doc.data())
          return deleteDoc(doc.ref)
        })
        await Promise.all(deletePromises)
        console.log("Active chats removed successfully")
      } catch (error) {
        console.error("Error removing from active chats:", {
          errorCode: (error as any).code,
          errorMessage: (error as Error).message,
          stack: (error as Error).stack
        })
      }
    } else {
      console.log("Skipped removing active chats, force:", force, "user:", user?.email)
    }
  }

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (loggedInUser: FirebaseUser | null) => {
      if (loggedInUser) {
        console.log("=== AUTH STATE CHANGE ===")
        console.log("User logged in:", loggedInUser.email)
        
        setPreFormData((prev) => ({
          ...prev,
          name: loggedInUser.displayName || loggedInUser.email?.split("@")[0] || "",
        }))

        try {
          const userDocRef = doc(db, "users", loggedInUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (!userDoc.exists()) {
            console.log("Creating user document for:", loggedInUser.email)
            const userData = {
              uid: loggedInUser.uid,
              email: loggedInUser.email,
              role: "patient",
              displayName: loggedInUser.displayName || "",
              createdAt: serverTimestamp(),
            }
            await setDoc(userDocRef, userData)
            console.log("✅ User document created successfully")
            const verifyDoc = await getDoc(userDocRef)
            if (verifyDoc.exists()) {
              console.log("✅ User document verified:", verifyDoc.data())
            } else {
              console.log("❌ User document creation failed verification")
            }
          } else {
            console.log("✅ User document already exists:", userDoc.data())
          }
        } catch (userCreationError) {
          console.error("❌ Error creating/checking user document:", userCreationError)
        }

        const sortedEmails = [loggedInUser.email!, doctorEmail].sort()
        const currentRoomId = `${sortedEmails[0]}_${sortedEmails[1]}`
        setRoomId(currentRoomId)
        console.log("Room ID set to:", currentRoomId)

        const messagesRef = collection(db, "chats", currentRoomId, "messages")
        const q = query(messagesRef, orderBy("timestamp"))

        const unsubMessages = onSnapshot(
          q,
          (snapshot) => {
            console.log("Messages snapshot received, count:", snapshot.docs.length)
            const newMessages: MessageType[] = snapshot.docs.map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                senderEmail: data.senderEmail || data.email || "unknown",
                text: data.text,
                timestamp: data.timestamp?.toDate(),
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
                fileName: data.fileName,
                uid: data.uid,
                photoURL: data.photoURL,
              } as MessageType
            })
            setMessages(newMessages)
          },
          (error) => {
            console.error("Error listening to messages:", {
              errorCode: (error as any).code,
              errorMessage: (error as Error).message,
              stack: (error as Error).stack
            })
            toast({
              title: "Error",
              description: "Failed to load messages. Please try again.",
              variant: "destructive",
            })
          }
        )

        return () => {
          console.log("Cleaning up messages listener for room:", currentRoomId)
          unsubMessages()
        }
      } else {
        console.log("No user logged in, redirecting to home")
        await removeFromActiveChats(false)
        router.push("/")
      }
    })

    const handleBeforeUnload = async () => {
      console.log("Before unload triggered")
      await removeFromActiveChats(false)
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        console.log("Tab hidden, skipping active chats removal")
        // Disabled auto-deletion on visibility change
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      console.log("Cleaning up auth and event listeners")
      unsubscribeAuth()
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      // Removed removeFromActiveChats from cleanup to prevent unintended deletion
    }
  }, [user, router, doctorEmail])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !user?.email || !roomId || isSending) return

    setIsSending(true)
    try {
      let messageData: Partial<MessageType> = {
        senderEmail: user.email,
        timestamp: serverTimestamp(),
        uid: user.uid,
        photoURL: user.photoURL,
      }

      if (selectedFile) {
        const fileId = uuidv4()
        const storageRef = ref(storage, `chatMedia/${roomId}/${fileId}_${selectedFile.name}`)
        await uploadBytes(storageRef, selectedFile)
        const fileURL = await getDownloadURL(storageRef)

        const mediaType = selectedFile.type.startsWith("image/")
          ? "image"
          : selectedFile.type.startsWith("video/")
            ? "video"
            : "file"

        messageData = {
          ...messageData,
          mediaUrl: fileURL,
          mediaType: mediaType,
          fileName: selectedFile.name,
          text: newMessage.trim() || undefined,
        }
      } else {
        messageData.text = newMessage.trim()
      }

      await addDoc(collection(db, "chats", roomId, "messages"), messageData)
      setNewMessage("")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleEndConsultation = async () => {
    if (window.confirm("Are you sure you want to end this consultation? This will clear your chat history.")) {
      try {
        console.log("Ending consultation for user:", user?.email)
        await removeFromActiveChats(true) // Force deletion

        if (roomId) {
          const messagesRef = collection(db, "chats", roomId, "messages")
          const snapshot = await getDocs(messagesRef)
          console.log("Deleting messages, found:", snapshot.docs.length, "documents")
          const deletePromises = snapshot.docs.map((doc) => {
            console.log("Deleting message:", doc.id)
            return deleteDoc(doc.ref)
          })
          await Promise.all(deletePromises)
        }
        setChatStarted(false)
        setMessages([])
        setNewMessage("")
        setSelectedFile(null)
        setPreFormData({
          name: user?.displayName || user?.email?.split("@")[0] || "",
          age: "",
          gender: "",
          symptoms: "",
          contact: "",
          urgency: "",
        })
        console.log("Consultation ended, redirecting to home")
        router.push("/")
      } catch (err) {
        console.error("Error ending consultation:", {
          errorCode: (err as any).code,
          errorMessage: (err as Error).message,
          stack: (err as Error).stack
        })
        toast({
          title: "Error",
          description: "Failed to end consultation. Please try again or contact support.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCall = async (type: "audio" | "video") => {
    if (!roomId || !user?.email) return
    const NEXT_PUBLIC_TOKEN_BASE_URL = process.env.NEXT_PUBLIC_TOKEN_BASE_URL
    if (!NEXT_PUBLIC_TOKEN_BASE_URL) {
      console.error("NEXT_PUBLIC_TOKEN_BASE_URL is not set.")
      return
    }

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_TOKEN_BASE_URL}?channelName=${roomId}&uid=${user.email}&role=publisher`,
      )
      const { token } = await response.json()
      router.push(`/call?channel=${roomId}&uid=${user.email}&token=${token}&type=${type}`)
    } catch (err) {
      console.error("Failed to fetch Agora token", err)
      toast({
        title: "Error",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      })
    }
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
                      className={`bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.name ? "border-red-500" : ""}`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
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
                        className={`bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.age ? "border-red-500" : ""}`}
                        min="5"
                        max="100"
                        placeholder="Your age"
                      />
                      {formErrors.age && <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>}
                    </div>
                    <div>
                      <Label htmlFor="gender" className="dark:text-gray-100">
                        Gender *
                      </Label>
                      <Select value={preFormData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger
                          className={`bg-white/50 dark:bg-gray-700/50 ${formErrors.gender ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select gender" className="dark:text-gray-100" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
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
                      className={`bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.contact ? "border-red-500" : ""}`}
                      placeholder="9258924611"
                    />
                    {formErrors.contact && <p className="text-red-500 text-sm mt-1">{formErrors.contact}</p>}
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
                      className={`bg-white/50 min-h-[120px] dark:bg-gray-700/50 dark:text-gray-100 ${formErrors.symptoms ? "border-red-500" : ""}`}
                    />
                    {formErrors.symptoms && <p className="text-red-500 text-sm mt-1">{formErrors.symptoms}</p>}
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="dark:text-gray-100">
                      Urgency Level *
                    </Label>
                    <Select value={preFormData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger
                        className={`bg-white/50 dark:bg-gray-700/50 ${formErrors.urgency ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select urgency level" className="dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                        <SelectItem value="low">Low - General inquiry/routine consultation</SelectItem>
                        <SelectItem value="medium">Medium - Concerning symptoms</SelectItem>
                        <SelectItem value="high">High - Urgent consultation needed</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.urgency && <p className="text-red-500 text-sm mt-1">{formErrors.urgency}</p>}
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

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg" size="lg">
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Dr. Nitin Mishra - Dermatologist
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Chat Active
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] grid lg:grid-cols-4 gap-4">
        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            {/* Chat Header */}
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-700 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dr. Nitin Mishra</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MBBS, MD (Skin & VD)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall("audio")}
                    className="flex items-center space-x-1"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Audio Call</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall("video")}
                    className="flex items-center space-x-1"
                  >
                    <VideoIcon className="h-4 w-4" />
                    <span>Video Call</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-500 dark:text-gray-400">Connecting to Dr. Nitin Mishra...</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderEmail === user?.email ? "justify-end" : "justify-start"} mb-2`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                      msg.senderEmail === user?.email
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : msg.senderEmail === "system"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700"
                    }`}
                  >
                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                    {msg.mediaUrl && msg.mediaType === "image" && (
                      <img
                        src={msg.mediaUrl || "/placeholder.svg"}
                        alt={msg.fileName || "Uploaded image"}
                        className="mt-2 rounded-md max-w-full max-h-64 object-contain"
                      />
                    )}
                    {msg.mediaUrl && msg.mediaType === "video" && (
                      <video
                        controls
                        src={msg.mediaUrl}
                        className="mt-2 rounded-md max-w-full max-h-64 object-contain"
                      />
                    )}
                    {msg.mediaUrl && msg.mediaType === "file" && (
                      <a
                        href={msg.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 underline text-sm block text-white"
                      >
                        📎 {msg.fileName || "File"}
                      </a>
                    )}

                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp?.toLocaleTimeString?.() ?? new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4 bg-white/50 dark:bg-gray-700/50">
              {patientQuickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {patientQuickReplies.map((reply, idx) => (
                    <Button
                      key={idx}
                      variant="secondary"
                      size="sm"
                      className="bg-slate-100 dark:bg-gray-700 dark:text-white text-gray-800 px-3 py-1 text-xs"
                      onClick={() => setNewMessage(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={handleFileUploadClick}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "Type your message..."}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSending || (!newMessage.trim() && !selectedFile)}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple={false}
                onChange={handleFileChange}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-sm dark:text-gray-100 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium">{preFormData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age:</span>
                <span className="font-medium">{preFormData.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                <span className="font-medium capitalize">{preFormData.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                <span className="font-medium">{preFormData.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                <Badge
                  variant={
                    preFormData.urgency === "high"
                      ? "destructive"
                      : preFormData.urgency === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {preFormData.urgency}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-sm dark:text-gray-100 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Chief Complaint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{preFormData.symptoms}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-sm dark:text-gray-100">Consultation Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="destructive" className="w-full" onClick={handleEndConsultation}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                End Consultation
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This will clear the chat and reload the page
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LiveChat() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LiveChatContent />
    </Suspense>
  )
}
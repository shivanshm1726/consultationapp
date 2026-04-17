"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import ChatSidebar, { type ChatContact } from "@/components/chat/ChatSidebar"
import ChatThread from "@/components/chat/ChatThread"
import ChatInput from "@/components/chat/ChatInput"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { io, Socket } from "socket.io-client"
import type { ChatMessage } from "@/hooks/useChatSocket"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

function getToken(): string | null {
  const match = document.cookie.match(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/)
  return match ? match[1] : null
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

export default function DoctorMessagesPage() {
  const { user, userData } = useAuth()
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const activeRoomRef = useRef<string | null>(null)

  // Fetch all chat sessions (inbox)
  const fetchContacts = useCallback(async () => {
    setIsLoadingContacts(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE_URL}/api/chats/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch sessions")
      const data = await res.json()
      setContacts(data)
    } catch (err) {
      console.error("Failed to load contacts:", err)
    } finally {
      setIsLoadingContacts(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchContacts()
  }, [user, fetchContacts])

  // Setup socket once
  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] })
    socketRef.current = socket

    socket.on("connect", () => setIsConnected(true))
    socket.on("disconnect", () => setIsConnected(false))

    socket.on("new_message", (msg: ChatMessage) => {
      // Only add if it belongs to the active room
      if (msg.roomId === activeRoomRef.current) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    })

    return () => { socket.disconnect() }
  }, [])

  // Load messages for a specific room via REST
  const loadMessages = async (roomId: string) => {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE_URL}/api/chats/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to load messages")
      const data: ChatMessage[] = await res.json()
      setMessages(data)
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  }

  // When a contact is selected
  const handleSelectContact = useCallback(async (contact: ChatContact) => {
    // Leave old room, join new room
    const socket = socketRef.current
    if (socket && activeRoomRef.current) {
      socket.emit("leave_chat", { roomId: activeRoomRef.current })
    }

    setSelectedContact(contact)
    setShowSidebar(false)
    setMessages([])
    activeRoomRef.current = contact._id

    // Join new room via socket
    if (socket && socket.connected) {
      socket.emit("join_chat", { roomId: contact._id })
    }

    // Fetch messages via REST
    await loadMessages(contact._id)
  }, [])

  // Send a message
  const handleSend = useCallback(async (text: string) => {
    if (!selectedContact) return
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: selectedContact._id,
          text,
          receiverId: selectedContact.contactId,
        }),
      })
      if (!res.ok) throw new Error("Failed to send message")
      // Socket will broadcast back via new_message event
    } catch (err) {
      console.error("Failed to send:", err)
    }
  }, [selectedContact])

  const currentUserId = userData?._id || userData?.uid || user?.uid || ""

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Sidebar */}
      <div className={`w-full md:w-[340px] md:min-w-[340px] shrink-0 ${showSidebar ? "block" : "hidden md:block"}`}>
        <ChatSidebar
          contacts={contacts}
          activeRoomId={selectedContact?._id || null}
          onSelectContact={handleSelectContact}
          isLoading={isLoadingContacts}
        />
      </div>

      {/* Main chat area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!showSidebar ? "block" : "hidden md:flex"}`}>
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="h-[65px] px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setShowSidebar(true)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold">
                    {getInitials(selectedContact.contactName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedContact.contactName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{selectedContact.contactEmail}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <span>{messages.length} messages</span>
              </div>
            </div>

            <ChatThread messages={messages} currentUserId={currentUserId} contactName={selectedContact.contactName} />
            <ChatInput onSend={handleSend} placeholder={`Message ${selectedContact.contactName}...`} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
            <div className="text-center px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Patient Messages</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Select a conversation from the sidebar to view messages and reply to your patients.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

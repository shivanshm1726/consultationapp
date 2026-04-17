"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export type ChatMessage = {
  _id: string
  roomId: string
  text: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId: string
  receiverName: string
  timestamp: string
  mediaUrl?: string
  mediaType?: string
  fileName?: string
}

export function useChatSocket(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Connect to socket & join room
  useEffect(() => {
    if (!roomId) return

    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] })
    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
      socket.emit("join_chat", { roomId })
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("new_message", (msg: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId])

  // Load existing messages for a room
  const loadMessages = useCallback(async (targetRoomId: string, token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${targetRoomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to load messages")
      const data: ChatMessage[] = await res.json()
      setMessages(data)
    } catch (err) {
      console.error("useChatSocket: failed to load messages", err)
    }
  }, [])

  // Send a message
  const sendMessage = useCallback(async (
    targetRoomId: string,
    text: string,
    receiverId: string | null,
    token: string
  ) => {
    const res = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId: targetRoomId, text, receiverId }),
    })
    if (!res.ok) throw new Error("Failed to send message")
    return res.json()
  }, [])

  // Clear messages (when switching conversations)
  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, isConnected, loadMessages, sendMessage, clearMessages }
}

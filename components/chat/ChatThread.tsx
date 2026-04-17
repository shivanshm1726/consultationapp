"use client"
import { useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ChatMessage } from "@/hooks/useChatSocket"

interface ChatThreadProps {
  messages: ChatMessage[]
  currentUserId: string
  contactName: string
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

export default function ChatThread({ messages, currentUserId, contactName }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold">
                {getInitials(contactName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start your conversation with {contactName}</p>
          <p className="text-xs text-slate-400 mt-1">Send a message to begin the consultation</p>
        </div>
      </div>
    )
  }

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = []
  messages.forEach(msg => {
    const dateStr = new Date(msg.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    const last = grouped[grouped.length - 1]
    if (last && last.date === dateStr) {
      last.msgs.push(msg)
    } else {
      grouped.push({ date: dateStr, msgs: [msg] })
    }
  })

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 bg-slate-50/50 dark:bg-slate-950/30">
      {grouped.map(group => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 bg-slate-50 dark:bg-slate-950 rounded-full py-1">
              {group.date}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.msgs.map(msg => {
              const isMe = msg.senderId === currentUserId
              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                  {!isMe && (
                    <Avatar className="h-7 w-7 mr-2 mt-1 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-[10px] font-bold">
                        {getInitials(msg.senderName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] ${isMe ? "order-1" : ""}`}>
                    {!isMe && (
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 ml-1">
                        {msg.senderName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-emerald-600 text-white rounded-br-md"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md"
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-emerald-200" : "text-slate-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

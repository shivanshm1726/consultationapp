"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageSquare } from "lucide-react"

export type ChatContact = {
  _id: string
  contactName: string
  contactEmail: string
  contactRole: string
  contactId: string
  lastMessage: string
  lastTimestamp: string
  messageCount: number
}

interface ChatSidebarProps {
  contacts: ChatContact[]
  activeRoomId: string | null
  onSelectContact: (contact: ChatContact) => void
  isLoading: boolean
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-600",
]

function getColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function ChatSidebar({ contacts, activeRoomId, onSelectContact, isLoading }: ChatSidebarProps) {
  const [search, setSearch] = useState("")

  const filtered = contacts.filter(c =>
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          Messages
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl h-9 text-sm"
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No conversations yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Patient messages will appear here</p>
          </div>
        ) : (
          filtered.map(contact => {
            const isActive = activeRoomId === contact._id
            return (
              <button
                key={contact._id}
                onClick={() => onSelectContact(contact)}
                className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-800/50 ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-l-emerald-500"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-l-transparent"
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className={`bg-gradient-to-br ${getColor(contact.contactId)} text-white text-xs font-bold`}>
                    {getInitials(contact.contactName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}>
                      {contact.contactName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      {timeAgo(contact.lastTimestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-relaxed">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.messageCount > 0 && !isActive && (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {contact.messageCount > 99 ? "99" : contact.messageCount}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

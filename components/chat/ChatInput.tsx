"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [disabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isSending || disabled) return

    setIsSending(true)
    try {
      await onSend(trimmed)
      setText("")
    } catch (err) {
      console.error("ChatInput: send failed", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type a message..."}
            disabled={disabled || isSending}
            rows={1}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all disabled:opacity-50"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || isSending || disabled}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white w-11 h-11 shrink-0 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:shadow-none"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
}

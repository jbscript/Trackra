"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Sparkles } from "lucide-react"

export default function AIChatPage() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Obsidian AI assistant. I can help you analyze your spending, categorize transactions, or give you financial insights. What would you like to know?",
    },
  ])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput("")

    // Simulating AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          role: "assistant",
          content:
            "I'm a demo UI right now! My backend intelligence is still being connected. But I can already tell you're doing a great job tracking your finances.",
        },
      ])
    }, 1000)
  }

  return (
    <main className="container mx-auto flex h-full max-w-md flex-col pt-0 md:max-w-2xl">
      <div className="flex h-full w-full flex-col bg-background text-foreground">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold tracking-wide">Obsidian AI</h1>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[0.95rem] leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(45,224,95,0.2)]"
                    : "rounded-tl-sm border border-white/5 bg-surface-container text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="mb-4 shrink-0 border-t border-white/5 bg-background p-4 sm:mb-0">
          <form
            onSubmit={handleSend}
            className="relative flex w-full items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your finances..."
              className="h-14 w-full rounded-full bg-surface-container pr-14 pl-6 text-[0.95rem] text-foreground transition-all outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="ml-0.5 h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

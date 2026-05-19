"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, Sparkles, Activity, PlusCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

const SUGGESTED_ACTIONS = [
  { label: "Analyze my life plan", icon: <Activity className="h-4 w-4" />, prompt: "Can you do a deep fast analysis of my entire life plan, goals, and habits? Tell me if I am healthy and what I should change." },
  { label: "Create a new Goal", icon: <PlusCircle className="h-4 w-4" />, prompt: "I want to create a new Life Domain and set some goals for it. Can you guide me?" },
  { label: "Check Overdue Tasks", icon: <CheckCircle2 className="h-4 w-4" />, prompt: "Check my tasks. Are there any overdue ones? Reschedule them for tomorrow." },
  { label: "Give me Godly Advice", icon: <Sparkles className="h-4 w-4" />, prompt: "Give me some Godly advice today to help me grow in reality and achieve excellence." }
]

export function AIController() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendToAI = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage = { id: Date.now().toString(), role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const now = new Date()
    const timeContext = `[System Context - User Local Time: ${now.toLocaleTimeString()}, Date: ${now.toLocaleDateString()}, Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}]`

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          timeContext
        })
      })

      const data = await response.json()

      if (data.message) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: data.message }])
      }
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendToAI(input)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 z-40 ${isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100'}`}
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex sm:items-end sm:justify-end sm:p-6 sm:bottom-16 sm:right-0 bg-background/95 sm:bg-transparent animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-card w-full h-full sm:w-[400px] sm:h-[700px] sm:max-h-[80vh] sm:rounded-2xl shadow-2xl sm:border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300 pointer-events-auto relative z-50">
            {/* Header */}
            <div className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Executive Coach AI</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Online</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative bg-background/50">
              <ScrollArea className="h-full px-4 py-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 pt-2 pb-4">
                    <div className="text-center space-y-2">
                      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-1">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground leading-none">Your Executive Coach</h3>
                      <p className="text-muted-foreground text-xs max-w-[280px] mx-auto">
                        I am here to ensure you grow in reality. I will analyze your plans, demand excellence, and guide you with Godly wisdom.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-2">
                      {SUGGESTED_ACTIONS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => sendToAI(action.prompt)}
                          className="flex items-center gap-3 p-3 text-left rounded-xl border border-border/50 bg-card hover:bg-accent transition-all text-xs font-medium shadow-sm"
                        >
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                            {action.icon}
                          </div>
                          <span className="text-foreground leading-tight">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-card border border-border/60 text-foreground rounded-bl-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-li:my-0.5"
                            }`}
                        >
                          {message.role === "user" ? (
                            message.content
                          ) : (
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => (
                                  <a {...props} className="text-primary underline hover:text-primary/80 font-medium" target="_blank" rel="noopener noreferrer" />
                                )
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start">
                        <div className="rounded-2xl px-4 py-3 bg-card border border-border/60 rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                          <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce" />
                          <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-card">
              <form onSubmit={handleSubmit} className="flex w-full items-end gap-2 relative">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full pl-4 pr-10 py-5 rounded-xl border-border/60 bg-muted/30 focus-visible:ring-primary text-sm transition-all"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 rounded-xl shadow-sm flex-shrink-0 active:scale-95 transition-transform"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

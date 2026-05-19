"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Zap,
  Lightbulb,
  CheckSquare,
  Bell,
  FileText,
  Target,
  Send,
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react"
import type { QuickCapture, CaptureType } from "@/lib/types"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const captureTypes: { value: CaptureType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "idea", label: "Idea", icon: Lightbulb },
  { value: "task", label: "Task", icon: CheckSquare },
  { value: "reminder", label: "Reminder", icon: Bell },
  { value: "note", label: "Note", icon: FileText },
  { value: "goal", label: "Goal", icon: Target },
]

function getTypeColor(type: CaptureType) {
  switch (type) {
    case "idea":
      return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30"
    case "task":
      return "bg-primary/10 text-primary border-primary/30"
    case "reminder":
      return "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/30"
    case "note":
      return "bg-muted text-muted-foreground border-muted"
    case "goal":
      return "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
  }
}

function getTypeIcon(type: CaptureType) {
  switch (type) {
    case "idea":
      return Lightbulb
    case "task":
      return CheckSquare
    case "reminder":
      return Bell
    case "note":
      return FileText
    case "goal":
      return Target
  }
}

function CaptureItem({ capture, onDelete }: { capture: QuickCapture; onDelete: () => void }) {
  const Icon = getTypeIcon(capture.type)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
    >
      <div className={`p-2 rounded-lg ${getTypeColor(capture.type).split(" ")[0]}`}>
        <Icon className={`h-4 w-4 ${getTypeColor(capture.type).split(" ")[1]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{capture.content}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={`text-xs ${getTypeColor(capture.type)}`}>
            {capture.type}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(capture.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

export default function CapturePage() {
  const [captures, setCaptures] = useState<QuickCapture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCapture, setNewCapture] = useState("")
  const [selectedType, setSelectedType] = useState<CaptureType>("idea")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/quick-captures')
      .then(res => res.json())
      .then(data => {
        setCaptures(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })

    // Auto-focus textarea on mount
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCapture.trim()) return

    const captureData = {
      type: selectedType,
      content: newCapture.trim(),
    }

    try {
      const res = await fetch('/api/quick-captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captureData)
      })
      if (res.ok) {
        const newDoc = await res.json()
        setCaptures([newDoc, ...captures])
        setNewCapture("")
        textareaRef.current?.focus()
      }
    } catch (e) {
      console.error("Failed to capture", e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/quick-captures/${id}`, { method: 'DELETE' })
      setCaptures(captures.filter((c) => c.id !== id))
    } catch (e) {
      console.error("Failed to delete", e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  const unprocessedCaptures = captures.filter((c) => !c.processed)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quick Capture</h1>
          </div>
          <p className="text-muted-foreground">
            Capture ideas, tasks, and thoughts instantly
          </p>
        </motion.div>

        {/* Capture Input */}
        <motion.div variants={item}>
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    ref={textareaRef}
                    value={newCapture}
                    onChange={(e) => setNewCapture(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What's on your mind? Capture it here..."
                    className="min-h-[100px] resize-none text-base"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {captureTypes.map((type) => (
                        <Button
                          key={type.value}
                          type="button"
                          variant={selectedType === type.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedType(type.value)}
                          className={
                            selectedType === type.value
                              ? ""
                              : getTypeColor(type.value)
                          }
                        >
                          <type.icon className="h-4 w-4 mr-1" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                    <Button type="submit" disabled={!newCapture.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pro tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Enter</kbd> to quickly capture
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {captureTypes.map((type) => {
            const count = captures.filter((c) => c.type === type.value && !c.processed).length
            return (
              <Card key={type.value}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(type.value).split(" ")[0]}`}>
                      <type.icon className={`h-4 w-4 ${getTypeColor(type.value).split(" ")[1]}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{count}</p>
                      <p className="text-xs text-muted-foreground">{type.label}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        {/* Captures List */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Inbox
                  <Badge variant="secondary" className="ml-2">
                    {unprocessedCaptures.length}
                  </Badge>
                </CardTitle>
                {unprocessedCaptures.length > 0 && (
                  <Button variant="outline" size="sm">
                    Process All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : unprocessedCaptures.length > 0 ? (
                    <div className="space-y-2">
                      {unprocessedCaptures.map((capture) => (
                        <CaptureItem
                          key={capture.id}
                          capture={capture}
                          onDelete={() => handleDelete(capture.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground">Inbox is empty</h3>
                      <p className="text-muted-foreground mt-1">
                        All captures have been processed
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

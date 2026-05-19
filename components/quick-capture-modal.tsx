"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Lightbulb,
  CheckSquare,
  FileText,
  Link,
  Mic,
  Tag,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickCaptureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CaptureType = "thought" | "task" | "note" | "link"

const captureTypes: { type: CaptureType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "thought", label: "Thought", icon: Lightbulb, color: "text-amber-500" },
  { type: "task", label: "Task", icon: CheckSquare, color: "text-emerald-500" },
  { type: "note", label: "Note", icon: FileText, color: "text-blue-500" },
  { type: "link", label: "Link", icon: Link, color: "text-purple-500" },
]

export function QuickCaptureModal({ open, onOpenChange }: QuickCaptureModalProps) {
  const [selectedType, setSelectedType] = React.useState<CaptureType>("thought")
  const [content, setContent] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    } else {
      setContent("")
      setTags([])
      setTagInput("")
      setSelectedType("thought")
    }
  }, [open])

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = () => {
    if (!content.trim()) return
    // In a real app, this would save to the database
    console.log("Saving capture:", { type: selectedType, content, tags })
    onOpenChange(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Quick Capture</h2>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Type Selector */}
              <div className="flex gap-2 border-b border-border px-4 py-3">
                {captureTypes.map(({ type, label, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${selectedType === type ? "" : color}`} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    selectedType === "thought"
                      ? "What&apos;s on your mind?"
                      : selectedType === "task"
                      ? "What needs to be done?"
                      : selectedType === "note"
                      ? "Write your note..."
                      : "Paste a link..."
                  }
                  className="min-h-[120px] w-full resize-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />

                {/* Tags */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tags (press Enter)"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Mic className="mr-1 h-4 w-4" />
                    Voice
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!content.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

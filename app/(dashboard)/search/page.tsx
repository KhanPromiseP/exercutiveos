"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  FolderKanban,
  CheckSquare,
  Target,
  Lightbulb,
  Compass,
  FileText,
  ArrowRight,
  X,
  Command,
} from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

interface SearchResult {
  id: string
  type: "project" | "task" | "habit" | "decision" | "domain"
  title: string
  description?: string
  status?: string
  href: string
}

function getTypeIcon(type: SearchResult["type"]) {
  switch (type) {
    case "project":
      return FolderKanban
    case "task":
      return CheckSquare
    case "habit":
      return Target
    case "decision":
      return Lightbulb
    case "domain":
      return Compass
  }
}

function getTypeColor(type: SearchResult["type"]) {
  switch (type) {
    case "project":
      return "bg-primary/10 text-primary"
    case "task":
      return "bg-[var(--warning)]/10 text-[var(--warning)]"
    case "habit":
      return "bg-[var(--success)]/10 text-[var(--success)]"
    case "decision":
      return "bg-[var(--warning)]/10 text-[var(--warning)]"
    case "domain":
      return "bg-primary/10 text-primary"
  }
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/habits').then(res => res.json()),
      fetch('/api/decisions').then(res => res.json()),
      fetch('/api/life-domains').then(res => res.json())
    ])
    .then(([projects, tasks, habits, decisions, domains]) => {
      const idx: SearchResult[] = [
        ...(Array.isArray(projects) ? projects : []).map((p: any) => ({
          id: p.id,
          type: "project" as const,
          title: p.title,
          description: p.vision || p.description,
          status: p.status,
          href: "/projects",
        })),
        ...(Array.isArray(tasks) ? tasks : []).map((t: any) => ({
          id: t.id,
          type: "task" as const,
          title: t.title,
          description: t.description,
          status: t.status,
          href: "/tasks",
        })),
        ...(Array.isArray(habits) ? habits : []).map((h: any) => ({
          id: h.id,
          type: "habit" as const,
          title: h.name,
          description: h.description,
          href: "/habits",
        })),
        ...(Array.isArray(decisions) ? decisions : []).map((d: any) => ({
          id: d.id,
          type: "decision" as const,
          title: d.title,
          description: d.description,
          status: d.status,
          href: "/decisions",
        })),
        ...(Array.isArray(domains) ? domains : []).map((d: any) => ({
          id: d.id,
          type: "domain" as const,
          title: d.name,
          description: d.description,
          href: "/domains",
        })),
      ]
      setSearchIndex(idx)
    })
    .catch(err => console.error(err))
  }, [])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTerms = query.toLowerCase().split(" ")
    const filtered = searchIndex.filter((item) => {
      const searchText = `${item.title} ${item.description || ""} ${item.status || ""}`.toLowerCase()
      return searchTerms.every((term) => searchText.includes(term))
    })

    setResults(filtered.slice(0, 10))
    setSelectedIndex(0)
  }, [query, searchIndex])

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href)
        }
        break
      case "Escape":
        e.preventDefault()
        setQuery("")
        break
    }
  }

  const quickActions = [
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Habits", href: "/habits", icon: Target },
    { label: "Decisions", href: "/decisions", icon: Lightbulb },
    { label: "Domains", href: "/domains", icon: Compass },
    { label: "Quick Capture", href: "/capture", icon: FileText },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Search Everything
          </h1>
          <p className="text-muted-foreground">
            Find projects, tasks, habits, decisions, and more
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search projects, tasks, habits..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 pr-12 h-14 text-lg"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 rounded bg-muted">
                  <Command className="inline h-3 w-3" />K
                </kbd>
                <span>to search anywhere</span>
                <span className="mx-2">|</span>
                <kbd className="px-2 py-1 rounded bg-muted">↑↓</kbd>
                <span>to navigate</span>
                <span className="mx-2">|</span>
                <kbd className="px-2 py-1 rounded bg-muted">↵</kbd>
                <span>to select</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <CardContent className="p-2">
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-1">
                      {results.map((result, index) => {
                        const Icon = getTypeIcon(result.type)
                        return (
                          <button
                            key={result.id}
                            onClick={() => router.push(result.href)}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                              index === selectedIndex
                                ? "bg-accent"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg ${getTypeColor(result.type)}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="capitalize text-xs">
                                {result.type}
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          ) : query ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No results found</h3>
              <p className="text-muted-foreground mt-1">
                Try different keywords or check spelling
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="quick-actions"
              variants={item}
            >
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 transition-colors text-left"
                  >
                    <action.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Searches */}
        {!query && (
          <motion.div variants={item}>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Recent
            </p>
            <div className="space-y-2">
              {["Educational Platform", "AWS Certification", "Morning Prayer"].map(
                (recent, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(recent)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{recent}</span>
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

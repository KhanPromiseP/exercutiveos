"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Target,
  Lightbulb,
  Calendar,
  Settings,
  Inbox,
  X,
  ArrowRight,
  Command,
} from "lucide-react"
import type { Project, Task } from "@/lib/types"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Life Domains", href: "/domains", icon: Lightbulb },
  { name: "Decisions", href: "/decisions", icon: Lightbulb },
  { name: "Quick Capture", href: "/capture", icon: Inbox },
  { name: "Reviews", href: "/reviews", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [tasks, setTasks] = React.useState<Task[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open && projects.length === 0) {
      Promise.all([
        fetch('/api/projects').then(res => res.json()),
        fetch('/api/tasks').then(res => res.json())
      ]).then(([p, t]) => {
        setProjects(Array.isArray(p) ? p : [])
        setTasks(Array.isArray(t) ? t : [])
      }).catch(err => console.error(err))
    }
  }, [open, projects.length])

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProjects = projects.filter((project) =>
    (project.title || "").toLowerCase().includes(query.toLowerCase())
  )

  const filteredTasks = tasks.filter((task) =>
    (task.title || "").toLowerCase().includes(query.toLowerCase())
  )

  const allResults = [
    ...filteredPages.map((p) => ({ type: "page" as const, ...p })),
    ...filteredProjects.slice(0, 3).map((p) => ({
      type: "project" as const,
      name: p.title,
      href: `/projects`,
      icon: FolderKanban,
    })),
    ...filteredTasks.slice(0, 3).map((t) => ({
      type: "task" as const,
      name: t.title,
      href: `/tasks`,
      icon: CheckSquare,
    })),
  ]

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault()
      router.push(allResults[selectedIndex].href)
      onOpenChange(false)
    } else if (e.key === "Escape") {
      onOpenChange(false)
    }
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, projects, tasks..."
                  className="flex-1 bg-transparent py-4 text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {allResults.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {query === "" && (
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Quick Navigation
                      </div>
                    )}
                    {allResults.map((result, index) => {
                      const Icon = result.icon
                      return (
                        <button
                          key={`${result.type}-${result.name}`}
                          onClick={() => {
                            router.push(result.href)
                            onOpenChange(false)
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${index === selectedIndex
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1 text-sm">{result.name}</span>
                          <span
                            className={`text-xs ${index === selectedIndex
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                              }`}
                          >
                            {result.type === "page"
                              ? "Page"
                              : result.type === "project"
                                ? "Project"
                                : "Task"}
                          </span>
                          <ArrowRight className="h-3 w-3 opacity-50" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      <ArrowRight className="inline h-3 w-3 rotate-[-90deg]" />
                    </kbd>
                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      <ArrowRight className="inline h-3 w-3 rotate-90" />
                    </kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      Enter
                    </kbd>
                    to select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">
                    Esc
                  </kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

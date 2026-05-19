"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckSquare,
  MoreVertical,
  Trash2,
  Edit,
  AlertTriangle,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task, TaskStatus, Priority, Project } from "@/lib/types"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function getStatusColor(status: TaskStatus) {
  switch (status) {
    case "pending":
      return "bg-muted text-muted-foreground border-muted"
    case "in-progress":
      return "bg-primary/10 text-primary border-primary/30"
    case "completed":
      return "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
    case "blocked":
      return "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/30"
    case "delayed":
      return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30"
  }
}

function getPriorityColor(priority: Priority) {
  switch (priority) {
    case "critical":
      return "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/30"
    case "high":
      return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30"
    case "medium":
      return "bg-primary/10 text-primary border-primary/30"
    case "low":
      return "bg-muted text-muted-foreground border-muted"
  }
}

function TaskItem({ task, projects }: { task: Task, projects: Project[] }) {
  const [isChecked, setIsChecked] = useState(task.status === "completed")
  const project = task.projectId
    ? projects.find((p) => p.id === task.projectId)
    : null

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed"

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border bg-card transition-colors ${isChecked ? "opacity-60" : ""
        } ${isOverdue ? "border-[var(--critical)]/50" : "border-border"}`}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => setIsChecked(checked as boolean)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium text-foreground ${isChecked ? "line-through" : ""
                }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className={getStatusColor(task.status)}>
            {task.status.replace("-", " ")}
          </Badge>
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          {project && (
            <Badge variant="secondary" className="text-xs">
              {project.title}
            </Badge>
          )}
          {task.isRecurring && (
            <Badge variant="secondary" className="text-xs">
              Recurring
            </Badge>
          )}
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-sm mt-2 ${isOverdue ? "text-[var(--critical)]" : "text-muted-foreground"
              }`}
          >
            {isOverdue ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>
              {isOverdue ? "Overdue: " : "Due: "}
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

        {task.checklist.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <CheckSquare className="h-3 w-3" />
            <span>
              {task.checklist.filter((c) => c.completed).length}/
              {task.checklist.length} completed
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/projects').then(res => res.json())
    ])
      .then(([tasksData, projectsData]) => {
        setTasks(Array.isArray(tasksData) ? tasksData : [])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  const todayTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate).toDateString() === new Date().toDateString()
  )

  const upcomingTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) > new Date() &&
      new Date(t.dueDate).toDateString() !== new Date().toDateString() &&
      t.status !== "completed"
  )

  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "completed"
  )

  const completedTasks = tasks.filter((t) => t.status === "completed")

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "today":
        return filterTasks(todayTasks)
      case "upcoming":
        return filterTasks(upcomingTasks)
      case "overdue":
        return filterTasks(overdueTasks)
      case "completed":
        return filterTasks(completedTasks)
      default:
        return filterTasks(tasks)
    }
  }

  const filteredTasks = getFilteredTasks()

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your tasks
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your list
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input id="title" placeholder="Enter task title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the task..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="datetime-local" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                  <Calendar className="h-4 w-4 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todayTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--critical)]/10">
                  <AlertTriangle className="h-4 w-4 text-[var(--critical)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overdueTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success)]/10">
                  <CheckSquare className="h-4 w-4 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Done</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {activeTab === "all" && "All Tasks"}
                    {activeTab === "today" && "Today&apos;s Tasks"}
                    {activeTab === "upcoming" && "Upcoming Tasks"}
                    {activeTab === "overdue" && "Overdue Tasks"}
                    {activeTab === "completed" && "Completed Tasks"}
                    <span className="text-muted-foreground font-normal ml-2">
                      ({filteredTasks.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskItem key={task.id} task={task} projects={projects} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground">
                        No tasks found
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Create a new task to get started"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}

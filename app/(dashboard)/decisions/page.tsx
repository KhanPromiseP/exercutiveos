"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Lightbulb,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronRight,
  Loader2
} from "lucide-react"
import type { Decision, DecisionStatus, Project } from "@/lib/types"

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

function getStatusColor(status: DecisionStatus) {
  switch (status) {
    case "pending":
      return "bg-muted text-muted-foreground border-muted"
    case "implemented":
      return "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
    case "reviewing":
      return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30"
    case "revised":
      return "bg-primary/10 text-primary border-primary/30"
  }
}

function getStatusIcon(status: DecisionStatus) {
  switch (status) {
    case "pending":
      return Clock
    case "implemented":
      return CheckCircle2
    case "reviewing":
      return RefreshCw
    case "revised":
      return RefreshCw
  }
}

function DecisionCard({ decision, projects }: { decision: Decision, projects: Project[] }) {
  const project = decision.projectId
    ? projects.find((p) => p.id === decision.projectId)
    : null

  const StatusIcon = getStatusIcon(decision.status)

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={getStatusColor(decision.status)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {decision.status}
              </Badge>
              {project && (
                <Badge variant="secondary" className="text-xs">
                  {project.title}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{decision.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{decision.description}</p>

        <div className="space-y-3 p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Reasoning
            </p>
            <p className="text-sm text-foreground">{decision.reasoning}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Expected Outcome
            </p>
            <p className="text-sm text-foreground">{decision.expectedOutcome}</p>
          </div>
          {decision.actualOutcome && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Actual Outcome
              </p>
              <p className="text-sm text-foreground">{decision.actualOutcome}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Made {new Date(decision.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {decision.reviewDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>
                Review {new Date(decision.reviewDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/decisions').then(res => res.json()),
      fetch('/api/projects').then(res => res.json())
    ])
      .then(([decisionsData, projectsData]) => {
        setDecisions(Array.isArray(decisionsData) ? decisionsData : [])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const filteredDecisions = decisions.filter((decision) => {
    const matchesSearch =
      decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || decision.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: decisions.length,
    implemented: decisions.filter((d) => d.status === "implemented").length,
    reviewing: decisions.filter((d) => d.status === "reviewing").length,
    pending: decisions.filter((d) => d.status === "pending").length,
  }

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Decision Log</h1>
            <p className="text-muted-foreground mt-1">
              Record and review strategic decisions
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Decision
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Log a Decision</DialogTitle>
                <DialogDescription>
                  Record a strategic decision and your reasoning
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Decision Title</Label>
                  <Input id="title" placeholder="What did you decide?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the decision in detail..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reasoning">Reasoning</Label>
                  <Textarea
                    id="reasoning"
                    placeholder="Why did you make this decision?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected">Expected Outcome</Label>
                  <Textarea
                    id="expected"
                    placeholder="What do you expect to happen?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Related Project</Label>
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
                    <Label htmlFor="reviewDate">Review Date</Label>
                    <Input id="reviewDate" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>Log Decision</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success)]/10">
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.implemented}</p>
                  <p className="text-sm text-muted-foreground">Implemented</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                  <RefreshCw className="h-4 w-4 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.reviewing}</p>
                  <p className="text-sm text-muted-foreground">Reviewing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
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
              placeholder="Search decisions..."
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
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="revised">Revised</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Decisions Grid */}
        {isLoading ? (
          <motion.div variants={item} className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : filteredDecisions.length === 0 ? (
          <motion.div variants={item} className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No decisions found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Start logging your strategic decisions"}
            </p>
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
            {filteredDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} projects={projects} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

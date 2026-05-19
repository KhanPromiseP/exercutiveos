"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Plus,
  Compass,
  Target,
  Heart,
  Briefcase,
  Activity,
  BookOpen,
  DollarSign,
  Users,
  CheckCircle2,
  Loader2
} from "lucide-react"
import type { LifeDomain, Habit } from "@/lib/types"

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

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  heart: Heart,
  briefcase: Briefcase,
  activity: Activity,
  "book-open": BookOpen,
  "dollar-sign": DollarSign,
  users: Users,
  compass: Compass,
  target: Target,
}

function DomainCard({ domain, habits }: { domain: LifeDomain, habits: Habit[] }) {
  const Icon = iconMap[domain.icon] || Compass

  // Calculate stats for this domain
  const domainHabits = habits.filter((h) => h.lifeDomainId === domain.id)
  const todayStr = new Date().toISOString().split("T")[0]
  const habitsCompletedToday = domainHabits.filter((h) =>
    h.logs.find((l) => l.date === todayStr && l.completed)
  ).length

  const domainGoalsCompleted = domain.goals.length > 0 ? 
    Math.round((2 / domain.goals.length) * 100) : 0 // Mock completion

  return (
    <Card className="hover:border-primary/50 transition-colors overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: domain.color }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${domain.color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: domain.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{domain.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {domain.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vision */}
        {domain.vision && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{domain.vision}&rdquo;
            </p>
          </div>
        )}

        {/* Goals Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Goals Progress</span>
            <span className="font-medium text-foreground">{domainGoalsCompleted}%</span>
          </div>
          <Progress value={domainGoalsCompleted} className="h-2" />
        </div>

        {/* Goals List */}
        {domain.goals.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Goals</p>
            <div className="space-y-1">
              {domain.goals.slice(0, 3).map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    className={`h-4 w-4 flex-shrink-0 ${
                      index < 2 ? "text-[var(--success)]" : "text-muted-foreground/30"
                    }`}
                  />
                  <span className={index < 2 ? "line-through opacity-60" : ""}>
                    {goal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{domainHabits.length}</p>
            <p className="text-xs text-muted-foreground">Habits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {habitsCompletedToday}/{domainHabits.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<LifeDomain[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/life-domains').then(res => res.json()),
      fetch('/api/habits').then(res => res.json())
    ])
    .then(([domainsData, habitsData]) => {
      setDomains(Array.isArray(domainsData) ? domainsData : [])
      setHabits(Array.isArray(habitsData) ? habitsData : [])
      setIsLoading(false)
    })
    .catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  // Calculate overall stats
  const totalGoals = domains.reduce((sum, d) => sum + (d.goals ? d.goals.length : 0), 0)
  const totalHabits = habits.length

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Life Domains</h1>
            <p className="text-muted-foreground mt-1">
              Manage different areas of your life holistically
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Life Domain</DialogTitle>
                <DialogDescription>
                  Add a new area of life to focus on
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Domain Name</Label>
                  <Input id="name" placeholder="e.g., Spiritual, Career" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this domain represent?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vision">Vision Statement</Label>
                  <Textarea
                    id="vision"
                    placeholder="What is your long-term vision for this area?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input id="icon" placeholder="e.g., heart, target" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" type="color" defaultValue="#6366f1" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>Create Domain</Button>
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
                  <Compass className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{domains.length}</p>
                  <p className="text-sm text-muted-foreground">Life Domains</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--success)]/10">
                  <Target className="h-4 w-4 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalGoals}</p>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                  <Activity className="h-4 w-4 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalHabits}</p>
                  <p className="text-sm text-muted-foreground">Active Habits</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">72%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Domain Grid */}
        {isLoading ? (
          <motion.div variants={item} className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : domains.length === 0 ? (
          <motion.div variants={item} className="text-center py-12">
            <Compass className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No life domains yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first domain to start organizing your life
            </p>
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} habits={habits} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

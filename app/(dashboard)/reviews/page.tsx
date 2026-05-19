"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Sun,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Plus,
  Loader2
} from "lucide-react"
import { useEffect } from "react"
import type { Task, Habit, Project } from "@/lib/types"

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

function DailyReview({ tasks, habits }: { tasks: Task[], habits: Habit[] }) {
  const [reflections, setReflections] = useState("")
  const [priorities, setPriorities] = useState("")
  const todayStr = new Date().toISOString().split("T")[0]

  const completedTasks = tasks.filter(
    (t) => t.status === "completed" && t.completedAt &&
      new Date(t.completedAt).toISOString().split("T")[0] === todayStr
  ).length

  const completedHabits = habits.filter((h) =>
    h.logs.find((l) => l.date === todayStr && l.completed)
  ).length

  return (
    <div className="space-y-6">
      {/* Today&apos;s Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4 text-[var(--warning)]" />
            Today&apos;s Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-foreground">{completedTasks}</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-foreground">
                {completedHabits}/{habits.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Habits Done</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily completion</span>
              <span className="font-medium text-foreground">
                {habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0}%
              </span>
            </div>
            <Progress value={habits.length > 0 ? (completedHabits / habits.length) * 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Reflections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daily Reflection</CardTitle>
          <CardDescription>
            What went well today? What could be improved?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Wins & Accomplishments</label>
            <Textarea
              placeholder="What did you accomplish today?"
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tomorrow&apos;s Priorities</label>
            <Textarea
              placeholder="What are your top 3 priorities for tomorrow?"
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete Daily Review
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function WeeklyReview({ stats, projects }: { stats: any, projects: Project[] }) {
  const [accomplishments, setAccomplishments] = useState("")
  const [challenges, setChallenges] = useState("")
  const [priorities, setPriorities] = useState("")

  return (
    <div className="space-y-6">
      {/* Weekly Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.completedTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.weeklyProductivity}%</p>
              <p className="text-xs text-muted-foreground">Productivity</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{projects.filter(p => p.status === "active").length}</p>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--success)]" />
            Project Progress This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.filter(p => p.status === "active").map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{project.title}</span>
                <span className="text-muted-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reflection Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Reflection</CardTitle>
          <CardDescription>
            Take time to assess your week and plan for the next
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              Key Accomplishments
            </label>
            <Textarea
              placeholder="What were your biggest wins this week?"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
              Challenges & Obstacles
            </label>
            <Textarea
              placeholder="What challenges did you face? How can you overcome them?"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Next Week&apos;s Focus
            </label>
            <Textarea
              placeholder="What are your top priorities for next week?"
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete Weekly Review
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function MonthlyReview() {
  const [reflection, setReflection] = useState("")

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[var(--success)]/10 text-center">
              <p className="text-3xl font-bold text-[var(--success)]">12</p>
              <p className="text-xs text-muted-foreground">Goals Achieved</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 text-center">
              <p className="text-3xl font-bold text-primary">85%</p>
              <p className="text-xs text-muted-foreground">Habit Consistency</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--warning)]/10 text-center">
              <p className="text-3xl font-bold text-[var(--warning)]">30</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Task Completion Rate</span>
                <span className="font-medium text-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Project Progress</span>
                <span className="font-medium text-foreground">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Decision Quality Score</span>
                <span className="font-medium text-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reflection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Monthly Reflection</CardTitle>
          <CardDescription>
            Step back and assess your overall progress this month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--warning)]" />
              Strategic Insights
            </label>
            <Textarea
              placeholder="What strategic insights did you gain this month? What patterns do you notice?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <Button className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete Monthly Review
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReviewsPage() {
  const [stats, setStats] = useState<any>({
    activeProjects: 0,
    pendingTasks: 0,
    weeklyProductivity: 0,
    currentStreak: 0,
    habitsCompletedToday: 0,
    completedToday: 0,
    todayTasks: 0
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(res => res.json()),
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/habits').then(res => res.json()),
      fetch('/api/projects').then(res => res.json())
    ])
      .then(([statsData, tasksData, habitsData, projectsData]) => {
        setStats(statsData)
        setTasks(Array.isArray(tasksData) ? tasksData : [])
        setHabits(Array.isArray(habitsData) ? habitsData : [])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

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
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reviews</h1>
          </div>
          <p className="text-muted-foreground">
            Reflect on progress, assess achievements, and plan strategically
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div variants={item} className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Monthly
                </TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-6">
                <DailyReview tasks={tasks} habits={habits} />
              </TabsContent>
              <TabsContent value="weekly" className="mt-6">
                <WeeklyReview stats={stats} projects={projects} />
              </TabsContent>
              <TabsContent value="monthly" className="mt-6">
                <MonthlyReview />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

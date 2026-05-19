"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
  Target,
  TrendingUp,
  Flame,
  Clock,
  ChevronRight,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import type { Alert, Task, Habit, Project } from "@/lib/types"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function AlertCard({ alert }: { alert: Alert }) {
  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-[var(--critical)]/10",
          border: "border-[var(--critical)]/30",
          icon: AlertTriangle,
          iconColor: "text-[var(--critical)]",
        }
      case "warning":
        return {
          bg: "bg-[var(--warning)]/10",
          border: "border-[var(--warning)]/30",
          icon: AlertCircle,
          iconColor: "text-[var(--warning)]",
        }
      case "success":
        return {
          bg: "bg-[var(--success)]/10",
          border: "border-[var(--success)]/30",
          icon: CheckCircle2,
          iconColor: "text-[var(--success)]",
        }
    }
  }

  const styles = getAlertStyles(alert.type)
  const Icon = styles.icon

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}
    >
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{alert.title}</p>
        <p className="text-sm text-muted-foreground truncate">{alert.description}</p>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {trend && (
            <Badge
              variant="secondary"
              className={
                trendUp
                  ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
                  : "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/30"
              }
            >
              <TrendingUp
                className={`h-3 w-3 mr-1 ${!trendUp && "rotate-180"}`}
              />
              {trend}
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function HabitItem({
  name,
  streak,
  completed,
}: {
  name: string
  streak: number
  completed: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${completed
            ? "bg-[var(--success)] border-[var(--success)]"
            : "border-muted-foreground/30"
            }`}
        >
          {completed && <CheckCircle2 className="h-3 w-3 text-[var(--success-foreground)]" />}
        </div>
        <span className="text-sm text-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-1 text-[var(--warning)]">
        <Flame className="h-3 w-3" />
        <span className="text-xs font-medium">{streak}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
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

  const todayTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.dueDate &&
      new Date(t.dueDate).toDateString() === new Date().toDateString()
  )

  // Generate dynamic alerts based on actual data
  const alerts: Alert[] = []

  const overdueCount = tasks.filter(t => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < new Date()).length
  if (overdueCount > 0) {
    alerts.push({
      id: "alert-1",
      type: "critical",
      title: "Overdue Tasks",
      description: `You have ${overdueCount} overdue tasks that need immediate attention.`,
      entityType: "task",
      entityId: "overdue-summary"
    })
  }

  const noActivityProjects = projects.filter(p => p.progress === 0 && p.status === "active").length
  if (noActivityProjects > 0) {
    alerts.push({
      id: "alert-2",
      type: "warning",
      title: "Stalled Projects",
      description: `${noActivityProjects} active projects have 0% progress.`,
      entityType: "goal",
      entityId: "stalled-projects-summary"
    })
  }

  const completedTodayCount = stats.completedToday || 0
  if (completedTodayCount > 0) {
    alerts.push({
      id: "alert-3",
      type: "success",
      title: "Great Job!",
      description: `You have completed ${completedTodayCount} tasks today.`,
      entityType: "task",
      entityId: "completed-today-summary"
    })
  }

  const criticalAlerts = alerts.filter((a) => a.type === "critical")
  const warningAlerts = alerts.filter((a) => a.type === "warning")
  const successAlerts = alerts.filter((a) => a.type === "success")

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
              Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button asChild>
            <Link href="/capture">
              <Plus className="h-4 w-4 mr-2" />
              Quick Capture
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <motion.div variants={item} className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : (
          <>
            {/* Stats Grid */}
            <motion.div
              variants={item}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard
                title="Active Projects"
                value={stats.activeProjects}
                icon={FolderKanban}
                trend="+2"
                trendUp={true}
              />
              <StatCard
                title="Pending Tasks"
                value={stats.pendingTasks}
                icon={CheckSquare}
              />
              <StatCard
                title="Weekly Productivity"
                value={`${stats.weeklyProductivity}%`}
                icon={TrendingUp}
                trend="+5%"
                trendUp={true}
              />
              <StatCard
                title="Current Streak"
                value={stats.currentStreak}
                icon={Flame}
              />
            </motion.div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Alerts Section */}
              <motion.div variants={item} className="lg:col-span-2 space-y-4">
                {/* Critical Alerts */}
                {criticalAlerts.length > 0 && (
                  <Card className="border-[var(--critical)]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-[var(--critical)]">
                        <AlertTriangle className="h-4 w-4" />
                        Critical Alerts ({criticalAlerts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {criticalAlerts.slice(0, 3).map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Warning Alerts */}
                {warningAlerts.length > 0 && (
                  <Card className="border-[var(--warning)]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-[var(--warning)]">
                        <AlertCircle className="h-4 w-4" />
                        Needs Attention ({warningAlerts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {warningAlerts.slice(0, 3).map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Success Section */}
                {successAlerts.length > 0 && (
                  <Card className="border-[var(--success)]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-[var(--success)]">
                        <CheckCircle2 className="h-4 w-4" />
                        Recent Wins ({successAlerts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {successAlerts.slice(0, 3).map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Active Projects */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Active Projects</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/projects">
                          View all
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {projects
                      .filter((p) => p.status === "active")
                      .slice(0, 3)
                      .map((project) => (
                        <div key={project.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {project.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className={
                                  project.priority === "critical"
                                    ? "bg-[var(--critical)]/10 text-[var(--critical)]"
                                    : project.priority === "high"
                                      ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                                      : ""
                                }
                              >
                                {project.priority}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-1.5" />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Sidebar */}
              <motion.div variants={item} className="space-y-4">
                {/* Today&apos;s Focus */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Today&apos;s Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      {todayTasks.length > 0 ? (
                        <div className="space-y-2">
                          {todayTasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
                            >
                              <div className="mt-0.5">
                                <div
                                  className={`h-4 w-4 rounded-full border-2 ${task.priority === "critical"
                                    ? "border-[var(--critical)]"
                                    : task.priority === "high"
                                      ? "border-[var(--warning)]"
                                      : "border-muted-foreground/30"
                                    }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {task.title}
                                </p>
                                {task.dueDate && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No tasks scheduled for today
                        </p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Habits */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Flame className="h-4 w-4 text-[var(--warning)]" />
                        Today&apos;s Habits
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {stats.habitsCompletedToday || 0}/{habits.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {habits.map((habit) => {
                        const todayLog = habit.logs.find(
                          (l) => l.date === new Date().toISOString().split("T")[0]
                        )
                        return (
                          <HabitItem
                            key={habit.id}
                            name={habit.name}
                            streak={habit.currentStreak}
                            completed={todayLog?.completed || false}
                          />
                        )
                      })}
                    </div>
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href="/habits">
                        View All Habits
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Daily Tasks</span>
                          <span className="font-medium text-foreground">
                            {stats.completedToday}/{stats.todayTasks}
                          </span>
                        </div>
                        <Progress
                          value={
                            stats.todayTasks > 0
                              ? (stats.completedToday / stats.todayTasks) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Weekly Progress</span>
                          <span className="font-medium text-foreground">
                            {stats.weeklyProductivity}%
                          </span>
                        </div>
                        <Progress value={stats.weeklyProductivity} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

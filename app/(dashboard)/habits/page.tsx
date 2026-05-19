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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Calendar,
  Loader2
} from "lucide-react"
import type { Habit, LifeDomain } from "@/lib/types"

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

function HabitCard({ habit, domains }: { habit: Habit, domains: LifeDomain[] }) {
  const todayStr = new Date().toISOString().split("T")[0]
  const todayLog = habit.logs.find((l) => l.date === todayStr)
  const isCompletedToday = todayLog?.completed || false
  const [completed, setCompleted] = useState(isCompletedToday)

  const domain = habit.lifeDomainId
    ? domains.find((d) => d.id === habit.lifeDomainId)
    : null

  // Generate last 7 days of habit completion
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]
    const log = habit.logs.find((l) => l.date === dateStr)
    return {
      date: dateStr,
      day: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
      completed: log?.completed || false,
      isToday: dateStr === todayStr,
    }
  })

  const weeklyCompletion = Math.round(
    (last7Days.filter((d) => d.completed).length / 7) * 100
  )

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {habit.description}
              </p>
            )}
          </div>
          <Button
            variant={completed ? "default" : "outline"}
            size="sm"
            onClick={() => setCompleted(!completed)}
            className={
              completed
                ? "bg-[var(--success)] hover:bg-[var(--success)]/90"
                : ""
            }
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Done
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-1" />
                Mark Done
              </>
            )}
          </Button>
        </div>

        {/* Streak and Domain */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-[var(--warning)]">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">{habit.currentStreak} day streak</span>
          </div>
          {domain && (
            <Badge
              variant="secondary"
              style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
            >
              {domain.name}
            </Badge>
          )}
        </div>

        {/* Weekly Progress Dots */}
        <div className="flex items-center justify-between gap-1 mb-4">
          {last7Days.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                  day.completed
                    ? "bg-[var(--success)] text-[var(--success-foreground)]"
                    : day.isToday
                    ? "border-2 border-primary bg-primary/10"
                    : "bg-muted"
                }`}
              >
                {day.completed && <CheckCircle2 className="h-4 w-4" />}
              </div>
              <span
                className={`text-xs ${
                  day.isToday ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {day.day}
              </span>
            </div>
          ))}
        </div>

        {/* Weekly Completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly completion</span>
            <span className="font-medium text-foreground">{weeklyCompletion}%</span>
          </div>
          <Progress value={weeklyCompletion} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{habit.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{habit.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [domains, setDomains] = useState<LifeDomain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/habits').then(res => res.json()),
      fetch('/api/life-domains').then(res => res.json())
    ])
    .then(([habitsData, domainsData]) => {
      setHabits(Array.isArray(habitsData) ? habitsData : [])
      setDomains(Array.isArray(domainsData) ? domainsData : [])
      setIsLoading(false)
    })
    .catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const todayStr = new Date().toISOString().split("T")[0]
  const completedToday = habits.filter((h) =>
    h.logs.find((l) => l.date === todayStr && l.completed)
  ).length

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0)
  const avgCompletion = Math.round(
    (habits.reduce((sum, h) => {
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split("T")[0]
      })
      const completed = h.logs.filter(
        (l) => last7.includes(l.date) && l.completed
      ).length
      return sum + completed / 7
    }, 0) /
      habits.length) *
      100
  )

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Habits</h1>
            <p className="text-muted-foreground mt-1">
              Build consistency and track your daily habits
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
                <DialogDescription>
                  Add a new habit to track daily
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Habit Name</Label>
                  <Input id="name" placeholder="e.g., Morning Exercise" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your habit..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Life Domain</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>Create Habit</Button>
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
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{habits.length}</p>
                  <p className="text-sm text-muted-foreground">Total Habits</p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {completedToday}/{habits.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Done Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                  <Flame className="h-4 w-4 text-[var(--warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStreak}</p>
                  <p className="text-sm text-muted-foreground">Total Streaks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgCompletion}%</p>
                  <p className="text-sm text-muted-foreground">Weekly Avg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today&apos;s Progress */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today&apos;s Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedToday} of {habits.length} habits completed
                  </span>
                  <span className="font-medium text-foreground">
                    {Math.round((completedToday / habits.length) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(completedToday / habits.length) * 100}
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habits Grid */}
        {isLoading ? (
          <motion.div variants={item} className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : habits.length === 0 ? (
          <motion.div variants={item} className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No habits yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first habit to start building consistency
            </p>
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} domains={domains} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

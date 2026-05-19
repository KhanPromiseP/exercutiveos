"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Mountain,
  Compass,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Goal {
  id: string
  title: string
  description: string
  timeframe: "lifetime" | "5year" | "1year" | "quarterly"
  category: string
  milestones: { id: string; title: string; completed: boolean }[]
  progress: number
}

const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Financial Independence",
    description: "Achieve complete financial freedom to pursue passion projects",
    timeframe: "5year",
    category: "Finance",
    milestones: [
      { id: "m1", title: "Emergency fund (6 months)", completed: true },
      { id: "m2", title: "Max out retirement accounts", completed: true },
      { id: "m3", title: "Build passive income streams", completed: false },
      { id: "m4", title: "Reach target net worth", completed: false },
    ],
    progress: 50,
  },
  {
    id: "2",
    title: "Master Public Speaking",
    description: "Become confident and impactful in front of any audience",
    timeframe: "1year",
    category: "Growth",
    milestones: [
      { id: "m1", title: "Join Toastmasters", completed: true },
      { id: "m2", title: "Give 10 presentations", completed: false },
      { id: "m3", title: "Keynote at conference", completed: false },
    ],
    progress: 33,
  },
  {
    id: "3",
    title: "Run a Marathon",
    description: "Complete a full marathon under 4 hours",
    timeframe: "1year",
    category: "Health",
    milestones: [
      { id: "m1", title: "Run 5K consistently", completed: true },
      { id: "m2", title: "Complete half marathon", completed: true },
      { id: "m3", title: "Marathon training program", completed: false },
      { id: "m4", title: "Race day", completed: false },
    ],
    progress: 50,
  },
]

const visionStatement = `I am building a life of purpose, impact, and freedom. My vision is to create meaningful work that helps others while maintaining deep relationships with family and friends. I pursue continuous growth in mind, body, and spirit, knowing that the journey is as important as the destination.`

const coreValues = [
  { name: "Integrity", description: "Do what&apos;s right, even when no one is watching" },
  { name: "Growth", description: "Embrace challenges as opportunities to learn" },
  { name: "Impact", description: "Create value that outlasts my presence" },
  { name: "Balance", description: "Nurture all dimensions of a fulfilling life" },
  { name: "Excellence", description: "Strive for the highest standard in all endeavors" },
]

const timeframeLabels: Record<string, string> = {
  lifetime: "Lifetime Vision",
  "5year": "5-Year Goals",
  "1year": "Annual Goals",
  quarterly: "Quarterly Objectives",
}

const timeframeColors: Record<string, string> = {
  lifetime: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "5year": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "1year": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  quarterly: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(mockGoals)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all")

  const filteredGoals =
    selectedTimeframe === "all"
      ? goals
      : goals.filter((g) => g.timeframe === selectedTimeframe)

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Goals & Vision
          </h1>
          <p className="text-muted-foreground mt-1">
            Your north star and the milestones along the way
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input placeholder="What do you want to achieve?" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Why is this important to you?" />
              </div>
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <select className="w-full p-2 rounded-md border border-input bg-background">
                  <option value="quarterly">Quarterly</option>
                  <option value="1year">1 Year</option>
                  <option value="5year">5 Years</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <Button className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vision Statement */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mountain className="h-5 w-5 text-primary" />
            Life Vision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed italic">
            {'"'}{visionStatement}{'"'}
          </p>
          <Button variant="ghost" size="sm" className="mt-3 text-primary">
            <Edit2 className="h-3 w-3 mr-1" />
            Edit Vision
          </Button>
        </CardContent>
      </Card>

      {/* Core Values */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          Core Values
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {coreValues.map((value, i) => (
            <motion.div
              key={value.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-foreground">{value.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTimeframe === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeframe("all")}
        >
          All Goals
        </Button>
        {Object.entries(timeframeLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedTimeframe === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full hover:shadow-lg transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        timeframeColors[goal.timeframe]
                      }`}
                    >
                      {timeframeLabels[goal.timeframe]}
                    </span>
                    <CardTitle className="text-lg mt-2">{goal.title}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{goal.description}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Milestones
                  </span>
                  <div className="space-y-1.5">
                    {goal.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={
                            milestone.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }
                        >
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="w-full mt-2">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

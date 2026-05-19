"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Plus,
  Calendar,
  Sun,
  Moon,
  Cloud,
  Smile,
  Meh,
  Frown,
  Heart,
  Star,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface JournalEntry {
  id: string
  date: string
  mood: "great" | "good" | "okay" | "bad"
  weather: "sunny" | "cloudy" | "rainy"
  gratitude: string[]
  highlights: string
  reflection: string
  lessons: string
}

const mockEntries: JournalEntry[] = [
  {
    id: "1",
    date: "2026-05-18",
    mood: "great",
    weather: "sunny",
    gratitude: ["Morning coffee ritual", "Productive work session", "Call with an old friend"],
    highlights: "Finally shipped the new feature I&apos;ve been working on for weeks. The team&apos;s response was incredibly positive.",
    reflection: "I noticed that starting my day with intention setting made a huge difference in my focus levels.",
    lessons: "Patience and consistent effort compound over time. Today was proof of that.",
  },
  {
    id: "2",
    date: "2026-05-17",
    mood: "good",
    weather: "cloudy",
    gratitude: ["Healthy breakfast", "Good workout", "Quiet evening"],
    highlights: "Had a breakthrough in understanding a complex problem at work.",
    reflection: "Taking breaks to walk outside helped clear my mind when I felt stuck.",
    lessons: "Sometimes stepping away is the most productive thing you can do.",
  },
  {
    id: "3",
    date: "2026-05-16",
    mood: "okay",
    weather: "rainy",
    gratitude: ["Warm home", "Good book", "Supportive partner"],
    highlights: "Despite the gloomy weather, managed to complete my weekly review.",
    reflection: "Low energy days are part of life. It&apos;s okay to work at a slower pace sometimes.",
    lessons: "Honor your energy levels and adjust expectations accordingly.",
  },
]

const moodIcons = {
  great: { icon: Smile, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  good: { icon: Smile, color: "text-blue-500", bg: "bg-blue-500/10" },
  okay: { icon: Meh, color: "text-amber-500", bg: "bg-amber-500/10" },
  bad: { icon: Frown, color: "text-red-500", bg: "bg-red-500/10" },
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: Cloud,
}

export default function JournalPage() {
  const [entries] = useState(mockEntries)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEntries = entries.filter(
    (entry) =>
      entry.highlights.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reflection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.lessons.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Daily Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Reflect, learn, and grow every day
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Daily Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Mood Selection */}
              <div className="space-y-2">
                <Label>How are you feeling today?</Label>
                <div className="flex gap-2">
                  {Object.entries(moodIcons).map(([mood, { icon: Icon, color, bg }]) => (
                    <button
                      key={mood}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors ${bg}`}
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                      <span className="capitalize text-sm">{mood}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gratitude */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  3 Things You&apos;re Grateful For
                </Label>
                <div className="space-y-2">
                  <Input placeholder="1. Something you&apos;re grateful for..." />
                  <Input placeholder="2. Another blessing..." />
                  <Input placeholder="3. One more thing..." />
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Today&apos;s Highlights
                </Label>
                <Textarea placeholder="What were the best moments of your day?" rows={3} />
              </div>

              {/* Reflection */}
              <div className="space-y-2">
                <Label>Reflection</Label>
                <Textarea placeholder="What thoughts or feelings are on your mind?" rows={3} />
              </div>

              {/* Lessons */}
              <div className="space-y-2">
                <Label>Lessons Learned</Label>
                <Textarea placeholder="What did today teach you?" rows={2} />
              </div>

              <Button className="w-full">Save Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Smile className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{entries.length * 3}</p>
                <p className="text-xs text-muted-foreground">Gratitudes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">78%</p>
                <p className="text-xs text-muted-foreground">Good Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">May 2026</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry, i) => {
          const MoodIcon = moodIcons[entry.mood].icon
          const WeatherIcon = weatherIcons[entry.weather]
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${moodIcons[entry.mood].bg}`}>
                        <MoodIcon className={`h-5 w-5 ${moodIcons[entry.mood].color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{formatDate(entry.date)}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <WeatherIcon className="h-3 w-3" />
                          <span className="capitalize">{entry.weather}</span>
                        </div>
                      </div>
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
                  {/* Gratitude */}
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-pink-500 flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Gratitude
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {entry.gratitude.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Highlights
                    </span>
                    <p className="text-sm text-foreground/80">{entry.highlights}</p>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Lessons</span>
                    <p className="text-sm text-muted-foreground italic">{entry.lessons}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

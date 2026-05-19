// User Types
export interface User {
  id: string
  email: string
  name: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

// Project Types
export type ProjectStatus = "active" | "completed" | "on-hold" | "archived"
export type Priority = "low" | "medium" | "high" | "critical"

export interface Project {
  id: string
  userId: string
  title: string
  vision?: string
  mission?: string
  category: string
  tags: string[]
  status: ProjectStatus
  priority: Priority
  deadline?: Date
  progress: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Task Types
export type TaskStatus = "pending" | "in-progress" | "completed" | "blocked" | "delayed"

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  userId: string
  projectId?: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  reminderDate?: Date
  isRecurring: boolean
  recurringPattern?: string
  checklist: ChecklistItem[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Milestone Types
export interface Milestone {
  id: string
  projectId: string
  userId: string
  title: string
  description?: string
  dueDate?: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Habit Types
export interface HabitLog {
  date: string
  completed: boolean
}

export interface Habit {
  id: string
  userId: string
  lifeDomainId?: string
  name: string
  description?: string
  frequency: "daily" | "weekly" | "monthly"
  targetPerPeriod: number
  currentStreak: number
  longestStreak: number
  logs: HabitLog[]
  createdAt: Date
  updatedAt: Date
}

// Life Domain Types
export interface LifeDomain {
  id: string
  userId: string
  name: string
  description?: string
  icon: string
  color: string
  vision?: string
  goals: string[]
  createdAt: Date
  updatedAt: Date
}

// Decision Types
export type DecisionStatus = "pending" | "implemented" | "reviewing" | "revised"

export interface Decision {
  id: string
  userId: string
  projectId?: string
  title: string
  description: string
  reasoning: string
  expectedOutcome: string
  actualOutcome?: string
  status: DecisionStatus
  reviewDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Quick Capture Types
export type CaptureType = "idea" | "task" | "reminder" | "note" | "goal"

export interface QuickCapture {
  id: string
  userId: string
  type: CaptureType
  content: string
  processed: boolean
  processedAt?: Date
  createdAt: Date
}

// Reminder Types
export interface Reminder {
  id: string
  userId: string
  title: string
  description?: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Review Types
export type ReviewType = "daily" | "weekly" | "monthly"

export interface Review {
  id: string
  userId: string
  type: ReviewType
  date: Date
  accomplishments: string[]
  challenges: string[]
  priorities: string[]
  reflections?: string
  createdAt: Date
  updatedAt: Date
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  todayTasks: number
  completedToday: number
  weeklyProductivity: number
  habitsCompletedToday: number
  currentStreak: number
}

export interface Alert {
  id: string
  type: "critical" | "warning" | "success"
  title: string
  description: string
  entityType: "task" | "milestone" | "reminder" | "goal" | "habit"
  entityId: string
  dueDate?: Date
}

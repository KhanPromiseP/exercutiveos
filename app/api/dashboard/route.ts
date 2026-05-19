import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Project from "@/models/Project"
import Task from "@/models/Task"
import Habit from "@/models/Habit"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    await dbConnect()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Run aggregations in parallel
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      completedToday,
      habits,
    ] = await Promise.all([
      Project.countDocuments({ userId }),
      Project.countDocuments({ userId, status: "active" }),
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: "completed" }),
      Task.countDocuments({ userId, status: { $ne: "completed" } }),
      Task.countDocuments({ 
        userId, 
        status: { $ne: "completed" },
        dueDate: { $lt: new Date() } 
      }),
      Task.countDocuments({ 
        userId, 
        dueDate: { $gte: todayStart, $lte: todayEnd } 
      }),
      Task.countDocuments({ 
        userId, 
        status: "completed",
        completedAt: { $gte: todayStart, $lte: todayEnd }
      }),
      Habit.find({ userId })
    ])

    // Calculate habit stats
    const todayStr = todayStart.toISOString().split("T")[0]
    let habitsCompletedToday = 0
    let totalStreak = 0

    habits.forEach(habit => {
      totalStreak += habit.currentStreak
      const todayLog = habit.logs.find((log: any) => log.date === todayStr)
      if (todayLog?.completed) {
        habitsCompletedToday++
      }
    })

    const avgStreak = habits.length > 0 ? Math.round(totalStreak / habits.length) : 0
    const weeklyProductivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return NextResponse.json({
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      completedToday,
      weeklyProductivity,
      habitsCompletedToday,
      currentStreak: avgStreak, // Using average streak as a representative number
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

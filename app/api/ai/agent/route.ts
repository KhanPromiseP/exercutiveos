import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Task from "@/models/Task"
import User from "@/models/User"
import webpush from "web-push"

webpush.setVapidDetails(
  "mailto:noreply@executiveos.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
)

export async function GET(req: NextRequest) {
  try {
    // Basic auth check for cron job
    const internalSecret = req.headers.get("x-internal-secret") || new URL(req.url).searchParams.get("secret")
    if (internalSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 })
    }

    await dbConnect()

    // Find all overdue tasks globally
    const now = new Date()
    const overdueTasks = await Task.find({
      status: { $ne: "completed" },
      dueDate: { $lt: now }
    })

    if (overdueTasks.length === 0) {
      return NextResponse.json({ message: "No overdue tasks found" })
    }

    // Group overdue tasks by user
    const tasksByUser: Record<string, any[]> = {}
    overdueTasks.forEach(task => {
      if (!tasksByUser[task.userId]) tasksByUser[task.userId] = []
      tasksByUser[task.userId].push(task)
    })

    let notificationsSent = 0

    // Send AI-like warnings to users with overdue tasks
    for (const [userId, tasks] of Object.entries(tasksByUser)) {
      const user = await User.findById(userId)
      if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) continue

      const count = tasks.length
      const message = `[AI Controller Warning]: You have ${count} overdue task${count > 1 ? 's' : ''}! This is unacceptable. Open the app immediately to reschedule or complete them. I am waiting for your action.`

      const payload = JSON.stringify({
        title: "CRITICAL: Overdue Tasks",
        body: message,
        data: { url: "/tasks" },
        actions: [
          { action: 'open', title: 'Review Tasks' }
        ]
      })

      const notifications = user.pushSubscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub, payload)
          notificationsSent++
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await User.findByIdAndUpdate(userId, { $pull: { pushSubscriptions: sub } })
          }
        }
      })

      await Promise.all(notifications)
    }

    return NextResponse.json({ success: true, notificationsSent, overdueUsersCount: Object.keys(tasksByUser).length })
  } catch (error: any) {
    console.error("AI Agent automation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

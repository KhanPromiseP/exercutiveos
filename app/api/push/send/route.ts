import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import webpush from "web-push"

webpush.setVapidDetails(
  "mailto:noreply@executiveos.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
)

export async function POST(req: NextRequest) {
  try {
    // Basic auth check - in production you'd want a secure machine-to-machine auth for cron jobs
    const session = await auth()
    const internalSecret = req.headers.get("x-internal-secret")
    
    // Allow either user session OR internal cron secret
    if (!session?.user?.id && internalSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, title, body, data, actions } = await req.json()
    
    // Ensure the sender has permission to send to this user (unless it's the cron job)
    if (session?.user?.id && session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await dbConnect()
    const user = await User.findById(userId)

    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return NextResponse.json({ error: "No subscriptions found" }, { status: 404 })
    }

    const payload = JSON.stringify({
      title,
      body,
      data,
      actions
    })

    const notifications = user.pushSubscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(sub, payload)
      } catch (err: any) {
        // If subscription is invalid/expired, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await User.findByIdAndUpdate(userId, {
            $pull: { pushSubscriptions: sub }
          })
        } else {
          console.error("Error sending push notification", err)
        }
      }
    })

    await Promise.all(notifications)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Push send error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

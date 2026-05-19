import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ verificationToken: token })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    user.emailVerified = true
    user.verificationToken = undefined
    await user.save()

    return NextResponse.json({ success: true, message: "Email verified successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

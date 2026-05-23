import { NextRequest, NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/email"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ email })

    // Always return a generic success to avoid user enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      })
    }

    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiry = resetTokenExpiry
    await user.save()

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(req.url).origin
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    if (process.env.NODE_ENV === "development") {
      console.log("\n=================================")
      console.log("PASSWORD RESET LINK:")
      console.log(resetUrl)
      console.log("=================================\n")
    }

    try {
      await sendPasswordResetEmail(user.email, resetUrl)
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr)
      // Don't fail the request — email is best-effort
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    )
  }
}

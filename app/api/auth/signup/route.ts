import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    await dbConnect()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomUUID()

    const user = await User.create({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(req.url).origin

    let emailError: string | null = null
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        baseUrl
      )
    } catch (err: any) {
      console.error("Verification email failed to send:", err.message)
      emailError = "Account created, but the verification email could not be sent."
    }

    const verificationUrl =
      `${baseUrl}/verify-email?token=${verificationToken}`

    if (process.env.NODE_ENV === "development") {
      console.log("\n=================================")
      console.log("EMAIL VERIFICATION LINK:")
      console.log(verificationUrl)
      console.log("=================================\n")
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      message: emailError || "Please check your email to verify your account.",
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Habit from "@/models/Habit"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lifeDomainId = searchParams.get("lifeDomainId")

    const query: any = { userId: session.user.id }
    if (lifeDomainId) {
      query.lifeDomainId = lifeDomainId
    }

    await dbConnect()
    const habits = await Habit.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json(habits)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    await dbConnect()
    
    const habit = await Habit.create({
      ...data,
      userId: session.user.id
    })
    
    return NextResponse.json(habit, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

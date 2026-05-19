import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Reminder from "@/models/Reminder"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    const reminder = await Reminder.findOne({ _id: id, userId: session.user.id })
    
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    return NextResponse.json(reminder)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()
    await dbConnect()
    
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      data,
      { new: true, runValidators: true }
    )
    
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    return NextResponse.json(reminder)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    const reminder = await Reminder.findOneAndDelete({ _id: id, userId: session.user.id })
    
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Reminder deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

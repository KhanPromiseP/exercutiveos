import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Decision from "@/models/Decision"

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
    const decision = await Decision.findOne({ _id: id, userId: session.user.id })
    
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    return NextResponse.json(decision)
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
    
    const decision = await Decision.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      data,
      { new: true, runValidators: true }
    )
    
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    return NextResponse.json(decision)
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
    const decision = await Decision.findOneAndDelete({ _id: id, userId: session.user.id })
    
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Decision deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

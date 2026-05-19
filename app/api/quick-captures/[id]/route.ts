import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import QuickCapture from "@/models/QuickCapture"

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
    const capture = await QuickCapture.findOne({ _id: id, userId: session.user.id })
    
    if (!capture) {
      return NextResponse.json({ error: "Quick Capture not found" }, { status: 404 })
    }

    return NextResponse.json(capture)
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
    
    const capture = await QuickCapture.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      data,
      { new: true, runValidators: true }
    )
    
    if (!capture) {
      return NextResponse.json({ error: "Quick Capture not found" }, { status: 404 })
    }

    return NextResponse.json(capture)
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
    const capture = await QuickCapture.findOneAndDelete({ _id: id, userId: session.user.id })
    
    if (!capture) {
      return NextResponse.json({ error: "Quick Capture not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Quick Capture deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

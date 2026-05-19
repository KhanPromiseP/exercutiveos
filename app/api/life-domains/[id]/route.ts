import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import LifeDomain from "@/models/LifeDomain"

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
    const lifeDomain = await LifeDomain.findOne({ _id: id, userId: session.user.id })
    
    if (!lifeDomain) {
      return NextResponse.json({ error: "Life Domain not found" }, { status: 404 })
    }

    return NextResponse.json(lifeDomain)
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
    
    const lifeDomain = await LifeDomain.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      data,
      { new: true, runValidators: true }
    )
    
    if (!lifeDomain) {
      return NextResponse.json({ error: "Life Domain not found" }, { status: 404 })
    }

    return NextResponse.json(lifeDomain)
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
    const lifeDomain = await LifeDomain.findOneAndDelete({ _id: id, userId: session.user.id })
    
    if (!lifeDomain) {
      return NextResponse.json({ error: "Life Domain not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Life Domain deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

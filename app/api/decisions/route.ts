import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Decision from "@/models/Decision"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    const query: any = { userId: session.user.id }
    if (projectId) {
      query.projectId = projectId
    }

    await dbConnect()
    const decisions = await Decision.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json(decisions)
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
    
    const decision = await Decision.create({
      ...data,
      userId: session.user.id
    })
    
    return NextResponse.json(decision, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

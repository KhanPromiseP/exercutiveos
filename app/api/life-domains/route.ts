import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import LifeDomain from "@/models/LifeDomain"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const lifeDomains = await LifeDomain.find({ userId: session.user.id }).sort({ createdAt: -1 })
    
    return NextResponse.json(lifeDomains)
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
    
    const lifeDomain = await LifeDomain.create({
      ...data,
      userId: session.user.id
    })
    
    return NextResponse.json(lifeDomain, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

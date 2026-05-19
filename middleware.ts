import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple middleware for demo purposes
// In production, this would use NextAuth's auth middleware
export function middleware(request: NextRequest) {
  // For demo purposes, allow all routes
  // Users can access the dashboard directly
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|screenshots|manifest.json|sw.js|offline).*)",
  ],
}

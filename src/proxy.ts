import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  return response
}

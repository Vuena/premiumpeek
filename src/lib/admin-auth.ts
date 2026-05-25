import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function verifyAdmin(req: Request) {
  if (!adminDb || !adminAuth) {
    return { error: NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 }) }
  }
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const token = authHeader.split("Bearer ")[1]
  let decoded: any
  try {
    decoded = await adminAuth!.verifyIdToken(token)
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) }
  }

  const d = adminDb!
  const userSnap = await d.collection("users").doc(decoded.uid).get()
  if (!userSnap.exists || userSnap.data()?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { uid: decoded.uid }
}

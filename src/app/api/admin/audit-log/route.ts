import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdmin } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req)
    if (auth.error) return auth.error

    const { action, details } = await req.json()
    if (!action) {
      return NextResponse.json({ error: "action gerekli" }, { status: 400 })
    }

    const d = adminDb!
    await d.collection("auditLogs").add({
      adminUid: auth.uid,
      action,
      details: details || {},
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Audit log error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req)
    if (auth.error) return auth.error

    const d = adminDb!
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50")
    const snap = await d.collection("auditLogs")
      .orderBy("createdAt", "desc")
      .limit(Math.min(limit, 200))
      .get()

    const logs = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }))

    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error("Audit log fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

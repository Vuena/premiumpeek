import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdmin } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    const auth = await verifyAdmin(req)
    if (auth.error) return auth.error

    const { uid, role } = await req.json()
    if (!uid || !role) {
      return NextResponse.json({ error: "uid and role are required" }, { status: 400 })
    }

    const validRoles = ["user", "admin", "banned"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await adminDb!.collection("users").doc(uid).update({ role })

    await adminDb!.collection("auditLogs").add({
      adminUid: auth.uid,
      action: "user_ban_toggle",
      details: { targetUid: uid, newRole: role },
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

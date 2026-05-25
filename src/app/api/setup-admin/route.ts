import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("x-setup-key") !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email gerekli" }, { status: 400 })
    }

    const userRecord = await adminAuth!.getUserByEmail(email)
    await adminDb!.collection("users").doc(userRecord.uid).set({
      role: "admin",
      email: userRecord.email,
      displayName: userRecord.displayName || "",
    }, { merge: true })

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
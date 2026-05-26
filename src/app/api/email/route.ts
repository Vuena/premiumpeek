import { NextRequest, NextResponse } from "next/server"
import { sendEmail, dailyReminderHtml, warningHtml, removedHtml } from "@/lib/email"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split("Bearer ")[1]
    try {
      const decoded = await adminAuth!.verifyIdToken(token)
      const userSnap = await adminDb!.collection("users").doc(decoded.uid).get()
      if (userSnap.data()?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await req.json()
    const { type, ...data } = body

    let subject = ""
    let html = ""

    switch (type) {
      case "daily-reminder":
        subject = "You have apps to test today!"
        html = dailyReminderHtml(data.userName, data.appCount, data.packName, data.testingLink)
        break
      case "warning":
        subject = `⚠️ Day ${data.daysMissed} warning - ${data.packName}`
        html = warningHtml(data.userName, data.daysMissed, data.packName)
        break
      case "removed":
        subject = `❌ You were removed from ${data.packName}`
        html = removedHtml(data.userName, data.packName)
        break
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    const result = await sendEmail({ to: data.to, subject, html })
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdmin } from "@/lib/admin-auth"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    const auth = await verifyAdmin(req)
    if (auth.error) return auth.error

    const { subject, message, target } = await req.json()
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    if (!resend) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const d = adminDb!
    let usersSnap
    if (target === "all") {
      usersSnap = await d.collection("users").get()
    } else if (target === "testers") {
      usersSnap = await d.collection("users").where("isTester", "==", true).get()
    } else if (target === "premium") {
      usersSnap = await d.collection("users").where("role", "==", "premium").get()
    } else {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 })
    }

    const emails = usersSnap.docs
      .map(d => d.data().email)
      .filter(Boolean)
      .slice(0, 50)

    if (emails.length === 0) {
      return NextResponse.json({ error: "No emails found to send" }, { status: 400 })
    }

    const sent: string[] = []
    const failed: string[] = []

    for (const email of emails) {
      try {
        await resend.emails.send({
          from: "PremiumPeek <noreply@premiumpeek.com>",
          to: email,
          subject,
          text: message,
        })
        sent.push(email)
      } catch {
        failed.push(email)
      }
    }

    const d2 = adminDb!
    await d2.collection("auditLogs").add({
      adminUid: auth.uid,
      action: "send_email",
      details: { subject, target, sentCount: sent.length, failedCount: failed.length },
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, sent: sent.length, failed: failed.length })
  } catch (error: any) {
    console.error("Send email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    if (!rateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please wait 1 minute." }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await sendEmail({
      to: "premiumpeektest@gmail.com",
      subject: `Contact Form: ${escapeHtml(name)} <${escapeHtml(email)}>`,
      html: `<h2>New Contact Message</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message)}</p>`,
    }).catch(err => console.error("Contact email send failed:", err))

    return NextResponse.json({ success: true, message: "Your message has been received. We will get back to you as soon as possible." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

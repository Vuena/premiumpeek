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
      return NextResponse.json({ error: "Çok fazla istek. Lütfen 1 dakika bekleyin." }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 })
    }

    await sendEmail({
      to: "premiumpeektest@gmail.com",
      subject: `İletişim Formu: ${escapeHtml(name)} <${escapeHtml(email)}>`,
      html: `<h2>Yeni İletişim Mesajı</h2><p><strong>Ad:</strong> ${escapeHtml(name)}</p><p><strong>E-posta:</strong> ${escapeHtml(email)}</p><p><strong>Mesaj:</strong></p><p>${escapeHtml(message)}</p>`,
    }).catch(err => console.error("Contact email send failed:", err))

    return NextResponse.json({ success: true, message: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

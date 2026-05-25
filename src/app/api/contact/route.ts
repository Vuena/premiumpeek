import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 })
    }

    const result = await sendEmail({
      to: "premiumpeektest@gmail.com",
      subject: `İletişim Formu: ${escapeHtml(name)} <${escapeHtml(email)}>`,
      html: `<h2>Yeni İletişim Mesajı</h2><p><strong>Ad:</strong> ${escapeHtml(name)}</p><p><strong>E-posta:</strong> ${escapeHtml(email)}</p><p><strong>Mesaj:</strong></p><p>${escapeHtml(message)}</p>`,
    })

    if (result.error) {
      return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

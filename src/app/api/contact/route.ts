import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 })
    }

    console.log("Contact form submission:", { name, email, message })

    // In production, send email via Resend or save to Firestore
    // await sendEmail({ to: "info@premiumpeek.com", subject: `İletişim: ${name}`, html: `<p>${message}</p>` })

    return NextResponse.json({ success: true, message: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

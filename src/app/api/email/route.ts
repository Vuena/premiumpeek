import { NextRequest, NextResponse } from "next/server"
import { sendEmail, dailyReminderHtml, warningHtml, removedHtml } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, ...data } = body

    let subject = ""
    let html = ""

    switch (type) {
      case "daily-reminder":
        subject = "📱 Bugün test etmen gereken uygulamalar var!"
        html = dailyReminderHtml(data.userName, data.appCount, data.packName, data.testingLink)
        break
      case "warning":
        subject = `⚠️ ${data.daysMissed}. gün uyarısı - ${data.packName}`
        html = warningHtml(data.userName, data.daysMissed, data.packName)
        break
      case "removed":
        subject = `❌ ${data.packName} pack'inden atıldın`
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

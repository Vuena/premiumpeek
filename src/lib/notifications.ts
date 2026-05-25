import { sendEmail, dailyReminderHtml, warningHtml, removedHtml } from "@/lib/email"

interface EmailOptions {
  to: string
  userName: string
}

export async function sendDailyReminder({ to, userName }: EmailOptions, appCount: number, packName: string) {
  try {
    await sendEmail({
      to,
      subject: "Günlük Test Hatırlatması | PremiumPeek",
      html: dailyReminderHtml(userName, appCount, packName, "https://www.premiumpeek.com/dashboard/testing"),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

export async function sendWarning({ to, userName }: EmailOptions, daysMissed: number, packName: string) {
  try {
    await sendEmail({
      to,
      subject: "Uyarı: Test Aksatma | PremiumPeek",
      html: warningHtml(userName, daysMissed, packName),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

export async function sendRemoved({ to, userName }: EmailOptions, packName: string) {
  try {
    await sendEmail({
      to,
      subject: "Pack'ten Atıldın | PremiumPeek",
      html: removedHtml(userName, packName),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

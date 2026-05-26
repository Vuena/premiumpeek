import { sendEmail, dailyReminderHtml, warningHtml, removedHtml } from "@/lib/email"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface EmailOptions {
  to: string
  userName: string
}

export async function sendDailyReminder({ to, userName }: EmailOptions, appCount: number, packName: string) {
  try {
    await sendEmail({
      to,
      subject: "Daily Test Reminder | PremiumPeek",
      html: dailyReminderHtml(userName, appCount, packName, `${siteUrl}/dashboard/testing`),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

export async function sendWarning({ to, userName }: EmailOptions, daysMissed: number, packName: string) {
  try {
    await sendEmail({
      to,
      subject: "Warning: Missed Test | PremiumPeek",
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
      subject: "Removed from Pack | PremiumPeek",
      html: removedHtml(userName, packName),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

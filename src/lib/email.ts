import { Resend } from "resend"

const resendKey = process.env.RESEND_API_KEY
let resend: Resend | null = null

if (resendKey) {
  resend = new Resend(resendKey)
}

const FROM = process.env.EMAIL_FROM || "noreply@premiumpeek.com"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn("Resend not configured. Set RESEND_API_KEY env variable.")
    return { error: "Email service not configured" }
  }
  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    })
    return result
  } catch (error) {
    console.error("Email send error:", error)
    return { error }
  }
}

export function dailyReminderHtml(userName: string, appCount: number, packName: string, testingLink: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px;">📱 PremiumPeek</div>
      <h2 style="font-size:20px;margin-bottom:16px;">Hello ${esc(userName)}!</h2>
      <p style="color:#555;line-height:1.6;">Today you need to test <strong>${appCount} apps</strong> (${esc(packName)}).</p>
      <p style="color:#555;line-height:1.6;">Remember, if you miss tests you'll be removed from the pack!</p>
      <a href="${testingLink}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:12px;font-weight:500;margin:16px 0;">Test Now</a>
      <p style="color:#888;font-size:12px;margin-top:24px;">PremiumPeek · Google Play Testing Community</p>
    </div>
  `
}

export function warningHtml(userName: string, daysMissed: number, packName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px;">📱 PremiumPeek</div>
      <h2 style="font-size:20px;margin-bottom:16px;">Warning, ${esc(userName)}! ⚠️</h2>
      <p style="color:#555;line-height:1.6;"><strong>Day ${daysMissed}</strong> — you missed a test (${esc(packName)}).</p>
      ${daysMissed >= 2 ? '<p style="color:#dc2626;font-weight:bold;">If you miss tomorrow you\'ll be removed from the pack!</p>' : '<p style="color:#555;">If you miss again you\'ll be removed from the pack.</p>'}
      <p style="color:#888;font-size:12px;margin-top:24px;">PremiumPeek · Google Play Testing Community</p>
    </div>
  `
}

export function removedHtml(userName: string, packName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px;">📱 PremiumPeek</div>
      <h2 style="font-size:20px;margin-bottom:16px;">Removed from Pack</h2>
      <p style="color:#555;line-height:1.6;">Hello ${esc(userName)},</p>
      <p style="color:#555;line-height:1.6;">You were removed from <strong>${esc(packName)}</strong> because you didn't test on time.</p>
      <p style="color:#555;line-height:1.6;">You can join a new pack and start over.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">PremiumPeek · Google Play Testing Community</p>
    </div>
  `
}

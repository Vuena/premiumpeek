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
      <h2 style="font-size:20px;margin-bottom:16px;">Merhaba ${esc(userName)}!</h2>
      <p style="color:#555;line-height:1.6;">Bugün test etmen gereken <strong>${appCount} uygulama</strong> var (${esc(packName)}).</p>
      <p style="color:#555;line-height:1.6;">Unutma, aksatırsan pack'ten atılırsın!</p>
      <a href="${testingLink}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:12px;font-weight:500;margin:16px 0;">Şimdi Test Et</a>
      <p style="color:#888;font-size:12px;margin-top:24px;">PremiumPeek · Google Play Test Topluluğu</p>
    </div>
  `
}

export function warningHtml(userName: string, daysMissed: number, packName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px;">📱 PremiumPeek</div>
      <h2 style="font-size:20px;margin-bottom:16px;">Uyarı, ${esc(userName)}! ⚠️</h2>
      <p style="color:#555;line-height:1.6;"><strong>${daysMissed}. gün</strong> testini aksattın (${esc(packName)}).</p>
      ${daysMissed >= 2 ? '<p style="color:#dc2626;font-weight:bold;">Yarın aksatırsan pack\'ten atılacaksın!</p>' : '<p style="color:#555;">Aksatırsan pack\'ten atılırsın.</p>'}
      <p style="color:#888;font-size:12px;margin-top:24px;">PremiumPeek · Google Play Test Topluluğu</p>
    </div>
  `
}

export function removedHtml(userName: string, packName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px;">📱 PremiumPeek</div>
      <h2 style="font-size:20px;margin-bottom:16px;">Pack'ten Atıldın</h2>
      <p style="color:#555;line-height:1.6;">Merhaba ${esc(userName)},</p>
      <p style="color:#555;line-height:1.6;">Test yapmadığın için <strong>${esc(packName)}</strong> pack'inden atıldın.</p>
      <p style="color:#555;line-height:1.6;">Yeni bir pack'e katılarak tekrar başlayabilirsin.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">PremiumPeek · Google Play Test Topluluğu</p>
    </div>
  `
}

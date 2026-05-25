import { auth } from "./firebase"

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3333"

interface EmailOptions {
  to: string
  userName: string
}

export async function sendDailyReminder({ to, userName }: EmailOptions, appCount: number, packName: string) {
  try {
    await fetch(`${API_URL}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "daily-reminder",
        to,
        userName,
        appCount,
        packName,
        testingLink: `${API_URL}/dashboard/testing`,
      }),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

export async function sendPackInvite({ to, userName }: EmailOptions, packName: string, code: string, inviterName: string) {
  try {
    await fetch(`${API_URL}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "pack-invite",
        to,
        userName,
        packName,
        code,
        inviterName,
        joinLink: `${API_URL}/dashboard/packs/join`,
      }),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

export async function sendWarning({ to, userName }: EmailOptions, daysMissed: number, packName: string) {
  try {
    await fetch(`${API_URL}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "warning",
        to,
        userName,
        daysMissed,
        packName,
      }),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

export async function sendRemoved({ to, userName }: EmailOptions, packName: string) {
  try {
    await fetch(`${API_URL}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "removed",
        to,
        userName,
        packName,
      }),
    })
  } catch (err) {
    console.error("Failed to send email:", err)
  }
}

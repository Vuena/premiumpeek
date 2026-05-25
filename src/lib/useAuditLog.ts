"use client"
import { auth } from "@/lib/firebase"

export async function logAudit(action: string, details: Record<string, any> = {}) {
  try {
    if (!auth?.currentUser) { console.error("Not authenticated"); return }
    const token = await auth.currentUser.getIdToken()
    await fetch("/api/admin/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, details }),
    })
  } catch (err) {
    console.error("Audit log failed:", err)
  }
}

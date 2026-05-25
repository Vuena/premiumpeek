import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const maxDuration = 60

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }

    const d = adminDb
    const now = new Date()
    const packsSnap = await d.collection("packs").where("status", "==", "testing").get()
    let processed = 0
    let screenshotsCleaned = 0

    for (const packDoc of packsSnap.docs) {
      const pack = packDoc.data()
      const packId = packDoc.id
      const currentDay = pack.currentDay || 1

      if (currentDay >= pack.totalDays) {
        await packDoc.ref.update({ status: "completed", endDate: now })
        processed++
        continue
      }

      for (const member of pack.members || []) {
        if (member.type === "premium") continue
        const uid = member.uid
        const activityRef = d.collection("testingActivity")
        const activitySnap = await activityRef
          .where("packId", "==", packId)
          .where("uid", "==", uid)
          .where("day", "==", currentDay)
          .get()

        if (activitySnap.empty) {
          const userRef = d.collection("users").doc(uid)
          const userSnap = await userRef.get()
          const userData = userSnap.data()
          const missedDays = (userData?.missedDays || 0) + 1

          await userRef.update({ missedDays })

          if (missedDays >= 3) {
            await packDoc.ref.update({
              members: pack.members.filter((m: any) => m.uid !== uid),
            })

            await userRef.update({ missedDays: 0 })

            const userAppsSnap = await d.collection("apps").where("uid", "==", uid).where("packId", "==", packId).get()
            for (const appDoc of userAppsSnap.docs) {
              await appDoc.ref.update({ packId: "", status: "pending" })
            }
          }
        } else {
          const userRef = d.collection("users").doc(uid)
          await userRef.update({ missedDays: 0 })
        }
      }

      await packDoc.ref.update({ currentDay: currentDay + 1 })
      processed++
    }

    // Clean up old screenshots (completed packs, 5+ days old)
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    const oldPacksSnap = await d.collection("packs")
      .where("status", "==", "completed")
      .where("endDate", "<=", fiveDaysAgo)
      .get()

    for (const packDoc of oldPacksSnap.docs) {
      const packId = packDoc.id
      const screenshotsSnap = await d.collection("screenshots")
        .where("packId", "==", packId)
        .get()

      const batch = d.batch()
      for (const doc of screenshotsSnap.docs) {
        const data = doc.data()
        if (data.url) {
          try {
            // Parse Firebase Storage URL to get file path
            const urlParts = data.url.split("/o/")
            if (urlParts.length > 1) {
              const encodedPath = urlParts[1].split("?")[0]
              const filePath = decodeURIComponent(encodedPath)
              // Delete from Storage using fetch (HTTP DELETE with admin token fallback)
              const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""
              if (bucket) {
                const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}`
                await fetch(storageUrl, { method: "DELETE" }).catch(() => {})
              }
            }
          } catch {}
        }
        batch.delete(doc.ref)
      }
      await batch.commit()
      screenshotsCleaned += screenshotsSnap.size
    }

    return NextResponse.json({ processed, screenshotsCleaned, message: "Cron job completed" })
  } catch (error: any) {
    console.error("Cron job error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

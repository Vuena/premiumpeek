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
            const memberObj = pack.members.find((m: any) => m.uid === uid)
            if (memberObj) {
              await packDoc.ref.update({
                members: [...pack.members.filter((m: any) => m.uid !== uid)],
              })
            }
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

    return NextResponse.json({ processed, message: "Cron job completed" })
  } catch (error: any) {
    console.error("Cron job error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

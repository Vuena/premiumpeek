import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const maxDuration = 60

export async function GET(req: NextRequest) {
  try {
    if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }

    const d = adminDb!
    const now = new Date()
    let installTransitions = 0
    let dayProgressed = 0
    let packsCompleted = 0

    // Phase 1: Stuck "installing" packs → transition to "testing" if deadline passed
    const installingSnap = await d.collection("packs").where("status", "==", "installing").get()
    for (const packDoc of installingSnap.docs) {
      const pack = packDoc.data()
      const deadlinePassed = pack.installDeadline?.toMillis() < now.getTime()
      const allConfirmed = pack.members?.every((m: any) => m.type === "premium" || m.installConfirmed)

      if (allConfirmed || deadlinePassed) {
        await packDoc.ref.update({
          status: "testing",
          startDate: now,
          currentDay: 0,
        })
        installTransitions++
      }
    }

    // Phase 2: Process "testing" packs - check daily activity and advance days
    const testingSnap = await d.collection("packs").where("status", "==", "testing").get()
    for (const packDoc of testingSnap.docs) {
      const pack = packDoc.data()
      const packId = packDoc.id
      const currentDay = pack.currentDay ?? 0

      // Day 0 = first CRON run after transition → skip activity check, just advance to day 1
      if (currentDay < 1) {
        await packDoc.ref.update({ currentDay: 1 })
        dayProgressed++
        continue
      }

      if (currentDay >= pack.totalDays) {
        await packDoc.ref.update({ status: "completed", endDate: now })
        packsCompleted++
        continue
      }

      // Check activity for all free members
      for (const member of pack.members || []) {
        if (member.type === "premium") continue
        const uid = member.uid
        const activitySnap = await d.collection("testingActivity")
          .where("packId", "==", packId)
          .where("uid", "==", uid)
          .where("day", "==", currentDay)
          .get()

        const userRef = d.collection("users").doc(uid)
        if (activitySnap.empty) {
          const userSnap = await userRef.get()
          const userData = userSnap.data()
          const missedDays = (userData?.missedDays || 0) + 1
          await userRef.update({ missedDays })

          if (missedDays >= 3) {
            await packDoc.ref.update({
              members: pack.members.filter((m: any) => m.uid !== uid),
              memberUids: pack.memberUids?.filter((u: string) => u !== uid) || [],
            })
            await userRef.update({ missedDays: 0 })

            const userAppsSnap = await d.collection("apps")
              .where("uid", "==", uid)
              .where("packId", "==", packId)
              .get()
            for (const appDoc of userAppsSnap.docs) {
              await appDoc.ref.update({ packId: "", status: "pending" })
            }
          }
        } else {
          await userRef.update({ missedDays: 0 })
        }
      }

      await packDoc.ref.update({ currentDay: currentDay + 1 })
      dayProgressed++
    }

    // Phase 3: Clean up old screenshots (completed packs, 5+ days old)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const oldPacksSnap = await d.collection("packs")
      .where("status", "==", "completed")
      .where("endDate", "<=", fiveDaysAgo)
      .get()

    let screenshotsCleaned = 0
    for (const packDoc of oldPacksSnap.docs) {
      const packId = packDoc.id
      const screenshotsSnap = await d.collection("screenshots")
        .where("packId", "==", packId)
        .get()

      const batch = d.batch()
      for (const doc of screenshotsSnap.docs) {
        batch.delete(doc.ref)
      }
      await batch.commit()
      screenshotsCleaned += screenshotsSnap.size
    }

    return NextResponse.json({
      installTransitions,
      dayProgressed,
      packsCompleted,
      screenshotsCleaned,
      message: "Cron job completed",
    })
  } catch (error: any) {
    console.error("Cron job error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

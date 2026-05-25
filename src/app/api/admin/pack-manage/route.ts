import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdmin } from "@/lib/admin-auth"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    const auth = await verifyAdmin(req)
    if (auth.error) return auth.error

    const { packId, action: op, data } = await req.json()
    if (!packId || !op) {
      return NextResponse.json({ error: "packId ve action gerekli" }, { status: 400 })
    }

    const d = adminDb!
    const packRef = d.collection("packs").doc(packId)
    const packSnap = await packRef.get()
    if (!packSnap.exists) {
      return NextResponse.json({ error: "Pack bulunamadı" }, { status: 404 })
    }

    const validStatuses = ["forming", "installing", "testing", "completed"]

    switch (op) {
      case "changeStatus": {
        const newStatus = data?.status
        if (!newStatus || !validStatuses.includes(newStatus)) {
          return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 })
        }
        await packRef.update({ status: newStatus })
        await log(d, auth.uid, "pack_change_status", { packId, oldStatus: packSnap.data()?.status, newStatus })
        break
      }

      case "addMember": {
        const { uid, email, displayName, role } = data || {}
        if (!uid) {
          return NextResponse.json({ error: "uid gerekli" }, { status: 400 })
        }
        const pack = packSnap.data()!
        if (pack.members?.some((m: any) => m.uid === uid)) {
          return NextResponse.json({ error: "Kullanıcı zaten pack'te" }, { status: 400 })
        }
        if ((pack.members?.length || 0) >= (pack.maxMembers || 18)) {
          return NextResponse.json({ error: "Pack dolu" }, { status: 400 })
        }
        const newMember = {
          uid,
          email: email || "",
          displayName: displayName || "",
          role: role || "member",
          joinedAt: new Date(),
        }
        await packRef.update({
          members: FieldValue.arrayUnion(newMember),
        })
        await log(d, auth.uid, "pack_add_member", { packId, memberUid: uid, memberRole: role || "member" })
        break
      }

      case "removeMember": {
        const { uid: removeUid } = data || {}
        if (!removeUid) {
          return NextResponse.json({ error: "uid gerekli" }, { status: 400 })
        }
        const pack = packSnap.data()!
        const member = pack.members?.find((m: any) => m.uid === removeUid)
        if (!member) {
          return NextResponse.json({ error: "Kullanıcı pack'te bulunamadı" }, { status: 404 })
        }
        await packRef.update({
          members: pack.members.filter((m: any) => m.uid !== removeUid),
        })
        await log(d, auth.uid, "pack_remove_member", { packId, memberUid: removeUid })
        break
      }

      case "delete": {
        await packRef.delete()
        await log(d, auth.uid, "pack_delete", { packId, packName: packSnap.data()?.name || "" })
        break
      }

      default:
        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Pack manage error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function log(d: FirebaseFirestore.Firestore, adminUid: string, action: string, details: any) {
  await d.collection("auditLogs").add({
    adminUid,
    action,
    details,
    createdAt: new Date(),
  })
}

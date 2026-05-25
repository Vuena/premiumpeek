import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAdmin } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    const auth = await verifyAdmin(req)
    if (auth.error) return auth.error

    const { action, appId } = await req.json()
    if (!appId || !action) {
      return NextResponse.json({ error: "appId ve action gerekli" }, { status: 400 })
    }

    switch (action) {
      case "delete": {
        const appSnap = await adminDb!.collection("apps").doc(appId).get()
        if (!appSnap.exists) {
          return NextResponse.json({ error: "Uygulama bulunamadı" }, { status: 404 })
        }
        await adminDb!.collection("apps").doc(appId).delete()
        await adminDb!.collection("auditLogs").add({
          adminUid: auth.uid,
          action: "app_delete",
          details: { appId, appName: appSnap.data()?.appName || "" },
          createdAt: new Date(),
        })
        break
      }

      default:
        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Admin apps error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

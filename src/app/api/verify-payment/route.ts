import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
    }
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    let decoded: any
    try {
      decoded = await adminAuth!.verifyIdToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, txHash, packId, appId } = body

    if (!orderId || !txHash) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 })
    }

    const d = adminDb!
    const orderRef = d.collection("orders").doc(orderId)
    const orderSnap = await orderRef.get()

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 })
    }

    const order = orderSnap.data()!
    if (order.uid !== decoded.uid) {
      return NextResponse.json({ error: "Bu sipariş size ait değil" }, { status: 403 })
    }

    if (order.status !== "awaiting_payment") {
      return NextResponse.json({ error: "Bu sipariş için ödeme beklenmiyor" }, { status: 400 })
    }

    // Store TX hash for admin verification
    const updateData: Record<string, any> = {
      txHash,
      status: "awaiting_confirmation",
      submittedAt: new Date(),
    }
    if (packId) updateData.packId = packId
    if (appId) updateData.appId = appId

    await orderRef.update(updateData)

    return NextResponse.json({
      success: true,
      message: "Ödeme bilgisi kaydedildi. Admin onayından sonra test süreci başlayacak.",
    })
  } catch (error: any) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import type { DecodedIdToken } from "firebase-admin/auth"

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
    let decoded: DecodedIdToken
    try {
      decoded = await adminAuth!.verifyIdToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const d = adminDb!
    const orderRef = d.collection("orders").doc(orderId)
    const orderSnap = await orderRef.get()
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderSnap.data()!
    if (order.uid !== decoded.uid) {
      return NextResponse.json({ error: "You don't have permission to delete this order" }, { status: 403 })
    }

    if (order.status !== "awaiting_payment" && order.status !== "awaiting_confirmation" && order.status !== "paid") {
      return NextResponse.json({ error: "This order cannot be deleted" }, { status: 400 })
    }

    await orderRef.delete()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete order error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
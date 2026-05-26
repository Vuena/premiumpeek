import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import type { DecodedIdToken } from "firebase-admin/auth"

const USDT_WALLET = process.env.NEXT_PUBLIC_USDT_WALLET || ""
const USDT_PRICE = parseInt(process.env.NEXT_PUBLIC_USDT_PRICE || "10")

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

    const body = await req.json()
    const { appName, packageName, googlePlayLink, instructions } = body

    if (!appName || !packageName || !googlePlayLink) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const d = adminDb!
    const orderRef = await d.collection("orders").add({
      uid: decoded.uid,
      userEmail: decoded.email || "",
      userName: decoded.name || "",
      appName,
      packageName,
      googlePlayLink,
      instructions: instructions || "",
      amount: USDT_PRICE,
      currency: "USDT",
      status: "awaiting_payment",
      walletAddress: USDT_WALLET,
      txHash: "",
      testers: [],
      testerCount: 0,
      currentDay: 0,
      totalDays: 16,
      reportIds: [],
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      walletAddress: USDT_WALLET,
      amount: USDT_PRICE,
      currency: "USDT",
      network: "TRC-20",
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
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
    const { appName, packageName, googlePlayLink, instructions } = body

    if (!appName || !packageName || !googlePlayLink) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 })
    }

    const userEmail = decoded.email || decoded.firebase?.identities?.email?.[0] || ""

    const orderData = {
      uid: decoded.uid,
      userEmail,
      userName: decoded.name || "",
      appName,
      packageName,
      googlePlayLink,
      instructions: instructions || "",
      amount: 49900, // 499.00 TL (kuruş)
      currency: "try",
      status: "awaiting_payment",
      testers: [],
      testerCount: 0,
      currentDay: 0,
      totalDays: 16,
      reportIds: [],
      createdAt: new Date(),
    }

    const d = adminDb!
    const orderRef = await d.collection("orders").add(orderData)

    const userSnap = await d.collection("users").doc(decoded.uid).get()
    if (userSnap.exists) {
      const userData = userSnap.data()
      await d.collection("users").doc(decoded.uid).update({
        totalPosted: (userData?.totalPosted || 0) + 1,
      })
    }

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      bank: {
        name: "Ziraat Bankası",
        branch: "İstanbul Kurumsal",
        iban: "TR12 0006 7010 0000 0090 1234 56",
        holder: "PremiumPeek Teknoloji",
        amount: "499,00 TL",
      },
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

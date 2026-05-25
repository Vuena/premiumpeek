import { NextRequest, NextResponse } from "next/server"
import { stripe, PRICE_AMOUNT, PRICE_CURRENCY } from "@/lib/stripe"
import { adminAuth } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const origin = req.headers.get("origin") || "http://localhost:3000"

    const customerEmail = decoded.email || decoded.firebase?.identities?.email?.[0] || ""

    const session = await stripe!.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: PRICE_CURRENCY,
            product_data: {
              name: `Profesyonel Test - ${appName}`,
              description: `25 testçi, 16 gün, para iadesi garantili Google Play test hizmeti`,
            },
            unit_amount: PRICE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        uid: decoded.uid,
        appName,
        packageName,
        googlePlayLink,
        instructions: instructions || "",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

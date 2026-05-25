import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
    }

    const event = stripe!.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const { uid, appName, packageName, googlePlayLink, instructions } = session.metadata

        const orderData = {
          uid,
          userEmail: session.customer_email || "",
          userName: "",
          appName,
          packageName,
          googlePlayLink,
          instructions: instructions || "",
          amount: session.amount_total || 0,
          currency: session.currency || "try",
          status: "paid",
          stripePaymentId: session.payment_intent,
          stripeSessionId: session.id,
          testers: [],
          testerCount: 0,
          currentDay: 0,
          totalDays: 16,
          reportIds: [],
          createdAt: new Date(),
        }

        const d = adminDb!
        const orderRef = await d.collection("orders").add(orderData)

        const userRef = d.collection("users").doc(uid)
        const userSnap = await userRef.get()
        if (userSnap.exists) {
          const userData = userSnap.data()
          await userRef.update({
            totalPosted: (userData?.totalPosted || 0) + 1,
          })
        }

        console.log(`Order created: ${orderRef.id} for user ${uid} - ${appName}`)
        break
      }

      case "checkout.session.expired": {
        console.log("Session expired:", event.data.object.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

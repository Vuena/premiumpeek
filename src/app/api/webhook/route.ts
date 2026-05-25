import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // Stripe webhook - currently disabled. 
  // Manual Havale/EFT payment system is active.
  // Re-enable when Stripe is configured.
  return NextResponse.json({ received: true })
}

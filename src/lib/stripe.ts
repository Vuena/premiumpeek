import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY
let stripe: Stripe | null = null

if (stripeKey) {
  stripe = new Stripe(stripeKey, { apiVersion: Stripe.API_VERSION })
}

export { stripe }

export const PRICE_AMOUNT = 499
export const PRICE_CURRENCY = "try"
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

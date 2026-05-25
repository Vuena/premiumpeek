import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY
let stripe: Stripe | null = null

if (stripeKey) {
  stripe = new Stripe(stripeKey)
}

export { stripe }

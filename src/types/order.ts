export type OrderStatus = "pending" | "paid" | "testing" | "completed" | "refunded"

export interface Order {
  id: string
  uid: string
  userEmail: string
  userName: string
  appName: string
  packageName: string
  googlePlayLink: string
  instructions: string
  amount: number
  currency: string
  status: OrderStatus
  stripePaymentId?: string
  stripeSessionId?: string
  testers: string[]
  testerCount: number
  currentDay: number
  totalDays: number
  reportIds: string[]
  startedAt?: Date
  completedAt?: Date
  refundReason?: string
  createdAt: Date
}

export const ORDER_PRICE = 499
export const ORDER_CURRENCY = "TRY"
export const ORDER_TESTER_COUNT = 25
export const ORDER_TOTAL_DAYS = 16

export type OrderStatus = "awaiting_payment" | "paid" | "testing" | "completed" | "refunded"

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
  txHash?: string
  walletAddress?: string
  testers: string[]
  testerCount: number
  currentDay: number
  totalDays: number
  reportIds: string[]
  startedAt?: Date
  paidAt?: Date
  completedAt?: Date
  refundReason?: string
  createdAt: Date
}

export const ORDER_PRICE_USDT = 10
export const ORDER_CURRENCY = "USDT"
export const ORDER_TESTER_COUNT = 18
export const ORDER_TOTAL_DAYS = 16

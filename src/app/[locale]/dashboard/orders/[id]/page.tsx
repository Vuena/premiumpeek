"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOrderById } from "@/lib/firestore"
import { Loader2, ArrowLeft, Clock, CheckCircle2, CreditCard } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"
import type { Order } from "@/types/order"
import { useTranslations, useLocale } from "next-intl"
import { useToast } from "@/context/ToastContext"

export default function OrderDetailPage() {
  const t = useTranslations("DashboardOrders")
  const t2 = useTranslations("PurchasePage")
  const locale = useLocale()
  usePageMeta({ title: t("orderDetailTitle") })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast: addToast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    ;(async () => {
      try {
        await loadOrder()
      } catch (err) {
        addToast("error", t("loadError")); console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadOrder = async () => {
    if (!user || !params.id) return
    const data = await getOrderById(params.id as string)
    if (!data || (data as Order).uid !== user.uid) {
      router.push("/dashboard/orders")
      return
    }
    setOrder(data as Order)
    setLoading(false)
  }

  const statusLabels: Record<string, string> = {
    awaiting_payment: t("statusAwaitingPayment"),
    awaiting_confirmation: t("statusAwaitingConfirmation"),
    paid: t("statusPaid"),
    testing: t("statusTesting"),
    completed: t("statusCompleted"),
    refunded: t("statusRefunded"),
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!order) return <div className="text-center py-20 text-zinc-500">{t("notFound")}</div>

  const progress = (order.currentDay ?? 0) > 0 && (order.totalDays ?? 0) > 0 ? Math.round(((order.currentDay ?? 0) / (order.totalDays ?? 1)) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToOrders")}
      </Link>

      <div className="grid gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">{order.appName}</h1>
                <p className="text-sm text-zinc-500">{order.packageName}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${order.status === "testing" ? "bg-green-100 dark:bg-green-950/30 text-green-700" : order.status === "awaiting_payment" ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700" : order.status === "awaiting_confirmation" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700" : order.status === "completed" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            {order.status === "testing" && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-zinc-500 mb-2">
                  <span>{t("progress")}</span>
                  <span>{t("daysProgress", { current: order.currentDay || 0, total: order.totalDays })}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">{t("amount")}</span>
                <p className="font-medium">{order.amount} {order.currency}</p>
              </div>
              <div>
                <span className="text-zinc-500">{t("testerCount")}</span>
                <p className="font-medium">{order.testerCount || 0} / 18</p>
              </div>
              {order.txHash && (
                <div className="col-span-2">
                  <span className="text-zinc-500">{t2("txHash")}</span>
                  <p className="font-mono text-xs break-all">{order.txHash}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {order.status === "awaiting_payment" && (
          <Card className="border-0 shadow-sm bg-yellow-50 dark:bg-yellow-950/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">{t("paymentPending")}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t("paymentPendingDesc", { amount: order.amount })}
              </p>
              <Link href={"/purchase"}>
                <Button size="sm">{t("completePayment")}</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {order.status === "paid" && (
          <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">{t("paymentReceived")}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t("paymentReceivedDesc")}
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === "testing" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">{t("dailyStatus")}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {Array.from({ length: order.totalDays }).map((_, i) => {
                  const day = i + 1
                  const done = day < (order.currentDay || 0)
                  const current = day === (order.currentDay || 0)
                  return (
                    <div key={day} className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                      done ? "bg-green-100 dark:bg-green-950/30 text-green-700" :
                      current ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 ring-2 ring-blue-500" :
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}>
                      {day}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "completed" && (
          <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-950/30">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">{t("testComplete")}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t("testCompleteDesc")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

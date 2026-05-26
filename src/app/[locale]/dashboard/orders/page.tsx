"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getUserOrders } from "@/lib/firestore"
import { useToast } from "@/context/ToastContext"
import { Loader2, Clock, CheckCircle2, CreditCard, Trash2 } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"
import type { Order } from "@/types/order"
import { useTranslations } from "next-intl"

export default function OrdersPage() {
  const t = useTranslations("DashboardOrders")
  usePageMeta({ title: t("pageTitle") })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast: addToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    ;(async () => {
      try {
        await loadOrders()
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadOrders = async () => {
    try {
      if (!user) return
      const data = await getUserOrders(user.uid)
      setOrders(data as Order[])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const statusLabels: Record<string, string> = {
    awaiting_payment: t("statusAwaitingPayment"),
    awaiting_confirmation: t("statusAwaitingConfirmation"),
    paid: t("statusPaid"),
    testing: t("statusTesting"),
    completed: t("statusCompleted"),
    refunded: t("statusRefunded"),
  }

  const statusColors: Record<string, string> = {
    awaiting_payment: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700",
    awaiting_confirmation: "bg-blue-100 dark:bg-blue-950/30 text-blue-700",
    paid: "bg-blue-100 dark:bg-blue-950/30 text-blue-700",
    testing: "bg-green-100 dark:bg-green-950/30 text-green-700",
    completed: "bg-green-100 dark:bg-green-950/30 text-green-700",
    refunded: "bg-red-100 dark:bg-red-950/30 text-red-700",
  }

  const handleDelete = async (orderId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(t("deleteConfirm"))) return
    if (!db) {
      addToast("error", t("dbError"))
      return
    }
    try {
      await deleteDoc(doc(db, "orders", orderId))
      setOrders(prev => prev.filter(o => o.id !== orderId))
      addToast("success", t("deleteSuccess"))
    } catch (err: any) {
      addToast("error", err.message || t("deleteError"))
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("subtitle")}</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">{t("noOrdersTitle")}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {t("noOrdersDesc")}
            </p>
            <Link href="/purchase"><Button>{t("quickTest")}</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div key={order.id}>
              <Link href={`/dashboard/orders/${order.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${order.status === "testing" ? "bg-green-50 dark:bg-green-950/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                          {order.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                           order.status === "testing" ? <Clock className="h-5 w-5 text-green-600" /> :
                           <CreditCard className="h-5 w-5 text-zinc-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{order.appName}</p>
                          <p className="text-xs text-zinc-500">{order.packageName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || ""}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                          <p className="text-xs text-zinc-400 mt-1">{order.amount} {order.currency}</p>
                        </div>
                        {(order.status === "awaiting_payment" || order.status === "awaiting_confirmation" || order.status === "paid") && (
                          <button onClick={(e) => handleDelete(order.id, e)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-600 hover:border-red-300 transition-all shrink-0 cursor-pointer" title={t("deleteOrder")}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

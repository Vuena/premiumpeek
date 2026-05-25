"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserOrders, deleteOrder } from "@/lib/firestore"
import { Loader2, Clock, CheckCircle2, CreditCard, Trash2 } from "lucide-react"

const statusLabels: Record<string, string> = {
  awaiting_payment: "Ödeme Bekliyor",
  paid: "Ödendi (Onay Bekliyor)",
  testing: "Test Ediliyor",
  completed: "Tamamlandı",
  refunded: "İade Edildi",
}

const statusColors: Record<string, string> = {
  awaiting_payment: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700",
  paid: "bg-blue-100 dark:bg-blue-950/30 text-blue-700",
  testing: "bg-green-100 dark:bg-green-950/30 text-green-700",
  completed: "bg-green-100 dark:bg-green-950/30 text-green-700",
  refunded: "bg-red-100 dark:bg-red-950/30 text-red-700",
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadOrders()
  }, [user, authLoading])

  const loadOrders = async () => {
    if (!user) return
    const data = await getUserOrders(user.uid)
    setOrders(data as any[])
    setLoading(false)
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm("Siparişi silmek istediğine emin misin?")) return
    try {
      await deleteOrder(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err: any) {
      alert(err.message || "Silinirken hata oluştu")
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Siparişlerim</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Profesyonel test siparişlerin</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Henüz siparişin yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Profesyonel test hizmeti ile               18 testçiyi pack'ine ekleyelim uygulamana atayalım.
            </p>
            <Link href="/purchase"><Button>Hızlı Test Başlat ($10 USDT)</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="relative group">
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
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || ""}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                        <p className="text-xs text-zinc-400 mt-1">{order.amount} {order.currency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              {(order.status === "awaiting_payment" || order.status === "paid") && (
                <button onClick={() => handleDelete(order.id)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-600 hover:border-red-300 transition-all cursor-pointer" title="Siparişi Sil">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

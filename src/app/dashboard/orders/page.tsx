"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Clock, CheckCircle2, AlertCircle, Loader2, CreditCard, ArrowRight, Ban } from "lucide-react"

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
    const d = db!
    const q = query(collection(d, "orders"), where("uid", "==", user!.uid), orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
    pending: { icon: AlertCircle, label: "Bekliyor", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30" },
    paid: { icon: Clock, label: "Test Başlayacak", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    testing: { icon: Clock, label: "Test Ediliyor", color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
    completed: { icon: CheckCircle2, label: "Tamamlandı", color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
    refunded: { icon: Ban, label: "İade Edildi", color: "text-red-600 bg-red-50 dark:bg-red-950/30" },
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Siparişlerim</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Profesyonel test siparişlerin</p>
        </div>
        <Link href="/#pricing">
          <Button className="gap-2"><CreditCard size={16} /> Yeni Sipariş</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Henüz siparişin yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Profesyonel test hizmeti ile 25 testçiyi 6 saat içinde uygulamana atayalım.
            </p>
            <Link href="/#pricing"><Button>Profesyonel Test Başlat (₺499)</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const cfg = statusConfig[order.status] || statusConfig.pending
            const Icon = cfg.icon
            return (
              <Card key={order.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{order.appName}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{order.packageName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          <span className={`font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-zinc-400">₺{(order.amount / 100).toFixed(0)}</span>
                          {order.status === "testing" && (
                            <span className="text-zinc-400">Gün {order.currentDay}/{order.totalDays}</span>
                          )}
                          {order.testerCount > 0 && (
                            <span className="text-zinc-400">{order.testerCount}/25 testçi</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="ghost" size="sm"><ArrowRight size={16} /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

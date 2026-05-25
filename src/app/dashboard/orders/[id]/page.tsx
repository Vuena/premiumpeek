"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft, Clock, CheckCircle2, Ban, Loader2, ExternalLink, Users, Calendar } from "lucide-react"

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadOrder()
  }, [user, authLoading, params.id])

  const loadOrder = async () => {
    const d = db!
    const snap = await getDoc(doc(d, "orders", params.id as string))
    if (snap.exists()) {
      const data = snap.data()
      if (data.uid !== user!.uid) {
        router.push("/dashboard/orders")
        return
      }
      setOrder({ id: snap.id, ...data })
    }
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!order) return <div className="text-center py-16 text-zinc-500">Sipariş bulunamadı.</div>

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
    paid: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
    testing: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
    completed: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
    refunded: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Siparişlerim
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{order.appName}</h1>
          <p className="text-sm text-zinc-500">{order.packageName}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || ""}`}>
          {order.status}
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: "Testçi", value: `${order.testerCount || 0}/${order.totalDays || 25}` },
          { icon: Calendar, label: "İlerleme", value: order.status === "testing" ? `Gün ${order.currentDay}/${order.totalDays}` : order.status },
          { icon: Clock, label: "Durum", value: order.status === "completed" ? "Tamamlandı" : order.status === "paid" ? "Test başlatılacak" : order.status },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2 text-zinc-500" />
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-zinc-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between text-sm py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Ücret</span>
            <span className="font-medium">₺{(order.amount / 100).toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Ödeme</span>
            <span className="font-medium">{order.stripePaymentId ? "Onaylandı" : "Beklemede"}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Google Play</span>
            <a href={order.googlePlayLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              Aç <ExternalLink size={12} />
            </a>
          </div>
          {order.instructions && (
            <div className="text-sm py-2">
              <span className="text-zinc-500 block mb-1">Talimatlar</span>
              <p className="text-zinc-700 dark:text-zinc-300">{order.instructions}</p>
            </div>
          )}
          {order.refundReason && (
            <div className="text-sm py-2">
              <span className="text-red-600 font-medium block mb-1">İade Sebebi</span>
              <p className="text-red-600/80">{order.refundReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

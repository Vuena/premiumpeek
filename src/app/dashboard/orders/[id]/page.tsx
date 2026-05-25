"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOrderById } from "@/lib/firestore"
import { Loader2, ArrowLeft, Clock, CheckCircle2, CreditCard } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"

const statusLabels: Record<string, string> = {
  awaiting_payment: "Ödeme Bekliyor",
  awaiting_confirmation: "TX Hash Gönderildi",
  paid: "Ödendi (Onay Bekliyor)",
  testing: "Test Ediliyor",
  completed: "Tamamlandı",
  refunded: "İade Edildi",
}

export default function OrderDetailPage() {
  usePageMeta({ title: "Sipariş Detayı | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadOrder()
  }, [user, authLoading])

  const loadOrder = async () => {
    if (!user || !params.id) return
    const data = await getOrderById(params.id as string)
    if (!data || (data as any).uid !== user.uid) {
      router.push("/dashboard/orders")
      return
    }
    setOrder(data)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!order) return null

  const progress = order.totalDays > 0 ? Math.round((order.currentDay / order.totalDays) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Siparişlerim
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
                  <span>İlerleme</span>
                  <span>{order.currentDay || 0} / {order.totalDays} gün</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Tutar</span>
                <p className="font-medium">{order.amount} {order.currency}</p>
              </div>
              <div>
                <span className="text-zinc-500">Testçi</span>
                <p className="font-medium">{order.testerCount || 0} / 18</p>
              </div>
              {order.txHash && (
                <div className="col-span-2">
                  <span className="text-zinc-500">TX Hash</span>
                  <p className="font-mono text-xs break-all">{order.txHash}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {order.status === "awaiting_payment" && (
          <Card className="border-0 shadow-sm bg-yellow-50 dark:bg-yellow-950/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Ödeme Bekleniyor</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {order.amount} USDT (TRC-20) gönder, TX Hash'ini gir.
              </p>
              <Link href={`/purchase`}>
                <Button size="sm">Ödemeyi Tamamla</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {order.status === "paid" && (
          <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Ödeme Alındı, Onay Bekliyor</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Admin ödemeyi onayladıktan sonra test süreci başlayacak.
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === "testing" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Günlük Test Durumu</h3>
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
              <h3 className="font-semibold text-lg mb-2">Test Süreci Tamamlandı!</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Google Play production access başvurusu için hazırsın.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllOrdersAdmin, updateOrderStatus, assignTestersToOrder } from "@/lib/firestore"
import { logAudit } from "@/lib/useAuditLog"
import { Loader2, ArrowLeft, CreditCard, CheckCircle2, Ban, Search, Users, ExternalLink } from "lucide-react"
import Link from "next/link"
import { usePageMeta } from "@/lib/usePageMeta"

export default function AdminOrdersPage() {
  usePageMeta({ title: "Siparişler | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    ;(async () => { try { await loadOrders() } catch { setOrders([]) } finally { setLoading(false) } })()
  }, [user, authLoading, router])

  const loadOrders = async () => {
    const data = await getAllOrdersAdmin()
    setOrders(data as any[])
  }

  const updateStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status)
    await logAudit("order_status_update", { orderId: id, newStatus: status })
    loadOrders()
  }

  const handleAssignTesters = async (id: string) => {
    const uids = await assignTestersToOrder(id, 18)
    await logAudit("order_assign_testers", { orderId: id })
    loadOrders()
  }

const statusLabels: Record<string, string> = {
  awaiting_payment: "Ödeme Bekliyor",
  awaiting_confirmation: "TX Hash Gönderildi",
  paid: "Ödendi (Onay Bekliyor)",
  testing: "Test Ediliyor",
  completed: "Tamamlandı",
  refunded: "İade Edildi",
}

const statusColors: Record<string, string> = {
  awaiting_payment: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700",
  awaiting_confirmation: "bg-blue-100 dark:bg-blue-950/30 text-blue-700",
  paid: "bg-blue-100 dark:bg-blue-950/30 text-blue-700",
  testing: "bg-green-100 dark:bg-green-950/30 text-green-700",
  completed: "bg-green-100 dark:bg-green-950/30 text-green-700",
  refunded: "bg-red-100 dark:bg-red-950/30 text-red-700",
}

  const filtered = orders.filter(o =>
    (o.appName || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.userEmail || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Admin Paneli
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Siparişler ({orders.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." aria-label="Sipariş ara" className="h-10 w-full sm:w-64 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Uygulama</th>
              <th className="text-left px-4 py-3 font-medium">Kullanıcı</th>
              <th className="text-center px-4 py-3 font-medium">Tutar</th>
              <th className="text-center px-4 py-3 font-medium">TX Hash</th>
              <th className="text-center px-4 py-3 font-medium">Durum</th>
              <th className="text-center px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="hidden md:table-row-group">
            {filtered.map((o: any) => (
              <tr key={o.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{o.appName}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[200px]">{o.packageName}</p>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{o.userEmail || o.uid?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-center font-medium">${o.amount} {o.currency}</td>
                <td className="px-4 py-3 text-center">
                  {o.txHash ? (
                    <a href={`https://tronscan.org/#/transaction/${o.txHash}`} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs">
                      {o.txHash.slice(0, 8)}... <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || ""}`}>{statusLabels[o.status] || o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {o.status === "awaiting_confirmation" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "paid")} title="Ödeme Onayla">
                        <CreditCard size={14} className="text-blue-600" />
                      </Button>
                    )}
                    {o.status === "paid" && (
                      <Button variant="ghost" size="sm" onClick={() => handleAssignTesters(o.id)} title="Testçi Ata">
                        <Users size={14} className="text-green-600" />
                      </Button>
                    )}
                    {o.status === "testing" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "completed")} title="Tamamla">
                        <CheckCircle2 size={14} className="text-green-600" />
                      </Button>
                    )}
                    {o.status !== "refunded" && o.status !== "completed" && (
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("İade et?")) updateStatus(o.id, "refunded") }} title="İade Et">
                        <Ban size={14} className="text-red-600" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden space-y-4">
        {filtered.map((o: any) => (
          <Card key={o.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium truncate">{o.appName}</p>
                  <p className="text-xs text-zinc-500 truncate">{o.packageName}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColors[o.status] || ""}`}>{statusLabels[o.status] || o.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="text-zinc-500">
                  <span className="text-xs">Kullanıcı</span>
                  <p className="font-medium text-xs truncate">{o.userEmail || o.uid?.slice(0, 8)}</p>
                </div>
                <div className="text-zinc-500">
                  <span className="text-xs">Tutar</span>
                  <p className="font-medium">${o.amount} {o.currency}</p>
                </div>
              </div>
              {o.txHash && (
                <div className="mb-3">
                  <span className="text-xs text-zinc-500">TX:</span>
                  <a href={`https://tronscan.org/#/transaction/${o.txHash}`} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs ml-1">
                    {o.txHash.slice(0, 8)}... <ExternalLink size={10} />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {o.status === "awaiting_confirmation" && (
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "paid")} title="Ödeme Onayla">
                    <CreditCard size={14} className="text-blue-600" />
                  </Button>
                )}
                {o.status === "paid" && (
                  <Button variant="ghost" size="sm" onClick={() => handleAssignTesters(o.id)} title="Testçi Ata">
                    <Users size={14} className="text-green-600" />
                  </Button>
                )}
                {o.status === "testing" && (
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "completed")} title="Tamamla">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </Button>
                )}
                {o.status !== "refunded" && o.status !== "completed" && (
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("İade et?")) updateStatus(o.id, "refunded") }} title="İade Et">
                    <Ban size={14} className="text-red-600" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

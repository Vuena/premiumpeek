"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, ArrowLeft, CreditCard, Clock, CheckCircle2, Ban, Search } from "lucide-react"
import Link from "next/link"

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    loadOrders()
  }, [user, authLoading])

  const loadOrders = async () => {
    const d = db!
    const snap = await getDocs(query(collection(d, "orders"), orderBy("createdAt", "desc")))
    setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const d = db!
    await updateDoc(doc(d, "orders", id), { status })
    loadOrders()
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700",
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Siparişler ({orders.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." className="h-10 w-64 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Uygulama</th>
              <th className="text-left px-4 py-3 font-medium">Kullanıcı</th>
              <th className="text-center px-4 py-3 font-medium">Tutar</th>
              <th className="text-center px-4 py-3 font-medium">Durum</th>
              <th className="text-center px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: any) => (
              <tr key={o.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{o.appName}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[200px]">{o.packageName}</p>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{o.userEmail || o.uid?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-center font-medium">₺{(o.amount / 100).toFixed(0)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || ""}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {o.status === "paid" && <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "testing")} title="Teste Başlat"><Clock size={14} className="text-green-600" /></Button>}
                    {o.status === "testing" && <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "completed")} title="Tamamla"><CheckCircle2 size={14} className="text-green-600" /></Button>}
                    {o.status !== "refunded" && <Button variant="ghost" size="sm" onClick={() => { if (confirm("İade et?")) updateStatus(o.id, "refunded") }} title="İade Et"><Ban size={14} className="text-red-600" /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

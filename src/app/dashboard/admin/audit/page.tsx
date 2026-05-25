"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/lib/firebase"
import { Loader2, ArrowLeft, Search } from "lucide-react"

const actionLabels: Record<string, string> = {
  user_ban_toggle: "Kullanıcı Ban/Unban",
  order_status_update: "Sipariş Durumu",
  order_assign_testers: "Testçi Ata",
  pack_delete: "Pack Sil",
  pack_change_status: "Pack Durum Değişimi",
  pack_add_member: "Üye Ekle",
  pack_remove_member: "Üye Çıkar",
  app_delete: "Uygulama Sil",
  complaint_resolve: "Şikayet Çöz",
  send_email: "E-posta Gönder",
}

export default function AdminAuditPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { document.title = "Denetim Kaydı | PremiumPeek" }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    loadLogs()
  }, [user, authLoading])

  const loadLogs = async () => {
    try {
      const token = await auth!.currentUser!.getIdToken()
      const res = await fetch("/api/admin/audit-log?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) {
      console.error("Failed to load audit logs:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter(l =>
    (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(l.details || {}).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Admin Paneli
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Denetim Kaydı</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." aria-label="Kayıt ara" className="h-10 w-full sm:w-64 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Zaman</th>
              <th className="text-left px-4 py-3 font-medium">İşlem</th>
              <th className="text-left px-4 py-3 font-medium">Detay</th>
            </tr>
          </thead>
          <tbody className="hidden md:table-row-group">
            {filtered.map((l: any) => (
              <tr key={l.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                  {l.createdAt ? new Date(l.createdAt).toLocaleString("tr-TR") : "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {actionLabels[l.action] || l.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 max-w-md truncate">
                  {JSON.stringify(l.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden space-y-3 mt-4">
        {filtered.map((l: any) => (
          <Card key={l.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">{l.createdAt ? new Date(l.createdAt).toLocaleString("tr-TR") : "-"}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {actionLabels[l.action] || l.action}
                </span>
              </div>
              <p className="text-xs text-zinc-500 truncate">{JSON.stringify(l.details)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

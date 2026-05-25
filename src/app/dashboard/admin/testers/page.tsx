"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getAvailableTesters } from "@/lib/firestore"
import { Loader2, ArrowLeft, Users, Search } from "lucide-react"

export default function AdminTestersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [testers, setTesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    loadTesters()
  }, [user, authLoading])

  const loadTesters = async () => {
    const data = await getAvailableTesters()
    setTesters(data)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const filtered = testers.filter((t: any) =>
    (t.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.email || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Admin Paneli
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testçi Havuzu ({testers.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." className="h-10 w-64 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">İsim</th>
              <th className="text-left px-4 py-3 font-medium">E-posta</th>
              <th className="text-center px-4 py-3 font-medium">Kredi</th>
              <th className="text-center px-4 py-3 font-medium">Katılma</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: any) => (
              <tr key={t.uid} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium">{t.displayName || "İsimsiz"}</td>
                <td className="px-4 py-3 text-zinc-500">{t.email || "-"}</td>
                <td className="px-4 py-3 text-center">{t.credits ?? 0} 🪙</td>
                <td className="px-4 py-3 text-center text-xs text-zinc-500">
                  {t.testerSince?.toDate?.()?.toLocaleDateString("tr-TR") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getAvailableTesters } from "@/lib/firestore"
import { Loader2, ArrowLeft, Users, Search } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"

export default function AdminTestersPage() {
  const t = useTranslations("AdminTesters")
  const locale = useLocale()
  usePageMeta({ title: t("metaTitle") })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [testers, setTesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    ;(async () => { try { await loadTesters() } catch { setTesters([]) } finally { setLoading(false) } })()
  }, [user, authLoading, router])

  const loadTesters = async () => {
    const data = await getAvailableTesters()
    setTesters(data)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const filtered = testers.filter((t: any) =>
    (t.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.email || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToAdmin")}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("title", { count: testers.length })}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} aria-label={t("searchLabel")} className="h-10 w-full sm:w-64 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("tableName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("tableEmail")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("tableSince")}</th>
            </tr>
          </thead>
          <tbody className="hidden md:table-row-group">
            {filtered.map((t: any) => (
              <tr key={t.uid} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium">{t.displayName || t("noName")}</td>
                <td className="px-4 py-3 text-zinc-500">{t.email || t("noEmail")}</td>
                <td className="px-4 py-3 text-center text-xs text-zinc-500">
                  {t.testerSince?.toDate?.()?.toLocaleDateString(locale) || t("noEmail")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden space-y-3 mt-4">
        {filtered.map((t: any) => (
          <Card key={t.uid} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium shrink-0">
                  {(t.displayName || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.displayName || t("noName")}</p>
                  <p className="text-xs text-zinc-500 truncate">{t.email || t("noEmail")}</p>
                </div>
                <span className="text-xs text-zinc-500 shrink-0">
                  {t.testerSince?.toDate?.()?.toLocaleDateString(locale) || t("noEmail")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

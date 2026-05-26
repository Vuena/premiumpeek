"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, FileText, Plus, ArrowRight } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"
import { useTranslations, useLocale } from "next-intl"

export default function ReportsPage() {
  const t = useTranslations("DashboardReports")
  const locale = useLocale()
  usePageMeta({ title: t("pageTitle") })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    ;(async () => {
      try {
        await loadReports()
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadReports = async () => {
    if (!db) { return }
    const d = db
    const q = query(collection(d, "reports"), where("uid", "==", user!.uid))
    const snap = await getDocs(q)
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    items.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
    setReports(items)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowRight size={16} className="rotate-180" /> {t("backToDashboard")}
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t("subtitle")}</p>
        </div>
        <Link href="/dashboard/reports/new">
          <Button className="gap-2"><Plus size={16} /> {t("newReport")}</Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
            <p className="text-sm text-zinc-500 mb-4">{t("noReports")}</p>
            <Link href="/dashboard/reports/new"><Button>{t("createReport")}</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <Link key={r.id} href={`/dashboard/reports/${r.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{t("reportLabel", { count: r.items?.length || 0 })}</p>
                    <p className="text-xs text-zinc-500">{r.createdAt?.toDate?.()?.toLocaleDateString(locale === "en" ? "en-US" : "tr-TR") || "—"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

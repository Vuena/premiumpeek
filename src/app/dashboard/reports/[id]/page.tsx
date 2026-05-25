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
import { ArrowLeft, Loader2, Download } from "lucide-react"

export default function ReportDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { document.title = "Rapor Detayı | PremiumPeek" }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadReport()
  }, [user, authLoading])

  const loadReport = async () => {
    const snap = await getDoc(doc(db!, "reports", params.id as string))
    if (!snap.exists() || snap.data().uid !== user!.uid) {
      router.push("/dashboard/reports")
      return
    }
    setReport({ id: snap.id, ...snap.data() })
    setLoading(false)
  }

  const handleDownload = () => {
    if (!report) return
    const dateStr = report.createdAt?.toDate?.()?.toLocaleDateString("tr-TR") || ""
    let html = `<html><head><meta charset="utf-8"><style>
      body{font-family:sans-serif;padding:40px;color:#18181b}
      h1{font-size:24px;margin-bottom:4px}
      .meta{color:#71717a;font-size:14px;margin-bottom:24px}
      table{width:100%;border-collapse:collapse}
      th{background:#f4f4f5;text-align:left;padding:10px 12px;font-size:13px}
      td{padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:13px}
      .b{color:#dc2626;font-weight:600}.u{color:#2563eb;font-weight:600}.f{color:#16a34a;font-weight:600}
      .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa}
    </style></head><body>
    <h1>Test Raporu</h1>
    <div class="meta">Tarih: ${dateStr}</div>
    <table><thead><tr><th>#</th><th>Tür</th><th>Açıklama</th></tr></thead><tbody>`
    report.items.forEach((item: any, i: number) => {
      const cls = item.type === "bug" ? "b" : item.type === "uiux" ? "u" : item.type === "feature" ? "f" : ""
      const lbl = item.type === "bug" ? "Hata" : item.type === "uiux" ? "UI/UX" : item.type === "feature" ? "Öneri" : "Diğer"
      html += `<tr><td>${i+1}</td><td class="${cls}">${lbl}</td><td>${item.description}</td></tr>`
    })
    html += `</tbody></table><div class="footer">PremiumPeek - Test Raporu</div></body></html>`
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url; a.download = `rapor-${report.id}.html`
    a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!report) return null

  const typeLabels: Record<string, string> = { bug: "Hata", uiux: "UI/UX", feature: "Öneri", other: "Diğer" }
  const typeColors: Record<string, string> = { bug: "text-red-600 bg-red-50 dark:bg-red-950/30", uiux: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", feature: "text-green-600 bg-green-50 dark:bg-green-950/30", other: "text-zinc-600 bg-zinc-50 dark:bg-zinc-800" }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/reports" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Raporlarım
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rapor Detayı</h1>
          <p className="text-sm text-zinc-500 mt-1">{report.createdAt?.toDate?.()?.toLocaleDateString("tr-TR") || ""}</p>
        </div>
        <Button onClick={handleDownload} className="gap-2"><Download size={16} /> HTML İndir</Button>
      </div>

      <div className="space-y-2">
        {report.items.map((item: any, i: number) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-start gap-4">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${typeColors[item.type] || typeColors.other}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium mb-1 ${typeColors[item.type]?.split(" ")[0] || ""}`}>
                  {typeLabels[item.type] || typeLabels.other}
                </p>
                <p className="text-sm whitespace-pre-wrap">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getComplaints, resolveComplaint, type Complaint } from "@/lib/firestore"
import { logAudit } from "@/lib/useAuditLog"
import { ArrowLeft, Loader2, Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { usePageMeta } from "@/lib/usePageMeta"

export default function AdminComplaintsPage() {
  const t = useTranslations("AdminComplaints")
  usePageMeta({ title: t("metaTitle") })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    if ((user as any).role !== "admin") { router.push("/dashboard"); return }
    loadComplaints()
  }, [user, authLoading, router])

  const loadComplaints = async () => {
    try {
      const data = await getComplaints()
      setComplaints(data)
    } catch (err) { console.error("Failed to load complaints:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (complaintId: string, action: "resolved" | "dismissed") => {
    setProcessing(complaintId)
    try {
      const complaint = complaints.find(c => c.id === complaintId)
      await resolveComplaint(complaintId, action)
      await logAudit("complaint_resolve", { complaintId, action, appName: complaint?.appName || "" })
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: action } : c))
    } catch (err) { console.error("Failed to resolve complaint:", err)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const pendingComplaints = complaints.filter(c => c.status === "pending")
  const resolvedComplaints = complaints.filter(c => c.status !== "pending")

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToAdmin")}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {pendingComplaints.length > 0 ? t("pendingCount", { count: pendingComplaints.length }) : t("noPending")}
          </p>
        </div>
      </div>

      {pendingComplaints.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {t("pendingTitle")}
          </h2>
          {pendingComplaints.map(complaint => (
            <Card key={complaint.id} className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      <h3 className="font-medium text-sm">{complaint.appName}</h3>
                    </div>
                    <p className="text-xs text-muted mb-1">
                      <strong>{t("complainedBy")}</strong> {complaint.complainedByName}
                    </p>
                    <p className="text-xs text-muted mb-1">
                      <strong>{t("complainedTarget")}</strong> {complaint.targetName} (UID: {complaint.targetUid.slice(0, 8)}...)
                    </p>
                    <p className="text-xs text-muted mb-1">
                      <strong>{t("packId")}</strong> {complaint.packId}
                    </p>
                    <p className="text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg mt-2">
                      <strong>{t("reason")}</strong> {complaint.reason}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="destructive" onClick={() => handleResolve(complaint.id, "resolved")} disabled={processing === complaint.id}>
                      {processing === complaint.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 size={14} />}
                      {t("resolveBtn")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(complaint.id, "dismissed")} disabled={processing === complaint.id}>
                      <XCircle size={14} />
                      {t("dismissBtn")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resolvedComplaints.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            {t("resolvedTitle")}
          </h2>
          <div className="space-y-2">
            {resolvedComplaints.map(complaint => (
              <Card key={complaint.id} className="border-0 shadow-sm opacity-60">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {complaint.status === "resolved" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{complaint.appName}</p>
                      <p className="text-xs text-zinc-500 truncate">{complaint.reason}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    complaint.status === "resolved" ? "bg-green-100 dark:bg-green-950/30 text-green-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}>
                    {complaint.status === "resolved" ? t("statusResolved") : t("statusDismissed")}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {complaints.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-sm">{t("empty")}</p>
        </div>
      )}
    </div>
  )
}

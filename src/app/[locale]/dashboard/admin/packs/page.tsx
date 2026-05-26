"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Loader2, ArrowLeft, Trash2, Clock, CheckCircle2, AlertCircle, Settings, Plus, X } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { usePageMeta } from "@/lib/usePageMeta"
import { useToast } from "@/context/ToastContext"

const validStatuses = ["forming", "installing", "testing", "completed"]

export default function AdminPacksPage() {
  const t = useTranslations("AdminPacks")
  usePageMeta({ title: t("metaTitle") })
  const { user, loading: authLoading } = useAuth()
  const { toast: addToast } = useToast()
  const router = useRouter()
  const [packs, setPacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [addUid, setAddUid] = useState("")
  const [removeUid, setRemoveUid] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    ;(async () => {
      try {
        await loadPacks()
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadPacks = async () => {
    if (!db) { return }
    const d = db
    const snap = await getDocs(query(collection(d, "packs"), orderBy("createdAt", "desc"), limit(50)))
    setPacks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const deletePack = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return
    await handleAction(id, "delete", {})
  }

  const handleAction = async (packId: string, action: string, data: any) => {
    setActionLoading(`${action}-${packId}`)
    setActionError("")
    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) { setActionError(t("actionErrorSession")); setActionLoading(null); return }
      const res = await fetch("/api/admin/pack-manage", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packId, action, data }),
      })
      const result = await res.json()
      if (!res.ok) { setActionError(result.error || t("actionErrorFailed")); addToast("error", result.error || t("actionErrorFailed")); return }
      addToast("success", t("actionSuccess"))
      loadPacks()
    } catch (err: any) {
      setActionError(err.message || t("actionErrorGeneric"))
      addToast("error", err.message || t("actionErrorGeneric"))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToAdmin")}
      </Link>
      <h1 className="text-2xl font-bold mb-6">{t("title", { count: packs.length })}</h1>

      {actionError && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600">{actionError}</div>
      )}

      <div className="space-y-3">
        {packs.map(p => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    p.status === "testing" ? "bg-green-50 dark:bg-green-950/30" :
                    p.status === "installing" ? "bg-blue-50 dark:bg-blue-950/30" :
                    p.status === "completed" ? "bg-purple-50 dark:bg-purple-950/30" : "bg-yellow-50 dark:bg-yellow-950/30"
                  }`}>
                    {p.status === "testing" ? <Clock className="h-4 w-4 text-green-600" /> :
                     p.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-blue-600" /> :
                     p.status === "installing" ? <Clock className="h-4 w-4 text-blue-600" /> :
                     <AlertCircle className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-zinc-500">
                      {t(`status_${p.status}`, { defaultValue: p.status })} · {t("members", { count: p.members?.length || 0, max: p.maxMembers || 18 })}
                      {(p.status === "testing" || p.status === "installing") && ` · ${t("dayProgress", { current: p.currentDay, total: p.totalDays })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                    <Settings size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deletePack(p.id)}>
                    <Trash2 size={14} className="text-red-600" />
                  </Button>
                </div>
              </div>

              {expanded === p.id && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="h-11 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 text-sm">
                      <option value="">{t("changeStatus")}</option>
                      {validStatuses.map(s => (
                        <option key={s} value={s}>{t(`status_${s}`, { defaultValue: s })}</option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => { if (newStatus) handleAction(p.id, "changeStatus", { status: newStatus }) }} disabled={!newStatus || actionLoading === `changeStatus-${p.id}`}>
                      {actionLoading === `changeStatus-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      {t("changeStatusBtn")}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Input value={addUid} onChange={e => setAddUid(e.target.value)} placeholder={t("addMemberPlaceholder")} className="h-11 w-48" />
                    <Button size="sm" onClick={() => { if (addUid.trim()) { handleAction(p.id, "addMember", { uid: addUid.trim() }); setAddUid("") } }} disabled={!addUid.trim() || actionLoading === `addMember-${p.id}`}>
                      {actionLoading === `addMember-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus size={14} />}
                      {t("addMemberBtn")}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Input value={removeUid} onChange={e => setRemoveUid(e.target.value)} placeholder={t("removeMemberPlaceholder")} className="h-11 w-48" />
                    <Button size="sm" variant="destructive" onClick={() => { if (removeUid.trim()) { handleAction(p.id, "removeMember", { uid: removeUid.trim() }); setRemoveUid("") } }} disabled={!removeUid.trim() || actionLoading === `removeMember-${p.id}`}>
                      {actionLoading === `removeMember-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <X size={14} />}
                      {t("removeMemberBtn")}
                    </Button>
                  </div>

                  {p.members && p.members.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2">{t("membersLabel", { count: p.members.length })}</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {p.members.map((m: any) => (
                          <div key={m.uid} className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                            <span className="truncate">{m.displayName || m.email || m.uid}</span>
                            <span className="text-zinc-400 shrink-0 ml-2">{m.role || t("roleMember")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

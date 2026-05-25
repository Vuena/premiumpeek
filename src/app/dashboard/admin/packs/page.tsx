"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Loader2, ArrowLeft, Trash2, Clock, CheckCircle2, AlertCircle, Settings, ChevronUp, Plus, X } from "lucide-react"
import Link from "next/link"
import { usePageMeta } from "@/lib/usePageMeta"

const validStatuses = ["forming", "installing", "testing", "completed"]

const statusLabel = (s: string) => {
  switch (s) {
    case "forming": return "Oluşuyor"
    case "installing": return "Yükleme"
    case "testing": return "Test"
    case "completed": return "Tamamlandı"
    default: return s
  }
}

const statusIcon = (s: string) => {
  switch (s) {
    case "testing": return <Clock className="h-4 w-4 text-green-600" />
    case "completed": return <CheckCircle2 className="h-4 w-4 text-blue-600" />
    case "installing": return <Clock className="h-4 w-4 text-blue-600" />
    default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
  }
}

export default function AdminPacksPage() {
  usePageMeta({ title: "Pack'ler | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
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
    loadPacks().catch(console.error)
  }, [user, authLoading, router])

  const loadPacks = async () => {
    if (!db) { return }
    const d = db
    const snap = await getDocs(query(collection(d, "packs"), orderBy("createdAt", "desc"), limit(50)))
    setPacks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const deletePack = async (id: string) => {
    if (!confirm("Pack'i silmek istediğine emin misin?")) return
    await handleAction(id, "delete", {})
  }

  const handleAction = async (packId: string, action: string, data: any) => {
    setActionLoading(`${action}-${packId}`)
    setActionError("")
    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) { setActionError("Oturum bulunamadı"); setActionLoading(null); return }
      const res = await fetch("/api/admin/pack-manage", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packId, action, data }),
      })
      const result = await res.json()
      if (!res.ok) { setActionError(result.error || "İşlem başarısız"); return }
      loadPacks()
    } catch (err: any) {
      setActionError(err.message || "Bir hata oluştu")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Admin Paneli
      </Link>
      <h1 className="text-2xl font-bold mb-6">Pack&apos;ler ({packs.length})</h1>

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
                  }`}>{statusIcon(p.status)}</div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-zinc-500">
                      {statusLabel(p.status)} · {p.members?.length || 0}/{p.maxMembers || 18} üye
                      {(p.status === "testing" || p.status === "installing") && ` · Gün ${p.currentDay}/${p.totalDays}`}
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
                      <option value="">Durum değiştir...</option>
                      {validStatuses.map(s => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => { if (newStatus) handleAction(p.id, "changeStatus", { status: newStatus }) }} disabled={!newStatus || actionLoading === `changeStatus-${p.id}`}>
                      {actionLoading === `changeStatus-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Değiştir
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Input value={addUid} onChange={e => setAddUid(e.target.value)} placeholder="Eklenecek UID..." className="h-11 w-48" />
                    <Button size="sm" onClick={() => { if (addUid.trim()) { handleAction(p.id, "addMember", { uid: addUid.trim() }); setAddUid("") } }} disabled={!addUid.trim() || actionLoading === `addMember-${p.id}`}>
                      {actionLoading === `addMember-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus size={14} />}
                      Ekle
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Input value={removeUid} onChange={e => setRemoveUid(e.target.value)} placeholder="Çıkarılacak UID..." className="h-11 w-48" />
                    <Button size="sm" variant="destructive" onClick={() => { if (removeUid.trim()) { handleAction(p.id, "removeMember", { uid: removeUid.trim() }); setRemoveUid("") } }} disabled={!removeUid.trim() || actionLoading === `removeMember-${p.id}`}>
                      {actionLoading === `removeMember-${p.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <X size={14} />}
                      Çıkar
                    </Button>
                  </div>

                  {p.members && p.members.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2">Üyeler ({p.members.length}):</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {p.members.map((m: any) => (
                          <div key={m.uid} className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                            <span className="truncate">{m.displayName || m.email || m.uid}</span>
                            <span className="text-zinc-400 shrink-0 ml-2">{m.role || "member"}</span>
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

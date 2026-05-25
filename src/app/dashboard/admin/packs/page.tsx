"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, ArrowLeft, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminPacksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    loadPacks()
  }, [user, authLoading])

  const loadPacks = async () => {
    const d = db!
    const snap = await getDocs(query(collection(d, "packs"), orderBy("createdAt", "desc")))
    setPacks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const deletePack = async (id: string) => {
    if (!confirm("Pack'i silmek istediğine emin misin?")) return
    const d = db!
    await deleteDoc(doc(d, "packs", id))
    loadPacks()
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case "active": return <Clock className="h-4 w-4 text-green-600" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case "forming": return "Oluşuyor"
      case "active": return "Aktif"
      case "completed": return "Tamamlandı"
      default: return s
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Admin Paneli
      </Link>
      <h1 className="text-2xl font-bold mb-6">Pack&apos;ler ({packs.length})</h1>

      <div className="space-y-3">
        {packs.map(p => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  p.status === "active" ? "bg-green-50 dark:bg-green-950/30" :
                  p.status === "completed" ? "bg-blue-50 dark:bg-blue-950/30" : "bg-yellow-50 dark:bg-yellow-950/30"
                }`}>{statusIcon(p.status)}</div>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-zinc-500">
                    {statusLabel(p.status)} · {p.members?.length || 0}/{p.maxMembers || 16} üye · Kod: {p.code}
                    {p.status === "active" && ` · Gün ${p.currentDay}/${p.totalDays}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deletePack(p.id)}><Trash2 size={14} className="text-red-600" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

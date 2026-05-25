"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Loader2, ArrowLeft, Trash2, ExternalLink, Clock, CheckCircle2, Hourglass } from "lucide-react"
import Link from "next/link"
import { usePageMeta } from "@/lib/usePageMeta"

export default function AdminAppsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  usePageMeta({ title: "Uygulamalar | PremiumPeek" })

  useEffect(() => {
    if (authLoading) return
    if (!user || (user as any).role !== "admin") { router.push("/dashboard"); return }
    loadApps().catch(console.error)
  }, [user, authLoading, router])

  const loadApps = async () => {
    if (!db) { return }
    const d = db
    const snap = await getDocs(query(collection(d, "apps"), orderBy("createdAt", "desc"), limit(50)))
    setApps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const deleteApp = async (id: string) => {
    if (!confirm("Uygulamayı silmek istediğine emin misin?")) return
    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) return
      const res = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "delete", appId: id }),
      })
      if (!res.ok) {
        const result = await res.json()
        console.error(result.error)
      }
      loadApps()
    } catch (err) {
      console.error(err)
    }
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case "testing": return <Clock className="h-4 w-4 text-green-600" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case "pending": return <Hourglass className="h-4 w-4 text-yellow-600" />
      default: return <Hourglass className="h-4 w-4 text-zinc-400" />
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Admin Paneli
      </Link>
      <h1 className="text-2xl font-bold mb-6">Uygulamalar ({apps.length})</h1>

      <div className="space-y-3">
        {apps.map(app => (
          <Card key={app.id} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  app.status === "testing" ? "bg-green-50 dark:bg-green-950/30" :
                  app.status === "completed" ? "bg-blue-50 dark:bg-blue-950/30" : "bg-yellow-50 dark:bg-yellow-950/30"
                }`}>{statusIcon(app.status)}</div>
                <div>
                  <p className="font-medium">{app.appName}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[300px]">{app.packageName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
                </a>
                <Button variant="ghost" size="sm" onClick={() => deleteApp(app.id)}><Trash2 size={14} className="text-red-600" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

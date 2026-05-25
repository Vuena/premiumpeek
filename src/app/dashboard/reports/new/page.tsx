"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft, Loader2, Download, Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/context/ToastContext"
import { usePageMeta } from "@/lib/usePageMeta"

export default function NewReportPage() {
  usePageMeta({ title: "Rapor Oluştur | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast: addToast } = useToast()
  const [apps, setApps] = useState<any[]>([])
  const [selectedApp, setSelectedApp] = useState("")
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<{ type: string; description: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadApps()
  }, [user, authLoading])

  const loadApps = async () => {
    const d = db!
    const q = query(collection(d, "apps"), where("uid", "==", user!.uid))
    const snap = await getDocs(q)
    setApps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const addItem = () => {
    if (!selectedApp) { setError("Önce bir uygulama seçmelisin."); return }
    setError("")
    setItems([...items, { type: "bug", description: "" }])
  }
  const updateItem = (i: number, field: "type" | "description", value: string) => {
    const copy = [...items]; copy[i][field] = value; setItems(copy)
  }
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const handleDownload = () => {
    if (!selectedApp || items.length === 0) return
    const app = apps.find(a => a.id === selectedApp)
    const dateStr = new Date().toLocaleDateString("tr-TR")
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
    <h1>Test Raporu - ${app?.appName || ""}</h1>
    <div class="meta">Tarih: ${dateStr} | Paket: ${app?.packageName || ""}</div>
    <table><thead><tr><th>#</th><th>Tür</th><th>Açıklama</th></tr></thead><tbody>`
    items.forEach((item, i) => {
      const cls = item.type === "bug" ? "b" : item.type === "uiux" ? "u" : item.type === "feature" ? "f" : ""
      const lbl = item.type === "bug" ? "Hata" : item.type === "uiux" ? "UI/UX" : item.type === "feature" ? "Öneri" : "Diğer"
      html += `<tr><td>${i+1}</td><td class="${cls}">${lbl}</td><td>${item.description}</td></tr>`
    })
    html += `</tbody></table><div class="footer">PremiumPeek - Test Raporu</div></body></html>`
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url; a.download = `rapor-${app?.appName?.toLowerCase().replace(/\s+/g,"-")}.html`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!selectedApp || items.length === 0) return
    setSaving(true)
    try {
      await addDoc(collection(db!, "reports"), {
        appId: selectedApp, uid: user!.uid, items, createdAt: serverTimestamp(),
      })
      setItems([])
      router.push("/dashboard/reports")
    } catch (err: any) {
      addToast("error", "Rapor kaydedilemedi: " + (err instanceof Error ? err.message : "Bilinmeyen hata"))
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/reports" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Raporlarım
      </Link>
      <h1 className="text-2xl font-bold mb-6">Rapor Oluştur</h1>

      <div className="space-y-4">
        <select value={selectedApp} onChange={e => { setSelectedApp(e.target.value); setError("") }}
          className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400">
          <option value="">Uygulama seç</option>
          {apps.map(a => <option key={a.id} value={a.id}>{a.appName}</option>)}
        </select>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <select value={item.type} onChange={e => updateItem(i, "type", e.target.value)}
              className="h-11 w-28 shrink-0 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400">
              <option value="bug">Hata</option>
              <option value="uiux">UI/UX</option>
              <option value="feature">Öneri</option>
              <option value="other">Diğer</option>
            </select>
            <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
              placeholder="Açıklama..." className="flex-1 h-11 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
            <button onClick={() => removeItem(i)} className="h-11 w-11 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={addItem} className="gap-2"><Plus size={16} /> Madde Ekle</Button>
        </div>

        {items.length > 0 && selectedApp && (
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Button onClick={handleDownload} className="gap-2"><Download size={16} /> HTML İndir</Button>
            <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
              Kaydet
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

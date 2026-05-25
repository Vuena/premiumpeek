"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { submitApp, getUserPacks, CREDIT_COST_POST, type Pack } from "@/lib/firestore"
import { FileText, Loader2, ArrowLeft, Coins } from "lucide-react"
import Link from "next/link"

export default function NewAppPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [form, setForm] = useState({
    appName: "",
    packageName: "",
    description: "",
    category: "other",
    language: "tr",
    googlePlayLink: "",
    instructions: "",
    packId: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [userCredits, setUserCredits] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadData()
  }, [user, authLoading])

  const loadData = async () => {
    if (!user) return
    const userPacks = await getUserPacks(user.uid)
    const activePacks = userPacks.filter(p => p.status === "active")
    setPacks(activePacks)
    const credits = (user as any).credits ?? 0
    setUserCredits(credits)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.appName.trim()) { setError("Uygulama adı gerekli"); return }
    if (!form.packageName.trim()) { setError("Package name gerekli"); return }
    if (!form.googlePlayLink.trim()) { setError("Google Play linki gerekli"); return }
    if (!form.packId) { setError("Bir pack seçmelisin"); return }

    setLoading(true)
    try {
      await submitApp({
        uid: user!.uid,
        ...form,
      })
      router.push("/dashboard/apps")
    } catch (err: any) {
      setError(err.message || "Uygulama yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/apps" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Uygulamalarım
      </Link>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Uygulama Yükle</CardTitle>
              <CardDescription>
                Pack&apos;ine test edilmesi için uygulamanı ekle
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-4 py-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <div>
                <span className="font-bold text-yellow-700 dark:text-yellow-400">{userCredits} 🪙</span>
                <p className="text-[10px] text-yellow-600/60">Maliyet: {CREDIT_COST_POST}🪙</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {userCredits < CREDIT_COST_POST && (
            <div className="mb-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              Yetersiz kredi! Uygulama yüklemek için {CREDIT_COST_POST}🪙 gerekli. Mevcut: {userCredits}🪙. 
              Pack'teki diğer uygulamaları test ederek kredi kazanabilirsin.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Uygulama Adı *</label>
                <Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} placeholder="Örn: Hesap Makinesi Pro" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Package Name *</label>
                <Input value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} placeholder="Örn: com.example.app" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Google Play Linki *</label>
                <Input value={form.googlePlayLink} onChange={(e) => setForm({ ...form, googlePlayLink: e.target.value })} placeholder="https://play.google.com/store/apps/details?id=..." required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Uygulaman hakkında kısa bir açıklama..."
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                  <option value="other">Diğer</option>
                  <option value="game">Oyun</option>
                  <option value="social">Sosyal</option>
                  <option value="productivity">Üretkenlik</option>
                  <option value="ecommerce">E-ticaret</option>
                  <option value="education">Eğitim</option>
                  <option value="health">Sağlık</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Dil</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                  <option value="tr">Türkçe</option>
                  <option value="en">İngilizce</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Pack *</label>
                <select value={form.packId} onChange={(e) => setForm({ ...form, packId: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                  <option value="">Pack seç</option>
                  {packs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.members.length}/{p.maxMembers})</option>
                  ))}
                </select>
                {packs.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Aktif bir pack'in yok. Önce bir pack'e katıl veya pack oluştur.</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Test Talimatları</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Testçilerin bilmesi gerekenler (giriş bilgisi, özel talimatlar varsa)..."
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || userCredits < CREDIT_COST_POST || packs.length === 0} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={18} />}
              {userCredits < CREDIT_COST_POST ? "Yetersiz Kredi" : "Uygulamayı Yükle (60🪙)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

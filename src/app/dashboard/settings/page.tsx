"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserProfile, joinTesterPool, leaveTesterPool } from "@/lib/firestore"
import { useToast } from "@/context/ToastContext"
import { Settings, Loader2, CheckCircle2, Users } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"

export default function SettingsPage() {
  usePageMeta({ title: "Ayarlar | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast: addToast } = useToast()
  const [form, setForm] = useState({ displayName: "", country: "", bio: "", devAccountLink: "" })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isTester, setIsTester] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    setForm({
      displayName: (user as any).displayName || "",
      country: (user as any).country || "",
      bio: (user as any).bio || "",
      devAccountLink: (user as any).devAccountLink || "",
    })
    setIsTester(!!(user as any).isTester)
  }, [user, authLoading])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    try {
      await updateUserProfile(user!.uid, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      addToast("error", err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Profil bilgilerini düzenle</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Ad Soyad</label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Ülke</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Örn: Türkiye" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Hakkımda</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Kendinden bahset..."
                className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Google Play Geliştirici Hesabı</label>
              <Input value={form.devAccountLink} onChange={(e) => setForm({ ...form, devAccountLink: e.target.value })} placeholder="https://play.google.com/store/apps/developer?id=..." />
            </div>

            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
              {saved ? "Kaydedildi" : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Testçi Havuzu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            Testçi havuzuna katılarak ücretli test siparişlerinde görev alabilirsin.
          </p>
          {isTester ? (
            <Button variant="outline" onClick={async () => { try { await leaveTesterPool(user.uid); setIsTester(false); addToast("success", "Testçi havuzundan ayrıldın") } catch { addToast("error", "Ayrılma başarısız") } }}>
              Testçi Havuzundan Ayrıl
            </Button>
          ) : (
            <Button onClick={async () => { try { await joinTesterPool(user.uid); setIsTester(true); addToast("success", "Testçi havuzuna katıldın") } catch { addToast("error", "Katılma başarısız") } }}>
              <Users className="h-4 w-4 mr-2" /> Testçi Ol
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Hesap Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">E-posta</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">Üyelik</span>
            <span>{(user as any).role === "admin" ? "Admin" : "Üye"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

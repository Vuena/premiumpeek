"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserProfile, joinTesterPool, leaveTesterPool } from "@/lib/firestore"
import { useToast } from "@/context/ToastContext"
import { Settings, Loader2, CheckCircle2, Users } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"
import { useTranslations } from "next-intl"

export default function SettingsPage() {
  const t = useTranslations("DashboardSettings")
  usePageMeta({ title: t("pageTitle") })
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
  }, [user, authLoading, router])

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

  if (authLoading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("displayName")}</label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("country")}</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder={t("countryPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("bio")}</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder={t("bioPlaceholder")}
                className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("devAccount")}</label>
              <Input value={form.devAccountLink} onChange={(e) => setForm({ ...form, devAccountLink: e.target.value })} placeholder={t("devAccountPlaceholder")} />
            </div>

            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
              {saved ? t("saved") : t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(user as any).role !== "admin" && (
      <Card className="border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">{t("testerPool")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            {t("testerPoolDesc")}
          </p>
          {isTester ? (
            <Button variant="outline" onClick={async () => { try { await leaveTesterPool(user.uid); setIsTester(false); addToast("success", t("leavePoolSuccess")) } catch { addToast("error", t("leavePoolError")) } }}>
              {t("leavePool")}
            </Button>
          ) : (
            <Button onClick={async () => { try { await joinTesterPool(user.uid); setIsTester(true); addToast("success", t("joinPoolSuccess")) } catch { addToast("error", t("joinPoolError")) } }}>
              <Users className="h-4 w-4 mr-2" /> {t("becomeTester")}
            </Button>
          )}
        </CardContent>
      </Card>
      )}

      <Card className="border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">{t("accountInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">{t("email")}</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">{t("membership")}</span>
            <span>{(user as any).role === "admin" ? t("admin") : t("member")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

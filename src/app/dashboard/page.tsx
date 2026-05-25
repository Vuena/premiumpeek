"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserPacks, getUserApps, getFormingPacks, createPack, joinPackWithApp, type Pack, type App } from "@/lib/firestore"
import { Users, Clock, FileText, Plus, ArrowRight, Loader2, Smartphone, Settings, Layers, LogIn, X, CheckCircle } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"
import { useToast } from "@/context/ToastContext"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [formingPacks, setFormingPacks] = useState<Pack[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const { toast: addToast } = useToast()
  const [joinPackId, setJoinPackId] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState("")

  usePageMeta({ title: "Panel | PremiumPeek" })
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    ;(async () => {
      try {
        await loadData()
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadData = async () => {
    if (!user) return
    let userPacks = await getUserPacks(user.uid)
    const userApps = await getUserApps(user.uid)
    let avail = await getFormingPacks()
    if (userPacks.length === 0 && avail.length === 0) {
      await createPack("Geliştiriciler Bekleniyor")
      avail = await getFormingPacks()
      userPacks = await getUserPacks(user.uid)
    }
    setPacks(userPacks)
    setFormingPacks(avail.filter(p => !p.members.some(m => m.uid === user.uid)))
    setApps(userApps)
    setLoading(false)
  }



  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
  if (!user) return null

  const activePacks = packs.filter(p => p.status === "testing" || p.status === "installing")
  const currentPack = packs[0]

  let testedCount = 0
  try {
    const testedStr = typeof window !== "undefined" ? localStorage.getItem(`tested_${new Date().toDateString()}`) : null
    if (testedStr) testedCount = JSON.parse(testedStr).length
  } catch (err) { console.error("Failed to parse localStorage tested data:", err) }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Hoş Geldin{user.displayName ? `, ${user.displayName}` : ""}</h1>
          <p className="text-sm text-muted mt-1">Google Play test yolculuğuna devam et</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/apps/new">
            <Button className="gap-2"><Plus size={16} />Uygulama Yükle</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        {[
          { icon: Smartphone, label: "Bugün Test", value: testedCount.toString(), href: "/dashboard/testing", color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
          { icon: FileText, label: "Uygulamalar", value: apps.length.toString(), href: "/dashboard/apps", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-cardborder shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {currentPack && currentPack.members.some(m => m.uid === user?.uid) && (
            <Card className={`border-2 shadow-md bg-gradient-to-br ${
              currentPack.status === "forming" ? "border-yellow-200 dark:border-yellow-800 from-yellow-50/40 to-white dark:from-yellow-950/10 dark:to-zinc-950" :
              currentPack.status === "installing" ? "border-blue-200 dark:border-blue-800 from-blue-50/40 to-white dark:from-blue-950/10 dark:to-zinc-950" :
              currentPack.status === "completed" ? "border-purple-200 dark:border-purple-800 from-purple-50/40 to-white dark:from-purple-950/10 dark:to-zinc-950" :
              "border-green-200 dark:border-green-800 from-green-50/40 to-white dark:from-green-950/10 dark:to-zinc-950"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-semibold text-lg">Pack</h2>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto ${
                    currentPack.status === "forming" ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400" :
                    currentPack.status === "installing" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" :
                    currentPack.status === "completed" ? "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400" :
                    "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                  }`}>
                    {currentPack.status === "forming" ? "Oluşuyor" :
                     currentPack.status === "installing" ? "Yükleme" :
                     currentPack.status === "completed" ? "Tamamlandı" : "Test"}
                  </span>
                </div>
                <Link href={`/dashboard/packs/${currentPack.id}`} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      currentPack.status === "forming" ? "bg-yellow-100 dark:bg-yellow-950/30" :
                      currentPack.status === "installing" ? "bg-blue-100 dark:bg-blue-950/30" :
                      currentPack.status === "completed" ? "bg-purple-100 dark:bg-purple-950/30" :
                      "bg-green-100 dark:bg-green-950/30"
                    }`}>
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill={currentPack.status === "forming" ? "#eab308" : currentPack.status === "installing" ? "#3b82f6" : currentPack.status === "completed" ? "#a855f7" : "#22c55e"} opacity="0.15" />
                        <circle cx="12" cy="12" r="5" fill={currentPack.status === "forming" ? "#eab308" : currentPack.status === "installing" ? "#3b82f6" : currentPack.status === "completed" ? "#a855f7" : "#22c55e"} />
                        <circle cx="12" cy="12" r="2" fill="white" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-semibold">{currentPack.name}</p>
                      <p className="text-xs text-muted">
                        {currentPack.status === "forming"
                          ? `${currentPack.members.length}/18 üye`
                          : currentPack.status === "installing"
                          ? `Yükleme aşaması · ${currentPack.members.length} üye`
                          : currentPack.status === "completed"
                          ? `Tamamlandı · ${currentPack.members.length} üye`
                          : `Gün ${currentPack.currentDay}/${currentPack.totalDays} · ${currentPack.members.length} üye`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </CardContent>
            </Card>
          )}

          {formingPacks.map(p => (
            <Card key={p.id} className="border-2 border-yellow-200 dark:border-yellow-800 shadow-md bg-gradient-to-br from-yellow-50/40 to-white dark:from-yellow-950/10 dark:to-zinc-950">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-semibold text-lg">Mevcut Pack</h2>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400">Oluşuyor</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-950/30">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#eab308" opacity="0.15" />
                        <circle cx="12" cy="12" r="5" fill="#eab308" />
                        <circle cx="12" cy="12" r="2" fill="white" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-semibold">{p.name}</p>
                      <p className="text-xs text-muted">{p.members.length}/18 üye</p>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2" onClick={() => setJoinPackId(p.id)}>
                    <LogIn size={16} /> Katıl
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-cardborder shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Hızlı İşlemler</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Layers, label: "Uygulama Yükle", href: "/dashboard/apps/new", desc: "Pack'ine ekle", color: "text-purple-600" },
                  { icon: Clock, label: "Bugünkü Testler", href: "/dashboard/testing", desc: "Testlerini yap", color: "text-green-600" },
                  { icon: FileText, label: "Raporlar", href: "/dashboard/reports", desc: "Test raporlarını gör", color: "text-orange-600" },
                  { icon: Settings, label: "Ayarlar", href: "/dashboard/settings", desc: "Profili düzenle", color: "text-zinc-600" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-3 rounded-xl border border-cardborder p-4 hover:bg-subtle transition-colors group">
                    <action.icon className={`h-8 w-8 ${action.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-cardborder shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Nasıl Çalışır?</h2>
              <ol className="space-y-3">
                {["Kaydol ve pack'ine katıl","Uygulamanın Google Play linkini yükle","Her gün pack'teki uygulamaları test et","16 gün sonra yayına hazırsın!"].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">{i + 1}</span>
                    <span className="text-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-cardborder shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">İstatistikler</h2>
              <div className="space-y-4">
                {[
                  { label: "Uygulamaların", value: apps.length.toString() },
                  { label: "Aktif Pack", value: activePacks.length.toString() },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-sm text-muted">{s.label}</span>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* App Selection Modal */}
      {joinPackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setJoinPackId(null)} role="dialog" aria-modal="true" aria-label="Pack'e katıl">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Pack'e Katıl</h3>
              <button onClick={() => setJoinPackId(null)} aria-label="Kapat" className="cursor-pointer"><X size={20} /></button>
            </div>

            {joinError && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{joinError}</div>
            )}

            {apps.filter(a => !a.packId).length > 0 ? (
              <>
                <p className="text-sm text-zinc-500 mb-4">Hangi uygulamanı bu pack'e eklemek istersin?</p>
                <div className="space-y-2 mb-4">
                  {apps.filter(a => !a.packId).map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center gap-3 min-w-0">
                        {app.appIcon ? (
                          <img src={app.appIcon} alt="Uygulama ikonu" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                            {app.appName[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{app.appName}</p>
                          <p className="text-xs text-zinc-500 truncate">{app.packageName}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={async () => {
                        setJoinLoading(true)
                        setJoinError("")
                        try {
                          await joinPackWithApp(joinPackId, app.id, user!)
                          setJoinPackId(null)
                          loadData()
                          addToast("success", "Pack'e katıldın!")
                        } catch (err: any) {
                          setJoinError(err.message || "Katılırken hata oluştu")
                        } finally {
                          setJoinLoading(false)
                        }
                      }} disabled={joinLoading}>
                        {joinLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle size={14} />}
                        Seç
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                  <Link href={`/dashboard/apps/new?packId=${joinPackId}`} onClick={() => setJoinPackId(null)}>
                    <Button variant="outline" className="w-full gap-2"><Plus size={16} /> Yeni Uygulama Ekle</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-500 mb-4">Henüz yüklediğin bir uygulama yok. Önce uygulamanı ekle, sonra pack'e katıl.</p>
                <Link href={`/dashboard/apps/new?packId=${joinPackId}`} onClick={() => setJoinPackId(null)}>
                  <Button className="w-full gap-2"><Plus size={16} /> Uygulama Yükle</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

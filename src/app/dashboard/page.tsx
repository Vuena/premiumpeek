"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserPacks, getUserApps, getFormingPacks, type Pack, type App } from "@/lib/firestore"
import { Users, Clock, FileText, Plus, ArrowRight, Loader2, Smartphone, Settings, Layers } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [formingPacks, setFormingPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadData()
  }, [user, authLoading])

  const loadData = async () => {
    if (!user) return
    const [userPacks, userApps, allForming] = await Promise.all([
      getUserPacks(user.uid),
      getUserApps(user.uid),
      getFormingPacks(),
    ])
    setPacks(userPacks)
    setApps(userApps)
    setFormingPacks(allForming.filter(p => !p.members.some(m => m.uid === user!.uid)))
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
  if (!user) return null

  const activePacks = packs.filter(p => p.status === "active")

  const testedStr = typeof window !== "undefined" ? localStorage.getItem(`tested_${new Date().toDateString()}`) : null
  const testedCount = testedStr ? JSON.parse(testedStr).length : 0

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Layers, label: "Aktif Pack", value: activePacks.length.toString(), href: "/dashboard/packs", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
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
          <Card className="border-cardborder shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Aktif Pack</h2>
              </div>
              {activePacks.length === 0 && formingPacks.length === 0 ? null : activePacks.length === 0 && formingPacks.length > 0 ? (
                <div className="space-y-3">
                  {formingPacks.slice(0, 2).map(pack => (
                    <Link key={pack.id} href={`/dashboard/packs/${pack.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-subtle transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{pack.name}</p>
                          <p className="text-xs text-muted">{pack.members.length}/{pack.maxMembers} üye · Oluşuyor</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {activePacks.map(pack => (
                    <Link key={pack.id} href={`/dashboard/packs/${pack.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-subtle transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{pack.name}</p>
                          <p className="text-xs text-muted">Gün {pack.currentDay}/{pack.totalDays} · {pack.members.length} üye</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-cardborder shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Hızlı İşlemler</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Users, label: "Pack'e Katıl", href: "/dashboard/packs/join", desc: "Aktif pack'leri gör", color: "text-indigo-600" },
                  { icon: FileText, label: "Uygulama Yükle", href: "/dashboard/apps/new", desc: "Pack'ine ekle", color: "text-purple-600" },
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
                {["Bir pack'e katıl","Uygulamanın Google Play linkini yükle","Her gün pack'teki uygulamaları test et","16 gün sonra yayına hazırsın!"].map((step, i) => (
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
                  { label: "Pack'lerin", value: packs.length.toString() },
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
    </div>
  )
}

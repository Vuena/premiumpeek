"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPackById, getUserApps, getPackApps, leavePack, confirmInstall, transitionInstallingToTesting, recordScreenshot, type Pack, type App } from "@/lib/firestore"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import type { Timestamp } from "firebase/firestore"
import { ArrowLeft, Users, Clock, Calendar, CheckCircle2, Loader2, LogOut, ExternalLink, Smartphone, Hourglass, Trophy } from "lucide-react"
import Link from "next/link"

export default function PackDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const packId = useParams().id as string
  const [pack, setPack] = useState<Pack | null>(null)
  const [apps, setApps] = useState<App[]>([])
  const [myApps, setMyApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [installTimeLeft, setInstallTimeLeft] = useState("")
  const [installScreenshot, setInstallScreenshot] = useState<File | null>(null)
  const [installScreenshotPreview, setInstallScreenshotPreview] = useState("")
  const [installError, setInstallError] = useState("")

  const isPremium = pack?.members.find(m => m.uid === user?.uid)?.type === "premium"

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadData()
  }, [user, authLoading, packId])

  useEffect(() => {
    if (pack?.status !== "installing" || !pack?.id) return
    const doTransition = async () => {
      try {
        await transitionInstallingToTesting(pack.id)
        const fresh = await getPackById(pack.id)
        if (fresh && fresh.status !== pack.status) setPack(fresh)
      } catch {}
    }
    doTransition()
    const interval = setInterval(doTransition, 30000)
    return () => clearInterval(interval)
  }, [pack?.status, pack?.id])

  useEffect(() => {
    if (pack?.status !== "installing" || !pack?.installDeadline) return
    const updateTimer = () => {
      const remaining = pack.installDeadline!.toMillis() - Date.now()
      if (remaining <= 0) { setInstallTimeLeft("Süre doldu"); return }
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setInstallTimeLeft(`${h}s ${m}d ${s}s`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [pack?.status, pack?.installDeadline])

  const loadData = async () => {
    if (!user || !packId) return
    const [packData, packApps, userApps] = await Promise.all([
      getPackById(packId as string),
      getPackApps(packId as string),
      getUserApps(user.uid),
    ])
    if (!packData) { setLoading(false); return }
    if (packData.status === "installing") {
      await transitionInstallingToTesting(packData.id)
      const fresh = await getPackById(packData.id)
      if (fresh) setPack(fresh)
      else setPack(packData)
    } else {
      setPack(packData)
    }
    setApps(packApps)
    setMyApps(userApps.filter(a => a.packId === packId))
    setLoading(false)
  }

  const isMember = pack?.members.some(m => m.uid === user?.uid)

  const handleLeave = async () => {
    if (!pack || !user) return
    if (!confirm("Pack'ten ayrılmak istediğine emin misin?")) return
    setActionLoading(true)
    try {
      await leavePack(pack.id, user.uid)
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleInstallScreenshot = (file: File | null) => {
    if (!file) { setInstallScreenshot(null); setInstallScreenshotPreview(""); return }
    if (file.size > 5 * 1024 * 1024) { setInstallError("Dosya boyutu 5MB'ı geçemez"); setTimeout(() => setInstallError(""), 4000); return }
    if (!file.type.startsWith("image/")) { setInstallError("Sadece resim dosyası yükleyebilirsin"); setTimeout(() => setInstallError(""), 4000); return }
    setInstallScreenshot(file)
    const reader = new FileReader()
    reader.onload = (e) => setInstallScreenshotPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleConfirmInstall = async () => {
    if (!pack || !user || !installScreenshot) return
    setActionLoading(true)
    setInstallError("")
    try {
      const storagePath = `screenshots/installs/${pack.id}/${user.uid}/${Date.now()}.jpg`
      const storageRef = ref(storage!, storagePath)
      await uploadBytes(storageRef, installScreenshot)
      const url = await getDownloadURL(storageRef)
      await recordScreenshot(pack.id, user.uid, 0, url, "install")
      await confirmInstall(pack.id, user.uid)
      const fresh = await getPackById(pack.id)
      if (fresh) setPack(fresh)
      alert("Tüm uygulamalar yüklendi! Pack başlıyor...")
    } catch (err: any) {
      setInstallError(err.message || "Bir hata oluştu")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!pack) return <div className="text-center py-16 text-zinc-500">Pack bulunamadı.</div>

  if (!isMember) { router.push("/dashboard"); return null }
  if (myApps.length === 0 && !isPremium && pack.status === "testing") { router.push("/dashboard/apps/new"); return null }

  const daysCompleted = pack.status === "testing" ? pack.currentDay - 1 : pack.status === "completed" ? pack.totalDays : 0

  const myMemberInfo = pack.members.find(m => m.uid === user?.uid)
  const myInstallConfirmed = myMemberInfo?.installConfirmed

  const phaseSteps = [
    { label: "Kayıt", status: "forming", icon: Users, done: pack.members.length >= pack.maxMembers },
    { label: "Yükleme", status: "installing", icon: Smartphone, done: pack.status === "testing" || pack.status === "completed" || (pack.status === "installing" && myMemberInfo?.type !== "premium" && pack.members.filter(m => m.type === "free").every(m => m.installConfirmed)) },
    { label: "Test", status: "testing", icon: Clock, done: pack.status === "testing" || pack.status === "completed" },
    { label: "Bitiş", status: "completed", icon: Trophy, done: pack.status === "completed" },
  ]

  const currentPhaseIndex = phaseSteps.findIndex(p =>
    p.status === pack.status || (pack.status === "installing" && p.status === "installing")
  )

  const statusColors: Record<string, string> = {
    forming: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
    installing: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
    testing: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
    completed: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
  }

  const statusLabels: Record<string, string> = {
    forming: "Oluşuyor",
    installing: "Yükleme Aşaması",
    testing: "Test Aşaması",
    completed: "Tamamlandı",
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Panele Dön
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{pack.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[pack.status] || ""}`}>
              {statusLabels[pack.status]}
            </span>
            {isPremium && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">Premium</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isMember && pack.status === "forming" && (
            <Button onClick={handleLeave} disabled={actionLoading} variant="destructive" className="gap-2">
              <LogOut size={16} /> Ayrıl
            </Button>
          )}
        </div>
      </div>

      {/* 4-Phase Timeline */}
      <Card className="border-0 shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {phaseSteps.map((phase, i) => (
              <div key={phase.status} className="flex flex-col items-center flex-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-2 ${
                  i < currentPhaseIndex ? "bg-green-100 dark:bg-green-950/30 text-green-600" :
                  i === currentPhaseIndex ? "bg-blue-100 dark:bg-blue-950/30 text-blue-600 ring-2 ring-blue-400" :
                  "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}>
                  {i < currentPhaseIndex ? <CheckCircle2 className="h-5 w-5" /> : <phase.icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium ${
                  i <= currentPhaseIndex ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                }`}>{phase.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Üyeler", value: `${pack.members.length}/18` },
          { icon: Calendar, label: "Durum", value: pack.status === "forming" ? "Bekliyor" : `${pack.currentDay || 0}/${pack.totalDays} Gün` },
          { icon: Clock, label: "İlerleme", value: pack.status === "forming" ? "-" : `${daysCompleted}/${pack.totalDays}` },
          { icon: CheckCircle2, label: "Uygulamalar", value: `${apps.length}` },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <s.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-zinc-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Installation Phase */}
      {pack.status === "installing" && !isPremium && (
        <Card className="border-0 shadow-sm mb-8 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hourglass className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-lg">Yükleme Aşaması</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted mb-1">Kalan süre</p>
              <p className={`text-2xl font-bold font-mono ${installTimeLeft === "Süre doldu" ? "text-red-600" : "text-blue-600"}`}>
                {installTimeLeft || "Hesaplanıyor..."}
              </p>
            </div>

            <p className="text-sm text-muted mb-4">
              Aşağıdaki tüm uygulamaları telefonuna yükle. Hepsi yüklendikten sonra "Hepsi Yüklendi" butonuna bas.
            </p>

            {apps.length === 0 ? (
              <div className="text-center py-6 text-zinc-400">
                <p className="text-sm">Henüz uygulama yüklenmemiş. Diğer üyeler uygulamalarını ekledikçe burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {apps.map((app) => {
                  const isMyApp = app.uid === user?.uid
                  return (
                    <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                        {app.appName[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.appName}{isMyApp ? " (senin)" : ""}</p>
                        <p className="text-xs text-zinc-500 truncate">{app.packageName}</p>
                      </div>
                      <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 shrink-0">
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  )
                })}
              </div>
            )}

            {installError && (
              <p className="text-sm text-red-600 mb-3">{installError}</p>
            )}
            {apps.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {installScreenshotPreview ? (
                  <div className="relative inline-block">
                    <img src={installScreenshotPreview} alt="Install screenshot" className="h-24 rounded-xl object-cover border border-zinc-300 dark:border-zinc-600" />
                    <button
                      onClick={() => { setInstallScreenshot(null); setInstallScreenshotPreview("") }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer text-xs"
                    >X</button>
                  </div>
                ) : (
                  <input
                    id="install-ss"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleInstallScreenshot(e.target.files?.[0] || null)}
                  />
                )}
                <div className="flex gap-2">
                  {!installScreenshotPreview && (
                    <label htmlFor="install-ss" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Smartphone size={16} />
                        Ekran Görüntüsü Ekle
                      </div>
                    </label>
                  )}
                  {installScreenshotPreview && (
                    <Button onClick={handleConfirmInstall} disabled={actionLoading} className="gap-2">
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                      Hepsi Yüklendi
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {pack.status === "installing" && isPremium && (
        <Card className="border-0 shadow-sm mb-8 border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-2">Premium Üye</h2>
            <p className="text-sm text-muted">
              Premium üye olduğun için yükleme yapmana gerek yok. Diğer üyeler uygulamaları yüklerken bekle.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Members */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Üyeler ({pack.members.length})</h2>
            <div className="space-y-3">
              {pack.members.map((member) => (
                <div key={member.uid} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium shrink-0">
                    {member.displayName[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{member.displayName}</p>
                      {member.type === "premium" && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">Premium</span>
                      )}
                      {member.uid === pack.createdBy && (
                        <span className="text-[10px] text-zinc-500">Kurucu</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {pack.status === "installing" && !member.installConfirmed && member.type === "free" ? "Yüklemedi" :
                       pack.status === "installing" && member.installConfirmed ? "Yükledi ✓" :
                       member.type === "premium" ? "Premium" : "Üye"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Apps */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Uygulamalar ({apps.length})</h2>
              {pack.status === "testing" && !isPremium && (
                <Link href="/dashboard/apps/new">
                  <Button size="sm">Uygulama Ekle</Button>
                </Link>
              )}
            </div>

            {apps.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm">Henüz uygulama yüklenmemiş</p>
                <p className="text-xs mt-1">Pack üyeleri uygulamalarını buraya ekleyecek.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apps.map((app) => (
                  <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                      {app.appName[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{app.appName}</p>
                      <p className="text-xs text-zinc-500 truncate">{app.packageName}</p>
                    </div>
                    <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

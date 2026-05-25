"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserPacks, getPackApps, recordTestingActivity, addComplaint, hasDayScreenshot, recordScreenshot, type Pack, type App } from "@/lib/firestore"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useToast } from "@/context/ToastContext"
import { Clock, CheckCircle2, ExternalLink, Loader2, Smartphone, Camera, AlertTriangle, X } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"

export default function TestingPage() {
  usePageMeta({ title: "Bugünkü Testler | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast: addToast } = useToast()
  const [appsToTest, setAppsToTest] = useState<App[]>([])
  const [packsMap, setPacksMap] = useState<Record<string, Pack>>({})
  const [loading, setLoading] = useState(true)
  const [testedToday, setTestedToday] = useState<string[]>([])
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [screenshots, setScreenshots] = useState<Record<string, File | null>>({})
  const [screenshotPreviews, setScreenshotPreviews] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [complaintOpen, setComplaintOpen] = useState<string | null>(null)
  const [complaintReason, setComplaintReason] = useState("")
  const [complaintSubmitting, setComplaintSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    ;(async () => {
      try {
        await loadTesting()
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const [isPremium, setIsPremium] = useState(false)

  const loadTesting = async () => {
    if (!user) return
    const userPacks = await getUserPacks(user.uid)
    const activePacks = userPacks.filter(p => p.status === "testing")

    const packMap: Record<string, Pack> = {}
    let allApps: App[] = []
    let premium = false
    for (const pack of activePacks) {
      packMap[pack.id] = pack
      const me = pack.members.find(m => m.uid === user.uid)
      if (me?.type === "premium") premium = true
      const packApps = await getPackApps(pack.id)
      allApps = [...allApps, ...packApps.filter(a => a.uid !== user.uid)]
    }

    setIsPremium(premium)
    setAppsToTest(allApps)
    setPacksMap(packMap)
    setLoading(false)

    const stored = localStorage.getItem(`tested_${new Date().toDateString()}`)
    if (stored) setTestedToday(JSON.parse(stored))
  }

  const handleScreenshotSelect = (appId: string, file: File | null) => {
    if (!file) {
      setScreenshots(prev => ({ ...prev, [appId]: null }))
      setScreenshotPreviews(prev => ({ ...prev, [appId]: "" }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'ı geçemez"); setTimeout(() => setError(""), 4000)
      return
    }
    if (!file.type.startsWith("image/")) {
      setError("Sadece resim dosyası yükleyebilirsin"); setTimeout(() => setError(""), 4000)
      return
    }
    setScreenshots(prev => ({ ...prev, [appId]: file }))
    const reader = new FileReader()
    reader.onload = (e) => setScreenshotPreviews(prev => ({ ...prev, [appId]: e.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const markTested = async (appId: string, packId: string) => {
    const file = screenshots[appId]
    if (!file) {
      setError("Test kanıtı olarak screenshot yüklemelisin"); setTimeout(() => setError(""), 4000)
      return
    }

    setUploading(prev => ({ ...prev, [appId]: true }))
    try {
      const pack = packsMap[packId]
      if (!pack || !user) return

      const day = pack.currentDay
      const storagePath = `screenshots/tests/${packId}/${user.uid}/${day}_${Date.now()}.jpg`
      if (!storage) { addToast("error", "Storage bağlantısı kurulamadı"); return }
      const storageRef = ref(storage, storagePath)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      await recordScreenshot(packId, user.uid, day, url, "test")

      const updated = [...testedToday, appId]
      setTestedToday(updated)
      localStorage.setItem(`tested_${new Date().toDateString()}`, JSON.stringify(updated))

      const fb = feedbacks[appId] || ""
      await recordTestingActivity(packId, user.uid, day, fb)
      addToast("success", "Test kaydedildi!")
    } catch (err) { console.error("Failed to record test activity:", err)
      addToast("error", "Test kaydedilemedi")
      setError("Screenshot yüklenirken hata oluştu"); setTimeout(() => setError(""), 4000)
    } finally {
      setUploading(prev => ({ ...prev, [appId]: false }))
    }
  }

  const submitComplaint = async (appId: string) => {
    if (!complaintReason.trim() || !user) return
    setComplaintSubmitting(true)
    try {
      const app = appsToTest.find(a => a.id === appId)
      if (!app) return
      const pack = packsMap[app.packId || ""]
      if (!pack) return
      const targetMember = pack.members.find(m => m.uid === app.uid)
      await addComplaint({
        packId: pack.id,
        appId: app.id,
        appName: app.appName,
        complainedBy: user.uid,
        complainedByName: user.displayName || user.email || "İsimsiz",
        targetUid: app.uid,
        targetName: targetMember?.displayName || "Bilinmiyor",
        reason: complaintReason,
      })
      setComplaintOpen(null)
      setComplaintReason("")
    } catch (err) { console.error("Failed to submit complaint:", err)
      addToast("error", "Şikayet gönderilemedi")
    } finally {
      setComplaintSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bugünkü Testler</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {isPremium && (
        <Card className="border-0 shadow-sm mb-6 border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-sm text-muted">
              Premium üye olduğun için test yapman gerekmiyor. Uygulaman pack üyeleri tarafından test ediliyor.
            </p>
          </CardContent>
        </Card>
      )}

      {appsToTest.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Bugün test edilecek uygulama yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isPremium ? "Pack'te test aşamasında bir uygulama bulunmuyor." : "Aktif bir pack'te değilsin veya pack'teki herkes uygulama yüklememiş."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="font-medium text-zinc-900 dark:text-white">{testedToday.length}</span> / {appsToTest.length} test edildi
            </p>
            <div className="h-2 flex-1 max-w-xs mx-4 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(testedToday.length / appsToTest.length) * 100}%` }} />
            </div>
          </div>

          {appsToTest.map((app) => {
            const tested = testedToday.includes(app.id)
            const pack = packsMap[app.packId || ""]
            const currentDay = pack?.currentDay || 0
            return (
              <Card key={app.id} className={`border-0 shadow-sm transition-all ${tested ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tested ? "bg-green-50 dark:bg-green-950/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                        {tested ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${tested ? "line-through text-zinc-400" : ""}`}>{app.appName}</h3>
                        <p className="text-sm text-zinc-500">{app.description?.slice(0, 80) || app.packageName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!tested && (
                        <button
                          onClick={() => setComplaintOpen(complaintOpen === app.id ? null : app.id)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Uygulama çalışmıyor"
                        >
                          <AlertTriangle size={16} />
                        </button>
                      )}
                      <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink size={16} /></Button>
                      </a>
                      {!tested && (
                        <Button size="sm" onClick={() => markTested(app.id, app.packId || "")} disabled={uploading[app.id]}>
                          {uploading[app.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Edildi"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {!tested && (
                    <div className="mt-3 ml-14 space-y-3">
                      {/* Screenshot upload */}
                      <div>
                        <input
                          ref={el => { fileInputRefs.current[app.id] = el }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleScreenshotSelect(app.id, e.target.files?.[0] || null)}
                        />
                        {screenshotPreviews[app.id] ? (
                          <div className="relative inline-block">
                            <img src={screenshotPreviews[app.id]} alt="Test ekran görüntüsü" className="h-32 rounded-xl object-cover border border-zinc-300 dark:border-zinc-600" />
                            <button
                              onClick={() => { setScreenshots(prev => ({ ...prev, [app.id]: null })); setScreenshotPreviews(prev => ({ ...prev, [app.id]: "" })) }}
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRefs.current[app.id]?.click()}
                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            <Camera size={14} />
                            Screenshot ekle (kanıt)
                          </button>
                        )}
                      </div>

                      <textarea
                        value={feedbacks[app.id] || ""}
                        onChange={(e) => setFeedbacks({ ...feedbacks, [app.id]: e.target.value })}
                        placeholder="Yorum yap..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        rows={2}
                      />
                    </div>
                  )}

                  {complaintOpen === app.id && !tested && (
                    <div className="mt-3 ml-14 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                      <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2">Uygulama çalışmıyor, sorunu açıkla:</p>
                      <textarea
                        value={complaintReason}
                        onChange={(e) => setComplaintReason(e.target.value)}
                        placeholder="Örn: Google Play sayfası açılmıyor, hata veriyor..."
                        className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => submitComplaint(app.id)} disabled={complaintSubmitting || !complaintReason.trim()}>
                          {complaintSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Bildir"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setComplaintOpen(null); setComplaintReason("") }}>İptal</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { submitApp, getUserPacks, type Pack } from "@/lib/firestore"
import { FileText, Loader2, ArrowLeft, CheckCircle, Smartphone, Users, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"

type Step = "setup" | "details" | "review" | "done"

const PLATFORMS = ["📱 Android"] as const

const SETUP_ADIMLARI = [
  { num: "01", baslik: "Testçi Grubunu Ekle", aciklama: "Google Play Console'da uygulamanın closed test bölümüne testçi grubumuzu ekle", detay: "Uygulamanın test bölümüne gidip testçilerimizin uygulamana erişebilmesi için Google Group'umuzu ekle.", grup: "premiumpeek@googlegroups.com" },
  { num: "02", baslik: "Global Testi Aktifleştir", aciklama: "Tüm ülkeleri seçerek testçilerimizin uygulamana erişmesini sağla", detay: "Uygulamanın test bölümünde tüm ülkeleri seç. Böylece uluslararası testçilerimiz uygulamanı test edebilir." },
  { num: "03", baslik: "İncelemeye Gönder", aciklama: "Değişiklikleri Google Play incelemesine gönder - genelde 30-60 dk içinde onaylanır", detay: "Test ayarlarını yaptıktan sonra değişiklikleri Google Play'e gönder. Bu işlem genelde çok hızlıdır." },
  { num: "04", baslik: "Testi Başlat", aciklama: "Onaylandıktan sonra değişiklikleri yayınla ve test sürecini başlat", detay: "Google onayından sonra değişiklikleri yayınla ve 16 günlük test sürecini testçilerimizle başlat." },
]

const ADIMLAR = [
  { label: "Kurulum", key: "setup" },
  { label: "Uygulama Detayları", key: "details" },
  { label: "Onayla & Gönder", key: "review" },
  { label: "Tamam", key: "done" },
]

export default function NewAppPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>("setup")
  const [packs, setPacks] = useState<Pack[]>([])
  const [form, setForm] = useState({
    appName: "",
    packageName: "",
    description: "",
    category: "other",
    language: "tr",
    googlePlayLink: "",
    instructions: "",
    testEmail: "",
    testPassword: "",
    platform: "📱 Android",
    packId: "",
  })
  const [appIcon, setAppIcon] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"free" | "paid" | null>(null)
  const [setupAccepted, setSetupAccepted] = useState(false)

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
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAppIcon(reader.result as string)
    reader.readAsDataURL(file)
  }

  const goReview = () => {
    setError("")
    if (!form.appName.trim()) { setError("Uygulama adı gerekli"); return }
    if (!form.packageName.trim()) { setError("Paket adı gerekli"); return }
    if (!form.googlePlayLink.trim()) { setError("Test linki gerekli"); return }
    setStep("review")
  }

  const handleSubmitFree = async () => {
    if (!form.packId) { setError("Aktif bir pack'in yok. Önce bir pack oluştur veya katıl."); return }
    setError("")
    setLoading(true)
    try {
      const extraNotes = [form.instructions, form.testEmail ? `Test girişi: ${form.testEmail} / ${form.testPassword}` : ""].filter(Boolean).join("\n")
      await submitApp({
        uid: user!.uid,
        appName: form.appName,
        packageName: form.packageName,
        description: form.description,
        category: form.category,
        language: form.language,
        googlePlayLink: form.googlePlayLink,
        instructions: extraNotes,
        packId: form.packId,
      })
      setStep("done")
    } catch (err: any) {
      setError(err.message || "Uygulama gönderilirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPaid = () => {
    router.push("/purchase")
  }

  const gosterilecekAdimlar = ADIMLAR.filter(a => a.key !== "done" || step === "done")

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/apps" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Uygulamalarım
      </Link>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {gosterilecekAdimlar.map((a, i) => (
          <div key={a.key} className="flex items-center gap-2 shrink-0">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              a.key === step ? "bg-blue-600 text-white" :
              (step === "done" || (step !== "setup" && a.key === "setup")) ? "bg-green-500 text-white" :
              "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
            }`}>
              {step === "done" || (step !== "setup" && a.key === "setup") ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${a.key === step ? "text-blue-600" : "text-zinc-400"}`}>{a.label}</span>
            {i < gosterilecekAdimlar.length - 1 && <div className="h-px w-6 bg-zinc-300 dark:bg-zinc-600" />}
          </div>
        ))}
      </div>

      {/* Step: Setup Guide */}
      {step === "setup" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-blue-600" /> Google Play Konsol Kurulumu</CardTitle>
            <CardDescription>Test sürecini başlatmak için önce Google Play Console'da aşağıdaki adımları tamamla.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 mb-8">
              {SETUP_ADIMLARI.map((s) => (
                <div key={s.num} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <div className="flex items-start gap-3 py-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-sm font-bold mt-0.5">{s.num}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.baslik}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{s.aciklama}</p>
                    </div>
                  </div>
                  <div className="pb-4 pl-10">
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">{s.detay}</p>
                    {s.grup && (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                        <p className="text-xs text-zinc-500 mb-1">Google Group e-postası (kopyala):</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 font-mono font-bold select-all">{s.grup}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <input type="checkbox" id="setup-accepted" checked={setupAccepted} onChange={e => setSetupAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 accent-blue-600" />
              <label htmlFor="setup-accepted" className="text-sm text-amber-700 dark:text-amber-400">
                Google Play Console'da yukarıdaki 4 adımı tamamladım ve uygulamamı testçilerin erişimine açtım.
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link href="/dashboard/apps"><Button variant="ghost">İptal</Button></Link>
              <Button disabled={!setupAccepted} onClick={() => setStep("details")}>
                Devam Et <ArrowLeft size={16} className="ml-1 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Uygulamanı Yükle</CardTitle>
            <CardDescription>25 profesyonel testçi tarafından 16 gün boyunca test edilmek üzere uygulamanı gönder.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Uygulama Adı <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">Google Play'de göründüğü şekliyle.</p>
                <Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} placeholder="Örn: Hesap Makinesi Pro" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Platform <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">Uygulaman hangi platformda çalışıyor?</p>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Test Linki <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">Google Play closed testing track için herkese açık katılım linki. <a href="https://support.google.com/googleplay/android-developer/answer/9845334" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Nasıl bulurum?</a></p>
                <Input value={form.googlePlayLink} onChange={(e) => setForm({ ...form, googlePlayLink: e.target.value })} placeholder="https://play.google.com/apps/testing/..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Uygulama İkonu</label>
                <p className="text-xs text-zinc-400 mb-1">Testçilerin uygulamanı tanıması için kare bir görsel (PNG, JPG, max 5 MB).</p>
                <div className="flex items-center gap-4">
                  {appIcon ? (
                    <img src={appIcon} alt="Önizleme" className="h-16 w-16 rounded-xl object-cover border border-zinc-300 dark:border-zinc-600" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 text-xs">Önizleme</div>
                  )}
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:underline">Dosya seç</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleIconUpload} />
                    <p className="text-xs text-zinc-400 mt-1">PNG, JPEG veya WebP (max. 5MB)</p>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Test Giriş Bilgileri</label>
                <p className="text-xs text-zinc-400 mb-1">Uygulaman giriş gerektiriyorsa testçiler için bir hesap oluştur.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={form.testEmail} onChange={(e) => setForm({ ...form, testEmail: e.target.value })} placeholder="test@ornek.com" />
                  <Input value={form.testPassword} onChange={(e) => setForm({ ...form, testPassword: e.target.value })} placeholder="Şifre" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Testçiler için Notlar</label>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Testçilerin bilmesi gereken ek bilgiler..."
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                />
              </div>
              <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button variant="ghost" onClick={() => setStep("setup")}>Geri</Button>
                <Button onClick={goReview}>İncelemeye Devam Et</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Onayla &amp; Gönder</CardTitle>
            <CardDescription>Uygulama bilgilerini kontrol et ve nasıl devam etmek istediğini seç.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

            {/* Özet */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 mb-6 space-y-2">
              <div className="flex items-center gap-3">
                {appIcon ? <img src={appIcon} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400"><Smartphone size={18} /></div>}
                <div>
                  <p className="font-medium">{form.appName || "Uygulama Adı"}</p>
                  <p className="text-xs text-zinc-500">{form.platform}</p>
                </div>
              </div>
              <div className="text-xs text-zinc-500 break-all">{form.googlePlayLink}</div>
              {(form.testEmail || form.testPassword) && <div className="text-xs text-zinc-500">Test girişi: {form.testEmail} / {form.testPassword}</div>}
            </div>

            {/* Yöntem seçimi */}
            <p className="text-sm font-medium mb-3">Nasıl devam etmek istersin?</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Ücretsiz */}
              <div className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOption === "free" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}
                onClick={() => setSelectedOption("free")}>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Ücretsiz - Pack'e Katıl</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-500 mb-4">
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 25 geliştirici birbirinin uygulamasını test eder</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 16 gün boyunca günlük test</li>
                </ul>
                {packs.length === 0 && <p className="text-xs text-amber-600">Aktif bir pack'in yok. Önce pack oluştur.</p>}
              </div>

              {/* Ücretli */}
              <div className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOption === "paid" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}
                onClick={() => setSelectedOption("paid")}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">$10 USDT - Profesyonel</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-500 mb-4">
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 25 profesyonel testçi</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 16 gün test süreci</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 6 saat içinde başlangıç</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 16 gün iade garantisi</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep("details")}>Geri</Button>
              {selectedOption === "free" ? (
                <Button onClick={handleSubmitFree} disabled={loading || packs.length === 0} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={16} />}
                  Pack'e Gönder
                </Button>
              ) : selectedOption === "paid" ? (
                <Button onClick={handleSubmitPaid} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  $10 USDT ile Devam Et
                </Button>
              ) : (
                <Button disabled>Bir seçenek seç</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-12">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Uygulaman Gönderildi! 🎉</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Uygulaman pack'ine eklendi. Diğer üyeler 24 saat içinde test etmeye başlayacak.
              Pack'ini aktif tutmak için her gün diğer uygulamaları test etmeyi unutma.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/testing"><Button>Test Etmeye Başla</Button></Link>
              <Link href="/dashboard/apps"><Button variant="outline">Uygulamalarım</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

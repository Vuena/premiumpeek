"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { submitApp, joinPack, getUserPacks, getFormingPacks, type Pack } from "@/lib/firestore"
import { FileText, Loader2, ArrowLeft, CheckCircle, Smartphone, Users, Clock, ShieldCheck, HelpCircle, X, Copy } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useToast } from "@/context/ToastContext"
import { usePageMeta } from "@/lib/usePageMeta"
import { useTranslations } from "next-intl"

type Step = "setup" | "details" | "review" | "done"

const PLATFORMS = ["Android"] as const

function extractPackageName(url: string): string {
  const testingMatch = url.match(/play\.google\.com\/apps\/testing\/([^/?\s]+)/)
  if (testingMatch) return testingMatch[1]
  const storeMatch = url.match(/[?&]id=([^&?\s]+)/)
  if (storeMatch) return storeMatch[1]
  return ""
}

function isValidPlayUrl(url: string): boolean {
  const t = url.trim()
  return /^https:\/\/play\.google\.com\/apps\/testing\/.+/.test(t) ||
         /^https:\/\/play\.google\.com\/store\/apps\/details\?id=.+/.test(t)
}

const MAX_ICON_SIZE = 5_000_000

export default function NewAppPage() {
  const t = useTranslations("DashboardApps")
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast: addToast } = useToast()
  usePageMeta({ title: t("pageTitleNew") })
  const urlPackId = searchParams.get("packId")
  const [step, setStep] = useState<Step>(urlPackId ? "details" : "setup")
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
    platform: "Android",
    packId: "",
  })
  const [appIcon, setAppIcon] = useState<string | null>(null)
  const [iconError, setIconError] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"free" | "paid" | null>(null)
  const [setupAccepted, setSetupAccepted] = useState(false)
  const [showUrlHelp, setShowUrlHelp] = useState(false)

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
    const userPacks = await getUserPacks(user.uid)
    setPacks(userPacks)
    if (urlPackId) {
      setForm(f => ({ ...f, packId: urlPackId }))
    } else if (userPacks.length > 0 && !form.packId) {
      setForm(f => ({ ...f, packId: userPacks[0].id }))
    }
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_ICON_SIZE) {
      setIconError(t("iconError", { size: (file.size / 1024 / 1024).toFixed(1) }))
      setTimeout(() => setIconError(""), 4000)
      return
    }
    setIconError("")
    const reader = new FileReader()
    reader.onload = () => setAppIcon(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleLinkChange = (val: string) => {
    setForm({ ...form, googlePlayLink: val, packageName: extractPackageName(val) })
  }

  const goReview = () => {
    setError("")
    if (!form.appName.trim()) { setError(t("appNameRequired")); return }
    if (!form.googlePlayLink.trim()) { setError(t("testLinkRequired")); return }
    if (!isValidPlayUrl(form.googlePlayLink)) { setError(t("invalidPlayUrl")); return }
    if (!extractPackageName(form.googlePlayLink)) { setError(t("packageExtractError")); return }
    if (!appIcon) { setError(t("appIconRequired")); return }
    setStep("review")
  }

  const handleSubmitFree = async () => {
    setError("")
    setLoading(true)
    try {
      let targetPackId = form.packId || urlPackId
      if (!targetPackId) {
        const forming = await getFormingPacks()
        if (forming.length === 0) { setError(t("noActivePack")); setLoading(false); return }
        targetPackId = forming[0].id
      }

      const extraNotes = [form.instructions, form.testEmail ? `Test login: ${form.testEmail} / ${form.testPassword}` : ""].filter(Boolean).join("\n")
      await joinPack(targetPackId, user!)
      await submitApp({
        uid: user!.uid,
        appName: form.appName,
        packageName: form.packageName,
        description: form.description,
        category: form.category,
        language: form.language,
        googlePlayLink: form.googlePlayLink,
        instructions: extraNotes,
        packId: targetPackId,
        appIcon: appIcon || "",
      })
      setStep("done")
    } catch (err: any) {
      setError(err.message || t("submitError"))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPaid = async () => {
    setError("")
    setLoading(true)
    try {
      const extraNotes = [form.instructions, form.testEmail ? `Test login: ${form.testEmail} / ${form.testPassword}` : ""].filter(Boolean).join("\n")
      sessionStorage.setItem("paidAppData", JSON.stringify({
        appName: form.appName,
        packageName: form.packageName,
        description: form.description,
        category: form.category,
        language: form.language,
        googlePlayLink: form.googlePlayLink,
        instructions: extraNotes,
        appIcon: appIcon || "",
      }))
      router.push("/purchase")
    } catch (err: any) {
      setError(err.message || t("redirectError"))
    } finally {
      setLoading(false)
    }
  }

  const gosterilecekAdimlar = [
    { label: t("stepLabelSetup"), key: "setup" },
    { label: t("stepLabelDetails"), key: "details" },
    { label: t("stepLabelReview"), key: "review" },
    { label: t("stepLabelDone"), key: "done" },
  ].filter(a => a.key !== "done" || step === "done")

  if (authLoading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/apps" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToApps")}
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
            <h1 className="sr-only">{t("setupTitle")}</h1>
            <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-blue-600" /> {t("setupTitle")}</CardTitle>
            <CardDescription>{t("setupDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 mb-6">
              {[
                { num: "01", baslik: t("setupStep1Title"), detay: t("setupStep1Desc"), grup: "premiumpeek@googlegroups.com" },
                { num: "02", baslik: t("setupStep2Title"), detay: t("setupStep2Desc") },
                { num: "03", baslik: t("setupStep3Title"), detay: t("setupStep3Desc") },
                { num: "04", baslik: t("setupStep4Title"), detay: t("setupStep4Desc") },
              ].map((s) => (
                <div key={s.num} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <div className="flex items-start gap-3 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-sm font-bold">{s.num}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.baslik}</p>
                    </div>
                  </div>
                  <div className="pb-3 pl-10">
                    <p className="text-xs text-zinc-500 mb-2">{s.detay}</p>
                    {s.grup && (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-zinc-500">{t("googleGroupLabel")}</p>
                          <button onClick={() => { navigator.clipboard.writeText(s.grup!); addToast("success", t("copied")) }}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                            <Copy size={12} /> {t("copy")}
                          </button>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400 font-mono font-bold">{s.grup}</p>
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
                {t("confirmSetup")}
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link href="/dashboard/apps"><Button variant="ghost">{t("goBack")}</Button></Link>
              <Button disabled={!setupAccepted} onClick={() => setStep("details")}>
                {t("continue")} <ArrowLeft size={16} className="ml-1 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h1 className="sr-only">{t("uploadYourApp")}</h1>
            <CardTitle className="text-xl">{t("uploadYourApp")}</CardTitle>
            <CardDescription>{t("uploadDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("appName")} <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">{t("appNameDesc")}</p>
                <Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} placeholder={t("appNamePlaceholder")} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("platform")} <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">{t("platformDesc")}</p>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("testLink")} <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">{t("testLinkDesc")}</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input value={form.googlePlayLink} onChange={(e) => handleLinkChange(e.target.value)} placeholder={t("testLinkPlaceholder")} required />
                  </div>
                  <button type="button" onClick={() => setShowUrlHelp(true)} className="flex items-center gap-1 shrink-0 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                    <HelpCircle size={14} /> {t("howToFind")}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("appIcon")} <span className="text-red-500">*</span></label>
                <p className="text-xs text-zinc-400 mb-1">{t("appIconDesc")}</p>
                <div className="flex items-center gap-4">
                  {appIcon ? (
                    <img src={appIcon} alt={t("preview")} className="h-16 w-16 rounded-xl object-cover border border-zinc-300 dark:border-zinc-600" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 text-xs">{t("preview")}</div>
                  )}
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:underline">{t("chooseFile")}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleIconUpload} />
                    <p className="text-xs text-zinc-400 mt-1">{t("fileTypes")}</p>
                  </label>
                </div>
                {iconError && <p className="text-xs text-red-500 mt-1">{iconError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("testCredentials")}</label>
                <p className="text-xs text-zinc-400 mb-1">{t("testCredentialsDesc")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input value={form.testEmail} onChange={(e) => setForm({ ...form, testEmail: e.target.value })} placeholder={t("testEmailPlaceholder")} />
                  <Input value={form.testPassword} onChange={(e) => setForm({ ...form, testPassword: e.target.value })} placeholder={t("testPasswordPlaceholder")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("testerNotes")}</label>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder={t("testerNotesPlaceholder")}
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                />
              </div>
              <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button variant="ghost" onClick={() => setStep("setup")}>{t("goBack")}</Button>
                <Button onClick={goReview}>{t("reviewTitle")}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h1 className="sr-only">{t("reviewTitle")}</h1>
            <CardTitle className="text-xl">{t("reviewTitle")}</CardTitle>
            <CardDescription>{t("reviewDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

            {/* Özet */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 mb-6 space-y-2">
              <div className="flex items-center gap-3">
                {appIcon ? <img src={appIcon} alt={t("appName")} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400"><Smartphone size={18} /></div>}
                <div>
                  <p className="font-medium">{form.appName || t("appName")}</p>
                  <p className="text-xs text-zinc-500">{form.platform}</p>
                </div>
              </div>
              <div className="text-xs text-zinc-500 break-all">{form.googlePlayLink}</div>
              {(form.testEmail || form.testPassword) && <div className="text-xs text-zinc-500">Test login: {form.testEmail} / {form.testPassword}</div>}
            </div>

            {/* Yöntem seçimi */}
            <p className="text-sm font-medium mb-3">{t("howToProceed")}</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Ücretsiz */}
              <div className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOption === "free" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}
                onClick={() => setSelectedOption("free")}>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">{t("freeOption")}</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-500 mb-4">
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("freeFeature1")}</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("freeFeature2")}</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("freeFeature3")}</li>
                </ul>
              </div>

              {/* Ücretli */}
              <div className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOption === "paid" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}
                onClick={() => setSelectedOption("paid")}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">{t("paidOption")}</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-500 mb-4">
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("paidFeature1")}</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("paidFeature2")}</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("paidFeature3")}</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {t("paidFeature4")}</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep("details")}>{t("goBack")}</Button>
              {selectedOption === "free" ? (
                <Button onClick={handleSubmitFree} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={16} />}
                  {t("submitToPack")}
                </Button>
              ) : selectedOption === "paid" ? (
                <Button onClick={handleSubmitPaid} disabled={loading} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("continueWithUsdt")}
                </Button>
              ) : (
                <Button disabled>{t("selectOption")}</Button>
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
            <h1 className="text-xl font-bold mb-2">{t("doneTitle")}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              {t("doneDesc")}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/testing"><Button>{t("startTesting")}</Button></Link>
              <Link href="/dashboard/apps"><Button variant="outline">{t("myAppsLink")}</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Url Help Modal */}
      {showUrlHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowUrlHelp(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{t("urlHelpTitle")}</h3>
              <button onClick={() => setShowUrlHelp(false)} className="cursor-pointer"><X size={20} /></button>
            </div>

            <p className="text-sm text-zinc-500 mb-4">
              {t("urlHelpDesc")}
            </p>

            <ol className="space-y-3 mb-4">
              {[t("urlHelpStep1"), t("urlHelpStep2"), t("urlHelpStep3"), t("urlHelpStep4")].map((adim, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs font-bold mt-0.5">{i + 1}</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{adim}</span>
                </li>
              ))}
            </ol>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 mb-4">
              <p className="text-xs text-zinc-500 mb-1">{t("urlHelpExample")}</p>
              <p className="text-sm text-blue-600 font-mono break-all">https://play.google.com/apps/testing/com.example.app</p>
            </div>

            <p className="text-xs text-amber-600">
              {t("urlHelpWarning")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { submitApp, getUserPacks, CREDIT_COST_POST, type Pack } from "@/lib/firestore"
import { FileText, Loader2, ArrowLeft, Coins, CheckCircle, Smartphone, Globe, Users, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"

type Step = "details" | "review" | "submitting" | "done" | "choose"

const PLATFORMS = ["📱 Android"] as const
const STEPS = [
  { label: "App Details", key: "details" },
  { label: "Review & Submit", key: "review" },
  { label: "Done", key: "done" },
]

const SETUP_STEPS = [
  { num: "01", title: "Add Testers Group", desc: "Add our testers google group to your app's closed testing track", detail: "Navigate to your app's testing section and add our Google Group to enable our testers to access your app for the 14-day testing period.", group: "testers-community@googlegroups.com" },
  { num: "02", title: "Enable Global Testing", desc: "Select all countries to allow our testers to access your app", detail: "Expand your app's reach by selecting all countries. This ensures our international team of testers can participate in your app testing." },
  { num: "03", title: "Submit for Review", desc: "Send the changes to review - typically approved within 30-60 minutes", detail: "Once you've configured the testing settings, submit your changes to Google Play for review. This process is usually very quick." },
  { num: "04", title: "Activate Testing", desc: "Once approved, publish your changes to start the testing process", detail: "After Google approves your changes, publish them to activate the testing track and begin the 14-day testing period with our team." },
]

export default function NewAppPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")
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
  const [userCredits, setUserCredits] = useState(0)
  const [selectedOption, setSelectedOption] = useState<"free" | "paid" | null>(null)

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

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAppIcon(reader.result as string)
    reader.readAsDataURL(file)
  }

  const goReview = () => {
    setError("")
    if (!form.appName.trim()) { setError("App name is required"); return }
    if (!form.packageName.trim()) { setError("Package name is required"); return }
    if (!form.googlePlayLink.trim()) { setError("Testing URL is required"); return }
    setStep("review")
  }

  const handleSubmitFree = async () => {
    if (!form.packId) { setError("You need an active pack. Create or join one first."); return }
    setError("")
    setLoading(true)
    try {
      const extraNotes = [form.instructions, form.testEmail ? `Test credentials: ${form.testEmail} / ${form.testPassword}` : ""].filter(Boolean).join("\n")
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
      setError(err.message || "Error submitting app")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPaid = () => {
    router.push("/purchase")
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/apps" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> My Apps
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Setup Guide - Left Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="border-0 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /> Setup Guide</CardTitle>
              <CardDescription>Add our Google Group to your Play Console so we can start testing. Watch the video or follow the steps below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 aspect-video flex items-center justify-center text-sm text-zinc-400">
                <Globe className="h-8 w-8 mr-2" /> Setup guide video tutorial
              </div>
              <p className="text-xs text-zinc-400 text-center">or follow the steps below</p>
              <div className="space-y-0">
                {SETUP_STEPS.map((s) => (
                  <details key={s.num} className="group border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <summary className="flex items-start gap-3 py-3 cursor-pointer list-none">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs font-bold mt-0.5">{s.num}</span>
                      <div>
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
                      </div>
                    </summary>
                    <div className="pb-3 pl-9">
                      <p className="text-xs text-zinc-500 leading-relaxed">{s.detail}</p>
                      {s.group && (
                        <div className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-2">
                          <p className="text-xs text-blue-700 dark:text-blue-400 font-mono">{s.group}</p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Right Side */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.filter(s => s.key !== "submitting").map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  s.key === step ? "bg-blue-600 text-white" :
                  ["done", "submitting"].includes(step) && (s.key === "details" || s.key === "review") ? "bg-green-500 text-white" :
                  "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                }`}>{s.key === "done" || (["done", "submitting"].includes(step) && (s.key === "details" || s.key === "review")) ? <CheckCircle size={14} /> : i + 1}</div>
                <span className={`text-xs font-medium ${s.key === step ? "text-blue-600" : "text-zinc-400"}`}>{s.label}</span>
                {i < STEPS.filter(x => x.key !== "submitting").length - 1 && <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-600" />}
              </div>
            ))}
          </div>

          {/* Step: Details */}
          {step === "details" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Submit Your App</CardTitle>
                <CardDescription>Get your app tested by 25 professional testers for 16 days</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">App name <span className="text-red-500">*</span></label>
                    <p className="text-xs text-zinc-400 mb-1">The name as it appears on Google Play.</p>
                    <Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} placeholder="e.g., My Fitness Tracker" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Platform <span className="text-red-500">*</span></label>
                    <p className="text-xs text-zinc-400 mb-1">Where does your app run?</p>
                    <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Testing URL <span className="text-red-500">*</span></label>
                    <p className="text-xs text-zinc-400 mb-1">The public join link for your Google Play closed testing track. <a href="https://support.google.com/googleplay/android-developer/answer/9845334" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">How do I find this?</a></p>
                    <Input value={form.googlePlayLink} onChange={(e) => setForm({ ...form, googlePlayLink: e.target.value })} placeholder="https://play.google.com/apps/testing/..." required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">App icon</label>
                    <p className="text-xs text-zinc-400 mb-1">A square image so testers can recognise your app (PNG, JPG, max 5 MB).</p>
                    <div className="flex items-center gap-4">
                      {appIcon ? (
                        <img src={appIcon} alt="Preview" className="h-16 w-16 rounded-xl object-cover border border-zinc-300 dark:border-zinc-600" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 text-xs">Preview</div>
                      )}
                      <label className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:underline">browse files</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleIconUpload} />
                        <p className="text-xs text-zinc-400 mt-1">PNG, JPEG, or WebP (max. 5MB)</p>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Test credentials</label>
                    <p className="text-xs text-zinc-400 mb-1">If your app needs a login, share a test account so testers can get in. Add any extra notes they should know.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={form.testEmail} onChange={(e) => setForm({ ...form, testEmail: e.target.value })} placeholder="test@example.com" />
                      <Input value={form.testPassword} onChange={(e) => setForm({ ...form, testPassword: e.target.value })} placeholder="Password" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Extra notes for testers</label>
                    <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                      placeholder="Any extra notes for testers..."
                      className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Link href="/dashboard/apps"><Button variant="ghost">Cancel</Button></Link>
                    <Button onClick={goReview}>Continue to Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step: Review & Submit */}
          {step === "review" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Review &amp; Submit</CardTitle>
                <CardDescription>Review your app details and choose how you want to proceed.</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

                {/* App Summary */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 mb-6 space-y-2">
                  <div className="flex items-center gap-3">
                    {appIcon ? <img src={appIcon} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400"><Smartphone size={18} /></div>}
                    <div>
                      <p className="font-medium">{form.appName || "App Name"}</p>
                      <p className="text-xs text-zinc-500">{form.platform}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 break-all">{form.googlePlayLink}</div>
                  {(form.testEmail || form.testPassword) && <div className="text-xs text-zinc-500">Test credentials: {form.testEmail} / {form.testPassword}</div>}
                </div>

                {/* Two Options: Free vs Paid */}
                <p className="text-sm font-medium mb-3">Choose how you want to proceed:</p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {/* Free Option */}
                  <div className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOption === "free" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}
                    onClick={() => setSelectedOption("free")}>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Free - Join a Pack</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-500 mb-4">
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 16 developers test each other's apps</li>
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 14 days of daily testing</li>
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> Earn credits by testing others</li>
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {CREDIT_COST_POST} kredi required</li>
                    </ul>
                    {packs.length === 0 && <p className="text-xs text-amber-600">You need an active pack. Create one first.</p>}
                  </div>

                  {/* Paid Option */}
                  <div className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${selectedOption === "paid" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}
                    onClick={() => setSelectedOption("paid")}>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">$10 USDT - Professional</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-500 mb-4">
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 25 professional testers</li>
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 16 days of testing</li>
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> Starts within 6 hours</li>
                      <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> 14-day money-back guarantee</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button variant="ghost" onClick={() => setStep("details")}>Back</Button>
                  {selectedOption === "free" ? (
                    <Button onClick={handleSubmitFree} disabled={loading || userCredits < CREDIT_COST_POST || packs.length === 0} className="gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={16} />}
                      Submit to Pack
                    </Button>
                  ) : selectedOption === "paid" ? (
                    <Button onClick={handleSubmitPaid} className="gap-2 bg-purple-600 hover:bg-purple-700">
                      Continue with $10 USDT
                    </Button>
                  ) : (
                    <Button disabled>Select an option above</Button>
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
                <h2 className="text-xl font-bold mb-2">App Submitted! 🎉</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  Your app has been added to your pack. Other members will start testing it within 24 hours. 
                  Don't forget to test their apps daily to earn credits and keep the pack active.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/dashboard/testing"><Button>Start Testing</Button></Link>
                  <Link href="/dashboard/apps"><Button variant="outline">My Apps</Button></Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

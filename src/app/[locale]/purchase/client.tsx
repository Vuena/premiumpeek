"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle, Copy } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { getFormingPacks, joinPack, submitApp } from "@/lib/firestore"
import { useTranslations } from "next-intl"
import { usePageMeta } from "@/lib/usePageMeta"
import { useToast } from "@/context/ToastContext"

const USDT_WALLET = process.env.NEXT_PUBLIC_USDT_WALLET || ""
const USDT_PRICE = parseInt(process.env.NEXT_PUBLIC_USDT_PRICE || "10")

export default function PurchaseClient() {
  const t = useTranslations("PurchasePage")
  usePageMeta({ title: t("metaTitle"), description: t("metaDescription") })

  const { user, loading: authLoading } = useAuth()
  const { toast: addToast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState<"form" | "payment" | "confirming" | "success">("form")
  const [form, setForm] = useState({ appName: "", googlePlayLink: "", instructions: "", packageName: "", appIcon: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<{ orderId: string; walletAddress: string; amount: number; currency: string; network: string } | null>(null)
  const [txHash, setTxHash] = useState("")

  function extractPackageName(url: string): string {
    const testingMatch = url.match(/play\.google\.com\/apps\/testing\/([^/?\s]+)/)
    if (testingMatch) return testingMatch[1]
    const storeMatch = url.match(/[?&]id=([^&?\s]+)/)
    if (storeMatch) return storeMatch[1]
    return "unknown"
  }

  useEffect(() => {
    if (authLoading || !user) return
    const saved = sessionStorage.getItem("paidAppData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setForm({
          appName: data.appName || "",
          googlePlayLink: data.googlePlayLink || "",
          instructions: data.instructions || "",
          packageName: data.packageName || extractPackageName(data.googlePlayLink || ""),
          appIcon: data.appIcon || "",
        })
        createOrder(data)
      } catch {
        sessionStorage.removeItem("paidAppData")
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (redirectTo) { router.push(redirectTo) }
  }, [redirectTo, router])

  const createOrder = async (appData: any) => {
    setLoading(true)
    setError("")
    try {
      if (!auth?.currentUser) throw new Error(t("errorLogin"))
      const pn = appData.packageName || extractPackageName(appData.googlePlayLink || "")
      if (!db) throw new Error(t("errorDB"))
      const orderRef = await addDoc(collection(db, "orders"), {
        uid: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "",
        userName: auth.currentUser.displayName || "",
        appName: appData.appName,
        packageName: pn,
        googlePlayLink: appData.googlePlayLink,
        instructions: appData.instructions || "",
        amount: USDT_PRICE,
        currency: "USDT",
        status: "awaiting_payment",
        walletAddress: USDT_WALLET,
        txHash: "",
        testers: [],
        testerCount: 0,
        currentDay: 0,
        totalDays: 16,
        reportIds: [],
        appIcon: appData.appIcon || "",
        createdAt: serverTimestamp(),
      })

      setOrderData({
        orderId: orderRef.id,
        walletAddress: USDT_WALLET,
        amount: USDT_PRICE,
        currency: "USDT",
        network: "TRC-20",
      })
      sessionStorage.removeItem("paidAppData")
      setStep("payment")
    } catch (err: any) {
      setError(err.message || t("errorVerify"))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.appName.trim()) { setError(t("errorAppName")); return }
    if (!form.googlePlayLink.trim()) { setError(t("errorPlayLink")); return }
    await createOrder({
      appName: form.appName,
      googlePlayLink: form.googlePlayLink,
      instructions: form.instructions,
      packageName: extractPackageName(form.googlePlayLink),
      appIcon: "",
    })
  }

  const handleVerifyPayment = async () => {
    if (!txHash.trim()) { setError(t("errorTxHash")); return }
    setError("")
    setLoading(true)
    try {
      if (!auth?.currentUser || !orderData) throw new Error(t("errorLogin"))
      const token = await auth.currentUser.getIdToken()
      const user = auth.currentUser

      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: orderData.orderId, txHash: txHash.trim() }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || t("errorVerify"))

      const formingPacks = await getFormingPacks()
      if (formingPacks.length > 0) {
        try {
          await joinPack(formingPacks[0].id, user, "premium")
          const appId = await submitApp({
            uid: user.uid,
            appName: form.appName,
            packageName: extractPackageName(form.googlePlayLink),
            description: "",
            category: "",
            language: "",
            googlePlayLink: form.googlePlayLink,
            instructions: "",
            packId: formingPacks[0].id,
            appIcon: "",
          })
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ orderId: orderData.orderId, txHash: txHash.trim(), packId: formingPacks[0].id, appId }),
          })
        } catch (e: any) {
          console.error("Post-payment error:", e)
          throw new Error(t("errorPostPayment"))
        }
      }

      setStep("success")
    } catch (err: any) {
      setError(err.message || t("errorVerify"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  if (authLoading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!user) return null

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
    t("benefit5"),
    t("benefit6"),
    t("benefit7"),
  ]

  const steps = [
    t("step1"),
    t("step2"),
    t("step3"),
    t("step4"),
    t("step5"),
  ]

  if (step === "payment" && orderData) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold mb-2">{t("paymentTitle")}</h1>
              <p className="text-sm text-zinc-500">
                {t("orderLabel")}: <span className="font-mono font-bold">{orderData.orderId.slice(0, 8)}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-100 dark:bg-[#121212] p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold mb-1">{orderData.amount} {orderData.currency}</p>
                <p className="text-xs text-zinc-500">{t("network")}: {orderData.network}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">{t("sendAddress")}</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-300 dark:border-zinc-600">
                    <code className="text-xs font-mono font-bold flex-1 select-all break-all">{orderData.walletAddress}</code>
                    <button onClick={() => { navigator.clipboard.writeText(orderData.walletAddress) }}
                      className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                      <Copy size={16} className="text-zinc-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4 mb-6 text-sm text-yellow-700 dark:text-yellow-400">
              <strong>{t("afterPayment")}</strong>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("txHash")}</label>
                <Input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder={t("txHashPlaceholder")} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleVerifyPayment} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("confirmPayment")}
              </Button>
              <p className="text-xs text-center text-zinc-400">
                <a href={`https://tronscan.org/#/address/${orderData.walletAddress}`} target="_blank" rel="noopener noreferrer" className="underline">{t("checkTronscan")}</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-xl font-bold mb-2">{t("successTitle")}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {t("successDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/orders"><Button>{t("myOrders")}</Button></Link>
              <Link href="/dashboard"><Button variant="outline">{t("backToDashboard")}</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/#pricing" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToPricing")}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h1 className="sr-only">{t("title")}</h1>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("appName")}</label>
                <Input value={form.appName} onChange={e => setForm({ ...form, appName: e.target.value })} placeholder={t("appNamePlaceholder")} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("googlePlayLink")}</label>
                <Input value={form.googlePlayLink} onChange={e => setForm({ ...form, googlePlayLink: e.target.value })} placeholder={t("googlePlayLinkPlaceholder")} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("testInstructions")}</label>
                <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })}
                  placeholder={t("testInstructionsPlaceholder")}
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 text-base py-6">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {loading ? t("processing") : t("continuePayment")}
              </Button>
              <p className="text-xs text-center text-zinc-400">
                {t.rich("refundNote", {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6" />
                <h3 className="font-semibold text-lg">{t("packageTitle")}</h3>
              </div>
              <ul className="space-y-3">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-100">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">{t("howTitle")}</h3>
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs font-bold">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

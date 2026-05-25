"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle, Copy, Clock, Smartphone, FileText, Star, MessageSquare } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase"

export default function PurchasePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<"form" | "payment" | "confirming" | "success">("form")
  const [form, setForm] = useState({ appName: "", packageName: "", googlePlayLink: "", instructions: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<{ orderId: string; walletAddress: string; amount: number; currency: string; network: string } | null>(null)
  const [txHash, setTxHash] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.appName.trim()) { setError("Uygulama adı gerekli"); return }
    if (!form.packageName.trim()) { setError("Paket adı gerekli"); return }
    if (!form.googlePlayLink.trim()) { setError("Google Play linki gerekli"); return }
    setLoading(true)

    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) throw new Error("Giriş yapmalısın")

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (data.success) {
        setOrderData(data)
        setStep("payment")
      } else {
        setError(data.error || "Bir hata oluştu")
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!txHash.trim()) { setError("TX Hash gerekli"); return }
    setError("")
    setLoading(true)
    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) throw new Error("Giriş yapmalısın")

      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: orderData?.orderId, txHash: txHash.trim() }),
      })

      const data = await res.json()
      if (data.success) {
        setStep("success")
      } else {
        setError(data.error || "Doğrulama başarısız")
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (!user) { router.push("/login"); return null }

  const benefits = [
    "25 profesyonel testçi",
    "6 saat içinde başlangıç",
    "16 gün tam test süreci",
    "Detaylı hata raporları",
    "Google Play form yanıtları",
    "%100 memnuniyet garantisi",
    "14 gün tam iade garantisi",
    "7/24 öncelikli destek",
  ]

  if (step === "payment" && orderData) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Ödeme Yap</h2>
              <p className="text-sm text-zinc-500">
                Sipariş: <span className="font-mono font-bold">{orderData.orderId.slice(0, 8)}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-100 dark:bg-[#121212] p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold mb-1">{orderData.amount} {orderData.currency}</p>
                <p className="text-xs text-zinc-500">Ağ: {orderData.network}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Gönderilecek Adres</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-300 dark:border-zinc-600">
                    <code className="text-xs font-mono font-bold flex-1 select-all break-all">{orderData.walletAddress}</code>
                    <button onClick={() => { navigator.clipboard.writeText(orderData.walletAddress) }}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                      <Copy size={16} className="text-zinc-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4 mb-6 text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Ödeme sonrası:</strong> TX Hash'ini aşağıya yapıştır. Admin onayından sonra test sürecin başlayacak.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">TX Hash (İşlem Numarası)</label>
                <Input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="TRONSCAN'den kopyala..." />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleVerifyPayment} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Ödemeyi Onayla
              </Button>
              <p className="text-xs text-center text-zinc-400">
                <a href={`https://tronscan.org/#/address/${orderData.walletAddress}`} target="_blank" rel="noopener noreferrer" className="underline">TRONSCAN'da kontrol et</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <Card className="border-0 shadow-sm text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Ödeme Kaydedildi! 🎉</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              TX Hash'in kaydedildi. Admin onayından sonra 25 testçin 6 saat içinde atanacak.
              Sipariş durumunu panelden takip edebilirsin.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/orders"><Button>Siparişlerim</Button></Link>
              <Link href="/dashboard"><Button variant="outline">Panele Dön</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/#pricing" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Fiyatlandırma
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Hızlı Test Satın Al</CardTitle>
            <CardDescription>25 testçi, 16 gün, $10 USDT</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Uygulama Adı *</label>
                <Input value={form.appName} onChange={e => setForm({ ...form, appName: e.target.value })} placeholder="Örn: Hesap Makinesi" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Paket Adı *</label>
                <Input value={form.packageName} onChange={e => setForm({ ...form, packageName: e.target.value })} placeholder="com.ornek.app" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Google Play Linki *</label>
                <Input value={form.googlePlayLink} onChange={e => setForm({ ...form, googlePlayLink: e.target.value })} placeholder="https://play.google.com/..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Test Talimatları</label>
                <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Varsa özel talimatlar..."
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2 text-base py-6">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {loading ? "İşleniyor..." : "$10 USDT ile Devam Et"}
              </Button>
              <p className="text-xs text-center text-zinc-400">
                Ödeme USDT (TRC-20) ile alınır. 14 gün içinde sonuç alınmazsa <strong>tam iade garantisi</strong>.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6" />
                <h3 className="font-semibold text-lg">Paket İçeriği</h3>
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
              <h3 className="font-semibold text-lg mb-2">Nasıl Çalışır?</h3>
              <ol className="space-y-3">
                {[
                  "Formu doldur, sipariş oluştur",
                  "$10 USDT gönder (TRC-20)",
                  "TX Hash'ini yapıştır, onayla",
                  "25 testçin 6 saat içinde atanır",
                  "16 gün sonra rapor + form cevapları",
                ].map((s, i) => (
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

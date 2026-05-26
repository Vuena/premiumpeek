"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import { Loader2, ArrowLeft, Send, Mail } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"
import { useToast } from "@/context/ToastContext"

export default function AdminEmailPage() {
  const t = useTranslations("AdminEmail")
  usePageMeta({ title: t("metaTitle") })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [target, setTarget] = useState("all")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState("")
  const { toast: addToast } = useToast()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    if ((user as any).role !== "admin") { router.push("/dashboard"); return }
  }, [user, authLoading, router])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResult(null)
    if (!subject.trim() || !message.trim()) { setError(t("errorSubjectMessage")); return }

    setSending(true)
    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) { setError(t("errorSession")); return }
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, message, target }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t("errorSend")); return }
      setResult({ sent: data.sent, failed: data.failed })
      setSubject("")
      setMessage("")
    } catch (err: any) {
      setError(err.message || t("errorGeneric")); addToast("error", err.message || t("errorGeneric"))
    } finally {
      setSending(false)
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToAdmin")}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("cardTitle")}</CardTitle>
          <CardDescription>{t("cardDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          {result && (
            <div className="mb-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm text-green-600 dark:text-green-400">
              {t("resultSuccess", { sent: result.sent, failed: result.failed })}
            </div>
          )}
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("targetLabel")}</label>
              <select value={target} onChange={e => setTarget(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400">
                <option value="all">{t("targetAll")}</option>
                <option value="testers">{t("targetTesters")}</option>
                <option value="premium">{t("targetPremium")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("subjectLabel")}</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder={t("subjectPlaceholder")} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("messageLabel")}</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
                rows={8}
                className="flex min-h-[120px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                required />
            </div>
            <Button type="submit" disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              {sending ? t("sendingBtn") : t("sendBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, Clock, Loader2, CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePageMeta } from "@/lib/usePageMeta"

export default function ContactClient() {
  const t = useTranslations("ContactPage")
  usePageMeta({ title: t("metaTitle"), description: t("metaDescription") })
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: "success", text: data.message })
        setForm({ name: "", email: "", message: "" })
      } else {
        setStatus({ type: "error", text: data.error || t("formError") })
      }
    } catch {
      setStatus({ type: "error", text: t("formRetry") })
    } finally {
      setSending(false)
    }
  }

  const contactItems = [
    { icon: Mail, title: t("emailTitle"), desc: "premiumpeektest@gmail.com", href: "mailto:premiumpeektest@gmail.com" },
    { icon: MessageSquare, title: t("supportTitle"), desc: t("supportDesc") },
    { icon: Clock, title: t("responseTitle"), desc: t("responseDesc") },
  ]

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-muted mb-12">{t("subtitle")}</p>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {contactItems.map(item => (
          <div key={item.title} className="text-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <item.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-zinc-100 dark:bg-[#121212] p-8">
        <h2 className="text-xl font-bold mb-6">{t("formTitle")}</h2>
        {status && (
          <div className={`mb-4 rounded-xl p-3 text-sm flex items-center gap-2 ${
            status.type === "success"
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}>
            {status.type === "success" ? <CheckCircle2 size={16} /> : null}
            {status.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("formName")}</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" placeholder={t("formNamePlaceholder")} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("formEmail")}</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" placeholder={t("formEmailPlaceholder")} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("formMessage")}</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} required
              className="flex min-h-[100px] w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" placeholder={t("formMessagePlaceholder")} />
          </div>
          <Button type="submit" disabled={sending} className="w-full gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {sending ? t("formSending") : t("formSend")}
          </Button>
        </form>
      </div>

      <p className="text-xs text-muted text-center mt-8">
        {t.rich("directEmail", {
          email: () => <a href="mailto:premiumpeektest@gmail.com" className="text-blue-600 hover:underline">premiumpeektest@gmail.com</a>
        })}
      </p>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 text-center">{t("faqTitle")}</h2>
        <div className="space-y-3">
          {faqs.map(item => (
            <details key={item.q} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 group">
              <summary className="font-medium cursor-pointer text-sm">{item.q}</summary>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

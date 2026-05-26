"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePageMeta } from "@/lib/usePageMeta"

export default function LoginClient() {
  const t = useTranslations("LoginPage")
  usePageMeta({ title: `${t("title")} | PremiumPeek`, description: `${t("subtitle")}.` })
  const { signInWithGoogle, signInWithEmail, user: authUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const pendingRef = useRef(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Email login error:", err)
      setError(err.message || t("errorLogin"))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)
    pendingRef.current = true
    try {
      const result = await signInWithGoogle()
      pendingRef.current = false
      if (result === "redirect") {
        return
      }
      if (result === "closed") {
        setLoading(false)
        return
      }
      router.push("/dashboard")
    } catch (err: any) {
      pendingRef.current = false
      console.error("Google login error:", err, "keys:", Object.keys(err ?? {}), "toString:", err?.toString?.())
      try { console.error("JSON:", JSON.stringify(err)) } catch {}
      let msg = t("errorGoogle")
      if (err?.code && err?.message) {
        msg = `${err.code}: ${err.message}`
      } else if (err?.message) {
        msg = err.message
      } else if (typeof err === "string") {
        msg = err
      }
      setError(msg)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && authUser && pendingRef.current) {
      pendingRef.current = false
      setLoading(false)
      router.push("/dashboard")
    }
  }, [authLoading, authUser, router])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-cardborder shadow-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 font-bold text-lg mb-2">
            <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none">
              <defs><linearGradient id="login-logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2563eb"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
              <rect width="32" height="32" rx="7" fill="url(#login-logo)"/>
              <rect x="8" y="4" width="16" height="24" rx="3" stroke="white" strokeWidth="1.8" fill="none"/>
              <rect x="10.5" y="6" width="11" height="14" rx="1" fill="white" opacity="0.2"/>
              <rect x="14.5" y="21" width="3" height="1.5" rx="0.75" fill="white"/>
            </svg>
            PremiumPeek
          </Link>
          <h1 className="sr-only">{t("title")}</h1>
          <CardTitle className="text-xl">{t("welcome")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="w-full mb-4 gap-2">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("loginGoogle")}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cardborder" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted">{t("or")}</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("email")}</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("password")}</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail size={18} />}
              {t("loginButton")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            {t("noAccount")}{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">{t("signup")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

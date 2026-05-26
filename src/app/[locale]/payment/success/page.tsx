"use client"
export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const t = useTranslations("PaymentPage")
  useEffect(() => { document.title = `${t("successTitle")} | PremiumPeek`; router.replace("/dashboard") }, [router, t])
  return <div className="flex items-center justify-center min-h-screen text-muted">{t("redirecting")}</div>
}

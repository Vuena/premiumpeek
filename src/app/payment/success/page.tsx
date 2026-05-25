"use client"
export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PaymentSuccessPage() {
  const router = useRouter()
  useEffect(() => { document.title = "Ödeme Başarılı | PremiumPeek"; router.replace("/dashboard") }, [router])
  return null
}

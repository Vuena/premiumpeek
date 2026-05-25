"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PaymentCancelPage() {
  const router = useRouter()
  useEffect(() => { document.title = "Ödeme İptal Edildi | PremiumPeek"; router.replace("/dashboard") }, [router])
  return null
}

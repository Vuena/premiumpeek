"use client"
export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CreditsPage() {
  const router = useRouter()
  useEffect(() => { document.title = "Krediler | PremiumPeek"; router.replace("/dashboard") }, [router])
  return null
}

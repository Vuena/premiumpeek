"use client"
export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function CreditsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace("/login"); return }
    router.replace("/dashboard")
  }, [user, loading, router])

  return null
}
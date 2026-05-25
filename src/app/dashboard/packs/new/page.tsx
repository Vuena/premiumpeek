"use client"
export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function NewPackRedirect() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    router.replace("/dashboard/packs")
  }, [user, authLoading, router])

  return null
}

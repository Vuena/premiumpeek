"use client"

import { useEffect, useState } from "react"
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "@/i18n/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallbackClient() {
  const router = useRouter()
  const [status, setStatus] = useState("Yönlendiriliyor...")

  useEffect(() => {
    if (!auth) {
      setStatus("Firebase başlatılamadı")
      return
    }

    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) {
      router.replace("/login")
      return
    }

    const params = new URLSearchParams(hash)
    const idToken = params.get("id_token")
    const accessToken = params.get("access_token")

    if (!idToken) {
      router.replace("/login?auth_error=missing_id_token")
      return
    }

    const credential = GoogleAuthProvider.credential(idToken, accessToken || undefined)

    signInWithCredential(auth, credential)
      .then(() => {
        router.replace("/dashboard")
      })
      .catch((err) => {
        console.error("[AUTH] signInWithCredential error:", err)
        const msg = encodeURIComponent(err?.code || err?.message || "credential_error")
        router.replace(`/login?auth_error=${msg}`)
      })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">{status}</p>
      </div>
    </div>
  )
}

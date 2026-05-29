"use client"

import { useEffect, useState } from "react"
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export default function AuthCallbackClient() {
  const [status, setStatus] = useState("redirecting...")

  useEffect(() => {
    if (!auth || !db) {
      setStatus("Firebase not initialized")
      return
    }

    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) {
      const locale = window.location.pathname.split("/")[1] || "tr"
      window.location.href = `/${locale}/login`
      return
    }

    const params = new URLSearchParams(hash)
    const idToken = params.get("id_token")
    const accessToken = params.get("access_token")

    if (!idToken) {
      const locale = window.location.pathname.split("/")[1] || "tr"
      window.location.href = `/${locale}/login?auth_error=missing_id_token`
      return
    }

    const credential = GoogleAuthProvider.credential(idToken, accessToken || undefined)

    signInWithCredential(auth, credential)
      .then(async (result) => {
        const userRef = doc(db!, "users", result.user.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName || "",
            photoURL: result.user.photoURL || "",
            totalTested: 0,
            totalPosted: 0,
            isTester: false,
            role: "user",
            createdAt: serverTimestamp(),
          })
        }
        const locale = window.location.pathname.split("/")[1] || "tr"
        window.location.href = `/${locale}/dashboard`
      })
      .catch((err) => {
        console.error("[AUTH] signInWithCredential error:", err)
        const locale = window.location.pathname.split("/")[1] || "tr"
        const msg = encodeURIComponent(err?.code || err?.message || "credential_error")
        window.location.href = `/${locale}/login?auth_error=${msg}`
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

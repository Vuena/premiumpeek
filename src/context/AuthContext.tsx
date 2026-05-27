"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

interface AuthUser extends User {
  username?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const getFirestoreDb = () => {
    if (!db) throw new Error("Firebase not initialized. Check your .env.local configuration.")
    return db
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AUTH] onAuthStateChanged fired. user:", firebaseUser?.uid || "null", "loading before:", loading)
      try {
        if (firebaseUser) {
          const userSnap = await getDoc(doc(getFirestoreDb(), "users", firebaseUser.uid)).catch(() => null)
          if (userSnap?.exists()) {
            console.log("[AUTH] User doc exists, setting user")
            setUser({ ...firebaseUser, ...userSnap.data() } as AuthUser)
          } else {
            console.log("[AUTH] No user doc, creating...")
            await createUserDocument(firebaseUser)
            const newSnap = await getDoc(doc(getFirestoreDb(), "users", firebaseUser.uid))
            setUser({ ...firebaseUser, ...newSnap.data() } as AuthUser)
          }
        } else {
          console.log("[AUTH] No user, setting null")
          setUser(null)
        }
      } catch (err) {
        console.error("[AUTH] onAuthStateChanged error:", err)
        if (firebaseUser) {
          setUser(firebaseUser as AuthUser)
        } else {
          setUser(null)
        }
      }
      setLoading(false)
      console.log("[AUTH] Loading set to false")
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!auth) {
      console.log("[AUTH] No auth instance, skipping getRedirectResult")
      return
    }
    console.log("[AUTH] Calling getRedirectResult...")
    getRedirectResult(auth).then((result) => {
      console.log("[AUTH] getRedirectResult resolved. result:", result?.user?.uid || "null")
      if (result) {
        createUserDocument(result.user).then(() => {
          const locale = window.location.pathname.split("/")[1]
          const safeLocale = locale === "__" || !locale ? "en" : locale
          console.log("[AUTH] Redirect result handled, redirecting to dashboard")
          window.location.href = `/${safeLocale}/dashboard`
        }).catch((err) => {
          console.error("[AUTH] Redirect sign-in doc error:", err)
        })
      } else {
        console.log("[AUTH] getRedirectResult returned null (no pending redirect)")
      }
    }).catch((err) => {
      console.error("[AUTH] getRedirectResult error:", err, "code:", err?.code, "message:", err?.message)
      const locale = window.location.pathname.split("/")[1]
      const safeLocale = locale === "__" || !locale ? "en" : locale
      const msg = encodeURIComponent(err?.code || err?.message || "redirect_error")
      window.location.href = `/${safeLocale}/login?auth_error=${msg}`
    })
  }, [])

  const createUserDocument = async (user: User, name?: string) => {
    const d = getFirestoreDb()
    const userRef = doc(d, "users", user.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: name || user.displayName || "",
        photoURL: user.photoURL || "",
        totalTested: 0,
        totalPosted: 0,
        isTester: false,
        role: "user",
        createdAt: serverTimestamp(),
      })
    }
  }

  const getFirebaseAuth = () => {
    if (!auth) throw new Error("Firebase not initialized. Check your .env.local configuration.")
    return auth
  }

  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider()
    const a = getFirebaseAuth()
    await signInWithRedirect(a, provider)
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
    await createUserDocument(result.user, name)
  }

  const logout = async () => {
    try {
      await signOut(getFirebaseAuth())
    } catch (err) {
      console.error("logout error:", err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

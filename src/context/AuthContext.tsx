"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
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
  signInWithGoogle: () => Promise<"popup" | "redirect" | "closed">
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
      try {
        if (firebaseUser) {
          const userSnap = await getDoc(doc(getFirestoreDb(), "users", firebaseUser.uid)).catch(() => null)
          if (userSnap?.exists()) {
            setUser({ ...firebaseUser, ...userSnap.data() } as AuthUser)
          } else {
            setUser(firebaseUser as AuthUser)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Auth state change error:", err)
        if (firebaseUser) {
          setUser(firebaseUser as AuthUser)
        } else {
          setUser(null)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!auth) return
    getRedirectResult(auth).then((result) => {
      if (result) {
        createUserDocument(result.user).then(() => {
          const locale = window.location.pathname.split("/")[1]
          const safeLocale = locale === "__" || !locale ? "en" : locale
          window.location.href = `/${safeLocale}/dashboard`
        }).catch((err) => {
          console.error("Redirect sign-in doc error:", err)
        })
      }
    }).catch((err) => {
      console.error("Redirect sign-in error:", err)
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

  const signInWithGoogle = async (): Promise<"popup" | "redirect" | "closed"> => {
    const provider = new GoogleAuthProvider()
    const a = getFirebaseAuth()
    try {
      const result = await signInWithPopup(a, provider)
      await createUserDocument(result.user)
      return "popup"
    } catch (err: any) {
      if (err?.code === "auth/popup-blocked") {
        setLoading(true)
        await signInWithRedirect(a, provider)
        return "redirect"
      }
      if (err?.code === "auth/popup-closed-by-user") {
        return "closed"
      }
      throw err
    }
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

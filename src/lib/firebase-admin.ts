import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

let serviceAccount: any
try {
  serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined
} catch (err) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err)
  serviceAccount = undefined
}

const app = !getApps().length && serviceAccount
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0] || undefined

export const adminDb = app ? getFirestore(app) : undefined
export const adminAuth = app ? getAuth(app) : undefined

export { app as adminApp }

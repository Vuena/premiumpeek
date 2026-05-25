import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined

const app = !getApps().length && serviceAccount
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0] || undefined

export const adminDb = app ? getFirestore(app) : undefined
export const adminAuth = app ? getAuth(app) : undefined

export { app as adminApp }

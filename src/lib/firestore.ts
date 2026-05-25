import { db } from "./firebase"
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
  arrayUnion,
  arrayRemove,
  type Timestamp,
} from "firebase/firestore"
import type { User } from "firebase/auth"

// ==================== TYPES ====================

export interface Pack {
  id: string
  name: string
  code: string
  status: "forming" | "active" | "completed"
  startDate?: Timestamp
  endDate?: Timestamp
  currentDay: number
  maxMembers: number
  totalDays: number
  members: PackMember[]
  createdBy: string
  createdAt: Timestamp
}

export interface PackMember {
  uid: string
  displayName: string
  photoURL?: string
  joinedAt: Timestamp
}

export interface App {
  id: string
  uid: string
  appName: string
  packageName: string
  description: string
  category: string
  language: string
  googlePlayLink: string
  instructions: string
  status: "pending" | "testing" | "completed"
  packId?: string
  screenshots: string[]
  createdAt: Timestamp
}

export interface CreditTransaction {
  id: string
  uid: string
  amount: number
  type: "earned" | "spent"
  reason: "test" | "post" | "bonus" | "referral" | "penalty"
  referenceId?: string
  note?: string
  createdAt: Timestamp
}

export interface DailyActivity {
  id: string
  packId: string
  uid: string
  appId: string
  day: number
  status: "pending" | "done"
  feedback?: string
  bugsFound?: string[]
  completedAt?: Timestamp
}

// ==================== PACK FUNCTIONS ====================

const CODES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generatePackCode(): string {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += CODES[Math.floor(Math.random() * CODES.length)]
  }
  return code
}

export async function createPack(name: string, user: User) {
  const d = db!
  const code = generatePackCode()
  const packRef = await addDoc(collection(d, "packs"), {
    name,
    code,
    status: "forming",
    currentDay: 0,
    maxMembers: 16,
    totalDays: 16,
    members: [
      {
        uid: user.uid,
        displayName: user.displayName || user.email || "İsimsiz",
        photoURL: user.photoURL || "",
        joinedAt: serverTimestamp(),
      },
    ],
    memberUids: [user.uid],
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  })
  return { id: packRef.id, code }
}

export async function joinPackByCode(code: string, user: User) {
  const d = db!
  const packsRef = collection(d, "packs")
  const q = query(packsRef, where("code", "==", code.toUpperCase()), where("status", "==", "forming"), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error("Geçerli bir pack kodu bulunamadı. Kod hatalı veya pack dolu olabilir.")
  }

  const packDoc = snapshot.docs[0]
  const packData = packDoc.data() as Omit<Pack, "id">

  if (packData.members.length >= packData.maxMembers) {
    throw new Error("Bu pack dolu (16/16).")
  }

  if (packData.members.some((m) => m.uid === user.uid)) {
    throw new Error("Zaten bu pack'in üyesisin.")
  }

  await runTransaction(d, async (transaction) => {
    const ref = doc(d, "packs", packDoc.id)
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const current = snap.data()
    if (current.members.length >= current.maxMembers) throw new Error("Pack doldu.")
    if (current.members.some((m: any) => m.uid === user.uid)) throw new Error("Zaten üyesin.")

    transaction.update(ref, {
      members: arrayUnion({
        uid: user.uid,
        displayName: user.displayName || user.email || "İsimsiz",
        photoURL: user.photoURL || "",
        joinedAt: new Date(),
      }),
      memberUids: arrayUnion(user.uid),
    })
  })

  return { packId: packDoc.id, packName: packData.name }
}

export async function leavePack(packId: string, uid: string) {
  const d = db!
  const packRef = doc(d, "packs", packId)

  await runTransaction(d, async (transaction) => {
    const snap = await transaction.get(packRef)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const data = snap.data()
    const member = data.members.find((m: PackMember) => m.uid === uid)
    if (!member) throw new Error("Bu pack'in üyesi değilsin.")

    transaction.update(packRef, {
      members: arrayRemove(member),
      memberUids: arrayRemove(uid),
    })
  })
}

export async function getUserPacks(uid: string) {
  const d = db!
  const packsRef = collection(d, "packs")
  const q = query(
    packsRef,
    where("memberUids", "array-contains", uid),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Pack))
}

export async function getPackById(packId: string) {
  const d = db!
  const snap = await getDoc(doc(d, "packs", packId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Pack
}

export async function startPack(packId: string, uid: string) {
  const d = db!
  const packRef = doc(d, "packs", packId)
  await runTransaction(d, async (transaction) => {
    const snap = await transaction.get(packRef)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const data = snap.data()
    if (data.createdBy !== uid) throw new Error("Sadece pack sahibi başlatabilir.")
    if (data.status !== "forming") throw new Error("Pack zaten başlatılmış.")
    if (data.members.length < 2) throw new Error("En az 2 üye gerekli.")

    transaction.update(packRef, {
      status: "active",
      startDate: new Date(),
      currentDay: 1,
    })
  })
}

// ==================== APP FUNCTIONS ====================

const CREDIT_COST_POST = 60

export async function submitApp(data: {
  uid: string
  appName: string
  packageName: string
  description: string
  category: string
  language: string
  googlePlayLink: string
  instructions: string
  packId: string
}) {
  const d = db!

  const appRef = await runTransaction(d, async (transaction) => {
    const userRef = doc(d, "users", data.uid)
    const userSnap = await transaction.get(userRef)
    if (!userSnap.exists()) throw new Error("Kullanıcı bulunamadı.")
    const userData = userSnap.data()
    const credits = userData.credits ?? 0
    if (credits < CREDIT_COST_POST) {
      throw new Error(`Yetersiz kredi. ${CREDIT_COST_POST}🪙 gerekiyor, mevcut: ${credits}🪙`)
    }

    const ref = await addDoc(collection(d, "apps"), {
      ...data,
      status: "pending",
      screenshots: [],
      createdAt: serverTimestamp(),
    })

    transaction.update(userRef, { credits: increment(-CREDIT_COST_POST) })

    await addDoc(collection(d, "transactions"), {
      uid: data.uid,
      amount: -CREDIT_COST_POST,
      type: "spent",
      reason: "post",
      referenceId: ref.id,
      note: `"${data.appName}" yayınlandı`,
      createdAt: serverTimestamp(),
    })

    return ref
  })

  return appRef.id
}

export async function getUserApps(uid: string) {
  const d = db!
  const q = query(collection(d, "apps"), where("uid", "==", uid), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as App))
}

export async function getPackApps(packId: string) {
  const d = db!
  const q = query(collection(d, "apps"), where("packId", "==", packId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as App))
}

// ==================== CREDIT FUNCTIONS ====================

export async function getUserCredits(uid: string): Promise<number> {
  const d = db!
  const snap = await getDoc(doc(d, "users", uid))
  return snap.data()?.credits ?? 0
}

export async function getCreditHistory(uid: string) {
  const d = db!
  const q = query(collection(d, "transactions"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(50))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CreditTransaction))
}

// ==================== ACTIVITY FUNCTIONS ====================

export async function markTestingDone(activityId: string, feedback?: string, bugsFound?: string[]) {
  const d = db!
  await updateDoc(doc(d, "testingActivity", activityId), {
    status: "done",
    feedback: feedback || "",
    bugsFound: bugsFound || [],
    completedAt: serverTimestamp(),
  })
}

export async function getTodayActivities(packId: string, uid: string, day: number) {
  const d = db!
  const q = query(
    collection(d, "testingActivity"),
    where("packId", "==", packId),
    where("uid", "==", uid),
    where("day", "==", day)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DailyActivity))
}

export async function recordTestingActivity(packId: string, uid: string, day: number) {
  const d = db!
  const activityId = `${packId}_${uid}_${day}`
  const ref = doc(d, "testingActivity", activityId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      packId,
      uid,
      day,
      status: "done",
      completedAt: serverTimestamp(),
    })
  }
}

// ==================== USER FUNCTIONS ====================

export async function getUserProfile(uid: string) {
  const d = db!
  const snap = await getDoc(doc(d, "users", uid))
  return snap.data() || null
}

export async function updateUserProfile(uid: string, data: Partial<{ displayName: string; country: string; bio: string; devAccountLink: string }>) {
  const d = db!
  await updateDoc(doc(d, "users", uid), data)
}

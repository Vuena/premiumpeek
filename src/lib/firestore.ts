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

// ==================== PACK FUNCTIONS ====================

export interface Pack {
  id: string
  name: string
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
  const data = {
    name,
    status: "forming",
    currentDay: 0,
    maxMembers: 25,
    totalDays: 16,
    members: [
      {
        uid: user.uid,
        displayName: user.displayName || user.email || "İsimsiz",
        photoURL: user.photoURL || "",
        joinedAt: new Date(),
      },
    ],
    memberUids: [user.uid],
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  }
  const packRef = await addDoc(collection(d, "packs"), data)
  return { id: packRef.id }
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
  return doJoinPack(d, packDoc.id, packDoc.data(), user)
}

export async function joinPack(packId: string, user: User) {
  const d = db!
  const snap = await getDoc(doc(d, "packs", packId))
  if (!snap.exists()) throw new Error("Pack bulunamadı.")
  return doJoinPack(d, packId, snap.data(), user)
}

async function doJoinPack(d: any, packId: string, packData: any, user: User) {
  if (packData.status !== "forming") throw new Error("Bu pack artık yeni üye kabul etmiyor.")
  if (packData.members.length >= packData.maxMembers) throw new Error("Bu pack dolu (25/25).")
  if (packData.members.some((m: any) => m.uid === user.uid)) throw new Error("Zaten bu pack'in üyesisin.")

  let started = false
  await runTransaction(d, async (transaction) => {
    const ref = doc(d, "packs", packId)
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const current = snap.data()
    if (current.status !== "forming") throw new Error("Bu pack artık yeni üye kabul etmiyor.")
    if (current.members.length >= current.maxMembers) throw new Error("Pack doldu.")
    if (current.members.some((m: any) => m.uid === user.uid)) throw new Error("Zaten üyesin.")

    const newMember = {
      uid: user.uid,
      displayName: user.displayName || user.email || "İsimsiz",
      photoURL: user.photoURL || "",
      joinedAt: new Date(),
    }

    const newMemberCount = current.members.length + 1
    if (newMemberCount >= current.maxMembers) {
      transaction.update(ref, {
        members: arrayUnion(newMember),
        memberUids: arrayUnion(user.uid),
        status: "active",
        startDate: new Date(),
        currentDay: 1,
      })
      started = true
    } else {
      transaction.update(ref, {
        members: arrayUnion(newMember),
        memberUids: arrayUnion(user.uid),
      })
    }
  })

  return { packId, packName: packData.name, started }
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

export async function getFormingPacks() {
  const d = db!
  const q = query(
    collection(d, "packs"),
    where("status", "==", "forming"),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pack))
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

  const ref = await addDoc(collection(d, "apps"), {
    ...data,
    status: "pending",
    screenshots: [],
    createdAt: serverTimestamp(),
  })

  return ref.id
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

export async function recordTestingActivity(packId: string, uid: string, day: number, feedbackLength = 0) {
  const d = db!
  const activityId = `${packId}_${uid}_${day}`
  const ref = doc(d, "testingActivity", activityId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await runTransaction(d, async (transaction) => {
      const activitySnap = await transaction.get(ref)
      if (activitySnap.exists()) return

      transaction.set(ref, {
        packId, uid, day,
        status: "done",
        completedAt: serverTimestamp(),
      })

      const userRef = doc(d, "users", uid)
      transaction.update(userRef, {
        totalTested: increment(1),
      })
    })
  }
}

export async function recordOrderTesterActivity(orderId: string, testerUid: string, day: number) {
  const d = db!
  const today = new Date().toISOString().slice(0, 10)
  const logId = `${orderId}_${testerUid}_${today}`
  const ref = doc(collection(d, "testerLogs"), logId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await runTransaction(d, async (transaction) => {
      const logSnap = await transaction.get(ref)
      if (logSnap.exists()) return

      transaction.set(ref, {
        orderId, testerUid, day,
        date: today,
        tested: true,
        feedback: "",
        createdAt: serverTimestamp(),
      })
    })
  }
}

// ==================== TESTER POOL FUNCTIONS ====================

export async function joinTesterPool(uid: string) {
  const d = db!
  const snap = await getDoc(doc(d, "users", uid))
  if (!snap.exists()) throw new Error("Kullanıcı bulunamadı.")
  await updateDoc(doc(d, "users", uid), { isTester: true, testerSince: serverTimestamp() })
}

export async function leaveTesterPool(uid: string) {
  const d = db!
  await updateDoc(doc(d, "users", uid), { isTester: false })
}

export async function getAvailableTesters() {
  const d = db!
  const q = query(
    collection(d, "users"),
    where("isTester", "==", true),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
}

export async function assignTestersToOrder(orderId: string, count: number = 25) {
  const d = db!
  const testers = await getAvailableTesters()
  const selected = testers.slice(0, count)
  const testerUids = selected.map(t => t.uid)
  await updateDoc(doc(d, "orders", orderId), {
    testers: testerUids,
    testerCount: testerUids.length,
    status: "testing",
  })
  return testerUids
}

// ==================== ORDER FUNCTIONS ====================

export async function getUserOrders(uid: string) {
  const d = db!
  const q = query(
    collection(d, "orders"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getOrderById(orderId: string) {
  const d = db!
  const snap = await getDoc(doc(d, "orders", orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getTesterTasks(testerUid: string) {
  const d = db!
  const q = query(
    collection(d, "orders"),
    where("testers", "array-contains", testerUid),
    where("status", "==", "testing")
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getAllOrdersAdmin() {
  const d = db!
  const snap = await getDocs(query(collection(d, "orders"), orderBy("createdAt", "desc")))
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function updateOrderStatus(orderId: string, status: string, extra?: Record<string, any>) {
  const d = db!
  await updateDoc(doc(d, "orders", orderId), { status, ...extra })
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

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
  status: "forming" | "installing" | "testing" | "completed"
  startDate?: Timestamp
  endDate?: Timestamp
  currentDay: number
  maxMembers: number
  totalDays: number
  members: PackMember[]
  memberUids: string[]
  createdBy: string
  createdAt: Timestamp
  installDeadline?: Timestamp
}

export interface PackMember {
  uid: string
  displayName: string
  photoURL?: string
  type: "free" | "premium"
  installConfirmed: boolean
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

// ==================== PACK FUNCTIONS ====================

export async function createPack(name: string, user: User) {
  const d = db!
  const data = {
    name,
    status: "forming",
    currentDay: 0,
    maxMembers: 18,
    totalDays: 16,
    members: [
      {
        uid: user.uid,
        displayName: user.displayName || user.email || "İsimsiz",
        photoURL: user.photoURL || "",
        type: "free",
        installConfirmed: false,
        joinedAt: new Date(),
      },
    ],
    memberUids: [user.uid],
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    installDeadline: null,
  }
  const packRef = await addDoc(collection(d, "packs"), data)
  return { id: packRef.id }
}

export async function joinPack(packId: string, user: User, memberType: "free" | "premium" = "free") {
  const d = db!
  const snap = await getDoc(doc(d, "packs", packId))
  if (!snap.exists()) throw new Error("Pack bulunamadı.")
  return doJoinPack(d, packId, snap.data(), user, memberType)
}

async function doJoinPack(d: any, packId: string, packData: any, user: User, memberType: "free" | "premium" = "free") {
  if (packData.status !== "forming") throw new Error("Bu pack artık yeni üye kabul etmiyor.")
  if (packData.members.length >= packData.maxMembers) throw new Error(`Bu pack dolu (${packData.maxMembers}/${packData.maxMembers}).`)
  const existingMember = packData.members.find((m: any) => m.uid === user.uid)
  if (existingMember) {
    if (existingMember.type === "premium") throw new Error("Zaten premium üyesin.")
    await runTransaction(d, async (transaction) => {
      const ref = doc(d, "packs", packId)
      const snap = await transaction.get(ref)
      if (!snap.exists()) throw new Error("Pack bulunamadı.")
      const current = snap.data()
      const premiumCount = current.members.filter((m: any) => m.type === "premium").length
      if (premiumCount >= 2) throw new Error("Premium kontenjanı dolu (max 2).")
      const updatedMembers = current.members.map((m: any) =>
        m.uid === user.uid ? { ...m, type: "premium" } : m
      )
      transaction.update(ref, { members: updatedMembers })
    })
    return { packId, packName: packData.name, started: false, upgraded: true }
  }
  // Premium slot check
  if (memberType === "premium") {
    const currentPremium = packData.members.filter((m: any) => m.type === "premium").length
    if (currentPremium >= 2) throw new Error("Premium kontenjanı dolu (max 2).")
  }

  let started = false
  await runTransaction(d, async (transaction) => {
    const ref = doc(d, "packs", packId)
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const current = snap.data()
    if (current.status !== "forming") throw new Error("Bu pack artık yeni üye kabul etmiyor.")
    if (current.members.length >= current.maxMembers) throw new Error("Pack doldu.")
    if (current.members.some((m: any) => m.uid === user.uid)) throw new Error("Zaten üyesin.")
    if (memberType === "premium") {
      const premiumCount = current.members.filter((m: any) => m.type === "premium").length
      if (premiumCount >= 2) throw new Error("Premium kontenjanı dolu (max 2).")
    }

    const newMember = {
      uid: user.uid,
      displayName: user.displayName || user.email || "İsimsiz",
      photoURL: user.photoURL || "",
      type: memberType,
      installConfirmed: false,
      joinedAt: new Date(),
    }

    const newMemberCount = current.members.length + 1
    if (newMemberCount >= current.maxMembers) {
      transaction.update(ref, {
        members: arrayUnion(newMember),
        memberUids: arrayUnion(user.uid),
        status: "installing",
        installDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        currentDay: 0,
      })
      started = true
    } else {
      transaction.update(ref, {
        members: arrayUnion(newMember),
        memberUids: arrayUnion(user.uid),
      })
    }
  })

  if (started) {
    const existing = await getDocs(query(collection(d, "packs"), where("status", "==", "forming"), limit(1)))
    if (existing.empty) {
      const dateStr = new Date().toLocaleDateString("tr-TR")
      await addDoc(collection(d, "packs"), {
        name: `PremiumPeek Pack (${dateStr})`,
        status: "forming",
        currentDay: 0,
        maxMembers: 18,
        totalDays: 16,
        members: [],
        memberUids: [],
        createdBy: "",
        createdAt: serverTimestamp(),
        installDeadline: null,
      })
    }
  }

  return { packId, packName: packData.name, started, upgraded: false }
}

export async function leavePack(packId: string, uid: string) {
  const d = db!
  const packRef = doc(d, "packs", packId)

  await runTransaction(d, async (transaction) => {
    const snap = await transaction.get(packRef)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const data = snap.data()
    if (data.status !== "forming") throw new Error("Sadece oluşma aşamasındaki pack'lerden ayrılabilirsin.")
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
    where("memberUids", "array-contains", uid)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Pack))
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
}

export async function getFormingPacks() {
  const d = db!
  const q = query(
    collection(d, "packs"),
    where("status", "==", "forming")
  )
  const snap = await getDocs(q)
  let packs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pack))
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))

  if (packs.length === 0) {
    const dateStr = new Date().toLocaleDateString("tr-TR")
    await addDoc(collection(d, "packs"), {
      name: `PremiumPeek Pack (${dateStr})`,
      status: "forming",
      currentDay: 0,
      maxMembers: 18,
      totalDays: 16,
      members: [],
      memberUids: [],
      createdBy: "",
      createdAt: serverTimestamp(),
      installDeadline: null,
    })
    const snap2 = await getDocs(q)
    packs = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pack))
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  }

  return packs
}

export async function getPackById(packId: string) {
  const d = db!
  const snap = await getDoc(doc(d, "packs", packId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Pack
}

export async function confirmInstall(packId: string, uid: string) {
  const d = db!
  await runTransaction(d, async (transaction) => {
    const ref = doc(d, "packs", packId)
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const data = snap.data()
    if (data.status !== "installing") throw new Error("Yükleme aşamasında değil.")

    const member = data.members.find((m: PackMember) => m.uid === uid)
    if (!member) throw new Error("Bu pack'in üyesi değilsin.")
    if (member.type === "premium") throw new Error("Premium üyelerin yükleme yapması gerekmez.")
    if (member.installConfirmed) throw new Error("Zaten onayladın.")

    const updatedMembers = data.members.map((m: PackMember) =>
      m.uid === uid ? { ...m, installConfirmed: true } : m
    )
    const allConfirmed = updatedMembers.every((m: PackMember) => m.type === "premium" || m.installConfirmed)

    if (allConfirmed) {
      transaction.update(ref, {
        members: updatedMembers,
        status: "testing",
        startDate: new Date(),
        currentDay: 1,
      })
    } else {
      transaction.update(ref, { members: updatedMembers })
    }
  })
}

export async function transitionInstallingToTesting(packId: string) {
  const d = db!
  await runTransaction(d, async (transaction) => {
    const ref = doc(d, "packs", packId)
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    const data = snap.data()
    if (data.status !== "installing") return

    const allConfirmed = data.members.every((m: PackMember) => m.type === "premium" || m.installConfirmed)
    const deadlinePassed = data.installDeadline?.toMillis() < Date.now()

    if (allConfirmed || deadlinePassed) {
      transaction.update(ref, {
        status: "testing",
        startDate: new Date(),
        currentDay: 1,
      })
    }
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
  appIcon?: string
}) {
  const d = db!

  const ref = await addDoc(collection(d, "apps"), {
    uid: data.uid,
    appName: data.appName,
    packageName: data.packageName,
    description: data.description,
    category: data.category,
    language: data.language,
    googlePlayLink: data.googlePlayLink,
    instructions: data.instructions,
    packId: data.packId,
    appIcon: data.appIcon || "",
    status: "pending",
    screenshots: [],
    createdAt: serverTimestamp(),
  })

  return ref.id
}

export async function getUserApps(uid: string) {
  const d = db!
  const q = query(collection(d, "apps"), where("uid", "==", uid))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as App))
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
}

export async function getPackApps(packId: string) {
  const d = db!
  const q = query(collection(d, "apps"), where("packId", "==", packId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as App))
}

// ==================== ACTIVITY FUNCTIONS ====================

export async function recordTestingActivity(packId: string, uid: string, day: number, feedback = "") {
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
        feedback,
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

export async function assignTestersToOrder(orderId: string, count: number = 18) {
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
    where("uid", "==", uid)
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
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

export async function deleteOrder(orderId: string) {
  const d = db!
  await deleteDoc(doc(d, "orders", orderId))
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

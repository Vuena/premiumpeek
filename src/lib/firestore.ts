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
  writeBatch,
  type Timestamp,
} from "firebase/firestore"
import type { User } from "firebase/auth"

function getDb() {
  if (!db) throw new Error("Database not available")
  return db
}

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
  appIcon?: string
  status: "pending" | "testing" | "completed"
  packId?: string
  screenshots: string[]
  createdAt: Timestamp
}

// ==================== PACK FUNCTIONS ====================

export async function createPack(name: string) {
  try {
    const d = getDb()
    const data = {
      name,
      status: "forming",
      currentDay: 0,
      maxMembers: 18,
      totalDays: 16,
      members: [],
      memberUids: [],
      createdBy: "",
      createdAt: serverTimestamp(),
      installDeadline: null,
    }
    const packRef = await addDoc(collection(d, "packs"), data)
    return { id: packRef.id }
  } catch (err) {
    console.error("createPack failed:", err)
    throw err
  }
}

export async function joinPackWithApp(packId: string, appId: string, user: User) {
  try {
    const d = getDb()
    const result = await joinPack(packId, user, "free")
    await updateDoc(doc(d, "apps", appId), { packId, status: "pending" })
    return result
  } catch (err) {
    console.error("joinPackWithApp failed:", err)
    throw err
  }
}

export async function joinPack(packId: string, user: User, memberType: "free" | "premium" = "free") {
  try {
    const d = getDb()
    const snap = await getDoc(doc(d, "packs", packId))
    if (!snap.exists()) throw new Error("Pack bulunamadı.")
    return doJoinPack(d, packId, snap.data(), user, memberType)
  } catch (err) {
    console.error("joinPack failed:", err)
    throw err
  }
}

async function doJoinPack(d: any, packId: string, packData: any, user: User, memberType: "free" | "premium" = "free") {
  try {
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
        await addDoc(collection(d, "packs"), {
          name: "Geliştiriciler Bekleniyor",
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
  } catch (err) {
    console.error("doJoinPack failed:", err)
    throw err
  }
}

export async function leavePack(packId: string, uid: string) {
  try {
    const d = getDb()
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
  } catch (err) {
    console.error("leavePack failed:", err)
    throw err
  }
}

export async function getUserPacks(uid: string) {
  try {
    const d = getDb()
    const packsRef = collection(d, "packs")
    const q = query(
      packsRef,
      where("memberUids", "array-contains", uid)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Pack))
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  } catch (err) {
    console.error("getUserPacks failed:", err)
    return []
  }
}

export async function getFormingPacks() {
  try {
    const d = getDb()
    const q = query(
      collection(d, "packs"),
      where("status", "==", "forming")
    )
    const snap = await getDocs(q)
    let packs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pack))
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))

    // Ensure consistent naming
    packs = packs.map(p => ({ ...p, name: "Geliştiriciler Bekleniyor" }))

    if (packs.length === 0) {
      await runTransaction(d, async (transaction) => {
        const newPackRef = doc(collection(d, "packs"))
        transaction.set(newPackRef, {
          name: "Geliştiriciler Bekleniyor",
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
      })
      const snap2 = await getDocs(q)
      packs = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pack))
        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
    }

    return packs
  } catch (err) {
    console.error("getFormingPacks failed:", err)
    return []
  }
}

export async function getPackById(packId: string) {
  try {
    const d = getDb()
    const snap = await getDoc(doc(d, "packs", packId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Pack
  } catch (err) {
    console.error("getPackById failed:", err)
    return null
  }
}

export async function confirmInstall(packId: string, uid: string) {
  try {
    const d = getDb()
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
  } catch (err) {
    console.error("confirmInstall failed:", err)
    throw err
  }
}

export async function transitionInstallingToTesting(packId: string) {
  try {
    const d = getDb()
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
  } catch (err) {
    console.error("transitionInstallingToTesting failed:", err)
    throw err
  }
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
  try {
    const d = getDb()

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
  } catch (err) {
    console.error("submitApp failed:", err)
    throw err
  }
}

export async function getUserApps(uid: string) {
  try {
    const d = getDb()
    const q = query(collection(d, "apps"), where("uid", "==", uid))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as App))
      .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  } catch (err) {
    console.error("getUserApps failed:", err)
    return []
  }
}

export async function getPackApps(packId: string) {
  try {
    const d = getDb()
    const q = query(collection(d, "apps"), where("packId", "==", packId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as App))
  } catch (err) {
    console.error("getPackApps failed:", err)
    return []
  }
}

// ==================== ACTIVITY FUNCTIONS ====================

export async function recordTestingActivity(packId: string, uid: string, day: number, feedback = "") {
  try {
    const d = getDb()
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
        transaction.set(userRef, { totalTested: increment(1) }, { merge: true })
      })
    }
  } catch (err) {
    console.error("recordTestingActivity failed:", err)
    throw err
  }
}

export async function recordOrderTesterActivity(orderId: string, testerUid: string, day: number) {
  try {
    const d = getDb()
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
  } catch (err) {
    console.error("recordOrderTesterActivity failed:", err)
    throw err
  }
}

// ==================== TESTER POOL FUNCTIONS ====================

export async function joinTesterPool(uid: string) {
  try {
    const d = getDb()
    const snap = await getDoc(doc(d, "users", uid))
    if (!snap.exists()) throw new Error("Kullanıcı bulunamadı.")
    await updateDoc(doc(d, "users", uid), { isTester: true, testerSince: serverTimestamp() })
  } catch (err) {
    console.error("joinTesterPool failed:", err)
    throw err
  }
}

export async function leaveTesterPool(uid: string) {
  try {
    const d = getDb()
    await updateDoc(doc(d, "users", uid), { isTester: false })
  } catch (err) {
    console.error("leaveTesterPool failed:", err)
    throw err
  }
}

export async function getAvailableTesters() {
  try {
    const d = getDb()
    const q = query(
      collection(d, "users"),
      where("isTester", "==", true),
      limit(100)
    )
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
  } catch (err) {
    console.error("getAvailableTesters failed:", err)
    return []
  }
}

export async function assignTestersToOrder(orderId: string, count: number = 18) {
  try {
    const d = getDb()
    const testers = await getAvailableTesters()
    const selected = testers.slice(0, count)
    const testerUids = selected.map(t => t.uid)
    await updateDoc(doc(d, "orders", orderId), {
      testers: testerUids,
      testerCount: testerUids.length,
      status: "testing",
    })
    return testerUids
  } catch (err) {
    console.error("assignTestersToOrder failed:", err)
    throw err
  }
}

// ==================== ORDER FUNCTIONS ====================

export async function getUserOrders(uid: string) {
  try {
    const d = getDb()
    const q = query(
      collection(d, "orders"),
      where("uid", "==", uid)
    )
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  } catch (err) {
    console.error("getUserOrders failed:", err)
    return []
  }
}

export async function getOrderById(orderId: string) {
  try {
    const d = getDb()
    const snap = await getDoc(doc(d, "orders", orderId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  } catch (err) {
    console.error("getOrderById failed:", err)
    return null
  }
}

export async function getTesterTasks(testerUid: string) {
  try {
    const d = getDb()
    const q = query(
      collection(d, "orders"),
      where("testers", "array-contains", testerUid),
      where("status", "==", "testing")
    )
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error("getTesterTasks failed:", err)
    return []
  }
}

export async function getAllOrdersAdmin() {
  try {
    const d = getDb()
    const snap = await getDocs(query(collection(d, "orders"), orderBy("createdAt", "desc"), limit(50)))
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error("getAllOrdersAdmin failed:", err)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: string, extra?: Record<string, any>) {
  try {
    const d = getDb()
    await updateDoc(doc(d, "orders", orderId), { status, ...extra })
  } catch (err) {
    console.error("updateOrderStatus failed:", err)
    throw err
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const d = getDb()
    await deleteDoc(doc(d, "orders", orderId))
  } catch (err) {
    console.error("deleteOrder failed:", err)
    throw err
  }
}

// ==================== USER FUNCTIONS ====================

export async function getUserProfile(uid: string) {
  try {
    const d = getDb()
    const snap = await getDoc(doc(d, "users", uid))
    return snap.data() || null
  } catch (err) {
    console.error("getUserProfile failed:", err)
    return null
  }
}

export async function updateUserProfile(uid: string, data: Partial<{ displayName: string; country: string; bio: string; devAccountLink: string }>) {
  try {
    const d = getDb()
    await updateDoc(doc(d, "users", uid), data)
  } catch (err) {
    console.error("updateUserProfile failed:", err)
    throw err
  }
}

// ==================== COMPLAINT FUNCTIONS ====================

export interface Complaint {
  id: string
  packId: string
  appId: string
  appName: string
  complainedBy: string
  complainedByName: string
  targetUid: string
  targetName: string
  reason: string
  status: "pending" | "resolved" | "dismissed"
  createdAt: Timestamp
}

export async function addComplaint(data: {
  packId: string
  appId: string
  appName: string
  complainedBy: string
  complainedByName: string
  targetUid: string
  targetName: string
  reason: string
}) {
  try {
    const d = getDb()
    const ref = await addDoc(collection(d, "complaints"), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
    })
    return ref.id
  } catch (err) {
    console.error("addComplaint failed:", err)
    throw err
  }
}

export async function getComplaints() {
  try {
    const d = getDb()
    const q = query(collection(d, "complaints"), orderBy("createdAt", "desc"), limit(50))
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
  } catch (err) {
    console.error("getComplaints failed:", err)
    return []
  }
}

export async function resolveComplaint(complaintId: string, action: "resolved" | "dismissed") {
  try {
    const d = getDb()
    const complaintSnap = await getDoc(doc(d, "complaints", complaintId))
    if (!complaintSnap.exists()) throw new Error("Şikayet bulunamadı")
    const complaint = complaintSnap.data() as Complaint

    if (action === "resolved") {
      // Remove user from pack
      const packRef = doc(d, "packs", complaint.packId)
      const packSnap = await getDoc(packRef)
      if (packSnap.exists()) {
        const packData = packSnap.data()
        const member = packData.members.find((m: PackMember) => m.uid === complaint.targetUid)
        if (member) {
          await runTransaction(d, async (transaction) => {
            const snap = await transaction.get(packRef)
            if (!snap.exists()) return
            const current = snap.data()
            transaction.update(packRef, {
              members: current.members.filter((m: PackMember) => m.uid !== complaint.targetUid),
              memberUids: current.memberUids.filter((u: string) => u !== complaint.targetUid),
            })
          })
        }
        // Unlink user's apps from this pack
        const userAppsSnap = await getDocs(query(
          collection(d, "apps"),
          where("uid", "==", complaint.targetUid),
          where("packId", "==", complaint.packId)
        ))
        for (const appDoc of userAppsSnap.docs) {
          await updateDoc(appDoc.ref, { packId: "", status: "pending" })
        }
      }
    }

    await updateDoc(doc(d, "complaints", complaintId), { status: action })
  } catch (err) {
    console.error("resolveComplaint failed:", err)
    throw err
  }
}

// ==================== SCREENSHOT HELPERS ====================

export async function hasDayScreenshot(packId: string, uid: string, day: number): Promise<boolean> {
  try {
    const d = getDb()
    const snap = await getDocs(query(
      collection(d, "screenshots"),
      where("packId", "==", packId),
      where("uid", "==", uid),
      where("day", "==", day),
      limit(1)
    ))
    return !snap.empty
  } catch (err) {
    console.error("hasDayScreenshot failed:", err)
    return false
  }
}

export async function recordScreenshot(packId: string, uid: string, day: number, url: string, type: "test" | "install") {
  try {
    const d = getDb()
    await addDoc(collection(d, "screenshots"), {
      packId, uid, day, url, type,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error("recordScreenshot failed:", err)
    throw err
  }
}

export async function getScreenshotsForPack(packId: string) {
  try {
    const d = getDb()
    const q = query(
      collection(d, "screenshots"),
      where("packId", "==", packId),
      orderBy("createdAt", "asc")
    )
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error("getScreenshotsForPack failed:", err)
    return []
  }
}

export async function getOldCompletedPacks(daysOld: number) {
  try {
    const d = getDb()
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    const q = query(
      collection(d, "packs"),
      where("status", "==", "completed"),
      where("endDate", "<=", cutoff)
    )
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pack))
  } catch (err) {
    console.error("getOldCompletedPacks failed:", err)
    return []
  }
}

export async function deleteScreenshotsForPack(packId: string) {
  try {
    const d = getDb()
    const snap = await getDocs(query(
      collection(d, "screenshots"),
      where("packId", "==", packId)
    ))
    if (snap.empty) return
    const batch = writeBatch(d)
    snap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
  } catch (err) {
    console.error("deleteScreenshotsForPack failed:", err)
    throw err
  }
}

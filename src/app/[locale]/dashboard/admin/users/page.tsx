"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Loader2, ArrowLeft, Ban, Search } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { usePageMeta } from "@/lib/usePageMeta"
import { useToast } from "@/context/ToastContext"

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsers")
  usePageMeta({ title: t("metaTitle") })
  const { user, loading: authLoading } = useAuth()
  const { toast: addToast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    if ((user as any).role !== "admin") { router.push("/dashboard"); return }
    ;(async () => {
      try {
        await loadUsers()
      } catch (err) {
        addToast("error", t("loadError")); console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadUsers = async () => {
    if (!db) { return }
    const d = db
    const snap = await getDocs(query(collection(d, "users"), orderBy("createdAt", "desc"), limit(50)))
    setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setLoading(false)
  }

  const toggleBan = async (uid: string, currentRole: string) => {
    if (!confirm(t("confirmBan"))) return
    try {
      const token = await auth?.currentUser?.getIdToken()
      if (!token) return
      const newRole = currentRole === "banned" ? "user" : "banned"
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, role: newRole }),
      })
      if (!res.ok) {
        const result = await res.json()
        addToast("error", result.error)
      }
      addToast("success", t("banSuccess"))
      loadUsers()
    } catch (err) {
      addToast("error", t("banError"))
    }
  }

  const filtered = users.filter(u =>
    (u.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backToAdmin")}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500">{t("userCount", { count: users.length })}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="h-10 w-full sm:w-64 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium">{t("tableUser")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("tableEmail")}</th>
                <th className="text-center px-4 py-3 font-medium">{t("tableRole")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody className="hidden md:table-row-group">
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium">
                        {(u.displayName || "?")[0]}
                      </div>
                      <span className="font-medium truncate max-w-[150px]">{u.displayName || t("noName")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.role === "admin" ? "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400" :
                      u.role === "banned" ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400" :
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}>{u.role || "user"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleBan(u.id, u.role)} title={u.role === "banned" ? t("unbanTitle") : t("banTitle")}>
                        <Ban size={14} className={u.role === "banned" ? "text-green-600" : "text-red-600"} />
                      </Button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="block md:hidden space-y-3 mt-4">
        {filtered.map((u: any) => (
          <Card key={u.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium shrink-0">
                  {(u.displayName || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.displayName || t("noName")}</p>
                  <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  u.role === "admin" ? "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400" :
                  u.role === "banned" ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400" :
                  "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}>{u.role || "user"}</span>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => toggleBan(u.id, u.role)} title={u.role === "banned" ? t("unbanTitle") : t("banTitle")}>
                  <Ban size={14} className={u.role === "banned" ? "text-green-600" : "text-red-600"} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

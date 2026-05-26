"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect, memo } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Trophy, Medal, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePageMeta } from "@/lib/usePageMeta"
import { useToast } from "@/context/ToastContext"

const LeaderboardClient = memo(function LeaderboardClient() {
  const t = useTranslations("LeaderboardPage")
  usePageMeta({ title: t("metaTitle"), description: t("metaDescription") })
  const { user } = useAuth()
  const { toast: addToast } = useToast()
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        await loadLeaderboard()
      } catch (err) {
        addToast("error", t("loadError")); console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const loadLeaderboard = async () => {
    try {
      if (!db) { setLoading(false); return }
      const d = db
      const snap = await getDocs(query(collection(d, "users"), orderBy("totalTested", "desc"), limit(50)))
      setTopUsers(snap.docs.map((doc, i) => ({ id: doc.id, rank: i + 1, ...doc.data() })))
    } catch (err) { addToast("error", t("loadError")); console.error("Failed to load leaderboard:", err) }
    setLoading(false)
  }

  const medals = ["text-yellow-500", "text-zinc-400", "text-amber-700"]

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-950/30">
          <Trophy className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
      </div>

      {topUsers.length === 0 && !loading ? (
        <Card className="border-0 shadow-sm p-12 text-center">
          <p className="text-zinc-500">{t("noData")}</p>
        </Card>
      ) : (
      <>
      <div className="hidden md:block">
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="w-12 text-center px-2 py-3">#</th>
                  <th className="text-left px-4 py-3 font-medium">{t("tableUser")}</th>
                  <th className="text-center px-4 py-3 font-medium">{t("tableTested")}</th>
                  <th className="text-center px-4 py-3 font-medium">{t("tablePublished")}</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u: any) => (
                  <tr key={u.id} className={`border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${u.id === user?.uid ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                    <td className="text-center px-2 py-3">
                      {u.rank <= 3 ? (
                        <Medal className={`h-5 w-5 mx-auto ${medals[u.rank - 1]}`} />
                      ) : (
                        <span className="text-zinc-400 text-xs">{u.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium shrink-0">
                          {(u.displayName || "?")[0]}
                        </div>
                        <div>
                          <span className="font-medium">{u.displayName || t("anonymous")}</span>
                          {u.id === user?.uid && <span className="ml-2 text-xs text-blue-600">({t("you")})</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3 font-bold">{u.totalTested || 0}</td>
                    <td className="text-center px-4 py-3">{u.totalPosted || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="block md:hidden space-y-3">
        {topUsers.map((u: any) => (
          <Card key={u.id} className={`border-0 shadow-sm ${u.id === user?.uid ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-7 w-7 shrink-0">
                  {u.rank <= 3 ? (
                    <Medal className={`h-5 w-5 ${medals[u.rank - 1]}`} />
                  ) : (
                    <span className="text-zinc-400 text-sm font-bold">{u.rank}</span>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium shrink-0">
                  {(u.displayName || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {u.displayName || t("anonymous")}
                    {u.id === user?.uid && <span className="ml-2 text-xs text-blue-600">({t("you")})</span>}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{u.email || ""}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{t("test")}: <strong>{u.totalTested || 0}</strong></span>
                <span className="text-zinc-500">{t("published")}: <strong>{u.totalPosted || 0}</strong></span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-purple-100 dark:bg-purple-950/30 text-purple-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"}`}>{u.role === "admin" ? t("admin") : t("user")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </>
    )}
    </div>
  )
})

export default LeaderboardClient

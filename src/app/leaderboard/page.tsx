"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Trophy, Medal, Loader2 } from "lucide-react"

export default function LeaderboardPage() {
  useEffect(() => { document.title = "Liderlik Tablosu | PremiumPeek" }, [])
  const { user } = useAuth()
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    const d = db!
    const snap = await getDocs(query(collection(d, "users"), orderBy("totalTested", "desc"), limit(50)))
    setTopUsers(snap.docs.map((doc, i) => ({ id: doc.id, rank: i + 1, ...doc.data() })))
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
          <h1 className="text-2xl font-bold">Liderlik Tablosu</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">En çok test yapan geliştiriciler</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="w-12 text-center px-2 py-3">#</th>
                <th className="text-left px-4 py-3 font-medium">Kullanıcı</th>
                <th className="text-center px-4 py-3 font-medium">Test Edilen</th>
                <th className="text-center px-4 py-3 font-medium">Yayınlanan</th>
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
                        <span className="font-medium">{u.displayName || "İsimsiz"}</span>
                        {u.id === user?.uid && <span className="ml-2 text-xs text-blue-600">(sen)</span>}
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
  )
}

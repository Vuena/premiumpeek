"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getCreditHistory, type CreditTransaction } from "@/lib/firestore"
import { Coins, ArrowUp, ArrowDown, Loader2 } from "lucide-react"

export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [txns, setTxns] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadTxns()
  }, [user, authLoading])

  const loadTxns = async () => {
    if (!user) return
    const history = await getCreditHistory(user.uid)
    setTxns(history)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const reasonLabel = (reason: string) => {
    switch (reason) {
      case "test": return "Uygulama test edildi"
      case "post": return "Uygulama yayınlandı"
      case "bonus": return "Hoş geldin bonusu"
      case "referral": return "Referans"
      case "penalty": return "Ceza"
      default: return reason
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-950/30">
          <Coins className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Kredi Geçmişi</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Kredi kazanma ve harcama hareketlerin</p>
        </div>
      </div>

      {txns.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Coins className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Henüz hareket yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Test yaparak kredi kazanmaya başla.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {txns.map((tx) => (
            <Card key={tx.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                  tx.type === "earned" ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
                }`}>
                  {tx.type === "earned" ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{reasonLabel(tx.reason)}</p>
                  {tx.note && <p className="text-xs text-zinc-500 truncate">{tx.note}</p>}
                </div>
                <div className={`font-bold text-sm ${tx.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                  {tx.type === "earned" ? "+" : ""}{tx.amount}🪙
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

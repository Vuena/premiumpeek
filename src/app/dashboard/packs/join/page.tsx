"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getFormingPacks, joinPack, type Pack } from "@/lib/firestore"
import { Users, Loader2, UserCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function JoinPackPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<(Pack & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    load()
  }, [user, authLoading])

  const load = async () => {
    try {
      const data = await getFormingPacks()
      setPacks(data)
    } catch (err: any) {
      setError(err.message || "Pack'ler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (packId: string) => {
    if (!user) return
    setError("")
    setJoining(packId)
    try {
      const result = await joinPack(packId, user)
      router.push(`/dashboard/packs/${result.packId}`)
    } catch (err: any) {
      setError(err.message)
      setJoining(null)
    }
  }

  if (authLoading) return null
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard/packs" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowRight size={16} className="rotate-180" /> Pack'lerim
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pack'e Katıl</h1>
          <p className="text-sm text-zinc-500 mt-1">Aşağıdaki açık pack'lerden birine katıl, yeterli kişiye ulaşınca testler başlasın.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
      ) : packs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Aktif pack bulunamadı</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Şu anda katılabileceğin açık bir pack yok. Lütfen daha sonra tekrar dene.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {packs.map((pack) => {
            const dolu = pack.members.length >= pack.maxMembers
            return (
              <Card key={pack.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${dolu ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{pack.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Oluşturan: {pack.members[0]?.displayName || "İsimsiz"}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
                      <UserCheck size={16} />
                      {pack.members.length}/{pack.maxMembers}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mb-3">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(pack.members.length / pack.maxMembers) * 100}%` }} />
                  </div>
                  <Button
                    onClick={() => handleJoin(pack.id)}
                    disabled={joining === pack.id || dolu}
                    className="w-full gap-2 text-sm"
                    size="sm"
                    variant={dolu ? "outline" : "default"}
                  >
                    {joining === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : dolu ? "Dolu" : "Katıl"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

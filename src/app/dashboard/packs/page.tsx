"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserPacks, getFormingPacks, joinPack, type Pack } from "@/lib/firestore"
import { Plus, Users, ArrowRight, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default function PacksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [formingPacks, setFormingPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [joinError, setJoinError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadPacks()
  }, [user, authLoading])

  const loadPacks = async () => {
    if (!user) return
    const [userPacks, allForming] = await Promise.all([
      getUserPacks(user.uid),
      getFormingPacks(),
    ])
    setPacks(userPacks)
    setFormingPacks(allForming.filter(p => !p.members.some(m => m.uid === user!.uid)))
    setLoading(false)
  }

  const handleJoin = async (packId: string) => {
    if (!user) return
    setJoinError("")
    setJoining(packId)
    try {
      const result = await joinPack(packId, user)
      router.push(`/dashboard/packs/${result.packId}`)
    } catch (err: any) {
      setJoinError(err.message)
      setJoining(null)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "active": return <Clock className="h-4 w-4 text-green-600" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "forming": return "Oluşuyor"
      case "active": return "Aktif"
      case "completed": return "Tamamlandı"
      default: return status
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Pack&apos;lerim</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            25 geliştirici, 16 gün, sonsuz destek
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/packs/join">
            <Button variant="outline" className="gap-2"><Users size={16} /> Katıl</Button>
          </Link>
          <Link href="/dashboard/packs/new">
            <Button className="gap-2"><Plus size={16} /> Yeni Pack</Button>
          </Link>
        </div>
      </div>

      {joinError && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{joinError}</div>
      )}

      {packs.length === 0 ? (
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Henüz bir pack'in yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Yeni bir pack oluştur veya aşağıdaki açık pack'lerden birine katıl.
            </p>
            <Link href="/dashboard/packs/new"><Button>Pack Oluştur</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {packs.map((pack) => (
            <Link key={pack.id} href={`/dashboard/packs/${pack.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      pack.status === "active" ? "bg-green-50 dark:bg-green-950/30 text-green-600" :
                      pack.status === "completed" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600" :
                      "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600"
                    }`}>
                      {statusIcon(pack.status)}
                    </div>
                    <div>
                      <h3 className="font-medium">{pack.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span>{statusLabel(pack.status)}</span>
                        <span>•</span>
                        <span>{pack.members.length}/{pack.maxMembers} üye</span>
                        {pack.status === "active" && (
                          <>
                            <span>•</span>
                            <span>Gün {pack.currentDay}/{pack.totalDays}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {formingPacks.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4">Katılabileceğin Pack'ler</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {formingPacks.map((pack) => (
              <Card key={pack.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{pack.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Oluşturan: {pack.members[0]?.displayName || "İsimsiz"}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
                      <Users size={16} />
                      {pack.members.length}/{pack.maxMembers}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mb-3">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(pack.members.length / pack.maxMembers) * 100}%` }} />
                  </div>
                  <Button
                    onClick={() => handleJoin(pack.id)}
                    disabled={joining === pack.id}
                    className="w-full gap-2 text-sm"
                    size="sm"
                  >
                    {joining === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Katıl"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

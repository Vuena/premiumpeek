"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserPacks, type Pack } from "@/lib/firestore"
import { Plus, Users, ArrowRight, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default function PacksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadPacks()
  }, [user, authLoading])

  const loadPacks = async () => {
    if (!user) return
    const userPacks = await getUserPacks(user.uid)
    setPacks(userPacks)
    setLoading(false)
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
            16 geliştirici, 14 gün, sonsuz destek
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

      {packs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Henüz bir pack&apos;in yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Yeni bir pack oluştur veya davet koduyla mevcut bir pack&apos;e katıl.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/dashboard/packs/new"><Button>Pack Oluştur</Button></Link>
              <Link href="/dashboard/packs/join"><Button variant="outline">Kodla Katıl</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
    </div>
  )
}

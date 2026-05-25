"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPackById, getUserApps, getPackApps, leavePack, type Pack, type App } from "@/lib/firestore"
import { ArrowLeft, Users, Clock, Calendar, CheckCircle2, Loader2, LogOut, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PackDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const packId = useParams().id as string
  const [pack, setPack] = useState<Pack | null>(null)
  const [apps, setApps] = useState<App[]>([])
  const [myApps, setMyApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadData()
  }, [user, authLoading, packId])

  const loadData = async () => {
    if (!user || !packId) return
    const [packData, packApps, userApps] = await Promise.all([
      getPackById(packId as string),
      getPackApps(packId as string),
      getUserApps(user.uid),
    ])
    setPack(packData)
    setApps(packApps)
    setMyApps(userApps.filter(a => a.packId === packId))
    setLoading(false)
  }

  const isMember = pack?.members.some(m => m.uid === user?.uid)

  const handleLeave = async () => {
    if (!pack || !user) return
    if (!confirm("Pack'ten ayrılmak istediğine emin misin?")) return
    setActionLoading(true)
    try {
      await leavePack(pack.id, user.uid)
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (!pack) return <div className="text-center py-16 text-zinc-500">Pack bulunamadı.</div>

  const daysCompleted = pack.status === "active" ? pack.currentDay - 1 : pack.status === "completed" ? pack.totalDays : 0

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Panele Dön
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{pack.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              pack.status === "active" ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400" :
              pack.status === "completed" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" :
              "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
            }`}>
              {pack.status === "forming" ? "Oluşuyor" : pack.status === "active" ? "Aktif" : "Tamamlandı"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isMember && pack.status === "forming" && (
            <Button onClick={handleLeave} disabled={actionLoading} variant="destructive" className="gap-2">
              <LogOut size={16} /> Ayrıl
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Üyeler", value: `${pack.members.length}/${pack.maxMembers}` },
          { icon: Calendar, label: "Durum", value: pack.status === "forming" ? "Bekliyor" : `${pack.currentDay}/${pack.totalDays} Gün` },
          { icon: Clock, label: "İlerleme", value: pack.status === "forming" ? "-" : `${daysCompleted}/${pack.totalDays}` },
          { icon: CheckCircle2, label: "Test Edilen", value: `${apps.length} uygulama` },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <s.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-zinc-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Members */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Üyeler ({pack.members.length})</h2>
            <div className="space-y-3">
              {pack.members.map((member) => (
                <div key={member.uid} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium shrink-0">
                    {member.displayName[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.displayName}</p>
                    <p className="text-xs text-zinc-500">
                      {member.uid === pack.createdBy ? "Kurucu" : "Üye"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Apps */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Uygulamalar ({apps.length})</h2>
              {isMember && pack.status === "active" && (
                <Link href="/dashboard/apps/new">
                  <Button size="sm">Uygulama Ekle</Button>
                </Link>
              )}
            </div>

            {apps.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm">Henüz uygulama yüklenmemiş</p>
                <p className="text-xs mt-1">Pack üyeleri uygulamalarını buraya ekleyecek.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apps.map((app) => (
                  <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                      {app.appName[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{app.appName}</p>
                      <p className="text-xs text-zinc-500 truncate">{app.packageName}</p>
                    </div>
                    <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

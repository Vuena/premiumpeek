"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserPacks, getPackApps, recordTestingActivity, type Pack, type App } from "@/lib/firestore"
import { Clock, CheckCircle2, ExternalLink, Loader2, Smartphone } from "lucide-react"

export default function TestingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [appsToTest, setAppsToTest] = useState<App[]>([])
  const [packsMap, setPacksMap] = useState<Record<string, Pack>>({})
  const [loading, setLoading] = useState(true)
  const [testedToday, setTestedToday] = useState<string[]>([])
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadTesting()
  }, [user, authLoading])

  const loadTesting = async () => {
    if (!user) return
    const userPacks = await getUserPacks(user.uid)
    const activePacks = userPacks.filter(p => p.status === "active")

    const packMap: Record<string, Pack> = {}
    let allApps: App[] = []
    for (const pack of activePacks) {
      packMap[pack.id] = pack
      const packApps = await getPackApps(pack.id)
      allApps = [...allApps, ...packApps.filter(a => a.uid !== user.uid)]
    }

    setAppsToTest(allApps)
    setPacksMap(packMap)
    setLoading(false)

    const stored = localStorage.getItem(`tested_${new Date().toDateString()}`)
    if (stored) setTestedToday(JSON.parse(stored))
  }

  const markTested = async (appId: string, packId: string) => {
    const updated = [...testedToday, appId]
    setTestedToday(updated)
    localStorage.setItem(`tested_${new Date().toDateString()}`, JSON.stringify(updated))

    const pack = packsMap[packId]
    if (pack && user) {
      try {
        const fb = feedbacks[appId] || ""
        await recordTestingActivity(packId, user.uid, pack.currentDay, fb.length)
      } catch (err) {
        console.error("Failed to record testing activity:", err)
      }
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bugünkü Testler</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {appsToTest.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Bugün test edilecek uygulama yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aktif bir pack'te değilsin veya pack'teki herkes uygulama yüklememiş.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="font-medium text-zinc-900 dark:text-white">{testedToday.length}</span> / {appsToTest.length} test edildi
            </p>
            <div className="h-2 flex-1 max-w-xs mx-4 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(testedToday.length / appsToTest.length) * 100}%` }} />
            </div>
          </div>

          {appsToTest.map((app) => {
            const tested = testedToday.includes(app.id)
            return (
              <Card key={app.id} className={`border-0 shadow-sm transition-all ${tested ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tested ? "bg-green-50 dark:bg-green-950/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                        {tested ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${tested ? "line-through text-zinc-400" : ""}`}>{app.appName}</h3>
                        <p className="text-xs text-zinc-500">{app.description?.slice(0, 80) || app.packageName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink size={16} /></Button>
                      </a>
                      {!tested && (
                        <Button size="sm" onClick={() => markTested(app.id, app.packId || "")}>Test Edildi</Button>
                      )}
                    </div>
                  </div>
                  {!tested && (
                    <div className="mt-3 ml-14">
                      <textarea
                        value={feedbacks[app.id] || ""}
                        onChange={(e) => setFeedbacks({ ...feedbacks, [app.id]: e.target.value })}
                        placeholder="Yorum yap..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

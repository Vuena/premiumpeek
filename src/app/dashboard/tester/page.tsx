"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTesterTasks, recordOrderTesterActivity } from "@/lib/firestore"
import { Loader2, Clock, CheckCircle2, ExternalLink, Smartphone } from "lucide-react"

export default function TesterPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testedToday, setTestedToday] = useState<string[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    if (!(user as any).isTester) { router.push("/dashboard"); return }
    loadTasks()
  }, [user, authLoading])

  const loadTasks = async () => {
    if (!user) return
    const data = await getTesterTasks(user.uid)
    setTasks(data as any[])
    setLoading(false)

    const stored = localStorage.getItem(`tester_tested_${new Date().toDateString()}`)
    if (stored) setTestedToday(JSON.parse(stored))
  }

  const markDone = async (orderId: string, createdAt: any) => {
    if (!user) return
    const updated = [...testedToday, orderId]
    setTestedToday(updated)
    localStorage.setItem(`tester_tested_${new Date().toDateString()}`, JSON.stringify(updated))

    const start = createdAt?.toDate?.() || new Date(createdAt || Date.now())
    const day = Math.floor((Date.now() - start.getTime()) / 86400000) + 1
    await recordOrderTesterActivity(orderId, user.uid, day)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Testçi Paneli</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Şu an test görevin yok</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Yeni ücretli sipariş geldiğinde sana atanacak.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="font-medium">{testedToday.length}</span> / {tasks.length} test edildi
            </p>
            <div className="h-2 flex-1 max-w-xs mx-4 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(testedToday.length / tasks.length) * 100}%` }} />
            </div>
          </div>

          {tasks.map((task: any) => {
            const done = testedToday.includes(task.id)
            return (
              <Card key={task.id} className={`border-0 shadow-sm transition-all ${done ? "opacity-60" : ""}`}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? "bg-green-50 dark:bg-green-950/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                      {done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Smartphone className="h-5 w-5 text-zinc-500" />}
                    </div>
                    <div>
                      <p className={`font-medium ${done ? "line-through text-zinc-400" : ""}`}>{task.appName}</p>
                      <p className="text-xs text-zinc-500">{task.packageName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={task.googlePlayLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm"><ExternalLink size={16} /></Button>
                    </a>
                    {!done && (
                      <Button size="sm" onClick={() => markDone(task.id, task.createdAt)}>
                        Test Edildi
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

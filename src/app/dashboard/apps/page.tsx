"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserApps, type App } from "@/lib/firestore"
import { ArrowLeft, Plus, FileText, ExternalLink, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"

export default function AppsPage() {
  usePageMeta({ title: "Uygulamalarım | PremiumPeek" })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    loadApps()
  }, [user, authLoading])

  const loadApps = async () => {
    if (!user) return
    const userApps = await getUserApps(user.uid)
    setApps(userApps)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const statusIcon = (status: string) => {
    switch (status) {
      case "testing": return <Clock className="h-4 w-4 text-green-600" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Panel
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Uygulamalarım</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pack&apos;lerine yüklediğin uygulamalar</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2"><Plus size={16} /> Yeni Uygulama</Button>
        </Link>
      </div>

      {apps.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold mb-2">Henüz uygulama yüklememişsin</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Pack&apos;ine test edilmesi için ilk uygulamanı yükle.
            </p>
            <Link href="/dashboard/apps/new"><Button>Uygulama Yükle</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.id} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    app.status === "testing" ? "bg-green-50 dark:bg-green-950/30 text-green-600" :
                    app.status === "completed" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600" :
                    "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600"
                  }`}>
                    {statusIcon(app.status)}
                  </div>
                  <div>
                    <h3 className="font-medium">{app.appName}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span>{app.packageName}</span>
                      {app.packId && <><span>•</span><span>Pack&apos;te</span></>}
                    </div>
                  </div>
                </div>
                <a href={app.googlePlayLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm"><ExternalLink size={16} /></Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

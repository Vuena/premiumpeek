"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, getCountFromServer, query, orderBy, limit, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Users, Layers, FileText, Loader2, ArrowRight, Shield, CreditCard, UserCheck, AlertTriangle, Mail, History } from "lucide-react"
import { usePageMeta } from "@/lib/usePageMeta"

export default function AdminPage() {
  const t = useTranslations("AdminMain")
  const locale = useLocale()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, packs: 0, apps: 0, activePacks: 0 })
  const [loading, setLoading] = useState(true)
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  usePageMeta({ title: t("metaTitle") })

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    if ((user as any).role !== "admin") { router.push("/dashboard"); return }
    ;(async () => {
      try {
        await loadStats()
        await loadRecentLogs()
      } catch (err) {
        console.error("Admin load failed:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, authLoading, router])

  const loadStats = async () => {
    if (!db) { return }
    const d = db
    const [usersCount, packsCount, appsCount, activePacksSnap] = await Promise.all([
      getCountFromServer(collection(d, "users")).then(s => s.data().count),
      getCountFromServer(collection(d, "packs")).then(s => s.data().count),
      getCountFromServer(collection(d, "apps")).then(s => s.data().count),
      getDocs(query(collection(d, "packs"), where("status", "in", ["testing", "installing"]), limit(1000))),
    ])
    setStats({
      users: usersCount,
      packs: packsCount,
      apps: appsCount,
      activePacks: activePacksSnap.docs.filter(d => d.data().status === "testing" || d.data().status === "installing").length,
    })
  }

  const loadRecentLogs = async () => {
    try {
      if (!auth?.currentUser) { console.error("Not authenticated"); return }
      const token = await auth.currentUser.getIdToken()
      const res = await fetch("/api/admin/audit-log?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setRecentLogs(data.logs || [])
    } catch (e) {
      console.error("Failed to load audit logs:", e)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const cards = [
    { icon: Users, label: t("statsUsers"), value: stats.users.toString(), href: "/dashboard/admin/users", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    { icon: Layers, label: t("statsPacks"), value: stats.packs.toString(), href: "/dashboard/admin/packs", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
    { icon: Layers, label: t("statsActivePacks"), value: stats.activePacks.toString(), href: "/dashboard/admin/packs", color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
    { icon: FileText, label: t("statsApps"), value: stats.apps.toString(), href: "/dashboard/admin/apps", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} href={card.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-zinc-500">{card.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: t("manageUsers"), desc: t("manageUsersDesc"), href: "/dashboard/admin/users" },
          { icon: Layers, label: t("managePacks"), desc: t("managePacksDesc"), href: "/dashboard/admin/packs" },
          { icon: FileText, label: t("manageApps"), desc: t("manageAppsDesc"), href: "/dashboard/admin/apps" },
          { icon: CreditCard, label: t("manageOrders"), desc: t("manageOrdersDesc"), href: "/dashboard/admin/orders" },
          { icon: UserCheck, label: t("manageTesters"), desc: t("manageTestersDesc"), href: "/dashboard/admin/testers" },
          { icon: AlertTriangle, label: t("manageComplaints"), desc: t("manageComplaintsDesc"), href: "/dashboard/admin/complaints" },
          { icon: History, label: t("manageAudit"), desc: t("manageAuditDesc"), href: "/dashboard/admin/audit" },
          { icon: Mail, label: t("manageEmail"), desc: t("manageEmailDesc"), href: "/dashboard/admin/email" },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {recentLogs.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">{t("recentLogs")}</h2>
              <Link href="/dashboard/admin/audit" className="text-xs text-blue-600 hover:underline">{t("viewAll")}</Link>
            </div>
            <div className="space-y-2">
              {recentLogs.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <span className="font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                    {t(`action_${l.action}`, { defaultValue: l.action })}
                  </span>
                  <span className="text-zinc-400">{l.createdAt ? new Date(l.createdAt).toLocaleString(locale) : "-"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

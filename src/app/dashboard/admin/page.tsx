"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Users, Layers, FileText, Loader2, ArrowRight, Shield, CreditCard, UserCheck } from "lucide-react"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, packs: 0, apps: 0, activePacks: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }
    if ((user as any).role !== "admin") { router.push("/dashboard"); return }
    loadStats()
  }, [user, authLoading])

  const loadStats = async () => {
    const d = db!
    const [usersSnap, packsSnap, appsSnap, activePacksSnap] = await Promise.all([
      getDocs(query(collection(d, "users"), limit(1000))),
      getDocs(query(collection(d, "packs"), limit(1000))),
      getDocs(query(collection(d, "apps"), limit(1000))),
      getDocs(query(collection(d, "packs"), limit(1000))),
    ])
    setStats({
      users: usersSnap.size,
      packs: packsSnap.size,
      apps: appsSnap.size,
      activePacks: activePacksSnap.docs.filter(d => d.data().status === "active").length,
    })
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>

  const cards = [
    { icon: Users, label: "Kullanıcılar", value: stats.users.toString(), href: "/dashboard/admin/users", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    { icon: Layers, label: "Pack'ler", value: stats.packs.toString(), href: "/dashboard/admin/packs", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
    { icon: Layers, label: "Aktif Pack", value: stats.activePacks.toString(), href: "/dashboard/admin/packs", color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
    { icon: FileText, label: "Uygulamalar", value: stats.apps.toString(), href: "/dashboard/admin/apps", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Paneli</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Platform yönetimi</p>
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

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Kullanıcıları Yönet", desc: "Listele, düzenle, banla", href: "/dashboard/admin/users" },
          { icon: Layers, label: "Pack'leri Yönet", desc: "Tüm pack'ler, müdahale", href: "/dashboard/admin/packs" },
          { icon: FileText, label: "Uygulamaları Yönet", desc: "Onayla, reddet", href: "/dashboard/admin/apps" },
          { icon: CreditCard, label: "Siparişleri Yönet", desc: "Ödemeler, iadeler", href: "/dashboard/admin/orders" },
          { icon: UserCheck, label: "Testçi Havuzu", desc: "Testçileri görüntüle", href: "/dashboard/admin/testers" },
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
    </div>
  )
}

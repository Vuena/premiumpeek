"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { joinPackByCode } from "@/lib/firestore"
import { Users, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function JoinPackPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (authLoading) return null
  if (!user) { router.push("/login"); return null }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!code.trim()) { setError("Davet kodu gerekli"); return }
    setLoading(true)
    try {
      const result = await joinPackByCode(code.trim(), user)
      router.push(`/dashboard/packs/${result.packId}`)
    } catch (err: any) {
      setError(err.message || "Pack'e katılırken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-0 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Pack&apos;e Katıl</CardTitle>
          <CardDescription>
            Bir arkadaşının davet kodunu gir ve pack&apos;ine katıl.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Davet Kodu</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Örn: ABC123"
                className="text-center text-lg font-mono tracking-widest uppercase"
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={18} />}
              Pack&apos;e Katıl
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Kendi pack&apos;ini oluşturmak ister misin?{" "}
            <Link href="/dashboard/packs/new" className="text-blue-600 hover:underline font-medium">Pack Oluştur</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

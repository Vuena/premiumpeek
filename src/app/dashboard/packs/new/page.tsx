"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createPack } from "@/lib/firestore"
import { Users, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function NewPackPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ id: string; code: string } | null>(null)

  if (authLoading) return null
  if (!user) { router.push("/login"); return null }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) { setError("Pack adı gerekli"); return }
    setLoading(true)
    try {
      const pack = await createPack(name.trim(), user)
      setResult(pack)
    } catch (err: any) {
      setError(err.message || "Pack oluşturulurken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-0 shadow-sm text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Pack Oluşturuldu!</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Davet kodunu diğer geliştiricilerle paylaş:
            </p>
            <div className="text-3xl font-mono font-bold tracking-wider text-blue-600 mb-6 bg-zinc-50 dark:bg-zinc-800 py-4 rounded-xl">
              {result.code}
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              16 kişi toplanınca pack otomatik başlayacak. Dilersen sen de başlatabilirsin.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/dashboard/packs/${result.id}`}>
                <Button>Pack&apos;e Git</Button>
              </Link>
              <Link href="/dashboard/packs">
                <Button variant="outline">Pack&apos;lerim</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-xl">Yeni Pack Oluştur</CardTitle>
          <CardDescription>
            16 geliştiricilik bir grup oluştur ve 16 gün boyunca birbirinizi test edin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Pack Adı</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Yazılımcılar Pack #1"
                required
                maxLength={50}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users size={18} />}
              Pack Oluştur
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Davet kodun mu var?{" "}
            <Link href="/dashboard/packs/join" className="text-blue-600 hover:underline font-medium">Pack&apos;e Katıl</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

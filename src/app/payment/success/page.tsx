"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) {
      router.push("/")
      return
    }
    setTimeout(() => setLoading(false), 2000)
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-zinc-500">Ödeme onaylanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center px-4 py-24">
      <Card className="w-full max-w-md border-0 shadow-sm text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Ödeme Başarılı! 🎉</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Ödemen alındı. 6 saat içinde 25 profesyonel testçi uygulamanı test etmeye başlayacak.
            Sipariş durumunu panelden takip edebilirsin.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard/orders">
              <Button className="w-full gap-2">
                Siparişlerim <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Panele Dön</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle, ArrowRight, RefreshCw } from "lucide-react"

export default function PaymentCancelPage() {
  return (
    <div className="flex items-center justify-center px-4 py-24">
      <Card className="w-full max-w-md border-0 shadow-sm text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Ödeme İptal Edildi</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Ödeme işlemi tamamlanmadı. Herhangi bir ücret alınmadı. Tekrar deneyebilirsin.
          </p>
          <div className="space-y-3">
            <Link href="/#pricing">
              <Button className="w-full gap-2">
                Tekrar Dene <RefreshCw size={16} />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Ana Sayfa</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

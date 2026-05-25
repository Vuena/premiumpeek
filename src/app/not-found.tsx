import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı | PremiumPeek",
  description: "Aradığınız sayfa bulunamadı.",
  alternates: { canonical: "https://www.premiumpeek.com" },
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <div className="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Sayfa Bulunamadı</h1>
        <p className="text-muted text-sm mb-6">Aradığın sayfa mevcut değil.</p>
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Ana Sayfa</Link>
      </div>
    </div>
  )
}

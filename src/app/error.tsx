"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { document.title = "Hata | PremiumPeek" }, [])
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <div className="text-6xl font-bold text-red-300 dark:text-red-800 mb-4">!</div>
        <h1 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h1>
        <p className="text-muted text-sm mb-6">Beklenmedik bir hata ile karşılaştık. Lütfen tekrar dene.</p>
        <button onClick={reset} aria-label="Tekrar dene" className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer">Tekrar Dene</button>
      </div>
    </div>
  )
}

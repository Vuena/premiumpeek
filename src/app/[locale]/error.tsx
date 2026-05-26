"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Common")

  useEffect(() => { document.title = `${t("error")} | PremiumPeek` }, [t])

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <div className="text-6xl font-bold text-red-300 dark:text-red-800 mb-4">!</div>
        <h1 className="text-2xl font-bold mb-2">{t("error")}</h1>
        <p className="text-muted text-sm mb-6">{t("errorDesc")}</p>
        {process.env.NODE_ENV === "development" && <details className="text-xs text-left text-zinc-400 mb-4 max-w-md mx-auto"><summary>{t("errorDetail")}</summary><pre className="mt-2 whitespace-pre-wrap">{error.message}</pre></details>}
        <button onClick={reset} aria-label={t("retry")} className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer">{t("retry")}</button>
      </div>
    </div>
  )
}

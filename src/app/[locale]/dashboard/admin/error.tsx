"use client"

import { useTranslations } from "next-intl"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("AdminMain")

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold mb-2">{t("errorTitle")}</h2>
      <p className="text-muted mb-6">{t("errorDesc")}</p>
      {process.env.NODE_ENV === "development" && <details className="text-xs text-left text-zinc-400 mb-4 max-w-md mx-auto"><summary>{t("errorDetail")}</summary><pre className="mt-2 whitespace-pre-wrap">{error.message}</pre></details>}
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
      >
        {t("retry")}
      </button>
    </div>
  )
}

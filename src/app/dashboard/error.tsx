"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
      <p className="text-muted mb-6">Beklenmeyen bir hata ile karşılaştık. Lütfen tekrar dene.</p>
      {process.env.NODE_ENV === "development" && <details className="text-xs text-left text-zinc-400 mb-4 max-w-md mx-auto"><summary>Hata detayı</summary><pre className="mt-2 whitespace-pre-wrap">{error.message}</pre></details>}
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
      >
        Tekrar Dene
      </button>
    </div>
  )
}

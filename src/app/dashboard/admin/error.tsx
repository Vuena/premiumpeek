"use client"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Admin Paneli Hatası</h2>
      <p className="text-muted mb-6">Admin panelinde bir hata oluştu. Lütfen tekrar dene.</p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
      >
        Tekrar Dene
      </button>
    </div>
  )
}

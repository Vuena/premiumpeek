import { Link } from "@/i18n/navigation"

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-zinc-950 text-center px-4">
      <h1 className="text-6xl font-bold text-zinc-900 dark:text-white mb-4">404</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">Page not found</p>
      <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200">
        Go Home
      </Link>
    </div>
  )
}

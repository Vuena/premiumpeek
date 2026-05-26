import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations("Common")

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <div className="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">{t("notFound")}</h1>
        <p className="text-muted text-sm mb-6">{t("notFoundDesc")}</p>
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">{t("home")}</Link>
      </div>
    </div>
  )
}

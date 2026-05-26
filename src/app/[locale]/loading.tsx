import { useTranslations } from "next-intl"

export default function Loading() {
  const t = useTranslations("Common")

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
        <p className="text-sm text-zinc-500">{t("loading")}</p>
      </div>
    </div>
  )
}

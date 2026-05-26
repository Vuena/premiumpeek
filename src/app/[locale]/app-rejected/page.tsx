import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("AppRejectedPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/app-rejected` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/app-rejected`,
    },
  }
}

export default function AppRejectedPage() {
  const t = useTranslations("AppRejectedPage")

  const reasons = [
    t("reason1"),
    t("reason2"),
    t("reason3"),
    t("reason4"),
  ]

  const cards = [
    { titleKey: "card1Title", descKey: "card1Desc" },
    { titleKey: "card2Title", descKey: "card2Desc" },
    { titleKey: "card3Title", descKey: "card3Desc" },
    { titleKey: "card4Title", descKey: "card4Desc" },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed text-lg">
        {t("subtitle")}
      </p>

      <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-6 mb-8">
        <h2 className="font-semibold mb-2">{t("reasonsTitle")}</h2>
        <ul className="space-y-2 text-sm text-red-700 dark:text-red-400">
          {reasons.map((reason, i) => (
            <li key={i}>&bull; {reason}</li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {cards.map(item => (
          <div key={item.titleKey} className="flex gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{t(item.titleKey)}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{t(item.descKey)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/purchase">
          <Button size="lg" className="gap-2 shadow-lg shadow-blue-600/20">
            {t("cta")} <ArrowRight size={18} />
          </Button>
        </Link>
        <p className="text-xs text-muted mt-3">{t("guaranteeNote")}</p>
      </div>
    </div>
  )
}

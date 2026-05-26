import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("RefundPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/refund` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/refund`,
    },
  }
}

export default function RefundPage() {
  const t = useTranslations("RefundPage")

  const conditions = [
    t("condition1"),
    t("condition2"),
    t("condition3"),
    t("condition4"),
    t("condition5"),
  ]

  const steps = [
    { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
    { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
    { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted text-sm mb-8">{t("lastUpdate")}</p>

      <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-6 mb-8">
        <p className="text-green-700 dark:text-green-400 font-medium">
          {t("guaranteeBox")}
        </p>
      </div>

      <div className="space-y-8 mb-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section1Title")}</h2>
          <ul className="space-y-3">
            {conditions.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 text-xs font-bold">&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section2Title")}</h2>
          <div className="space-y-4">
            {steps.map(item => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-sm">{t(item.titleKey)}</h3>
                  <p className="text-sm text-muted mt-0.5">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-6">
          <h2 className="font-semibold mb-2">{t("importantTitle")}</h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 leading-relaxed">
            {t("importantDesc")}
          </p>
        </section>
      </div>
    </div>
  )
}

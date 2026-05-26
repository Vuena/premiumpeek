import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("PrivacyPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/privacy` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/privacy`,
    },
  }
}

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage")

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section1Title")}</h2>
          <p className="text-muted leading-relaxed mb-3">{t("section1Desc")}</p>
          <ul className="list-disc list-inside space-y-1 text-muted text-sm">
            <li>{t("list1Item1")}</li>
            <li>{t("list1Item2")}</li>
            <li>{t("list1Item3")}</li>
            <li>{t("list1Item4")}</li>
            <li>{t("list1Item5")}</li>
            <li>{t("list1Item6")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section2Title")}</h2>
          <p className="text-muted leading-relaxed mb-3">{t("section2Desc")}</p>
          <ul className="list-disc list-inside space-y-1 text-muted text-sm">
            <li><strong>{t("list2Item1Label")}</strong> {t("list2Item1Desc")}</li>
            <li><strong>{t("list2Item2Label")}</strong> {t("list2Item2Desc")}</li>
            <li><strong>{t("list2Item3Label")}</strong> {t("list2Item3Desc")}</li>
            <li><strong>{t("list2Item4Label")}</strong> {t("list2Item4Desc")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section3Title")}</h2>
          <p className="text-muted leading-relaxed">{t("section3Desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section4Title")}</h2>
          <p className="text-muted leading-relaxed">{t("section4Desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section5Title")}</h2>
          <p className="text-muted leading-relaxed mb-3">{t("section5Desc")}</p>
          <ul className="list-disc list-inside space-y-1 text-muted text-sm">
            <li>{t("list5Item1")}</li>
            <li>{t("list5Item2")}</li>
            <li>{t("list5Item3")}</li>
            <li>{t("list5Item4")}</li>
            <li>{t("list5Item5")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section6Title")}</h2>
          <p className="text-muted leading-relaxed">
            {t("section6Desc")} <a href="mailto:premiumpeektest@gmail.com" className="text-blue-600 hover:underline">{t("email")}</a>
          </p>
        </section>
      </div>
    </div>
  )
}

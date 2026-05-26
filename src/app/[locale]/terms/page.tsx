import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("TermsPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/terms` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/terms`,
    },
  }
}

export default function TermsPage() {
  const t = useTranslations("TermsPage")

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section1Title")}</h2>
          <p className="text-muted leading-relaxed">{t("section1Desc1")}</p>
          <p className="text-muted leading-relaxed mt-3">{t("section1Desc2")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section2Title")}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>{t("list2Item1")}</li>
            <li>{t("list2Item2")}</li>
            <li>{t("list2Item3")}</li>
            <li>{t("list2Item4")}</li>
            <li>{t("list2Item5")}</li>
            <li>{t("list2Item6")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section3Title")}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>{t("list3Item1")}</li>
            <li>{t("list3Item2")}</li>
            <li>{t("list3Item3")}</li>
            <li>{t("list3Item4")}</li>
            <li>{t("list3Item5")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section4Title")}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>{t("list4Item1")}</li>
            <li>{t("list4Item2")}</li>
            <li>{t("list4Item3")}</li>
            <li>{t("list4Item4")}</li>
            <li>{t("list4Item5")}</li>
            <li>{t("list4Item6")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section5Title")}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>{t("list5Item1")}</li>
            <li>{t("list5Item2")}</li>
            <li>{t("list5Item3")}</li>
            <li>{t("list5Item4")}</li>
            <li>{t("list5Item5")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section6Title")}</h2>
          <p className="text-muted leading-relaxed">{t("section6Desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section7Title")}</h2>
          <p className="text-muted leading-relaxed">{t("section7Desc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("section8Title")}</h2>
          <p className="text-muted leading-relaxed">{t("section8Desc")}</p>
        </section>
      </div>
    </div>
  )
}

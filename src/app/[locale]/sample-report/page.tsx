import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("SampleReportPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/sample-report` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/sample-report`,
    },
  }
}

export default function SampleReportPage() {
  const t = useTranslations("SampleReportPage")

  const typeConfig: Record<string, { label: string; className: string }> = {
    bug: { label: t("typeBug"), className: "text-red-600 font-semibold" },
    uiux: { label: t("typeUIUX"), className: "text-blue-600 font-semibold" },
    suggestion: { label: t("typeSuggestion"), className: "text-green-600 font-semibold" },
  }

  const rows = [
    { no: 1, typeId: "bug", descKey: "row1Desc" },
    { no: 2, typeId: "uiux", descKey: "row2Desc" },
    { no: 3, typeId: "suggestion", descKey: "row3Desc" },
    { no: 4, typeId: "bug", descKey: "row4Desc" },
    { no: 5, typeId: "uiux", descKey: "row5Desc" },
  ]

  const formItems = [
    { labelKey: "formProcess" },
    { labelKey: "formFeedback" },
    { labelKey: "formComments" },
    { labelKey: "formResult" },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <Link href="/#pricing" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> {t("backLink")}
      </Link>
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">{t("subtitle")}</p>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">{t("reportTitle")}</h2>
            <p className="text-xs text-muted">{t("reportDate")}</p>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">{t("completed")}</span>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <th className="text-left px-3 py-2 font-medium">{t("tableHeaderNo")}</th>
                <th className="text-left px-3 py-2 font-medium">{t("tableHeaderType")}</th>
                <th className="text-left px-3 py-2 font-medium">{t("tableHeaderDesc")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.no} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2.5 text-muted">{row.no}</td>
                  <td className={`px-3 py-2.5 ${typeConfig[row.typeId].className}`}>{typeConfig[row.typeId].label}</td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{t(row.descKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-sm mb-2">{t("formTitle")}</h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {formItems.map((item, i) => (
                <p key={i}>{t(item.labelKey)}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/purchase">
          <Button size="lg" className="gap-2">{t("cta")} <Download size={16} /></Button>
        </Link>
      </div>
    </div>
  )
}

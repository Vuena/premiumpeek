import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Users, ShieldCheck, Sparkles, Globe, BarChart3, Smartphone } from "lucide-react"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("AboutPage")
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: `${siteUrl}/${locale}/about` },
    openGraph: {
      title: `${t("title")} | PremiumPeek`,
      description: t("description"),
      url: `${siteUrl}/${locale}/about`,
    },
  }
}

export default async function AboutPage() {
  const t = await getTranslations("AboutPage")

  const features = [
    { icon: Users, title: t("featureCommunityTitle"), desc: t("featureCommunityDesc") },
    { icon: ShieldCheck, title: t("featureReliableTitle"), desc: t("featureReliableDesc") },
    { icon: Sparkles, title: t("featureFreeTitle"), desc: t("featureFreeDesc") },
    { icon: Globe, title: t("featureGlobalTitle"), desc: t("featureGlobalDesc") },
  ]

  const stats = [
    { icon: BarChart3, value: "10.000+", label: t("statTests") },
    { icon: Users, value: "500+", label: t("statDevs") },
    { icon: Smartphone, value: "1.000+", label: t("statApps") },
  ]

  const steps = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
    { step: "4", title: t("step4Title"), desc: t("step4Desc") },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
        {t("description")}
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {features.map(item => (
          <div key={item.title} className="flex gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <item.icon className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {stats.map(item => (
          <div key={item.label} className="text-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <item.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold mb-1">{item.value}</div>
            <div className="text-sm text-zinc-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-zinc-100 dark:bg-[#121212] p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">{t("missionTitle")}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {t("missionDesc")}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">{t("howTitle")}</h2>
        <div className="space-y-4">
          {steps.map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">{item.step}</div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/signup"><Button size="lg">{t("cta")}</Button></Link>
      </div>
    </div>
  )
}

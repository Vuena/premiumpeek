import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/ui/cta-button"
import { TestimonialsSection } from "@/components/ui/TestimonialsSection"
import { Users, Calendar, ShieldCheck, Clock, FileText, Smartphone, ArrowRight, CheckCircle, X, Check } from "lucide-react"
import type { ReactNode } from "react"

function Chevron(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function Home() {
  const t = useTranslations("HomePage")

  const stats = [
    { value: "5.000+", label: t("statApps") },
    { value: "%95+", label: t("statSuccess") },
    { value: "50.000+", label: t("statMembers") },
    { value: "180+", label: t("statCountries") },
  ]

  const steps = [
    { icon: Users, title: t("step1Title"), desc: t("step1Desc") },
    { icon: Smartphone, title: t("step2Title"), desc: t("step2Desc") },
    { icon: Clock, title: t("step3Title"), desc: t("step3Desc") },
    { icon: ShieldCheck, title: t("step4Title"), desc: t("step4Desc") },
  ]

  const features = [
    { icon: Users, title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: Calendar, title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: Clock, title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: FileText, title: t("feature4Title"), desc: t("feature4Desc") },
    { icon: ShieldCheck, title: t("feature5Title"), desc: t("feature5Desc") },
  ]

  const freeFeatures = [t("freeFeature1"), t("freeFeature2"), t("freeFeature3")]

  const proFeatures = [t("proFeature1"), t("proFeature2"), t("proFeature3"), t("proFeature4"), t("proFeature5"), t("proFeature6"), t("proFeature7")]

  const faqKeys = ["faq1", "faq2", "faq3", "faq4", "faq5", "faq6", "faq7", "faq8", "faq9", "faq10", "faq11"] as const
  const faqs = faqKeys.map((key) => ({ q: t(`${key}q` as any), a: t(`${key}a` as any) }))

  const comparisonFriends = [
    { label: t("compStartTime"), value: t("compFriendsStart") },
    { label: t("compTesters"), value: t("compFriendsTesters") },
    { label: t("compGuarantee"), value: t("compFriendsGuarantee") },
    { label: t("compReporting"), value: t("compFriendsReporting") },
    { label: t("compCost"), value: t("compFriendsCost") },
  ]

  const comparisonFreelance = [
    { label: t("compStartTime"), value: t("compFreelanceStart") },
    { label: t("compTesters"), value: t("compFreelanceTesters") },
    { label: t("compGuarantee"), value: t("compFreelanceGuarantee") },
    { label: t("compReporting"), value: t("compFreelanceReporting") },
    { label: t("compCost"), value: t("compFreelanceCost") },
  ]

  const comparisonPeek = [
    { label: t("compStartTime"), value: t("compPeekStart") },
    { label: t("compTesters"), value: t("compPeekTesters") },
    { label: t("compGuarantee"), value: t("compPeekGuarantee") },
    { label: t("compReporting"), value: t("compPeekReporting") },
    { label: t("compCost"), value: t("compPeekCost") },
  ]

  const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">{desc}</p>}
    </div>
  )

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/10 dark:to-zinc-950" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-3.5 py-1 text-xs font-medium text-green-700 dark:text-green-400 mb-6">
              <ShieldCheck size={14} />
              {t("heroBadge")}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              {t("heroTitle1")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{t("heroTitle2")}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto">
              {t("heroDesc")}
            </p>
            <div className="mt-10 flex flex-col items-center gap-6">
              <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                <CtaButton>
                  <Button size="lg" className="text-sm sm:text-base gap-2 flex-1 sm:flex-none shadow-lg shadow-blue-600/20">
                    {t("heroFreeCTA")} <ArrowRight size={16} />
                  </Button>
                </CtaButton>
                <Link href="/#how-it-works">
                  <Button variant="outline" size="lg" className="text-sm sm:text-base flex-1 sm:flex-none border-zinc-300 dark:border-zinc-600">
                    {t("heroHowItWorks")}
                  </Button>
                </Link>
              </div>
              <Link href="/purchase" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-5 py-3 text-base sm:text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-105">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">$</span>
                {t("heroPremiumCTA")}
                <ArrowRight size={16} />
              </Link>
              <Link href="/#pricing" className="text-sm text-muted hover:text-foreground underline underline-offset-2 pt-1">
                {t("heroDetailsLink")}
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-7 text-center shadow-sm">
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 text-sm text-blue-700 dark:text-blue-400">
              <Users size={14} />
              <span><strong>5.000+</strong> {t("heroCommunityText")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title={t("howItWorksTitle")} desc={t("howItWorksDesc")} />
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mb-4 shadow-md">
                  <step.icon size={28} />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 h-7 w-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold ring-4 ring-white dark:ring-zinc-950">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title={t("featuresTitle")} desc={t("featuresDesc")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-cardborder shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-10 w-10 text-blue-600 dark:text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title={t("pricingTitle")} desc={t("pricingDesc")} />
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-cardborder">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">{t("freePlanTitle")}</h3>
                <p className="text-4xl font-bold mb-6">{t("freePlanPrice")}</p>
                <ul className="space-y-3 mb-8">
                  {freeFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <CtaButton><Button variant="outline" className="w-full">{t("freeCTA")}</Button></CtaButton>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-4 py-1 rounded-full">{t("proPlanBadge")}</div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">{t("proPlanTitle")}</h3>
                <p className="text-4xl font-bold mb-1">{t("proPlanPrice")}</p>
                <p className="text-sm text-muted mb-6">{t("proPlanDesc")}</p>
                <ul className="space-y-3 mb-8">
                   {proFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/purchase"><Button className="w-full shadow-lg shadow-blue-600/20">{t("proCTA")}</Button></Link>
                <div className="mt-3 text-center">
                  <Link href="/sample-report" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{t("sampleReport")}</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* Comparison */}
      <section className="py-20 sm:py-28 bg-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title={t("comparisonTitle")} desc={t("comparisonDesc")} />
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-cardborder shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="text-2xl font-bold text-zinc-400 mb-6">{t("compFriends")}</div>
                <div className="space-y-6">
                  {comparisonFriends.map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-zinc-400 mb-1">{item.label}</div>
                      <div className="flex items-center justify-center gap-2">
                        <X size={14} className="text-red-400 shrink-0" />
                        <span className="text-sm text-zinc-500">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-cardborder shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="text-2xl font-bold text-zinc-400 mb-6">{t("compFreelance")}</div>
                <div className="space-y-6">
                  {comparisonFreelance.map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-zinc-400 mb-1">{item.label}</div>
                      <div className="flex items-center justify-center gap-2">
                        <X size={14} className="text-red-400 shrink-0" />
                        <span className="text-sm text-zinc-500">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-4 py-1 rounded-full">{t("compBestBadge")}</div>
              <CardContent className="p-8 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">{t("compPremiumPeek")}</div>
                <div className="space-y-6">
                  {comparisonPeek.map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-zinc-400 mb-1">{item.label}</div>
                      <div className="flex items-center justify-center gap-2">
                        <Check size={14} className="text-green-500 shrink-0" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle title={t("faqTitle")} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            }),
          }} />
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-cardborder bg-card [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-sm">{faq.q}</span>
                  <Chevron className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 text-muted" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/10 dark:to-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-lg text-muted mb-8 max-w-xl mx-auto">
            {t("ctaDesc")}
          </p>
          <CtaButton>
            <Button size="lg" className="text-base gap-2 shadow-lg shadow-blue-600/20">
              {t("ctaButton")} <ArrowRight size={18} />
            </Button>
          </CtaButton>
        </div>
      </section>
    </div>
  )
}

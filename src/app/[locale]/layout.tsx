import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { routing } from "@/i18n/routing"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { ToastProvider } from "@/context/ToastContext"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CookieConsent } from "@/components/ui/CookieConsent"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  return {
    title: {
      default: locale === "en"
        ? "Free Google Play Testing Community - PremiumPeek"
        : "Ücretsiz Google Play Test Topluluğu - PremiumPeek",
      template: "%s | PremiumPeek",
    },
    description: locale === "en"
      ? "Free Google Play testing community. Test your app with 18 developers, meet publishing requirements, and go live. No credit card required."
      : "Ücretsiz Google Play test topluluğu. 18 geliştiriciyle uygulamanızı test edin, yayın şartlarını karşılayın ve yayına geçin. Kredi kartı gerekmez.",
    keywords: locale === "en"
      ? ["free google play testing", "google play testing community", "closed testing", "12 testers", "production access", "app testing", "premiumpeek"]
      : ["ücretsiz google play test", "google play test topluluğu", "google play testing", "closed testing", "12 testers", "production access", "app testing", "google play test kullanıcısı", "premiumpeek"],
    authors: [{ name: "PremiumPeek" }],
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: locale === "tr" ? `${siteUrl}/tr` : `${siteUrl}/en`,
      languages: {
        "tr": `${siteUrl}/tr`,
        "en": `${siteUrl}/en`,
      },
    },
    icons: {
      icon: "/favicon.svg",
      apple: "/icon.svg",
    },
    openGraph: {
      title: locale === "en" ? "Free Google Play Testing Community - PremiumPeek" : "Ücretsiz Google Play Test Topluluğu - PremiumPeek",
      description: locale === "en"
        ? "Free Google Play testing community. Test your app with 18 developers and go live. No credit card required."
        : "Ücretsiz Google Play test topluluğu. 18 geliştiriciyle uygulamanı test et, yayına geç. Kredi kartı gerekmez.",
      url: siteUrl,
      siteName: "PremiumPeek",
      locale: locale === "en" ? "en_US" : "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "en" ? "Free Google Play Testing Community - PremiumPeek" : "Ücretsiz Google Play Test Topluluğu - PremiumPeek",
      description: locale === "en"
        ? "Free Google Play testing community. Test your app with 18 developers and go live."
        : "Ücretsiz Google Play test topluluğu. 18 geliştiriciyle uygulamanı test et, yayına geç.",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

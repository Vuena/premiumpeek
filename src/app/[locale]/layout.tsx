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
        ? "PremiumPeek - Google Play Testing Community"
        : "PremiumPeek - Google Play Test Topluluğu",
      template: "%s | PremiumPeek",
    },
    description: locale === "en"
      ? "Test your app with packs of 18 developers to meet Google Play publishing requirements. Free community and professional testing service."
      : "Google Play yayın şartlarını karşılamak için 18 geliştiriciden oluşan pack'lerle uygulamanızı test edin. Ücretsiz topluluk ve profesyonel test hizmeti.",
    keywords: locale === "en"
      ? ["google play testing", "closed testing", "12 testers", "production access", "app testing", "premiumpeek"]
      : ["google play testing", "closed testing", "12 testers", "production access", "app testing", "google play test kullanıcısı", "premiumpeek", "google play test topluluğu"],
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
      title: locale === "en" ? "PremiumPeek - Google Play Testing Community" : "PremiumPeek - Google Play Test Topluluğu",
      description: locale === "en"
        ? "Test your app with packs of 18 developers and publish on Google Play."
        : "18 geliştiriciden oluşan pack'lerle uygulamanı test et, Google Play'de yayınla.",
      url: siteUrl,
      siteName: "PremiumPeek",
      locale: locale === "en" ? "en_US" : "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "en" ? "PremiumPeek - Google Play Testing Community" : "PremiumPeek - Google Play Test Topluluğu",
      description: locale === "en"
        ? "Test your app with packs of 18 developers and publish on Google Play."
        : "18 geliştiriciden oluşan pack'lerle uygulamanı test et, Google Play'de yayınla.",
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

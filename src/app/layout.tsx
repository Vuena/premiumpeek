import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { ToastProvider } from "@/context/ToastContext"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#18181b",
}

export const metadata: Metadata = {
  title: {
    default: "PremiumPeek - Google Play Test Topluluğu",
    template: "%s | PremiumPeek",
  },
  description: "Google Play yayın şartlarını karşılamak için 18 geliştiriciden oluşan pack'lerle uygulamanızı test edin. Ücretsiz topluluk ve profesyonel test hizmeti.",
  keywords: ["google play testing", "closed testing", "12 testers", "production access", "app testing", "google play test kullanıcısı", "premiumpeek", "google play test topluluğu"],
  authors: [{ name: "PremiumPeek" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "PremiumPeek - Google Play Test Topluluğu",
    description: "18 geliştiriciden oluşan pack'lerle uygulamanı test et, Google Play'de yayınla.",
    url: siteUrl,
    siteName: "PremiumPeek",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PremiumPeek - Google Play Test Topluluğu",
    description: "18 geliştiriciden oluşan pack'lerle uygulamanı test et, Google Play'de yayınla.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem("theme");
              if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
              }
            } catch(e) {}
          `,
        }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PremiumPeek",
            url: siteUrl,
            logo: `${siteUrl}/favicon.svg`,
            description: "Google Play yayın şartlarını karşılamak için test topluluğu",
            sameAs: [],
          }),
        }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PremiumPeek",
            url: siteUrl,
            description: "Google Play Test Topluluğu - Uygulamanızı 18 geliştiriciyle test edin, Google Play'de yayınlayın.",
            inLanguage: "tr",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: {
    default: "PremiumPeek - Google Play Test Topluluğu",
    template: "%s | PremiumPeek",
  },
  description: "Google Play yayın şartlarını karşılamak için 16 geliştiriciden oluşan pack'lerle uygulamanızı test edin. Ücretsiz topluluk ve profesyonel test hizmeti.",
  keywords: ["google play testing", "closed testing", "12 testers", "production access", "app testing", "google play test kullanıcısı"],
  authors: [{ name: "PremiumPeek" }],
  openGraph: {
    title: "PremiumPeek - Google Play Test Topluluğu",
    description: "16 geliştiriciden oluşan pack'lerle uygulamanı 16 günde test et, Google Play'de yayınla.",
    type: "website",
    locale: "tr_TR",
    siteName: "PremiumPeek",
  },
  twitter: {
    card: "summary_large_image",
    title: "PremiumPeek - Google Play Test Topluluğu",
    description: "16 geliştiriciden oluşan pack'lerle uygulamanı 16 günde test et, Google Play'de yayınla.",
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

import type { Metadata } from "next"
import LoginClient from "./client"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "PremiumPeek hesabınıza giriş yapın. Google Play test yolculuğunuza devam edin.",
  alternates: { canonical: `${siteUrl}/login` },
  openGraph: {
    title: "Giriş Yap | PremiumPeek",
    description: "PremiumPeek hesabınıza giriş yapın.",
    url: `${siteUrl}/login`,
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    title: "Giriş Yap | PremiumPeek",
    description: "PremiumPeek hesabınıza giriş yapın.",
    card: "summary_large_image",
  },
}

export default function LoginPage() {
  return <LoginClient />
}

import type { Metadata } from "next"
import SignupClient from "./client"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "PremiumPeek'e ücretsiz kaydolun. Google Play test topluluğuna katılın ve uygulamalarınızı test edin.",
  alternates: { canonical: `${siteUrl}/signup` },
  openGraph: {
    title: "Kayıt Ol | PremiumPeek",
    description: "PremiumPeek'e ücretsiz kaydolun. Google Play test topluluğuna katılın.",
    url: `${siteUrl}/signup`,
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    title: "Kayıt Ol | PremiumPeek",
    description: "PremiumPeek'e ücretsiz kaydolun.",
    card: "summary_large_image",
  },
}

export default function SignupPage() {
  return <SignupClient />
}

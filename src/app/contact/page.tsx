import type { Metadata } from "next"
import ContactClient from "./client"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export const metadata: Metadata = {
  title: "İletişim",
  description: "PremiumPeek ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için bize ulaşın.",
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: "İletişim | PremiumPeek",
    description: "PremiumPeek ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için bize ulaşın.",
    url: `${siteUrl}/contact`,
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    title: "İletişim | PremiumPeek",
    description: "PremiumPeek ile iletişime geçin.",
    card: "summary_large_image",
  },
}

export default function ContactPage() {
  return <ContactClient />
}

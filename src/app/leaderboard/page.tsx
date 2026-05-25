import type { Metadata } from "next"
import LeaderboardClient from "./client"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export const metadata: Metadata = {
  title: "Liderlik Tablosu",
  description: "En çok test yapan kullanıcıları görün. PremiumPeek liderlik tablosu ile en aktif testçileri keşfedin.",
  alternates: { canonical: `${siteUrl}/leaderboard` },
  openGraph: {
    title: "Liderlik Tablosu | PremiumPeek",
    description: "En çok test yapan kullanıcıları görün. PremiumPeek liderlik tablosu ile en aktif testçileri keşfedin.",
    url: `${siteUrl}/leaderboard`,
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    title: "Liderlik Tablosu | PremiumPeek",
    description: "En çok test yapan kullanıcılar.",
    card: "summary_large_image",
  },
}

export default function LeaderboardPage() {
  return <LeaderboardClient />
}

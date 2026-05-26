import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import PurchaseClient from "./client"

interface Props {
  params: Promise<{ locale: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("PurchasePage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/purchase` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/purchase`,
    },
  }
}

export default async function PurchasePage() {
  const t = await getTranslations("PurchasePage")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: t("productName"),
            description: t("productDesc"),
            offers: {
              "@type": "Offer",
              price: "10",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <PurchaseClient />
    </>
  )
}

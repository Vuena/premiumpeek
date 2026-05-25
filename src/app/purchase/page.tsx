import type { Metadata } from "next"
import PurchaseClient from "./client"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export const metadata: Metadata = {
  title: "Profesyonel Test Satın Al",
  description: "PremiumPeek'ten profesyonel test hizmeti satın alın. 18 testçi ile uygulamanızı Google Play'de yayınlayın.",
  alternates: { canonical: `${siteUrl}/purchase` },
  openGraph: {
    title: "Profesyonel Test Satın Al | PremiumPeek",
    description: "18 testçi ile uygulamanızı Google Play'de yayınlayın. 16 gün boyunca profesyonel test hizmeti.",
    url: `${siteUrl}/purchase`,
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    title: "Profesyonel Test Satın Al | PremiumPeek",
    description: "18 testçi ile uygulamanızı Google Play'de yayınlayın.",
    card: "summary_large_image",
  },
}

export default function PurchasePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Profesyonel Google Play Test Hizmeti",
            description: "18 testçi ile uygulamanızı Google Play'de yayınlayın. 16 gün boyunca profesyonel test hizmeti.",
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

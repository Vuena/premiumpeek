"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronDown } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import trReviews from "@/lib/reviews.json"
import enReviews from "@/lib/reviews-en.json"

export function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false)
  const locale = useLocale()
  const allReviews = locale === "tr" ? trReviews : enReviews
  const visible = showAll ? allReviews : allReviews.slice(0, 6)
  const t = useTranslations("HomePage")

  return (
    <section id="reviews" className="py-20 sm:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: locale === "tr" ? "PremiumPeek Google Play Test Hizmeti" : "PremiumPeek Google Play Testing Service",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: allReviews.length.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }),
      }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("reviewsTitle")}</h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">{t("reviewsSubtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((r) => (
            <Card key={r.name} className="border-cardborder">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted mb-4 leading-relaxed italic">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-400">{r.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{r.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showAll && allReviews.length > 6 && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll(true)} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer min-h-11">
              {t("seeAllReviews")} ({allReviews.length}) <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

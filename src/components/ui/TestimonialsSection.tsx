"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronDown } from "lucide-react"
import allReviews from "@/lib/reviews.json"

export function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? allReviews : allReviews.slice(0, 6)

  return (
    <section id="reviews" className="py-20 sm:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "PremiumPeek Google Play Test Hizmeti",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: "51",
            bestRating: "5",
            worstRating: "1",
          },
        }),
      }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Geliştiriciler Ne Diyor?</h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">5.000+ geliştirici uygulamasını yayınladı.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((t) => (
            <Card key={t.name} className="border-cardborder">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted mb-4 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-400">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showAll && allReviews.length > 6 && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll(true)} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer min-h-11">
              Tüm Yorumları Gör ({allReviews.length}) <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

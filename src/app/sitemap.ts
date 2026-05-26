import type { MetadataRoute } from "next"
import { blogPosts } from "@/lib/blog-data"

const locales = ["tr", "en"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ]

  const pagePaths = [
    { path: "/about", priority: 0.6, freq: "monthly" as const },
    { path: "/blog", priority: 0.6, freq: "weekly" as const },
    { path: "/contact", priority: 0.4, freq: "monthly" as const },
    { path: "/leaderboard", priority: 0.7, freq: "daily" as const },
    { path: "/login", priority: 0.3, freq: "monthly" as const },
    { path: "/payment/cancel", priority: 0.1, freq: "monthly" as const },
    { path: "/payment/success", priority: 0.1, freq: "monthly" as const },
    { path: "/privacy", priority: 0.3, freq: "monthly" as const },
    { path: "/purchase", priority: 0.8, freq: "weekly" as const },
    { path: "/refund", priority: 0.3, freq: "monthly" as const },
    { path: "/sample-report", priority: 0.5, freq: "monthly" as const },
    { path: "/app-rejected", priority: 0.5, freq: "monthly" as const },
    { path: "/signup", priority: 0.5, freq: "monthly" as const },
    { path: "/terms", priority: 0.3, freq: "monthly" as const },
  ]

  const localizedPages: MetadataRoute.Sitemap = []
  for (const locale of locales) {
    for (const page of pagePaths) {
      localizedPages.push({
        url: `${base}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.freq,
        priority: page.priority,
      })
    }
  }

  const blogPages: MetadataRoute.Sitemap = []
  for (const locale of locales) {
    for (const post of blogPosts) {
      blogPages.push({
        url: `${base}/${locale}/blog/${post.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })
    }
  }

  return [...staticPages, ...localizedPages, ...blogPages]
}

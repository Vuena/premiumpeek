import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { getBlogPosts } from "@/lib/blog-data"
import { blogJsonLd } from "@/lib/schema"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("BlogPage")
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: `${siteUrl}/${locale}/blog` },
    openGraph: {
      title: `${t("title")} | PremiumPeek`,
      description: t("description"),
      url: `${siteUrl}/${locale}/blog`,
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations("BlogPage")
  const posts = getBlogPosts(locale)

  const blogSchema = blogJsonLd(posts.map(p => ({
    title: p.title,
    url: `${siteUrl}/${locale}/blog/${p.slug}`,
    desc: p.desc,
    date: p.date,
  })))

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">{t("description")}</p>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl p-6 bg-card cursor-pointer">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{post.date}</p>
              <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{post.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

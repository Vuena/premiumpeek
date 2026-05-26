import { notFound } from "next/navigation"
import { Link } from "@/i18n/navigation"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { getBlogPost, getBlogPosts } from "@/lib/blog-data"
import { breadcrumbJsonLd, articleJsonLd } from "@/lib/schema"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const locales = ["tr", "en"]
  const posts = getBlogPosts("tr")
  return locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getBlogPost(slug, locale)
  if (!post) return {}
  return {
    title: `${post.title} | PremiumPeek`,
    description: post.desc,
    alternates: { canonical: `${siteUrl}/${locale}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.desc,
      url: `${siteUrl}/${locale}/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const post = getBlogPost(slug, locale)
  if (!post) notFound()

  const t = await getTranslations("BlogPage")

  const breadcrumb = breadcrumbJsonLd([
    { name: t("home"), url: `${siteUrl}` },
    { name: t("title"), url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${slug}` },
  ])

  const articleSchema = articleJsonLd({
    title: post.title,
    description: post.desc,
    url: `${siteUrl}/${locale}/blog/${slug}`,
    imageUrl: `${siteUrl}/opengraph-image.png`,
    date: post.date,
    authorName: "PremiumPeek",
  })

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Link href="/blog" className="text-sm text-blue-600 hover:underline mb-4 inline-block">{t("backToBlog")}</Link>
      <article>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{post.date}</p>
        <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
        <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{post.content}</p>
      </article>
    </div>
  )
}

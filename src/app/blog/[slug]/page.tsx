import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { blogPosts } from "@/lib/blog-data"
import { breadcrumbJsonLd } from "@/lib/schema"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: `${post.title} | PremiumPeek`,
    description: post.desc,
    alternates: { canonical: `https://www.premiumpeek.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.desc,
      url: `https://www.premiumpeek.com/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  const breadcrumb = breadcrumbJsonLd([
    { name: "Ana Sayfa", url: "https://www.premiumpeek.com" },
    { name: "Blog", url: "https://www.premiumpeek.com/blog" },
    { name: post.title, url: `https://www.premiumpeek.com/blog/${slug}` },
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Link href="/blog" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Blog'a Dön</Link>
      <article>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{post.date}</p>
        <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
        <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{post.content}</p>
      </article>
    </div>
  )
}

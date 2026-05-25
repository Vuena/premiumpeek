import Link from "next/link"
import type { Metadata } from "next"
import { blogPosts } from "@/lib/blog-data"

export const metadata: Metadata = {
  title: "Blog | PremiumPeek",
  description: "Google Play test süreci hakkında ipuçları ve rehberler.",
  alternates: { canonical: "https://www.premiumpeek.com/blog" },
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Google Play test süreci hakkında ipuçları ve rehberler.</p>

      <div className="space-y-4">
        {blogPosts.map((post) => (
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

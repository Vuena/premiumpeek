import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calendar } from "lucide-react"

export const metadata = { title: "Blog" }

export default function BlogPage() {
  const posts = [
    {
      title: "Google Play Kapalı Test Şartı 2026",
      desc: "Google Play'in kapalı test şartı nedir, nasıl karşılanır? Adım adım rehber.",
      date: "Mayıs 2026",
    },
    {
      title: "12 Testçi Bulma Rehberi",
      desc: "Uygulamanız için 12 gerçek test kullanıcısı bulmanın en kolay yolları.",
      date: "Nisan 2026",
    },
    {
      title: "Pack Sistemi Nasıl Çalışır?",
      desc: "16 geliştiriciden oluşan pack'lerle test sürecinizi nasıl hızlandıracağınızı öğrenin.",
      date: "Mart 2026",
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Google Play test süreci hakkında ipuçları ve rehberler.</p>

      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                <Calendar size={12} />
                <span>{post.date}</span>
              </div>
              <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{post.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                Devamını Oku <ArrowRight size={14} />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

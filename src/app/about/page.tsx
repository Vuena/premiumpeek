import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, ShieldCheck, Sparkles, Globe, BarChart3, Clock, Smartphone } from "lucide-react"

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "PremiumPeek, Google Play'de uygulama yayınlamak isteyen geliştiricilerin kapalı test şartını karşılaması için kurulmuş bir test topluluğudur.",
  alternates: { canonical: "https://www.premiumpeek.com/about" },
  openGraph: {
    title: "Hakkımızda | PremiumPeek",
    description: "Google Play kapalı test şartını karşılamak için geliştirici topluluğu.",
    url: "https://www.premiumpeek.com/about",
    siteName: "PremiumPeek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkımızda | PremiumPeek",
    description: "Google Play kapalı test şartını karşılamak için geliştirici topluluğu.",
  },
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">Hakkımızda</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
        PremiumPeek, Google Play&apos;de uygulama yayınlamak isteyen geliştiricilerin 
        kapalı test şartını karşılaması için kurulmuş bir test topluluğudur.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {[
          { icon: Users, title: "Topluluk", desc: "Binlerce geliştirici birbirinin uygulamasını test ediyor." },
          { icon: ShieldCheck, title: "Güvenilir", desc: "Aksatma halinde atılma kuralı ile herkesin aktif kalması sağlanır." },
          { icon: Sparkles, title: "Ücretsiz", desc: "Temel pack sistemi tamamen ücretsizdir." },
          { icon: Globe, title: "Global", desc: "Tüm dillerdeki uygulamalar desteklenir." },
        ].map(item => (
          <div key={item.title} className="flex gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <item.icon className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: BarChart3, value: "10.000+", label: "Test Tamamlandı" },
          { icon: Users, value: "500+", label: "Aktif Geliştirici" },
          { icon: Smartphone, value: "1.000+", label: "Uygulama Test Edildi" },
        ].map(item => (
          <div key={item.label} className="text-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <item.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold mb-1">{item.value}</div>
            <div className="text-sm text-zinc-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-zinc-100 dark:bg-[#121212] p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Misyonumuz</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Her geliştiricinin uygulamasını Google Play&apos;de yayınlayabilmesi için 
          ihtiyaç duyduğu test sürecini kolay, ücretsiz ve erişilebilir kılmak.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Nasıl Çalışır?</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Kaydol", desc: "Ücretsiz hesap oluştur ve pack&apos;lere katılmaya başla." },
            { step: "2", title: "Pack&apos;e Katıl", desc: "Diğer geliştiricilerin oluşturduğu pack&apos;lere katıl veya kendi pack&apos;ini oluştur." },
            { step: "3", title: "Test Et", desc: "Her gün 2-3 uygulamayı test et ve test sürecini tamamla." },
            { step: "4", title: "Yayınla", desc: "Test şartını karşıla, uygulamanı Google Play&apos;de yayınla." },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">{item.step}</div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/signup"><Button size="lg">Hemen Başla</Button></Link>
      </div>
    </div>
  )
}

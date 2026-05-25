import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, ShieldCheck, Sparkles, Globe } from "lucide-react"

export const metadata = {
  title: "Hakkımızda",
  description: "PremiumPeek, Google Play'de uygulama yayınlamak isteyen geliştiricilerin kapalı test şartını karşılaması için kurulmuş bir test topluluğudur.",
  openGraph: {
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
          { icon: ShieldCheck, title: "Güvenilir", desc: "3 gün kuralı ile herkesin aktif kalması sağlanır." },
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

      <div className="rounded-2xl bg-zinc-100 dark:bg-[#121212] p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Misyonumuz</h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Her geliştiricinin uygulamasını Google Play&apos;de yayınlayabilmesi için 
          ihtiyaç duyduğu test sürecini kolay, ücretsiz ve erişilebilir kılmak.
        </p>
      </div>

      <div className="text-center">
        <Link href="/signup"><Button size="lg">Hemen Başla</Button></Link>
      </div>
    </div>
  )
}

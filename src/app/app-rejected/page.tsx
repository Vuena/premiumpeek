import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight, CheckCircle } from "lucide-react"

export const metadata = {
  title: "App Rejected? | PremiumPeek",
  description: "Google Play'den red yediysen endişelenme. PremiumPeek ile test sürecini tamamla ve yeniden başvur.",
}

export default function AppRejectedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">Google Play&apos;den Red mi Yedin?</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed text-lg">
        Endişelenme, çoğu geliştirici ilk denemede geçemez. PremiumPeek ile test sürecini tamamla ve yeniden başvur.
      </p>

      <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-6 mb-8">
        <h2 className="font-semibold mb-2">Reddedilmenin En Yaygın Nedenleri</h2>
        <ul className="space-y-2 text-sm text-red-700 dark:text-red-400">
          <li>• Yetersiz testçi sayısı (12&apos;den az)</li>
          <li>• Test süresinin 14 günden kısa olması</li>
          <li>• Testçilerin yetersiz aktivitesi (günlük açılış)</li>
          <li>• Eksik veya hatalı başvuru formu yanıtları</li>
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {[
          { title: "25 Gerçek Testçi", desc: "Google'ın istediği 12'den fazla. Garantili katılım." },
          { title: "16 Gün Süreç", desc: "14 gün şartını +2 gün buffer ile karşıla." },
          { title: "Günlük Aktivite", desc: "Testçiler her gün uygulamanı açar." },
          { title: "Rapor Desteği", desc: "Başvuru formu yanıtları hazır." },
        ].map(item => (
          <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/purchase">
          <Button size="lg" className="gap-2 shadow-lg shadow-blue-600/20">
            Hemen Profesyonel Test Başlat <ArrowRight size={18} />
          </Button>
        </Link>
        <p className="text-xs text-muted mt-3">Google Play reddinde koşulsuz iade garantisi</p>
      </div>
    </div>
  )
}

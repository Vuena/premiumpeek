import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"

export const metadata = {
  title: "Örnek Test Raporu | PremiumPeek",
  description: "PremiumPeek test raporu örneği - detaylı hata raporları, UI/UX geri bildirimleri ve öneriler.",
}

export default function SampleReportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <Link href="/#pricing" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Fiyatlandırmaya Dön
      </Link>
      <h1 className="text-3xl font-bold mb-2">Örnek Test Raporu</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Profesyonel test hizmetimizde aldığınız raporun bir örneği.</p>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Test Raporu - Örnek Uygulama</h2>
            <p className="text-xs text-muted">Tarih: 25 Mayıs 2026 | Paket: com.example.app</p>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">16 Gün Tamamlandı</span>
        </div>

        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <th className="text-left px-3 py-2 font-medium">#</th>
                <th className="text-left px-3 py-2 font-medium">Tür</th>
                <th className="text-left px-3 py-2 font-medium">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: 1, type: "Hata", cls: "text-red-600 font-semibold", desc: "Uygulama başlatıldığında siyah ekran kalıyor, 3 saniye sonra düzeliyor." },
                { no: 2, type: "UI/UX", cls: "text-blue-600 font-semibold", desc: "Kayıt ekranında butonlar mobil görünümde üst üste biniyor." },
                { no: 3, type: "Öneri", cls: "text-green-600 font-semibold", desc: "Profil sayfasına karanlık mod geçişi eklenebilir." },
                { no: 4, type: "Hata", cls: "text-red-600 font-semibold", desc: "Bildirimlere tıklandığında uygulama çöküyor (Android 14)." },
                { no: 5, type: "UI/UX", cls: "text-blue-600 font-semibold", desc: "Ana sayfadaki yazı fontu çok küçük, okunması zor." },
              ].map(row => (
                <tr key={row.no} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2.5 text-muted">{row.no}</td>
                  <td className={`px-3 py-2.5 ${row.cls}`}>{row.type}</td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-sm mb-2">Google Play Başvuru Formu Yanıtları</h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p><strong>Test süreci:</strong> 25 testçi, 16 gün, günlük aktif katılım</p>
              <p><strong>Geri bildirim:</strong> 5 hata raporu, 3 UI/UX iyileştirmesi, 2 öneri</p>
              <p><strong>Testçi yorumları:</strong> Olumlu geri bildirimler, uygulama başarıyla test edildi</p>
              <p><strong>Sonuç:</strong> Google Play yayın şartları fazlasıyla karşılandı</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/purchase">
          <Button size="lg" className="gap-2">Profesyonel Test Başlat <Download size={16} /></Button>
        </Link>
      </div>
    </div>
  )
}

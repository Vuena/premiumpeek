import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Users, Calendar, ShieldCheck, Clock, FileText, Star, ArrowRight, Sparkles, Smartphone } from "lucide-react"

export default function Home() {
  const stats = [
    { value: "5.000+", label: "Uygulama Yayınlandı" },
    { value: "%99", label: "Başarı Oranı" },
    { value: "50.000+", label: "Topluluk Üyesi" },
    { value: "180+", label: "Ülke" },
  ]

  const steps = [
    { icon: Users, title: "Pack'e Katıl", desc: "16 geliştiriciden oluşan bir pack'e katıl veya yeni bir pack oluştur." },
    { icon: Smartphone, title: "Uygulamanı Yükle", desc: "Google Play test linkini gir, talimatlarını ekle. Pack'teki herkes senin uygulamanı test etmeye başlasın." },
    { icon: Clock, title: "16 Gün Boyunca Test Et", desc: "Her gün pack'teki diğer 15 uygulamayı test et, kredi kazan. 3 gün aksatırsan pack'ten atılırsın." },
    { icon: ShieldCheck, title: "Google Play'de Yayınla", desc: "15+ gerçek testçi, 14+ gün aktivite ile Google Play şartını karşıla. Yayına hazırsın!" },
  ]

  const features = [
    { icon: Users, title: "16 Gerçek Testçi", desc: "Google'ın istediği 12'den fazla. Herkes gerçek bir geliştirici." },
    { icon: Calendar, title: "16 Gün Süreç", desc: "14 gün Google şartı + 2 gün tampon. Acele etmene gerek yok." },
    { icon: Clock, title: "Günlük Aktivite", desc: "Pack üyeleri her gün uygulamanı açar. Pasif yükleme değil, gerçek kullanım." },
    { icon: FileText, title: "Geri Bildirim", desc: "Her testçi yorum yapar, hataları raporlar. Uygulamanı iyileştir." },
    { icon: ShieldCheck, title: "Sorumluluk", desc: "3 gün aksatınca atılma. Herkes taahhüdünü yerine getirir." },
    { icon: Sparkles, title: "Oyunlaştırma", desc: "Rozetler, liderlik tablosu, kredi sistemi. Test etmek eğlenceli." },
  ]

  const testimonials = [
    { name: "Ahmet Y.", title: "Android Geliştirici", text: "3 kere reddedildikten sonra PremiumPeek ile ilk denemede onay aldım. Pack sistemi gerçekten işe yarıyor." },
    { name: "Zeynep K.", title: "Mobil Uygulama Geliştiricisi", text: "Arkadaş bulamıyordum, 14 gün boyunca test edecek kimse yoktu. Burada 16 kişi birbirine destek oluyor." },
    { name: "Mehmet A.", title: "Freelancer Geliştirici", text: "Ücretsiz olmasına rağmen sistem çok sağlam. 16 günde uygulamam yayına hazırdı." },
    { name: "Elif D.", title: "Startup Kurucusu", text: "Profesyonel test hizmetiyle 6 saatte testçiler atandı. Para iadesi garantisi de cabası." },
  ]

  const faqs = [
    { q: "Pack sistemi nedir?", a: "Pack, 16 geliştiriciden oluşan ve 16 gün boyunca birbirlerinin uygulamalarını test etmeyi taahhüt eden gruptur. Her üye diğer 15 uygulamayı her gün açar ve geri bildirim verir." },
    { q: "Google Play'in şartı ne?", a: "Yeni hesaplar, yayın öncesinde 12 gerçek kullanıcı tarafından 14 ardışık gün test edilmelidir." },
    { q: "Ücretsiz topluluk ile ücretli hizmet arasındaki fark nedir?", a: "Ücretsiz toplulukta 16 kişilik pack'lerde birbirinizi test edersiniz. Ücretli hizmette 25 profesyonel testçi 6 saat içinde atanır, 16 gün boyunca test eder, detaylı rapor alırsınız." },
    { q: "Ya birisi test etmezse?", a: "3 gün üst üste test etmeyen pack'ten atılır. Bu sayede herkesin aktif kalması sağlanır." },
    { q: "Kaç kredi kazanabilirim?", a: "Her test ettiğin uygulama için +4🪙 kazanırsın. Günde 15 uygulama × 4🪙 = 60🪙. 16 günde toplam 960🪙." },
    { q: "Uygulamam her dilde test edilebilir mi?", a: "Evet. Tüm dillerdeki uygulamalar desteklenir. Geri bildirimler Türkçe veya İngilizce verilir." },
  ]

  const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">{desc}</p>}
    </div>
  )

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/10 dark:to-zinc-950" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 text-sm text-blue-700 dark:text-blue-400 mb-6">
              <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
              <span>5.000+ uygulama başarıyla yayınlandı</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Google Play&apos;de Yayınla
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Testçi Bulma Derdine Son</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto">
              16 geliştiriciden oluşan pack&apos;lerle uygulamanı 16 günde test et, 
              Google Play yayın şartlarını karşıla ve yayına geç. Ücretsiz başla.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="text-base gap-2 w-full sm:w-auto shadow-lg shadow-blue-600/20">
                  Ücretsiz Başla <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="text-base w-full sm:w-auto border-zinc-300 dark:border-zinc-600">
                  Nasıl Çalışır?
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-subtle">
        <SectionTitle title="Nasıl Çalışır?" desc="4 adımda Google Play yayın şartlarını karşıla." />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mb-4 shadow-md">
                  <step.icon size={28} />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 h-7 w-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold ring-4 ring-white dark:ring-zinc-950">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Neden PremiumPeek?" desc="Google Play'in kapalı test şartını karşılamanın en kolay yolu." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-cardborder shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-10 w-10 text-blue-600 dark:text-blue-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Fiyatlandırma" desc="Bütçene ve zamanına uygun planı seç." />
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-cardborder">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Ücretsiz Topluluk</h3>
                <p className="text-4xl font-bold mb-6">₺0</p>
                <ul className="space-y-3 mb-8">
                  {["16 kişilik pack sistemi", "Günlük test takibi", "Kredi kazanma sistemi", "Geri bildirim ve yorumlar", "Liderlik tablosu"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup"><Button variant="outline" className="w-full">Ücretsiz Başla</Button></Link>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-4 py-1 rounded-full">En Popüler</div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Profesyonel Test</h3>
                <p className="text-4xl font-bold mb-1">₺499</p>
                <p className="text-sm text-muted mb-6">uygulama başına · tek seferlik</p>
                <ul className="space-y-3 mb-8">
                  {["25 profesyonel testçi", "6 saat içinde başlangıç", "16 gün tam test süreci", "Detaylı PDF rapor", "Google Play form yanıtları", "%100 para iadesi garantisi", "7/24 öncelikli destek"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/purchase"><Button className="w-full shadow-lg shadow-blue-600/20">Hemen Başla</Button></Link>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-sm text-muted">Kurumsal müşteriler için özel fiyatlandırma mevcut.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Geliştiriciler Ne Diyor?" desc="5.000+ geliştirici uygulamasını yayınladı." />
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-cardborder">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-yellow-500 text-yellow-500" : "text-zinc-300 dark:text-zinc-600"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted mb-4 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-400">{t.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted">{t.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 sm:py-28 bg-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Neden Biz?" desc="Diğer yöntemlerle karşılaştırma." />
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto text-sm">
              <thead>
                <tr className="border-b border-cardborder">
                  <th className="text-left py-4 px-4 font-medium"></th>
                  <th className="text-center py-4 px-4 font-medium text-muted">Arkadaşların</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-t-xl">PremiumPeek</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Başlama süresi", "Günler/Haftalar", "6 saat"],
                  ["Testçi sayısı", "? (güvenilmez)", "16-25 garanti"],
                  ["Test garantisi", "Yok", "3 gün kuralı"],
                  ["Rapor", "Yok", "Detaylı geri bildirim"],
                  ["Maliyet", "Zaman + iyilik borcu", "Ücretsiz veya ₺499"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-cardborder">
                    <td className="py-3 px-4 font-medium">{row[0]}</td>
                    <td className="text-center py-3 px-4 text-muted">{row[1]}</td>
                    <td className="text-center py-3 px-4 text-blue-600 dark:text-blue-500 font-medium bg-blue-50 dark:bg-blue-950/20">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle title="Sık Sorulan Sorular" />
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-cardborder bg-card [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-sm">{faq.q}</span>
                  <Chevron className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 text-muted" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/10 dark:to-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Google Play&apos;de Yayınlanmaya Hazır mısın?
          </h2>
          <p className="text-lg text-muted mb-8 max-w-xl mx-auto">
            5.000+ geliştiricinin kullandığı sistemi sen de dene. Ücretsiz başla.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base gap-2 shadow-lg shadow-blue-600/20">
              Hemen Başla <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function Chevron(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

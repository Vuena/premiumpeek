"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ChevronUp } from "lucide-react"

export default function BlogPage() {
  useEffect(() => { document.title = "Blog | PremiumPeek" }, [])
  const [expanded, setExpanded] = useState<number | null>(null)

  const posts = [
    {
      title: "Google Play Kapalı Test Şartı 2026",
      desc: "Google Play'in kapalı test şartı nedir, nasıl karşılanır? Adım adım rehber.",
      date: "Mayıs 2026",
      content: "Google Play, Kasım 2023'ten sonra açılan bireysel geliştirici hesapları için yeni uygulama yayınlarken kapalı test şartı getirmiştir. Bu şarta göre, uygulamanızı yayınlamadan önce 12 gerçek kullanıcı tarafından en az 14 ardışık gün boyunca test edilmesi gerekmektedir. PremiumPeek pack sistemi ile 18 gerçek geliştirici ile bu şartı 16 günde fazlasıyla karşılayabilirsiniz. Ayrıca profesyonel test hizmetimizle pack'e premium üye olarak katılabilirsiniz."
    },
    {
      title: "12 Testçi Bulma Rehberi",
      desc: "Uygulamanız için 12 gerçek test kullanıcısı bulmanın en kolay yolları.",
      date: "Nisan 2026",
      content: "Google Play'in kapalı test şartını karşılamak için 12 gerçek kullanıcı bulmak birçok geliştirici için en büyük engeldir. Arkadaş çevrenizden testçi toplamaya çalışmak genellikle yetersiz kalır ve kullanıcıların 14 gün boyunca düzenli test yapmasını sağlamak neredeyse imkansızdır. PremiumPeek topluluğunda 5.000'den fazla geliştirici birbirinin uygulamasını test etmektedir. Pack sistemimiz sayesinde her üye diğerlerinin uygulamalarını test etmeyi taahhüt eder ve aksatma halinde atılma kuralı ile herkesin aktif kalması sağlanır."
    },
    {
      title: "Pack Sistemi Nasıl Çalışır?",
      desc: "18 geliştiriciden oluşan pack'lerle test sürecinizi nasıl hızlandıracağınızı öğrenin.",
      date: "Mart 2026",
      content: "Pack sistemi, 18 geliştiricinin bir araya gelerek 16 gün boyunca birbirlerinin uygulamalarını test ettiği bir yapıdır. Her pack üyesi, her gün diğer 17 uygulamayı test eder ve geri bildirim sağlar. Aksatma halinde üyeler pack'ten atılır ve 1 ay boyunca yeni bir pack'e katılamaz. Bu sayede tüm üyelerin aktif kalması garanti altına alınır. Pack'iniz dolduğunda (18 üye) otomatik olarak başlar ve 16 günün sonunda Google Play şartını karşılamış olursunuz."
    },
    {
      title: "Google Play Reddi Sonrası Ne Yapmalı?",
      desc: "Uygulamanız Google Play'den red yediyse izlemeniz gereken adımlar.",
      date: "Şubat 2026",
      content: "Google Play'den red yemek can sıkıcı olsa da çoğu durumda çözümü basittir. Red nedenini dikkatlice okuyun: genellikle eksik test süresi, yetersiz testçi sayısı veya politika ihlali sebebiyledir. Test süreniz yetersizse PremiumPeek ile hızlıca 18 testçiye ulaşarak yeniden başvuru yapabilirsiniz. Google Play üretim erişiminiz reddedilirse, profesyonel test hizmetimizde ödediğiniz ücret koşulsuz iade edilir."
    },
    {
      title: "Ücretsiz vs Profesyonel Test: Hangisi Sana Uygun?",
      desc: "Bütçene ve zamanına göre doğru test yöntemini seç.",
      date: "Ocak 2026",
      content: "PremiumPeek'te iki seçenek sunuyoruz. Ücretsiz topluluk pack'leri: 18 kişilik gruplarda karşılıklı test yaparsınız, ücretsizdir ancak sıra beklemeniz gerekebilir. Profesyonel test hizmeti ($10 USDT): pack'e premium üye olarak katılır, 16 gün boyunca test edilirsiniz, üstelik Google Play reddinde koşulsuz iade garantisi. Acelesi olanlar için profesyonel, zamanı olanlar için ücretsiz pack idealdir."
    },
    {
      title: "Kapalı Test Sürecinde Sık Yapılan Hatalar",
      desc: "Google Play kapalı test başvurusunda yapılan en yaygın hatalar.",
      date: "Aralık 2025",
      content: "En sık yapılan hatalar: 1) Testçilerin uygulamayı yeterince uzun süre test etmemesi (14 gün şartı), 2) Testçilerin gerçek kullanıcı olmaması (bot veya sahte hesaplar), 3) Test süresince yetersiz aktivite (günlük açılış şartı), 4) Test süreci tamamlanmadan yayın başvurusu yapmak. PremiumPeek tüm bu hataları otomatik sistemle önler: günlük takip, aksatma halinde atılma kuralı ve gerçek geliştiricilerden oluşan topluluk."
    },
    {
      title: "Google Play Testçi Bulma Siteleri Karşılaştırması",
      desc: "En popüler test platformlarının karşılaştırmalı analizi.",
      date: "Kasım 2025",
      content: "Piyasada birçok test platformu bulunuyor. Bazıları ücretli testçi kiralama hizmeti sunarken, bazıları karşılıklı test sistemine dayanır. PremiumPeek'in farkı: tamamen ücretsiz pack sistemi, 18 gerçek geliştirici, aksatma halinde atılma kuralı ile aktif katılım garantisi, detaylı geri bildirim ve hata raporları. Profesyonel hizmetimizde ise $10 USDT ile pack'e premium üyelik ve Google Play reddinde iade garantisi sunuyoruz."
    },
    {
      title: "Uygulamanızı Google Play'e Yüklemeye Hazır mı?",
      desc: "Yayın öncesi kontrol listeniz ve son adımlar.",
      date: "Ekim 2025",
      content: "Google Play'e yayın başvurusu yapmadan önce şunları kontrol edin: Kapalı test süreciniz tamamlandı mı? En az 12 testçiniz var mı? Test süresi 14+ günü geçti mi? Uygulamanızın gizlilik politikası ve izinleri doğru mu? Tüm hatalar giderildi mi? PremiumPeek ile tüm bu şartları otomatik olarak karşılayabilir, yayın başvurunuzu güvenle yapabilirsiniz."
    },
    {
      title: "Google Play Politika Güncellemeleri 2026",
      desc: "2026 yılında Google Play'de değişen politikalar ve test şartları.",
      date: "Eylül 2025",
      content: "Google Play 2026 yılında da test politikalarını sıkılaştırmaya devam ediyor. Yeni hesaplar için kapalı test şartı devam ediyor ve Google test sürecini daha yakından takip ediyor. PremiumPeek olarak tüm politika değişikliklerini anlık takip ediyor ve sistemimizi buna göre güncelliyoruz. Topluluğumuz her zaman güncel şartlara uygun şekilde test sürecini yönetir."
    },
    {
      title: "Geliştirici Topluluklarının Gücü",
      desc: "Neden tek başınıza değil, bir toplulukla test etmelisiniz?",
      date: "Ağustos 2025",
      content: "Tek başınıza 12 testçi bulup 14 gün boyunca aktif tutmak neredeyse imkansızdır. Bir toplulukla çalışmanın avantajları: herkes birbirinin uygulamasını test eder, karşılıklı güven sistemi vardır, kurallar herkes için geçerlidir, test süreci şeffaf ve takip edilebilirdir. PremiumPeek topluluğunda 5.000'den fazla geliştirici aynı amaç için birbirine destek oluyor. Siz de aramıza katılın, Google Play'de yayınlama hedefinize birlikte ulaşalım."
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">Google Play test süreci hakkında ipuçları ve rehberler.</p>

      <div className="space-y-4">
        {posts.map((post, i) => (
          <Card key={post.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{post.desc}</p>
              {expanded === i ? (
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">{post.content}</p>
                  <button onClick={() => setExpanded(null)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline cursor-pointer">
                    Gizle <ChevronUp size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setExpanded(i)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline cursor-pointer">
                  Devamını Oku <ArrowRight size={14} />
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export interface BlogPost {
  slug: string
  title: string
  desc: string
  date: string
  content: string
}

import { blogPosts as enPosts } from "./blog-data-en"

const trPosts: BlogPost[] = [
  {
    slug: "google-play-kapali-test-sarti-2026",
    title: "Google Play Kapalı Test Şartı 2026",
    desc: "Google Play'in kapalı test şartı nedir, nasıl karşılanır? Adım adım rehber.",
    date: "Mayıs 2026",
    content: "Google Play, Kasım 2023'ten sonra açılan bireysel geliştirici hesapları için yeni uygulama yayınlarken kapalı test şartı getirmiştir. Bu şarta göre, uygulamanızı yayınlamadan önce 12 gerçek kullanıcı tarafından en az 14 ardışık gün boyunca test edilmesi gerekmektedir. PremiumPeek pack sistemi ile 18 gerçek geliştirici ile bu şartı 16 günde fazlasıyla karşılayabilirsiniz. Pack süreci 4 aşamadan oluşur: oluşma (forming) → yükleme (installing, 24 saat) → test (testing, 16 gün) → tamamlanma (completed). Premium üye olarak da pakete katılıp test edilme hakkı elde edebilirsiniz.",
  },
  {
    slug: "12-testci-bulma-rehberi",
    title: "12 Testçi Bulma Rehberi",
    desc: "Uygulamanız için 12 gerçek test kullanıcısı bulmanın en kolay yolları.",
    date: "Nisan 2026",
    content: "Google Play'in kapalı test şartını karşılamak için 12 gerçek kullanıcı bulmak birçok geliştirici için en büyük engeldir. Arkadaş çevrenizden testçi toplamaya çalışmak genellikle yetersiz kalır ve kullanıcıların 14 gün boyunca düzenli test yapmasını sağlamak neredeyse imkansızdır. PremiumPeek topluluğunda 5.000'den fazla geliştirici birbirinin uygulamasını test etmektedir. Pack sistemimiz sayesinde her üye diğerlerinin uygulamalarını test etmeyi taahhüt eder. 24 saatlik yükleme aşamasında kurulum ekran görüntüsü alınır, ardından 16 günlük test aşamasında her gün en az bir ekran görüntüsü yüklenerek aktif kalınır. Aksatma halinde atılma kuralı ile herkesin aktif kalması sağlanır.",
  },
  {
    slug: "pack-sistemi-nasil-calisir",
    title: "Pack Sistemi Nasıl Çalışır?",
    desc: "18 geliştiriciden oluşan pack'lerle test sürecinizi nasıl hızlandıracağınızı öğrenin.",
    date: "Mart 2026",
    content: "Pack sistemi 4 aşamadan oluşur: Oluşma (Forming) → Yükleme (Installing) → Test (Testing) → Tamamlanma (Completed). Oluşma aşamasında 18 üye toplanır. Dolduğunda otomatik olarak yükleme aşamasına geçer ve 24 saatlik geri sayım başlar. Bu sürede her üye uygulamaları yükleyip kurulum ekran görüntüsü alır. Ardından 16 günlük test aşaması başlar: her gün en az bir ekran görüntüsü yüklemek ve geri bildirim sağlamak gerekir. Aksatma halinde sistem otomatik olarak üyeyi pack'ten atar. Premium üyeler ($10 USDT) yalnızca test edilir, test yapmaz.",
  },
  {
    slug: "google-play-reddi-sonrasi-ne-yapmali",
    title: "Google Play Reddi Sonrası Ne Yapmalı?",
    desc: "Uygulamanız Google Play'den red yediyse izlemeniz gereken adımlar.",
    date: "Şubat 2026",
    content: "Google Play'den red yemek can sıkıcı olsa da çoğu durumda çözümü basittir. Red nedenini dikkatlice okuyun: genellikle eksik test süresi, yetersiz testçi sayısı veya politika ihlali sebebiyledir. Test süreniz yetersizse PremiumPeek ile hızlıca 18 testçiye ulaşarak yeniden başvuru yapabilirsiniz. Google Play üretim erişiminiz reddedilirse, profesyonel test hizmetimizde ödediğiniz ücret koşulsuz iade edilir.",
  },
  {
    slug: "ucretsiz-vs-profesyonel-test",
    title: "Ücretsiz vs Profesyonel Test: Hangisi Sana Uygun?",
    desc: "Bütçene ve zamanına göre doğru test yöntemini seç.",
    date: "Ocak 2026",
    content: "PremiumPeek'te iki seçenek sunuyoruz. Ücretsiz topluluk pack'leri: 18 kişilik gruplarda karşılıklı test yaparsınız, her gün ekran görüntüsü yükler ve geri bildirim verirsiniz. 4 aşamalı süreç (forming → installing → testing → completed) ile 16 günde tamamlanır. Profesyonel test hizmeti ($10 USDT): pack'e premium üye olarak katılır, yalnızca test edilirsiniz — test yapmanız gerekmez, üstelik Google Play reddinde koşulsuz iade garantisi. Acelesi olanlar için profesyonel, zamanı olanlar için ücretsiz pack idealdir.",
  },
  {
    slug: "kapali-test-surecinde-sik-yapilan-hatalar",
    title: "Kapalı Test Sürecinde Sık Yapılan Hatalar",
    desc: "Google Play kapalı test başvurusunda yapılan en yaygın hatalar.",
    date: "Aralık 2025",
    content: "En sık yapılan hatalar: 1) Testçilerin uygulamayı yeterince uzun süre test etmemesi (14 gün şartı), 2) Testçilerin gerçek kullanıcı olmaması (bot veya sahte hesaplar), 3) Test süresince yetersiz aktivite (günlük ekran görüntüsü yüklememe), 4) Testçilerin uygulamayı hiç yüklememiş olması, 5) Test süreci tamamlanmadan yayın başvurusu yapmak. PremiumPeek tüm bu hataları otomatik sistemle önler: 24 saatlik yükleme aşamasında kurulum kanıtı istenir, 16 günlük test sürecinde günlük ekran görüntüsü zorunludur, aksatma halinde atılma kuralı ve gerçek geliştiricilerden oluşan topluluk ile aktif katılım garanti edilir.",
  },
  {
    slug: "google-play-testci-bulma-siteleri",
    title: "Google Play Testçi Bulma Siteleri Karşılaştırması",
    desc: "En popüler test platformlarının karşılaştırmalı analizi.",
    date: "Kasım 2025",
    content: "Piyasada birçok test platformu bulunuyor. Bazıları ücretli testçi kiralama hizmeti sunarken, bazıları karşılıklı test sistemine dayanır. PremiumPeek'in farkı: tamamen ücretsiz pack sistemi, 18 gerçek geliştirici, 4 aşamalı otomatik süreç (forming → installing → testing → completed), günlük ekran görüntüsü ile aktif katılım garantisi, aksatma halinde atılma kuralı ve detaylı hata raporları. Profesyonel hizmetimizde ise $10 USDT ile pack'e premium üyelik ve Google Play reddinde iade garantisi sunuyoruz.",
  },
  {
    slug: "uygulamanizi-google-playe-yuklemeye-hazir-mi",
    title: "Uygulamanızı Google Play'e Yüklemeye Hazır mı?",
    desc: "Yayın öncesi kontrol listeniz ve son adımlar.",
    date: "Ekim 2025",
    content: "Google Play'e yayın başvurusu yapmadan önce şunları kontrol edin: Kapalı test süreciniz tamamlandı mı? Pack'iniz 'completed' statüsüne geçti mi? En az 12 testçiniz var mı? Test süresi 14+ günü geçti mi? Tüm testçiler ekran görüntüsü yükledi mi? Uygulamanızın gizlilik politikası ve izinleri doğru mu? PremiumPeek ile tüm bu şartları otomatik olarak karşılayabilir, yayın başvurunuzu güvenle yapabilirsiniz.",
  },
  {
    slug: "google-play-politika-guncellemeleri-2026",
    title: "Google Play Politika Güncellemeleri 2026",
    desc: "2026 yılında Google Play'de değişen politikalar ve test şartları.",
    date: "Eylül 2025",
    content: "Google Play 2026 yılında da test politikalarını sıkılaştırmaya devam ediyor. Yeni hesaplar için kapalı test şartı devam ediyor ve Google test sürecini daha yakından takip ediyor. PremiumPeek olarak tüm politika değişikliklerini anlık takip ediyor ve sistemimizi buna göre güncelliyoruz. Topluluğumuz her zaman güncel şartlara uygun şekilde test sürecini yönetir.",
  },
  {
    slug: "gelistirici-topluluklarinin-gucu",
    title: "Geliştirici Topluluklarının Gücü",
    desc: "Neden tek başınıza değil, bir toplulukla test etmelisiniz?",
    date: "Ağustos 2025",
    content: "Tek başınıza 12 testçi bulup 14 gün boyunca aktif tutmak neredeyse imkansızdır. Bir toplulukla çalışmanın avantajları: herkes birbirinin uygulamasını test eder, karşılıklı güven sistemi vardır, kurallar herkes için geçerlidir, test süreci 4 aşamalı otomatik sistemle şeffaf ve takip edilebilirdir. PremiumPeek topluluğunda 5.000'den fazla geliştirici aynı amaç için birbirine destek oluyor. Siz de aramıza katılın, Google Play'de yayınlama hedefinize birlikte ulaşalım.",
  },
]

export const blogPosts = trPosts

export function getBlogPosts(locale: string): BlogPost[] {
  if (locale === "en") return enPosts
  return trPosts
}

export function getBlogPost(slug: string, locale: string): BlogPost | undefined {
  const posts = getBlogPosts(locale)
  return posts.find((p) => p.slug === slug)
}

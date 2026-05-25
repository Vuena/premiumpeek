export const metadata = { title: "Para İadesi Politikası" }

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Para İadesi Garantisi</h1>
      <p className="text-muted text-sm mb-8">Son güncelleme: 25 Mayıs 2026</p>

      <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-6 mb-8">
        <p className="text-green-700 dark:text-green-400 font-medium">
          Google Play üretim erişim başvurun reddedilirse, ödediğin $10 USDT'yi koşulsuz iade ediyoruz.
        </p>
      </div>

      <div className="space-y-8 mb-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">İade Koşulları</h2>
          <ul className="space-y-3">
            {[
              "Hızlı Test hizmeti satın alan tüm kullanıcılar için geçerlidir.",
              "Google Play üretim erişim başvurusu reddedildikten sonra 30 gün içinde talep edilmelidir.",
              "Red sebebi, test süreciyle ilgili olmalıdır (teknik paket hataları kapsam dışıdır).",
              "İade, aynı USDT cüzdan adresine geri gönderilir. Ağ ücretleri iade tutarından düşülebilir.",
              "Her kullanıcı, her uygulama için bir kez iade hakkından yararlanabilir.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 text-xs font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">İade Süreci</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Red Bildirimi", desc: "Google Play Console'dan red bildirimini alın." },
              { step: "2", title: "Talep Oluştur", desc: "Red ekran görüntüsü ve sipariş bilginizle info@premiumpeek.com adresine e-posta gönderin." },
              { step: "3", title: "Onay ve İade", desc: "Ekibimiz talebinizi 24 saat içinde inceler. USDT iadeniz 1-3 iş günü içinde cüzdanınıza gönderilir." },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-sm text-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-6">
          <h2 className="font-semibold mb-2">Önemli Not</h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 leading-relaxed">
            %99.9 başarı oranımızla iade neredeyse hiç talep edilmez.
          </p>
        </section>
      </div>
    </div>
  )
}

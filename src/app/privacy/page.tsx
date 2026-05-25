export const metadata = { title: "Gizlilik Politikası" }

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Gizlilik Politikası</h1>
      <p className="text-muted text-sm mb-8">Son güncelleme: 25 Mayıs 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Verilerin Kullanım Amacı</h2>
          <p className="text-muted leading-relaxed mb-3">Topladığımız veriler yalnızca şu amaçlarla kullanılır:</p>
          <ul className="list-disc list-inside space-y-1 text-muted text-sm">
            <li>Hesap oluşturma ve yönetimi</li>
            <li>Pack yönetimi ve eşleştirme sistemi</li>
            <li>Kredi sistemi işlemleri</li>
            <li>Günlük test takibi ve hatırlatmalar</li>
            <li>Liderlik tablosu sıralaması</li>
            <li>E-posta bildirimleri (günlük hatırlatma, pack daveti, uyarı)</li>
            <li>Müşteri desteği ve iletişim</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Veri Paylaşımı ve Üçüncü Taraflar</h2>
          <p className="text-muted leading-relaxed mb-3">
            Kullanıcı verileriniz üçüncü taraflarla paylaşılmaz. Aşağıdaki durumlar istisnadır:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted text-sm">
            <li><strong>Firebase (Google):</strong> Altyapı ve veritabanı hizmetleri için.</li>
            <li><strong>Resend:</strong> E-posta gönderim hizmeti için.</li>
            <li><strong>Yasal zorunluluk:</strong> Kanunen yetkili mercilerin talebi durumunda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Çerezler (Cookies)</h2>
          <p className="text-muted leading-relaxed">
            Platformumuz yalnızca zorunlu teknik çerezleri kullanır: oturum yönetimi ve tema tercihi (koyu/açık). 
            Üçüncü taraf izleme çerezleri kullanılmaz. Çerezleri tarayıcı ayarlarından yönetebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Veri Saklama ve Silme</h2>
          <p className="text-muted leading-relaxed">
            Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı sildiğinizde tüm verileriniz 
            30 gün içinde kalıcı olarak silinir. Hesap silme talebi için info@premiumpeek.com adresine e-posta gönderebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Kullanıcı Hakları</h2>
          <p className="text-muted leading-relaxed mb-3">6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside space-y-1 text-muted text-sm">
            <li>Verilerinize erişim talep etme</li>
            <li>Yanlış veya eksik verilerin düzeltilmesini isteme</li>
            <li>Verilerinizin silinmesini talep etme ("unutulma hakkı")</li>
            <li>Verilerinizin işlenmesine itiraz etme</li>
            <li>Verilerinizin taşınabilirliğini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. İletişim</h2>
          <p className="text-muted leading-relaxed">
            Gizlilik politikamız hakkında sorularınız için: <a href="mailto:info@premiumpeek.com" className="text-blue-600 hover:underline">info@premiumpeek.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

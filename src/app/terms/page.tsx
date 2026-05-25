export const metadata = { title: "Kullanım Şartları" }

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Kullanım Şartları</h1>
      <p className="text-muted text-sm mb-8">Son güncelleme: 25 Mayıs 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Hesap ve Kayıt</h2>
          <p className="text-muted leading-relaxed">
            Hesap oluşturarak doğru, güncel ve eksiksiz bilgi sağlamayı kabul edersiniz. 
            Hesabınızın güvenliğinden ve şifrenizin gizliliğinden tamamen siz sorumlusunuz. 
            Hesabınızda gerçekleşen tüm işlemler sizin sorumluluğunuzdadır.
          </p>
          <p className="text-muted leading-relaxed mt-3">
            Birden fazla hesap açmak, sahte bilgi kullanmak veya başkasına ait bilgilerle kayıt olmak yasaktır. 
            Bu tür durumlarda hesabınız kalıcı olarak askıya alınabilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Pack ve Test Kuralları</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>Pack üyeleri, 16 gün boyunca her gün diğer üyelerin uygulamalarını test etmeyi taahhüt eder.</li>
            <li>3 gün üst üste test yapmayan üyeler, otomatik olarak pack'ten atılır.</li>
            <li>Atılan üyenin uygulaması pack'ten çıkarılır, diğer üyeler kaldıkları yerden devam eder.</li>
            <li>Bir pack en az 2 üye ile başlatılabilir.</li>
            <li>Pack sahibi, pack'i başlatma ve üye çıkarma yetkisine sahiptir.</li>
            <li>Her üye, aynı anda birden fazla aktif pack'te yer alabilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Kredi Sistemi</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>Krediler yalnızca platform içi kullanım içindir, nakte çevrilemez veya devredilemez.</li>
            <li>Her test edilen uygulama için +4🪙 kazanılır.</li>
            <li>Uygulama yayınlama maliyeti 60🪙'dir.</li>
            <li>Yeni kullanıcılara kayıt bonusu olarak 30🪙 hediye edilir.</li>
            <li>Kredi kötüye kullanımı (bot, sahte hesap, hile) tespit edilirse hesap kalıcı olarak askıya alınır.</li>
            <li>Platform yönetimi, gerekli gördüğü durumlarda kredi bakiyelerinde düzeltme yapma hakkını saklı tutar.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Kripto Ödeme ve Hızlı Test Hizmeti</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>Hızlı Test hizmeti $10 USDT (TRC-20) karşılığında 25 testçi ve 16 gün test sürecini kapsar.</li>
            <li>Ödeme, belirtilen USDT cüzdan adresine yapılır. TX Hash kaydı kullanıcı tarafından sağlanır.</li>
            <li>Ödeme onaylandıktan sonra 6 saat içinde testçiler atanır. Test süreci 16 gün sürer.</li>
            <li>TX Hash doğrulaması admin tarafından yapılır. Yanlış/geçersiz TX Hash durumunda sipariş iptal edilebilir.</li>
            <li>USDT iadeleri, aynı cüzdana geri gönderilir. İşlem ücretleri kullanıcıya aittir.</li>
            <li>Google Play üretim erişim başvurunuz reddedilirse ödediğiniz $10 USDT iade edilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Kullanıcı Davranışı</h2>
          <ul className="list-disc list-inside space-y-2 text-muted text-sm">
            <li>Diğer kullanıcılara saygılı ve profesyonel davranmak zorunludur.</li>
            <li>Hakaret, tehdit, taciz veya ayrımcılık içeren davranışlar kesinlikle yasaktır.</li>
            <li>Platform üzerinden spam, reklam veya izinsiz tanıtım yapılamaz.</li>
            <li>Yasaklı içerik (uyuşturucu, silah, kumar, yetişkin içeriği) barındıran uygulamalar kabul edilmez.</li>
            <li>Kurallara uymayan kullanıcılar uyarısız kalıcı olarak uzaklaştırılır.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Fikri Mülkiyet</h2>
          <p className="text-muted leading-relaxed">
            Platforma yüklediğiniz uygulama ve içeriklerin tüm hakları size aittir. 
            PremiumPeek, test sürecini yürütmek için gerekli olan ölçüde bu içeriklere erişim hakkına sahiptir. 
            Uygulamalarınız üçüncü taraflarla paylaşılmaz, yalnızca pack üyeleriniz test amacıyla erişebilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Sorumluluk Reddi</h2>
          <p className="text-muted leading-relaxed">
            PremiumPeek, Google Play yayın şartlarını karşılamanıza yardımcı olur ancak yayın onayını garanti etmez. 
            Google Play'in yayın politikaları değişebilir; bu değişikliklerden kaynaklanan durumlardan platform sorumlu tutulamaz. 
            Platform, beklenmedik teknik aksaklıklar, bakım çalışmaları veya mücbir sebepler durumunda hizmet kesintisi 
            yaşanabileceğini kabul edersiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Değişiklikler</h2>
          <p className="text-muted leading-relaxed">
            Bu kullanım şartları önceden bildirim yapılmaksızın değiştirilebilir. 
            Önemli değişiklikler e-posta yoluyla bildirilir. Şartların güncel haline 
            her zaman bu sayfadan erişebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}

export const metadata = { title: "Para İadesi Politikası" }

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Para İadesi Garantisi</h1>
      <p className="text-muted text-sm mb-8">Son güncelleme: 25 Mayıs 2026</p>

      <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-6 mb-8">
        <p className="text-green-700 dark:text-green-400 font-medium">
          PremiumPeek tamamen ücretsiz bir platformdur. Pack sistemi ve tüm test özellikleri herhangi bir ücret olmadan kullanılabilir.
        </p>
      </div>

      <div className="space-y-6 text-muted leading-relaxed">
        <p>
          PremiumPeek üzerinde yapılan tüm işlemler ücretsizdir. Kredi sistemi ile çalışan platformumuzda 
          herhangi bir ödeme alınmamaktadır.
        </p>
        <p>
          Gelecekte ücretli hizmetler eklenmesi durumunda, bu sayfa güncellenecek ve para iadesi şartları 
          açıkça belirtilecektir.
        </p>
      </div>
    </div>
  )
}

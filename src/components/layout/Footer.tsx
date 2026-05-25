import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-cardborder bg-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold">P</div>
              PremiumPeek
            </Link>
            <p className="text-sm text-muted max-w-xs sm:max-w-none">
              Geliştiricilerin Google Play yayın şartlarını kolayca karşılaması için kurulmuş test topluluğu.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Platform</h4>
            <div className="space-y-2">
              <Link href="/#how-it-works" className="block text-sm text-muted hover:text-foreground">Nasıl Çalışır</Link>
              <Link href="/#pricing" className="block text-sm text-muted hover:text-foreground">Fiyatlandırma</Link>
              <Link href="/#reviews" className="block text-sm text-muted hover:text-foreground">Yorumlar</Link>
              <Link href="/#faq" className="block text-sm text-muted hover:text-foreground">SSS</Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Şirket</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted hover:text-foreground">Hakkımızda</Link>
              <Link href="/app-rejected" className="block text-sm text-muted hover:text-foreground">Red mi Yedin?</Link>
              <Link href="/blog" className="block text-sm text-muted hover:text-foreground">Blog</Link>
              <Link href="/contact" className="block text-sm text-muted hover:text-foreground">İletişim</Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Yasal</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-muted hover:text-foreground">Gizlilik Politikası</Link>
              <Link href="/terms" className="block text-sm text-muted hover:text-foreground">Kullanım Şartları</Link>
              <Link href="/refund" className="block text-sm text-muted hover:text-foreground">İade Politikası</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cardborder flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">&copy; 2026 PremiumPeek. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

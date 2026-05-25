import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-cardborder bg-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="foot-logo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2563eb"/>
                    <stop offset="100%" stop-color="#7c3aed"/>
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="7" fill="url(#foot-logo)"/>
                <rect x="8" y="4" width="16" height="24" rx="3" stroke="white" strokeWidth="1.8" fill="none"/>
                <rect x="10.5" y="6" width="11" height="14" rx="1" fill="white" opacity="0.2"/>
                <rect x="14.5" y="21" width="3" height="1.5" rx="0.75" fill="white"/>
              </svg>
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

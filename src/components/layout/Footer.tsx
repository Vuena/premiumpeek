import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

export async function Footer() {
  const t = await getTranslations("Footer")

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
                    <stop offset="100%" stopColor="#7c3aed"/>
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
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">{t("platform")}</h4>
            <div className="space-y-2">
              <Link href="/#how-it-works" className="block text-sm text-muted hover:text-foreground">{t("howItWorks")}</Link>
              <Link href="/#pricing" className="block text-sm text-muted hover:text-foreground">{t("pricing")}</Link>
              <Link href="/#reviews" className="block text-sm text-muted hover:text-foreground">{t("reviews")}</Link>
              <Link href="/#faq" className="block text-sm text-muted hover:text-foreground">{t("faq")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">{t("company")}</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted hover:text-foreground">{t("about")}</Link>
              <Link href="/app-rejected" className="block text-sm text-muted hover:text-foreground">{t("appRejected")}</Link>
              <Link href="/blog" className="block text-sm text-muted hover:text-foreground">{t("blog")}</Link>
              <Link href="/contact" className="block text-sm text-muted hover:text-foreground">{t("contact")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">{t("legal")}</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-muted hover:text-foreground">{t("privacy")}</Link>
              <Link href="/terms" className="block text-sm text-muted hover:text-foreground">{t("terms")}</Link>
              <Link href="/refund" className="block text-sm text-muted hover:text-foreground">{t("refund")}</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cardborder flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

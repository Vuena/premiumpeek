"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun, ChevronDown, Globe } from "lucide-react"
import { useState, useEffect, useRef, memo } from "react"
import { useTheme } from "./ThemeProvider"
import { useTranslations, useLocale } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"

export const Navbar = memo(function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const t = useTranslations("Navbar")
  const locale = useLocale()
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])
  useEffect(() => { setOpen(false); setDropdown(false) }, [pathname])

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
  if (isAuthPage) return null

  const links = [
    { href: "/#how-it-works" as const, label: t("howItWorks") },
    { href: "/#pricing" as const, label: t("pricing") },
    { href: "/blog" as const, label: t("blog") },
    { href: "/#reviews" as const, label: t("reviews") },
    { href: "/#faq" as const, label: t("faq") },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-cardborder bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2 font-bold text-lg">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="nav-logo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="7" fill="url(#nav-logo)"/>
            <rect x="8" y="4" width="16" height="24" rx="3" stroke="white" strokeWidth="1.8" fill="none"/>
            <rect x="10.5" y="6" width="11" height="14" rx="1" fill="white" opacity="0.2"/>
            <rect x="14.5" y="21" width="3" height="1.5" rx="0.75" fill="white"/>
          </svg>
          PremiumPeek
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="hidden md:flex items-center gap-1.5 h-9 px-2 rounded-xl hover:bg-subtle transition-colors text-sm cursor-pointer"
              aria-label={t("language")}
            >
              <Globe size={16} />
              <span className="uppercase font-medium">{locale}</span>
              <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-cardborder bg-card shadow-lg py-1 z-50">
                {[["tr", "Türkçe"], ["en", "English"]].map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => {
                      if (code !== locale) {
                        router.replace(pathname, { locale: code })
                      }
                      setLangOpen(false)
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-3 min-h-11 text-sm hover:bg-subtle cursor-pointer ${code === locale ? "font-medium text-blue-600" : "text-muted"}`}
                  >
                    <span className="text-base font-semibold w-6 text-center">{code.toUpperCase()}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleTheme} aria-label={t("themeToggle")} className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl hover:bg-subtle transition-colors">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 h-11 px-3 rounded-xl hover:bg-subtle transition-colors cursor-pointer">
                <div className="h-6 w-6 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-white">
                  {user.displayName?.[0] || user.email?.[0] || "?"}
                </div>
                <span className="text-sm hidden sm:block">{user.displayName || user.email}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-cardborder bg-card shadow-lg py-1">
                  <Link href="/dashboard" onClick={() => setDropdown(false)} className="block px-4 py-3 min-h-11 text-sm hover:bg-subtle">{t("dashboard")}</Link>
                  <Link href="/dashboard/orders" onClick={() => setDropdown(false)} className="block px-4 py-3 min-h-11 text-sm hover:bg-subtle">{t("myOrders")}</Link>
                  <Link href="/dashboard/settings" onClick={() => setDropdown(false)} className="block px-4 py-3 min-h-11 text-sm hover:bg-subtle">{t("settings")}</Link>
                  {(user as any).role === "admin" && (
                    <Link href="/dashboard/admin" onClick={() => setDropdown(false)} className="block px-4 py-3 min-h-11 text-sm text-blue-600 hover:bg-subtle">{t("adminPanel")}</Link>
                  )}
                  <button onClick={async () => { if (!confirm(t("logoutConfirm"))) return; try { await logout() } catch {}; setDropdown(false) }} className="block w-full text-left px-4 py-3 min-h-11 text-sm text-red-600 hover:bg-subtle cursor-pointer">{t("logout")}</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">{t("login")}</Button>
            </Link>
          )}

          <button onClick={() => setOpen(!open)} aria-label={open ? t("menuClose") : t("menuOpen")} className="md:hidden h-11 w-11 flex items-center justify-center rounded-xl hover:bg-subtle cursor-pointer">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-cardborder px-4 py-4 space-y-3 bg-background">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block py-3 text-sm text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-muted cursor-pointer min-h-11">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? t("lightTheme") : t("darkTheme")}
          </button>
          <div className="pt-2 border-t border-cardborder mt-2">
            <p className="text-xs text-muted mb-2 px-1">{t("language")}</p>
            {[["tr", "Türkçe"], ["en", "English"]].map(([code, label]) => (
              <button
                key={code}
                onClick={() => {
                  if (code !== locale) router.replace(pathname, { locale: code })
                  setOpen(false)
                }}
                className={`flex items-center gap-2 w-full py-3 text-sm cursor-pointer min-h-11 ${code === locale ? "font-medium text-blue-600" : "text-muted"}`}
              >
                <span className="text-base font-semibold w-6 text-center">{code.toUpperCase()}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
})

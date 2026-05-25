"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useTheme } from "./ThemeProvider"
import { usePathname, useRouter } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const goHome = useCallback((e: React.MouseEvent) => { e.preventDefault(); router.push("/"); window.scrollTo(0, 0) }, [router])

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")
  if (isAuthPage) return null

  const links = [
    { href: "/#how-it-works", label: "Nasıl Çalışır" },
    { href: "/#pricing", label: "Fiyatlandırma" },
    { href: "/blog", label: "Blog" },
    { href: "/#reviews", label: "Yorumlar" },
    { href: "/#faq", label: "SSS" },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-cardborder bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" onClick={goHome} className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold">P</div>
          PremiumPeek
        </a>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl hover:bg-subtle transition-colors cursor-pointer">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-subtle transition-colors cursor-pointer">
                <div className="h-6 w-6 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-medium text-white">
                  {user.displayName?.[0] || user.email?.[0] || "?"}
                </div>
                <span className="text-sm hidden sm:block">{user.displayName || user.email}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-cardborder bg-card shadow-lg py-1">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-subtle" onClick={() => setDropdown(false)}>Panel</Link>
                  <Link href="/dashboard/orders" className="block px-4 py-2 text-sm hover:bg-subtle" onClick={() => setDropdown(false)}>Siparişlerim</Link>
                  <button onClick={() => { logout(); setDropdown(false) }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-subtle cursor-pointer">Çıkış Yap</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Giriş Yap</Button>
            </Link>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-subtle cursor-pointer">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-cardborder px-4 py-4 space-y-3 bg-background">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block text-sm text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
          </button>
        </div>
      )}
    </nav>
  )
}

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PremiumPeek.com - Google Play Test Topluluğu

## Proje Yapısı
```
src/
  app/                    # Next.js App Router sayfaları
    page.tsx              # Landing page
    layout.tsx            # Root layout (Navbar + Footer + Auth/Theme)
    login/page.tsx        # Giriş sayfası
    signup/page.tsx       # Kayıt sayfası
    dashboard/page.tsx    # Kullanıcı paneli
  components/
    layout/               # Navbar, Footer, ThemeProvider
    ui/                   # Button, Card, Input (shadcn tarzı)
  context/
    AuthContext.tsx        # Firebase Auth context provider
  lib/
    firebase.ts           # Firebase client init (env config)
    utils.ts              # cn() utility (clsx + tailwind-merge)
```

## Önemli Kurallar
- Tüm client component'lerde "use client" kullan
- Firebase env değişkenleri .env.local'den okunur
- Auth olmayan sayfalar static generate edilebilir
- Dashboard sayfası `export const dynamic = "force-dynamic"` içerir

## Firebase Kurulumu
1. Firebase Console'da proje oluştur
2. Authentication > Sign-in method > Google + Email/Password aktifleştir
3. Firestore Database oluştur
4. .env.local dosyasını doldur

## Build & Run
```bash
npm run dev      # Development
npm run build    # Production build
npm run start    # Production serve
```

## Yapılacaklar
- [x] Week 1: Proje iskeleti, Auth, Layout
- [x] Week 2: Pack sistemi, Kredi sistemi, Günlük test akışı
- [x] Week 3: Admin panel, Bildirimler, Gamifikasyon
- [x] Week 4: Test, Deploy, SEO
- [x] Phase 2: Ücretli hizmet (Stripe)

## Tüm Sayfalar
| Rota | Açıklama |
|---|---|
| `/` | Landing page |
| `/login` | Giriş |
| `/signup` | Kayıt |
| `/dashboard` | Ana panel |
| `/dashboard/packs` | Pack listesi |
| `/dashboard/packs/new` | Pack oluştur |
| `/dashboard/packs/join` | Kodla katıl |
| `/dashboard/packs/[id]` | Pack detay |
| `/dashboard/apps` | Uygulamalarım |
| `/dashboard/apps/new` | Uygulama yükle |
| `/dashboard/testing` | Günlük testler |
| `/dashboard/credits` | Kredi geçmişi |
| `/dashboard/settings` | Ayarlar |
| `/dashboard/orders` | Siparişlerim |
| `/dashboard/orders/[id]` | Sipariş detay |
| `/dashboard/admin` | Admin paneli |
| `/dashboard/admin/users` | Admin - Kullanıcılar |
| `/dashboard/admin/packs` | Admin - Pack'ler |
| `/dashboard/admin/apps` | Admin - Uygulamalar |
| `/dashboard/admin/orders` | Admin - Siparişler |
| `/leaderboard` | Liderlik tablosu |
| `/purchase` | Profesyonel test satın alma |
| `/payment/success` | Ödeme başarılı |
| `/payment/cancel` | Ödeme iptal |
| `/api/email` | E-posta API (POST) |
| `/api/checkout` | Stripe checkout (POST) |
| `/api/webhook` | Stripe webhook (POST) |

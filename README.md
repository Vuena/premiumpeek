# Testers.In - Google Play Test Topluluğu

Geliştiricilerin Google Play yayın şartlarını (12 testçi, 14 gün) kolayca karşılaması için kurulmuş platform.

## 🚀 Hızlı Başlangıç

### 1. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com)'a git
2. **Yeni proje** oluştur
3. **Authentication** > **Sign-in method**:
   - Google (ENABLE)
   - Email/Password (ENABLE)
4. **Firestore Database** > **Create database** (test mode ile başlat)
5. **Storage** > **Get started** (test mode ile başlat)

### 2. .env.local Dosyasını Doldur

```bash
# Firebase Config (Proje ayarları > Web uygulaması > Firebase SDK snippet)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# Resend (opsiyonel - e-posta bildirimleri için)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@testersin.com
```

### 3. Çalıştır

```bash
npm install
npm run dev     # localhost:3000
```

### 4. Firestore Security Rules

`firestore.rules` dosyasını Firebase Console > Firestore > Rules'a yapıştır.

### 5. Admin Hesabı

İlk kullanıcını admin yapmak için Firestore Console'dan:
```
/users/{uid} → role: "admin" (ekle)
```

## 📁 Proje Yapısı

```
src/
  app/                    # Sayfalar (Next.js App Router)
  components/             # UI + Layout bileşenleri
  context/                # Auth context
  lib/                    # Firebase, Firestore, Email servisleri
```

## 📦 Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Development sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucu |
| `npm run lint` | Kod kalite kontrolü |

## 🧱 Teknoloji

- **Next.js 16** (App Router)
- **Firebase** (Auth, Firestore, Storage)
- **Tailwind CSS** (Stil)
- **Resend** (E-posta)
- **Stripe** (Ödeme - Phase 2)

## 📄 Lisans

Private - Tüm hakları saklıdır.

# Vercel Deployment Guide - QR Menu System

## ✅ MongoDB Geçişi Tamamlandı!

Sistem artık Vercel'e deploy edilmeye hazır. JSON dosyalardan MongoDB'ye geçiş yapıldı.

## 📋 Deployment Adımları

### 1. Vercel Hesabı Oluştur
- https://vercel.com adresine git
- GitHub hesabınla giriş yap

### 2. Projeyi GitHub'a Pushla
```bash
git add .
git commit -m "MongoDB migration completed for Vercel deployment"
git push origin main
```

### 3. Vercel'de Projeyi İçe Aktar
1. Vercel dashboard'da "Add New Project" tıkla
2. GitHub repository'ni seç
3. Framework Preset: **Next.js** (otomatik seçilir)
4. Root Directory: `./`

### 4. Environment Variables Ayarla
Vercel'de **Environment Variables** bölümüne ekle:

```env
DATABASE_URL="your_mongodb_connection_string"
NEXTAUTH_SECRET="your_nextauth_secret"
FIREBASE_API_KEY="your_firebase_api_key"
FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
FIREBASE_APP_ID="your_firebase_app_id"
```

**Önemli:** MongoDB connection string'inizde IP whitelist'e `0.0.0.0/0` ekleyin (Vercel dynamic IP)

### 5. Build Settings
Vercel otomatik olarak ayarlayacak:
- Build Command: `npm run build` veya `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 6. Deploy
"Deploy" butonuna bas. İlk deploy 2-3 dakika sürer.

## 🔧 Deploy Sonrası

### URL Güncelleme
Deploy edildikten sonra Vercel URL'ini alıp (örn: `your-project.vercel.app`):

1. `src/lib/url.ts` dosyasını güncelle:
```typescript
export const BASE_URL = 'https://your-project.vercel.app';
```

2. Commit ve push:
```bash
git add src/lib/url.ts
git commit -m "Update base URL for production"
git push
```

Vercel otomatik olarak yeniden deploy eder.

### Domain Bağlama (Opsiyonel)
1. Vercel dashboard → Settings → Domains
2. Kendi domain'inizi ekleyin
3. DNS ayarlarını yapın (Vercel otomatik talimat verir)

## 📊 MongoDB Atlas Ayarları

### Network Access
1. MongoDB Atlas → Network Access
2. "Add IP Address" tıkla
3. "Allow Access from Anywhere" seç (`0.0.0.0/0`)
   - Vercel serverless, dynamic IP kullanır

### Database User
- Read and write yetkisi olan kullanıcı olduğundan emin ol

## 🚀 Test Etme

Deploy sonrası:
1. `https://your-project.vercel.app` adresi aç
2. Admin panel: `/auth/login`
3. Müşteri arayüzü: `/table-selection`
4. QR kodları test et

## 🔄 Otomatik Deployment

Artık `main` branch'e her push:
- Otomatik build olur
- Otomatik deploy edilir
- ~30 saniyede canlıya alınır

## ⚙️ Performans Optimizasyonu

### Prisma Connection Pooling
Vercel Edge fonksiyonları için Prisma connection pooling kullanın:

```typescript
// Tek bir global instance
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Prisma Accelerate (Opsiyonel, Ücretli)
Daha hızlı DB bağlantıları için: https://pris.ly/cli/accelerate

## 🐛 Troubleshooting

### Build Error: Prisma Client Not Generated
```bash
# package.json'a ekle:
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Error
- MongoDB Atlas IP whitelist'i kontrol et
- `DATABASE_URL` environment variable'ı doğru mu?

### 404 Errors
- Vercel build log'larını kontrol et
- `next.config.mjs` redirect ayarları

## 📈 Monitoring

Vercel Dashboard'da:
- Real-time analytics
- Error tracking
- Performance metrics

## 💰 Maliyet

**Vercel Hobby Plan (Ücretsiz):**
- 100 GB bandwidth
- Unlimited websites
- Automatic HTTPS
- Edge Network

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared RAM
- Yeterli orta ölçekli restoranlar için

---

## ✨ Tamamlandı!

Sisteminiz artık production-ready ve Vercel'e deploy edilmeye hazır. Sorularınız için: support@vercel.com

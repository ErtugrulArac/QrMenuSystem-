# QR Menu Admin Panel - Başlangıç Rehberi

## 🎯 Sistem Nedir?

Bu bir **modern QR restaurant menü sistemi** ile entegre **admin paneldir**. Restorandaki masalardan müşteriler QR kod taraması ile menüyü görebilir, siparişverirken admin siparişleri yönetir.

---

## 🚀 Hızlı Başlangıç

### 1️⃣ Admin Paneline Gir
```
URL:    http://localhost:3005/auth/login
Email:  admin@qrmenu.com
Şifre:  admin123
```

### 2️⃣ Kategoriler Ekle
```
Dashboard → Kategoriler (Kırmızı kart)
Türkçe adı: "Atıştırmalar"
İngilizce:  "Appetizers"  
Resim URL:  https://images.unsplash.com/...
```

### 3️⃣ Ürünler Ekle
```
Dashboard → Ürünler (Yeşil kart)
Adı:       "Çiçek Pastırma"
İngilizce: "Flower Pastirma"
Kategori:  "Atıştırmalar" (seç)
Fiyat:     45.50 (₺)
Resim:     https://...
```

### 4️⃣ Masaları Ayarla
```
Dashboard → Masalar (Mavi kart)
Kod: "M1"
Kod: "M2"
Kod: "M3"
```

### 5️⃣ Siparişleri Yönet
```
Dashboard → Siparişler (Turuncu kart)
Bekleyen siparişleri gör
Onayla veya Reddet
```

---

## 📊 Admin Panel Özeti

### Dashboard (Ana Sayfası)
```
┌────────────────────────────────────────┐
│    Masa Yönetimi   │   Siparişler      │
│    Masaları ekle   │   Siparişleri yönet
├────────────────────────────────────────┤
│    Kategoriler     │   Ürünler         │
│    Kategori yönet  │   Ürün yönet      │
└────────────────────────────────────────┘
```

### Sayfalar
| Sayfa | URL | Renk | Fonksiyon |
|-------|-----|------|-----------|
| Kategoriler | `/dashboard/category` | 🔴 Kırmızı | Kategori CRUD |
| Ürünler | `/dashboard/product` | 🟢 Yeşil | Ürün CRUD |
| Masalar | `/dashboard/tables` | 🔵 Mavi | Masa CRUD |
| Siparişler | `/dashboard/orders` | 🟠 Turuncu | Sipariş yönetimi |

---

## 🔑 İşlevler

### ✅ Kategoriler (Kırmızı)
- Yeni kategori ekle
- Kategoriyi düzenle
- Kategoriyi sil
- Resim önizlemesi
- Türkçe + İngilizce ad

### ✅ Ürünler (Yeşil)
- Yeni ürün ekle
- Ürünü düzenle
- Ürünü sil
- Kategori seçimi
- Fiyat yönetimi
- Açıklamalar (TR + EN)

### ✅ Masalar (Mavi)
- Masa ekle (M1, M2, vb.)
- Durum değiştir (Açık/Kapalı)
- Masayı sil
- Hesap göster

### ✅ Siparişler (Turuncu)
- Siparişleri görüntüle
- Filtrele (Tümü, Beklemede, Onaylandı, Reddedildi)
- Onayla
- Reddet
- Detayları göster

---

## 🛠️ Teknik Bilgiler

```
Frontend:       Next.js 14.1.0 + TypeScript + Tailwind CSS
Backend:        Next.js API Routes
Veritabanı:     MongoDB + Prisma ORM
Authentication: NextAuth.js
Stil:           Tailwind CSS + React Icons
```

---

## 📁 Dosya Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── categories/
│   │   │   ├── route.ts          (GET, POST)
│   │   │   └── [id]/route.ts     (PUT, DELETE)
│   │   └── products/
│   │       ├── route.ts          (GET, POST)
│   │       └── [id]/route.ts     (PUT, DELETE)
│   └── (admin)/
│       └── dashboard/
│           ├── page.tsx          (Ana Dashboard)
│           ├── category/         (Kategoriler)
│           ├── product/          (Ürünler)
│           ├── tables/           (Masalar)
│           └── orders/           (Siparişler)
└── components/
    └── admin/
        ├── categoryManager/      (Kategori Bileşeni)
        └── productManager/       (Ürün Bileşeni)
```

---

## 🎨 Arayüz Tasarımı

- **Desktop Optimized:** Admin paneli sadece masaüstü için optimize
- **Mobile Responsive:** Müşteri menüsü mobil-uyumlu
- **Renk Kodlaması:** Her bölüm kendi rengiyle
- **Modern UI:** Modal formlar, grid layout, hover efektleri

---

## 📝 Veritabanı Modelleri

### Kategoriler
```
{
  id: String,
  name: String,        // "Atıştırmalar"
  ename: String,       // "Appetizers"
  image: String,       // Resim URL'si
  products: [...]      // Bağlantılı ürünler
}
```

### Ürünler
```
{
  id: String,
  name: String,        // "Çiçek Pastırma"
  ename: String,       // "Flower Pastirma"
  categoryId: String,  // Kategori referansı
  image: String,       // Resim URL'si
  price: Number,       // 4550 (kuruş cinsinden)
  description: String, // Açıklama (TR)
  edescription: String // Açıklama (EN)
}
```

---

## 🔐 Güvenlik

- ✅ NextAuth.js ile kimlik doğrulama
- ✅ bcryptjs ile şifre hashleme
- ✅ Protected routes (yalnızca giriş yapan admin)
- ✅ Session yönetimi

---

## 🌐 API Endpoints

### Kategoriler
```
GET    /api/categories          → Tümünü getir
POST   /api/categories          → Yeni ekle
PUT    /api/categories/[id]     → Güncelle
DELETE /api/categories/[id]     → Sil
```

### Ürünler
```
GET    /api/products            → Tümünü getir
POST   /api/products            → Yeni ekle
PUT    /api/products/[id]       → Güncelle
DELETE /api/products/[id]       → Sil
```

---

## 💡 İpuçları

1. **Resim URL'leri:** Unsplash, Pexels vb. sitelerden alabilirsiniz
2. **Fiyatlar:** Tam sayı olarak girin (örn: 45.50 ₺ = 4550 sent)
3. **Açıklamalar:** Türkçe ve İngilizce eklemek önerilir
4. **Masalar:** Restorandaki fiziksel masalara göre kodlandırın
5. **Siparişler:** Onayladığınız siparişler müşteriye iletilir

---

## 🐛 Sorun Giderme

| Problem | Çözüm |
|---------|--------|
| "Giriş yapılamıyor" | Email ve şifre doğru mu kontrol et |
| "Kategoriler görmüyorum" | Tarayıcıyı yenile (F5) |
| "Resim yüklenmedi" | URL'nin tam ve doğru olduğunu kontrol et |
| "Ürün ekleme hatası" | Tüm zorunlu alanları doldur |
| "Port kullanımda" | Farklı port kullan veya eski işlemi kapat |

---

## 📞 Destek

- Admin: `admin@qrmenu.com`
- Şifre: `admin123`
- Port: `3005`
- Veritabanı: MongoDB

---

**Sistem Hazır! 🎉**

Admin panelini kullanmaya başlayabilirsiniz. Sorularınız varsa rehberi kontrol edin.

*Son Güncelleme: 14 Aralık 2025*

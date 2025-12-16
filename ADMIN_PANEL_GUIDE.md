# Admin Panel - Tam Rehber

## 🎯 Admin Paneline Erişim

**URL:** `http://localhost:3005/auth/login`

**Giriş Bilgileri:**
- Email: `admin@qrmenu.com`
- Şifre: `admin123`

---

## 📊 Admin Paneli Özellikleri

### 1. **Kategoriler Yönetimi** (`/dashboard/category`)

Menü kategorilerini ekle, düzenle ve sil.

**Özellikler:**
- ✅ Yeni kategori ekle (Türkçe adı, İngilizce adı, resim URL'si)
- ✅ Kategoriyi düzenle
- ✅ Kategoriyi sil
- ✅ Resim önizlemesi
- ✅ Grid görünüş (4 kolon)
- ✅ Toplam kategori sayısı gösterimi

**Form Alanları:**
- Kategori Adı (TR) - *Zorunlu*
- Kategori Adı (EN) - *Zorunlu*
- Resim URL - *Zorunlu*

---

### 2. **Ürünler Yönetimi** (`/dashboard/product`)

Menü ürünlerini ekle, düzenle ve sil.

**Özellikler:**
- ✅ Yeni ürün ekle (adı, İngilizce adı, kategori, fiyat, resim, açıklama)
- ✅ Ürünü düzenle
- ✅ Ürünü sil
- ✅ Kategori seçimi
- ✅ Resim önizlemesi
- ✅ Türkçe ve İngilizce açıklamalar
- ✅ Liste görünüş (kart formatı)
- ✅ Toplam ürün sayısı gösterimi

**Form Alanları:**
- Ürün Adı (TR) - *Zorunlu*
- Ürün Adı (EN) - *Zorunlu*
- Kategori - *Zorunlu*
- Fiyat (₺) - *Zorunlu*
- Resim URL - *Zorunlu*
- Açıklama (TR) - İsteğe bağlı
- Açıklama (EN) - İsteğe bağlı

---

### 3. **Masa Yönetimi** (`/dashboard/tables`)

Restoran masalarını yönet.

**Özellikler:**
- ✅ Yeni masa ekle (M1, M2, M3, vb.)
- ✅ Masa durumunu değiştir (Açık/Kapalı)
- ✅ Masayı sil
- ✅ Açık hesap gösterimi
- ✅ Grid görünüş (4 kolon)
- ✅ Masa sayısı gösterimi

**Durum İndikatörleri:**
- 🟢 **Açık** - Müşteri sipariş verebilir
- 🔴 **Kapalı** - Masa kullanımda değil

---

### 4. **Siparişler Yönetimi** (`/dashboard/orders`)

Müşteri siparişlerini onayla veya reddet.

**Özellikler:**
- ✅ Filtreleme (Tümü, Beklemede, Onaylandı, Reddedildi)
- ✅ Siparişi onayla
- ✅ Siparişi reddet
- ✅ Ürün listesi gösterimi
- ✅ Toplam, KDV ve alt toplam hesaplaması
- ✅ Bekleyen siparişler için bildirim rozeti
- ✅ Durum gösterimi

**Sipariş Durumları:**
- 🟡 **Beklemede** - Onay bekleniyor
- 🟢 **Onaylandı** - Mutfağa gönderildi
- 🔴 **Reddedildi** - Müşteriye bildirildi

---

## 🎨 Admin Paneli Tasarımı

### Renk Kodlaması
- **Mavi** (Masalar): `#3b82f6`
- **Turuncu** (Siparişler): `#f97316`
- **Kırmızı** (Kategoriler): `#ef4444`
- **Yeşil** (Ürünler): `#22c55e`

### Düzen
- **Desktop Optimized**: Tüm sayfalar masaüstü için optimize edilmiş
- **Responsive Değil**: Admin paneli mobil cihazlarda optimize edilmemiş
- **Grid Sistemi**: Tailwind CSS grid kullanımı
  - Dashboard: 2 kolon
  - Kategoriler: 4 kolon
  - Ürünler: List görünüş
  - Masalar: 4 kolon
  - Siparişler: Full genişlik

---

## 🔧 API Endpoints

### Kategoriler
- `GET /api/categories` - Tüm kategorileri getir
- `POST /api/categories` - Yeni kategori ekle
- `PUT /api/categories/[id]` - Kategoriyi güncelle
- `DELETE /api/categories/[id]` - Kategoriyi sil

### Ürünler
- `GET /api/products` - Tüm ürünleri getir
- `POST /api/products` - Yeni ürün ekle
- `PUT /api/products/[id]` - Ürünü güncelle
- `DELETE /api/products/[id]` - Ürünü sil

---

## 📱 Müşteri Menüsü

**URL:** `http://localhost:3005/`

- Responsive tasarım (mobil-first)
- Kaydırılabilir kategori bölümü
- Ürün detayları ve fiyatlar
- Siparişi sepete ekle

---

## 🚀 İlk Başlangıç İçin

1. **Kategorileri ekle:**
   - Başlangıç kategorileri oluştur (Atıştırmalar, Ana Yemekler, Tatlılar, İçecekler vb.)

2. **Ürün ekle:**
   - Her kategori için örnekler ekle
   - Resim URL'lerini ayarla
   - Açıklamalar yaz

3. **Masaları ayarla:**
   - Restorandaki masalar için kodlar oluştur

4. **Test et:**
   - Siparişleri test et
   - Filtrelemeyi kontrol et

---

## 🔐 Güvenlik Bilgileri

- **Şifreleme**: bcryptjs (10 salt rounds)
- **Authentication**: NextAuth.js Credentials Provider
- **Veritabanı**: MongoDB + Prisma ORM

---

## 📝 Notlar

- Tüm veriler gerçek veritabanında saklanır
- Admin paneli sadece giriş yapmış adminler için erişilebilir
- Müşteri menüsü herkese açık
- Kategori/Ürün değişiklikleri anında müşteri menüsünde görülür

---

**Son Güncelleme:** 14 Aralık 2025

# Turkish CRM - Sanal Ofis & Coworking CRM Sistemi

Türkiye'de faaliyet gösteren sanal ofis, hazır ofis ve coworking alanları için geliştirilmiş modern, tam özellikli CRM web uygulaması.

## 🚀 Özellikler

### 📊 Dashboard
- Haftalık özet raporları
- Yeni lead sayısı takibi
- AI mesaj istatistikleri
- Kapanan satış rakamları
- Toplanan ödeme tutarları
- Interaktif grafikler ve metrikler

### 👥 Müşteri Yönetimi
- Kapsamlı müşteri veritabanı
- Lead kaynak takibi
- Şirket ve kişisel bilgi yönetimi
- Gelişmiş arama ve filtreleme
- Müşteri detay sayfaları

### 🔄 Satış Pipeline
- Kanban tarzı görüntüleme
- Drag & drop deal yönetimi
- Otomatik durumu güncelleme
- E-posta takip durumu
- Kazanım oranları analizi

### 📄 Sözleşme Yönetimi
- Hizmet tipine göre sözleşmeler
- Ödeme periyodu takibi
- Sona erme uyarıları
- Aktif/pasif durum yönetimi

### 💳 Ödeme & Tahsilat
- Vade takibi sistemi
- Ödeme durumu yönetimi
- Otomatik hatırlatma sistemi
- Vadesi geçmiş ödeme uyarıları
- Ödeme geçmişi raporları

### 💬 Etkileşim Logları
- AI WhatsApp bot konuşmaları
- Müşteri iletişim geçmişi
- Platform bazlı görüntüleme
- Konuşma zaman çizelgesi

### ⚙️ Operasyon Detayları
- WiFi bilgileri yönetimi
- Kapı kodu sistemı
- Kargo tercihleri
- Özel notlar ve talimatlar

### 🤖 Otomasyon Durumu
- n8n workflow takibi
- E-posta otomasyon durumu
- Ödeme hatırlatma sistemı
- Sistem performans metrikleri

### 🛡️ Güvenlik & Yetkilendirme
- Supabase Auth entegrasyonu
- Rol bazlı erişim kontrolü (Admin, Sales, Finance, Operations)
- Error boundary ve hata yönetimi
- Güvenli veri transferi

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern CSS framework
- **shadcn/ui** - UI component library
- **Recharts** - Data visualization
- **TanStack Query** - Server state management
- **react-beautiful-dnd** - Drag & drop functionality

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security

### Otomasyon
- **n8n** - Workflow automation (harici)
- WhatsApp Business API
- SMTP Email server
- Webhook entegrasyonları

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı
- Modern web tarayıcı

## 🚀 Kurulum

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd turkish-crm
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Environment Variables
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Database Setup

Aşağıdaki SQL komutlarını Supabase SQL Editor'da çalıştırın:

```sql
-- Müşteriler tablosu
CREATE TABLE musteriler (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ad_soyad TEXT NOT NULL,
    telefon TEXT UNIQUE,
    email TEXT,
    sirket_adi TEXT,
    sektor TEXT,
    kaynak TEXT DEFAULT 'Web',
    dogum_tarihi DATE,
    notlar TEXT,
    whatsapp_raw_id TEXT
);

-- Satış takip tablosu
CREATE TABLE satis_takip (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    musteri_id BIGINT NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ilgilenilen_hizmet TEXT,
    talep_tarihi DATE DEFAULT CURRENT_DATE,
    satis_durumu TEXT DEFAULT 'Görüşülüyor' CHECK (satis_durumu IN ('Yeni Lead', 'Görüşülüyor', 'Teklif Atıldı', 'Kazanıldı', 'Kaybedildi', 'Cevap Yok')),
    mail_1_durumu TEXT DEFAULT 'Bekliyor',
    mail_1_tarihi TIMESTAMPTZ,
    mail_2_durumu TEXT DEFAULT 'Bekliyor', 
    mail_2_tarihi TIMESTAMPTZ,
    kazanilma_tarihi DATE
);

-- Sözleşmeler tablosu
CREATE TABLE sozlesmeler (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    musteri_id BIGINT NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    hizmet_tipi TEXT,
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    sozlesme_bedeli NUMERIC(12,2),
    odeme_periyodu TEXT CHECK (odeme_periyodu IN ('Aylık', '3 Aylık', '6 Aylık', 'Yıllık')),
    aktif_mi BOOLEAN DEFAULT TRUE
);

-- Ödemeler tablosu
CREATE TABLE odemeler (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    musteri_id BIGINT NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
    sozlesme_id BIGINT REFERENCES sozlesmeler(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tutar NUMERIC(12,2),
    vade_tarihi DATE,
    durum TEXT DEFAULT 'Ödenmedi' CHECK (durum IN ('Ödenmedi', 'Ödendi', 'Kısmi', 'İptal', 'Gecikmiş')),
    hatirlatma_3gun_gitti BOOLEAN DEFAULT FALSE,
    hatirlatma_bugun_gitti BOOLEAN DEFAULT FALSE,
    hatirlatma_7gun_gitti BOOLEAN DEFAULT FALSE,
    aciklama TEXT
);

-- Etkileşimler tablosu
CREATE TABLE etkilesimler (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    musteri_id BIGINT NOT NULL REFERENCES musteriler(id) ON DELETE CASCADE,
    gonderen TEXT,
    mesaj_icerigi TEXT,
    ozet_konu TEXT,
    platform TEXT DEFAULT 'whatsapp',
    session_id TEXT
);

-- Operasyon detayları tablosu
CREATE TABLE operasyon_detaylari (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    musteri_id BIGINT NOT NULL UNIQUE REFERENCES musteriler(id) ON DELETE CASCADE,
    wifi_adi TEXT,
    wifi_sifresi TEXT,
    kapi_sifresi TEXT,
    kargo_tercihi TEXT,
    ozel_notlar TEXT
);

-- Haftalık özet rapor view'ı
CREATE VIEW haftalik_ozet_rapor AS
SELECT 
    (SELECT COUNT(*) FROM musteriler WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS yeni_lead_sayisi,
    (SELECT COUNT(*) FROM etkilesimler WHERE gonderen = 'ai' AND created_at >= CURRENT_DATE - INTERVAL '7 days') AS ai_mesaj_sayisi,
    (SELECT COUNT(*) FROM etkilesimler WHERE gonderen = 'ai' AND created_at >= CURRENT_DATE - INTERVAL '7 days') * 2 AS kazanilan_dakika,
    (SELECT COUNT(*) FROM satis_takip WHERE satis_durumu = 'Kazanıldı' AND kazanilma_tarihi >= CURRENT_DATE - INTERVAL '7 days') AS kapanan_satislar,
    (SELECT COALESCE(SUM(tutar), 0) FROM odemeler WHERE durum = 'Ödendi' AND vade_tarihi >= CURRENT_DATE - INTERVAL '7 days') AS toplanan_tutar;

-- RLS (Row Level Security) aktifleştirin
ALTER TABLE musteriler ENABLE ROW LEVEL SECURITY;
ALTER TABLE satis_takip ENABLE ROW LEVEL SECURITY;
ALTER TABLE sozlesmeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE odemeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE etkilesimler ENABLE ROW LEVEL SECURITY;
ALTER TABLE operasyon_detaylari ENABLE ROW LEVEL SECURITY;

-- Authenticated kullanıcılar için temel policy'ler
CREATE POLICY "Authenticated users can view all records" ON musteriler FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert records" ON musteriler FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update records" ON musteriler FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete records" ON musteriler FOR DELETE TO authenticated USING (true);

-- Diğer tablolar için benzer policy'leri ekleyin...
```

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
yarn dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

### 6. İlk Kullanıcı Oluşturma

1. Supabase Auth sayfasından bir kullanıcı oluşturun
2. User metadata'ya şu alanı ekleyin:
```json
{
  "role": "Admin",
  "full_name": "Sistem Yöneticisi"
}
```

## 📂 Proje Yapısı

```
turkish-crm/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard sayfası
│   │   ├── customers/          # Müşteri yönetimi
│   │   ├── pipeline/           # Satış pipeline
│   │   ├── contracts/          # Sözleşme yönetimi
│   │   ├── payments/           # Ödeme yönetimi
│   │   ├── interactions/       # Etkileşim logları
│   │   ├── operations/         # Operasyon detayları
│   │   └── automations/        # Otomasyon durumu
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── charts/             # Chart components
│   │   ├── modals/             # Modal components
│   │   ├── layout/             # Layout components
│   │   ├── loading/            # Loading states
│   │   └── error/              # Error handling
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── types/                  # TypeScript type definitions
│   └── constants/              # Application constants
├── public/                     # Static assets
└── ...config files
```

## 🔧 Available Scripts

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucu
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🏗️ Database Schema

### Temel Tablolar
- `musteriler`: Müşteri bilgileri
- `satis_takip`: Satış pipeline ve deal takibi
- `sozlesmeler`: Sözleşme yönetimi
- `odemeler`: Ödeme ve fatura takibi
- `etkilesimler`: AI ve insan etkileşim logları
- `operasyon_detaylari`: Müşteri başına operasyon ayarları

### View'lar
- `haftalik_ozet_rapor`: Dashboard için özet raporlar

## 🤖 n8n Otomasyon Entegrasyonu

Sistem şu n8n workflow'ları ile entegre çalışmak üzere tasarlanmıştır:

1. **Lead Intake**: Web form'dan gelen lead'leri otomatik kaydetme
2. **Sales Follow-up**: 2. ve 5. günde otomatik e-posta gönderimi
3. **Payment Reminders**: Vade tarihinde ve 7 gün sonra hatırlatma
4. **Deal Won from Payment**: Ödeme yapıldığında deal'i otomatik kazanıldı yapma

## 🎨 Rol Bazlı Erişim

### Admin
- Tüm modüllere tam erişim
- Kullanıcı yönetimi
- Sistem konfigürasyonu

### Sales
- Lead'ler ve müşteriler
- Satış pipeline
- AI konuşmalar
- Deal yönetimi

### Finance
- Sözleşmeler
- Ödeme takibi
- Mali raporlar
- Tahsilat

### Operations
- Operasyon detayları
- WiFi/Kapı kodları
- Kargo ayarları
- Müşteri notları

## 🚨 Error Handling

- Global error boundary
- 404 ve error sayfaları
- Loading state'leri
- Toast notifications
- Validation mesajları

## 🔐 Güvenlik

- Supabase Row Level Security (RLS)
- JWT token bazlı authentication
- HTTPS zorunluluğu (production)
- Environment variable'ları
- SQL injection koruması

## 📱 Responsive Design

- Mobile-first tasarım
- Tablet optimizasyonu
- Desktop tam özellik
- Touch-friendly interface

## 🌐 Deployment

### Vercel (Önerilen)
```bash
npm run build
npx vercel
```

### Diğer Platformlar
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altındadır. Detaylar için `LICENSE` dosyasına bakın.

## 🆘 Destek

- Issues sayfasından hata bildirin
- Documentation'ı kontrol edin
- Discord/Slack kanallarına katılın

## 📈 Roadmap

- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] API documentation
- [ ] Automated testing
- [ ] Performance optimizations
- [ ] i18n support (English)

---

**Turkish CRM** ile işletmenizin CRM ihtiyaçlarını modern, hızlı ve güvenli bir şekilde yönetin! 🚀

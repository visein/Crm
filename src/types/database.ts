export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      musteriler: {
        Row: {
          id: number
          created_at: string
          ad_soyad: string | null
          telefon: string | null
          email: string | null
          sirket_adi: string | null
          sektor: string | null
          kaynak: string
          dogum_tarihi: string | null
          notlar: string | null
          whatsapp_raw_id: string | null
          ad_soruldu_mu: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          ad_soyad?: string | null
          telefon?: string | null
          email?: string | null
          sirket_adi?: string | null
          sektor?: string | null
          kaynak?: string
          dogum_tarihi?: string | null
          notlar?: string | null
          whatsapp_raw_id?: string | null
          ad_soruldu_mu?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          ad_soyad?: string | null
          telefon?: string | null
          email?: string | null
          sirket_adi?: string | null
          sektor?: string | null
          kaynak?: string
          dogum_tarihi?: string | null
          notlar?: string | null
          whatsapp_raw_id?: string | null
          ad_soruldu_mu?: boolean
        }
      }
      satis_takip: {
        Row: {
          id: number
          musteri_id: number
          created_at: string
          ilgilenilen_hizmet: string | null
          talep_tarihi: string
          satis_durumu: string
          mail_1_durumu: string
          mail_1_tarihi: string | null
          mail_2_durumu: string
          mail_2_tarihi: string | null
          kazanilma_tarihi: string | null
        }
        Insert: {
          id?: number
          musteri_id: number
          created_at?: string
          ilgilenilen_hizmet?: string | null
          talep_tarihi?: string
          satis_durumu?: string
          mail_1_durumu?: string
          mail_1_tarihi?: string | null
          mail_2_durumu?: string
          mail_2_tarihi?: string | null
          kazanilma_tarihi?: string | null
        }
        Update: {
          id?: number
          musteri_id?: number
          created_at?: string
          ilgilenilen_hizmet?: string | null
          talep_tarihi?: string
          satis_durumu?: string
          mail_1_durumu?: string
          mail_1_tarihi?: string | null
          mail_2_durumu?: string
          mail_2_tarihi?: string | null
          kazanilma_tarihi?: string | null
        }
      }
      sozlesmeler: {
        Row: {
          id: number
          musteri_id: number
          created_at: string
          hizmet_tipi: string | null
          baslangic_tarihi: string | null
          bitis_tarihi: string | null
          sozlesme_bedeli: number | null
          odeme_periyodu: string | null
          aktif_mi: boolean
        }
        Insert: {
          id?: number
          musteri_id: number
          created_at?: string
          hizmet_tipi?: string | null
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          sozlesme_bedeli?: number | null
          odeme_periyodu?: string | null
          aktif_mi?: boolean
        }
        Update: {
          id?: number
          musteri_id?: number
          created_at?: string
          hizmet_tipi?: string | null
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          sozlesme_bedeli?: number | null
          odeme_periyodu?: string | null
          aktif_mi?: boolean
        }
      }
      odemeler: {
        Row: {
          id: number
          musteri_id: number
          sozlesme_id: number | null
          created_at: string
          tutar: number | null
          vade_tarihi: string | null
          durum: string
          hatirlatma_3gun_gitti: boolean
          hatirlatma_bugun_gitti: boolean
          hatirlatma_7gun_gitti: boolean
          aciklama: string | null
        }
        Insert: {
          id?: number
          musteri_id: number
          sozlesme_id?: number | null
          created_at?: string
          tutar?: number | null
          vade_tarihi?: string | null
          durum?: string
          hatirlatma_3gun_gitti?: boolean
          hatirlatma_bugun_gitti?: boolean
          hatirlatma_7gun_gitti?: boolean
          aciklama?: string | null
        }
        Update: {
          id?: number
          musteri_id?: number
          sozlesme_id?: number | null
          created_at?: string
          tutar?: number | null
          vade_tarihi?: string | null
          durum?: string
          hatirlatma_3gun_gitti?: boolean
          hatirlatma_bugun_gitti?: boolean
          hatirlatma_7gun_gitti?: boolean
          aciklama?: string | null
        }
      }
      etkilesimler: {
        Row: {
          id: number
          created_at: string
          musteri_id: number
          gonderen: string | null
          mesaj_icerigi: string | null
          ozet_konu: string | null
          platform: string
          session_id: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          musteri_id: number
          gonderen?: string | null
          mesaj_icerigi?: string | null
          ozet_konu?: string | null
          platform?: string
          session_id?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          musteri_id?: number
          gonderen?: string | null
          mesaj_icerigi?: string | null
          ozet_konu?: string | null
          platform?: string
          session_id?: string | null
        }
      }
      operasyon_detaylari: {
        Row: {
          id: number
          musteri_id: number
          wifi_adi: string | null
          wifi_sifresi: string | null
          kapi_sifresi: string | null
          kargo_tercihi: string | null
          ozel_notlar: string | null
        }
        Insert: {
          id?: number
          musteri_id: number
          wifi_adi?: string | null
          wifi_sifresi?: string | null
          kapi_sifresi?: string | null
          kargo_tercihi?: string | null
          ozel_notlar?: string | null
        }
        Update: {
          id?: number
          musteri_id?: number
          wifi_adi?: string | null
          wifi_sifresi?: string | null
          kapi_sifresi?: string | null
          kargo_tercihi?: string | null
          ozel_notlar?: string | null
        }
      }
    }
    Views: {
      haftalik_ozet_rapor: {
        Row: {
          yeni_lead_sayisi: number | null
          ai_mesaj_sayisi: number | null
          kazanilan_dakika: number | null
          kapanan_satislar: number | null
          toplanan_tutar: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Musteri = Database['public']['Tables']['musteriler']['Row']
export type SatisTakip = Database['public']['Tables']['satis_takip']['Row']
export type Sozlesme = Database['public']['Tables']['sozlesmeler']['Row']
export type Odeme = Database['public']['Tables']['odemeler']['Row']
export type Etkilesim = Database['public']['Tables']['etkilesimler']['Row']
export type OperasyonDetay = Database['public']['Tables']['operasyon_detaylari']['Row']
export type HaftalikOzet = Database['public']['Views']['haftalik_ozet_rapor']['Row']

// Insert types for forms
export type MusteriInsert = Database['public']['Tables']['musteriler']['Insert']
export type SatisTakipInsert = Database['public']['Tables']['satis_takip']['Insert']
export type SozlesmeInsert = Database['public']['Tables']['sozlesmeler']['Insert']
export type OdemeInsert = Database['public']['Tables']['odemeler']['Insert']
export type EtkileşimInsert = Database['public']['Tables']['etkilesimler']['Insert']
export type OperasyonDetayInsert = Database['public']['Tables']['operasyon_detaylari']['Insert']

// Enum values as constants
export const SatisDurumu = {
  YENI_LEAD: 'Yeni Lead',
  GORUSULUYOR: 'Görüşülüyor',
  TEKLIF_ATILDI: 'Teklif Atıldı',
  KAZANILDI: 'Kazanıldı',
  KAYBEDILDI: 'Kaybedildi',
  CEVAP_YOK: 'Cevap Yok'
} as const

export const MailDurumu = {
  BEKLIYOR: 'Bekliyor',
  GONDERILMEDI: 'Gönderilmedi',
  GONDERILDI: 'Gönderildi',
  ACILDI: 'Açıldı',
  CEVAPLANDI: 'Cevaplandı'
} as const

export const OdemeDurumu = {
  ODENMEDI: 'Ödenmedi',
  ODENDI: 'Ödendi',
  KISMI: 'Kısmi',
  IPTAL: 'İptal',
  GECIKMIŞ: 'Gecikmiş'
} as const

export const OdemePeriyodu = {
  AYLIK: 'Aylık',
  UC_AYLIK: '3 Aylık',
  ALTI_AYLIK: '6 Aylık',
  YILLIK: 'Yıllık'
} as const

export const HizmetTipi = {
  SANAL_OFIS: 'Sanal Ofis',
  HAZIR_OFIS: 'Hazır Ofis',
  COWORKING: 'Coworking',
  TOPLANTI: 'Toplantı',
  ETKINLIK: 'Etkinlik',
  DIGER: 'Diğer'
} as const

export const Gonderen = {
  AI: 'ai',
  MUSTERI: 'musteri',
  TEMSILCI: 'temsilci'
} as const

// Extended types for joined queries
export type MusteriWithOperations = Musteri & {
  operasyon_detaylari?: OperasyonDetay[]
}

export type MusteriWithDetails = Musteri & {
  satis_takip?: SatisTakip[]
  sozlesmeler?: Sozlesme[]
  odemeler?: Odeme[]
  etkilesimler?: Etkilesim[]
  operasyon_detaylari?: OperasyonDetay[]
}
import { z } from 'zod'

// Müşteri validation schemas
export const customerSchema = z.object({
  ad_soyad: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  telefon: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true
    // Turkish phone number format validation
    const phoneRegex = /^(\+90|0)?5[0-9]{9}$/
    return phoneRegex.test(val.replace(/\s/g, ''))
  }, 'Geçerli bir telefon numarası girin (05xxxxxxxxx)'),
  email: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true
    return z.string().email().safeParse(val).success
  }, 'Geçerli bir e-posta adresi girin'),
  sirket_adi: z.string().optional().or(z.literal('')),
  sektor: z.string().optional().or(z.literal('')),
  kaynak: z.string().min(1, 'Kaynak seçimi zorunludur'),
  notlar: z.string().optional().or(z.literal(''))
})

export type CustomerFormData = z.infer<typeof customerSchema>

// Sözleşme validation schemas
export const contractSchema = z.object({
  musteri_id: z.number().min(1, 'Müşteri seçimi zorunludur'),
  sozlesme_tarihi: z.string().min(1, 'Sözleşme tarihi zorunludur'),
  baslangic_tarihi: z.string().min(1, 'Başlangıç tarihi zorunludur'),
  bitis_tarihi: z.string().min(1, 'Bitiş tarihi zorunludur'),
  sozlesme_tutari: z.number().min(0, 'Sözleşme tutarı 0 veya daha büyük olmalıdır'),
  durum: z.enum(['aktif', 'pasif', 'iptal']),
  detaylar: z.string().optional().or(z.literal(''))
})

export type ContractFormData = z.infer<typeof contractSchema>

// Sözleşme düzenleme validation schema
export const editContractSchema = z.object({
  hizmet_tipi: z.string().min(1, 'Hizmet türü zorunludur'),
  baslangic_tarihi: z.string().optional().or(z.literal('')),
  bitis_tarihi: z.string().optional().or(z.literal('')),
  sozlesme_bedeli: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true
    const num = parseFloat(val)
    return !isNaN(num) && num >= 0
  }, 'Geçerli bir tutar girin (0 veya daha büyük)'),
  odeme_periyodu: z.string().min(1, 'Ödeme periyodu seçimi zorunludur'),
  aktif_mi: z.boolean()
})

export type EditContractFormData = z.infer<typeof editContractSchema>

// Satış kaydı validation schemas
export const salesRecordSchema = z.object({
  musteri_id: z.number().min(1, 'Müşteri seçimi zorunludur'),
  hizmet_turu: z.string().min(1, 'Hizmet türü zorunludur'),
  tutar: z.number().min(0, 'Tutar 0 veya daha büyük olmalıdır'),
  durum: z.enum(['Potansiyel', 'Teklif Verildi', 'Görüşme', 'Kazan', 'Kayıp']),
  olusturulma_tarihi: z.string().min(1, 'Oluşturulma tarihi zorunludur'),
  notlar: z.string().optional().or(z.literal(''))
})

export type SalesRecordFormData = z.infer<typeof salesRecordSchema>

// Deal (Satış Takip) ekleme validation schema
export const addDealSchema = z.object({
  ilgilenilen_hizmet: z.string().min(1, 'İlgilenilen hizmet seçimi zorunludur'),
  talep_tarihi: z.string().min(1, 'Talep tarihi zorunludur'),
  satis_durumu: z.string().min(1, 'Satış durumu seçimi zorunludur'),
  mail_1_durumu: z.string().min(1, 'Mail durumu seçimi zorunludur'),
  mail_2_durumu: z.string().min(1, 'Mail durumu seçimi zorunludur')
})

export type AddDealFormData = z.infer<typeof addDealSchema>

// Deal (Satış Takip) düzenleme validation schema
export const editDealSchema = z.object({
  ilgilenilen_hizmet: z.string().min(1, 'İlgilenilen hizmet seçimi zorunludur'),
  talep_tarihi: z.string().optional().or(z.literal('')),
  satis_durumu: z.string().optional().or(z.literal('')),
  mail_1_durumu: z.string().optional().or(z.literal('')),
  mail_1_tarihi: z.string().optional().or(z.literal('')),
  mail_2_durumu: z.string().optional().or(z.literal('')),
  mail_2_tarihi: z.string().optional().or(z.literal('')),
  kazanilma_tarihi: z.string().optional().or(z.literal(''))
})

export type EditDealFormData = z.infer<typeof editDealSchema>

// Ödeme validation schemas
export const paymentSchema = z.object({
  sozlesme_id: z.number().min(1, 'Sözleşme seçimi zorunludur'),
  tutar: z.number().min(0, 'Tutar 0 veya daha büyük olmalıdır'),
  odeme_tarihi: z.string().min(1, 'Ödeme tarihi zorunludur'),
  durum: z.enum(['beklemede', 'tamamlandi', 'gecikti']),
  aciklama: z.string().optional().or(z.literal(''))
})

export type PaymentFormData = z.infer<typeof paymentSchema>

// Global arama validation schema
export const searchSchema = z.object({
  query: z.string().min(2, 'Arama terimi en az 2 karakter olmalıdır')
})

export type SearchFormData = z.infer<typeof searchSchema>

// Setup validation schema
export const setupSchema = z.object({
  organizationName: z.string().min(2, 'Organizasyon adı en az 2 karakter olmalıdır'),
  userEmail: z.string().email('Geçerli bir e-posta adresi girin'),
  userName: z.string().min(2, 'Kullanıcı adı en az 2 karakter olmalıdır')
})

export type SetupFormData = z.infer<typeof setupSchema>
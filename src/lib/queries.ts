import { supabase } from './supabase'
import type { Database } from '@/types/database'
import type {
  Musteri,
  SatisTakip,
  Sozlesme,
  Odeme,
  Etkilesim,
  OperasyonDetay,
  HaftalikOzet,
  MusteriInsert,
  SatisTakipInsert,
  SozlesmeInsert,
  OdemeInsert,
  OperasyonDetayInsert
} from '@/types/database'

// Demo mode flag
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Mock data for demo
const mockCustomers: Musteri[] = [
  {
    id: 1,
    created_at: '2024-12-01T10:00:00.000Z',
    ad_soyad: 'Ahmet Yılmaz',
    telefon: '905321234567',
    email: 'ahmet@tekirdag.com',
    sirket_adi: 'Tekirdağ İnşaat Ltd.',
    sektor: 'İnşaat',
    kaynak: 'Web Form',
    dogum_tarihi: '1985-03-15',
    notlar: 'Sanal ofis hizmeti için görüştü',
    whatsapp_raw_id: '905321234567@c.us'
  },
  {
    id: 2,
    created_at: '2024-12-02T14:30:00.000Z',
    ad_soyad: 'Fatma Demir',
    telefon: '905429876543',
    email: 'fatma@consultancy.com',
    sirket_adi: 'Demir Danışmanlık',
    sektor: 'Danışmanlık',
    kaynak: 'Referans',
    dogum_tarihi: '1990-07-22',
    notlar: 'Hazır ofis alanları ile ilgileniyor',
    whatsapp_raw_id: '905429876543@c.us'
  },
  {
    id: 3,
    created_at: '2024-12-03T09:15:00.000Z',
    ad_soyad: 'Mehmet Kara',
    telefon: '905336547891',
    email: 'mehmet@teknoloji.com',
    sirket_adi: 'Kara Teknoloji',
    sektor: 'Teknoloji',
    kaynak: 'Telefon',
    dogum_tarihi: '1988-11-10',
    notlar: 'Coworking space\'e ilgili',
    whatsapp_raw_id: '905336547891@c.us'
  }
]

const mockSalesRecords: SatisTakip[] = [
  {
    id: 1,
    musteri_id: 1,
    created_at: '2024-12-01T10:30:00.000Z',
    ilgilenilen_hizmet: 'Sanal Ofis',
    talep_tarihi: '2024-12-01',
    satis_durumu: 'Teklif Atıldı',
    mail_1_durumu: 'Gönderildi',
    mail_1_tarihi: '2024-12-03T10:00:00.000Z',
    mail_2_durumu: 'Bekliyor',
    mail_2_tarihi: null,
    kazanilma_tarihi: null
  },
  {
    id: 2,
    musteri_id: 2,
    created_at: '2024-12-02T15:00:00.000Z',
    ilgilenilen_hizmet: 'Hazır Ofis',
    talep_tarihi: '2024-12-02',
    satis_durumu: 'Kazanıldı',
    mail_1_durumu: 'Gönderildi',
    mail_1_tarihi: '2024-12-04T09:00:00.000Z',
    mail_2_durumu: 'Gönderildi',
    mail_2_tarihi: '2024-12-07T09:00:00.000Z',
    kazanilma_tarihi: '2024-12-05'
  },
  {
    id: 3,
    musteri_id: 3,
    created_at: '2024-12-03T09:45:00.000Z',
    ilgilenilen_hizmet: 'Coworking',
    talep_tarihi: '2024-12-03',
    satis_durumu: 'Görüşülüyor',
    mail_1_durumu: 'Bekliyor',
    mail_1_tarihi: null,
    mail_2_durumu: 'Bekliyor',
    mail_2_tarihi: null,
    kazanilma_tarihi: null
  }
]

const mockContracts: Sozlesme[] = [
  {
    id: 1,
    musteri_id: 2,
    created_at: '2024-12-05T11:00:00.000Z',
    hizmet_tipi: 'Hazır Ofis',
    baslangic_tarihi: '2024-12-06',
    bitis_tarihi: '2025-12-06',
    sozlesme_bedeli: 25000.00,
    odeme_periyodu: 'Aylık',
    aktif_mi: true
  }
]

const mockPayments: Odeme[] = [
  {
    id: 1,
    musteri_id: 2,
    sozlesme_id: 1,
    created_at: '2024-12-05T11:30:00.000Z',
    tutar: 2500.00,
    vade_tarihi: '2024-12-06',
    durum: 'Ödendi',
    hatirlatma_3gun_gitti: false,
    hatirlatma_bugun_gitti: false,
    hatirlatma_7gun_gitti: false,
    aciklama: 'Aralık 2024 kirası'
  },
  {
    id: 2,
    musteri_id: 2,
    sozlesme_id: 1,
    created_at: '2024-12-05T11:30:00.000Z',
    tutar: 2500.00,
    vade_tarihi: '2025-01-06',
    durum: 'Ödenmedi',
    hatirlatma_3gun_gitti: false,
    hatirlatma_bugun_gitti: false,
    hatirlatma_7gun_gitti: false,
    aciklama: 'Ocak 2025 kirası'
  }
]

const mockInteractions: Etkilesim[] = [
  {
    id: 1,
    created_at: '2024-12-01T10:45:00.000Z',
    musteri_id: 1,
    gonderen: 'musteri',
    mesaj_icerigi: 'Merhaba, sanal ofis hizmeti hakkında bilgi almak istiyorum.',
    ozet_konu: 'Sanal ofis bilgi talebi',
    platform: 'whatsapp',
    session_id: 'session_001'
  },
  {
    id: 2,
    created_at: '2024-12-01T10:47:00.000Z',
    musteri_id: 1,
    gonderen: 'ai',
    mesaj_icerigi: 'Merhaba! Sanal ofis hizmetlerimiz hakkında size yardımcı olabilirim. Hangi özellikleri öğrenmek istiyorsunuz?',
    ozet_konu: 'AI yanıt - sanal ofis',
    platform: 'whatsapp',
    session_id: 'session_001'
  },
  {
    id: 3,
    created_at: '2024-12-02T15:15:00.000Z',
    musteri_id: 2,
    gonderen: 'temsilci',
    mesaj_icerigi: 'Hazır ofis alanımızı gezdiniz, sözleşme detaylarını konuşalım.',
    ozet_konu: 'Sözleşme görüşmesi',
    platform: 'phone',
    session_id: 'session_002'
  }
]

const mockOperationDetails: OperasyonDetay[] = [
  {
    id: 1,
    musteri_id: 2,
    wifi_adi: 'SanalOfis_Guest',
    wifi_sifresi: 'Guest2024!',
    kapi_sifresi: '1234',
    kargo_tercihi: 'Güvenliğe bırak',
    ozel_notlar: 'Toplantı salonunu sık kullanıyor'
  }
]

const mockWeeklyReport: HaftalikOzet = {
  yeni_lead_sayisi: 5,
  ai_mesaj_sayisi: 23,
  kazanilan_dakika: 46,
  kapanan_satislar: 2,
  toplanan_tutar: 7500.00
}

// Helper function to simulate API delay
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))

// Customer queries
export async function fetchCustomers(): Promise<Musteri[]> {
  if (isDemoMode) {
    await simulateDelay()
    return mockCustomers
  }

  const { data, error } = await supabase
    .from('musteriler')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchCustomerById(id: number) {
  const { data, error } = await supabase
    .from('musteriler')
    .select(`
      *,
      satis_takip(*),
      sozlesmeler(*),
      odemeler(*),
      etkilesimler(*),
      operasyon_detaylari(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Customer specific queries
export async function fetchCustomerDeals(customerId: number): Promise<SatisTakip[]> {
  const { data, error } = await supabase
    .from('satis_takip')
    .select('*')
    .eq('musteri_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchCustomerContracts(customerId: number): Promise<Sozlesme[]> {
  const { data, error } = await supabase
    .from('sozlesmeler')
    .select('*')
    .eq('musteri_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchCustomerPayments(customerId: number): Promise<Odeme[]> {
  const { data, error } = await supabase
    .from('odemeler')
    .select('*')
    .eq('musteri_id', customerId)
    .order('vade_tarihi', { ascending: false })

  if (error) throw error
  return data || []
}

// Sales pipeline queries
export async function fetchSalesPipeline() {
  if (isDemoMode) {
    await simulateDelay()
    return mockSalesRecords.map(record => ({
      ...record,
      musteriler: mockCustomers.find(c => c.id === record.musteri_id)
    }))
  }

  const { data, error } = await supabase
    .from('satis_takip')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi, telefon)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateSalesStatus(id: number, status: string) {
  if (isDemoMode) {
    await simulateDelay()
    // Find and update the mock data
    const recordIndex = mockSalesRecords.findIndex(record => record.id === id)
    if (recordIndex !== -1) {
      mockSalesRecords[recordIndex] = {
        ...mockSalesRecords[recordIndex],
        satis_durumu: status,
        ...(status === 'Kazanıldı' && {
          kazanilma_tarihi: new Date().toISOString().split('T')[0]
        })
      }
      return [mockSalesRecords[recordIndex]]
    } else {
      throw new Error(`Sales record with ID ${id} not found`)
    }
  }

  const updateData = {
    satis_durumu: status,
    ...(status === 'Kazanıldı' && {
      kazanilma_tarihi: new Date().toISOString().split('T')[0]
    })
  }
  
  const { data, error } = await supabase
    .from('satis_takip')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

// Contract queries
export async function fetchContracts() {
  if (isDemoMode) {
    await simulateDelay()
    return mockContracts.map(contract => ({
      ...contract,
      musteriler: mockCustomers.find(c => c.id === contract.musteri_id)
    }))
  }

  const { data, error } = await supabase
    .from('sozlesmeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Payment queries
export async function fetchPayments() {
  if (isDemoMode) {
    await simulateDelay()
    return mockPayments.map(payment => ({
      ...payment,
      musteriler: mockCustomers.find(c => c.id === payment.musteri_id)
    }))
  }

  const { data, error } = await supabase
    .from('odemeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi)
    `)
    .order('vade_tarihi', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updatePaymentStatus(id: number, status: string) {
  const { data, error } = await supabase
    .from('odemeler')
    .update({ durum: status })
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

// Interaction queries
export async function fetchInteractions(customerId?: number) {
  if (isDemoMode) {
    await simulateDelay()
    const interactions = customerId
      ? mockInteractions.filter(i => i.musteri_id === customerId)
      : mockInteractions

    return interactions.map(interaction => ({
      ...interaction,
      musteriler: mockCustomers.find(c => c.id === interaction.musteri_id)
    }))
  }

  let query = supabase
    .from('etkilesimler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi, telefon)
    `)

  if (customerId) {
    query = query.eq('musteri_id', customerId)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Operations queries
export async function fetchOperationDetails(customerId: number): Promise<OperasyonDetay | null> {
  const { data, error } = await supabase
    .from('operasyon_detaylari')
    .select('*')
    .eq('musteri_id', customerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertOperationDetails(details: OperasyonDetayInsert) {
  const { data, error } = await supabase
    .from('operasyon_detaylari')
    .upsert(details, {
      onConflict: 'musteri_id'
    })
    .select()

  if (error) throw error
  return data
}

// Dashboard queries
export async function fetchWeeklyReport(): Promise<HaftalikOzet> {
  if (isDemoMode) {
    await simulateDelay()
    return mockWeeklyReport
  }

  const { data, error } = await supabase
    .from('haftalik_ozet_rapor')
    .select('*')
    .single()

  if (error) throw error
  return data
}

// Search customers
export async function searchCustomers(query: string): Promise<Musteri[]> {
  const { data, error } = await supabase
    .from('musteriler')
    .select('*')
    .or(`ad_soyad.ilike.%${query}%,telefon.ilike.%${query}%,sirket_adi.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Create customer
export async function createCustomer(customer: MusteriInsert) {
  const { data, error } = await supabase
    .from('musteriler')
    .insert(customer)
    .select()

  if (error) throw error
  return data
}

// Update customer
export async function updateCustomer(
  id: number,
  updates: Database['public']['Tables']['musteriler']['Update']
) {
  const { data, error } = await supabase
    .from('musteriler')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

// Delete customer
export async function deleteCustomer(id: number) {
  const { data, error } = await supabase
    .from('musteriler')
    .delete()
    .eq('id', id)

  if (error) throw error
  return data
}

// Create sales record
export async function createSalesRecord(record: SatisTakipInsert) {
  if (isDemoMode) {
    await simulateDelay()
    // Generate new ID
    const newId = Math.max(...mockSalesRecords.map(r => r.id), 0) + 1
    const newRecord: SatisTakip = {
      id: newId,
      created_at: new Date().toISOString(),
      musteri_id: record.musteri_id,
      ilgilenilen_hizmet: record.ilgilenilen_hizmet || null,
      talep_tarihi: record.talep_tarihi || new Date().toISOString().split('T')[0],
      satis_durumu: record.satis_durumu || 'Yeni Lead',
      mail_1_durumu: 'Bekliyor',
      mail_1_tarihi: null,
      mail_2_durumu: 'Bekliyor',
      mail_2_tarihi: null,
      kazanilma_tarihi: null
    }
    mockSalesRecords.push(newRecord)
    return [newRecord]
  }

  const { data, error } = await supabase
    .from('satis_takip')
    .insert(record)
    .select()

  if (error) throw error
  return data
}

// Create contract
export async function createContract(contract: SozlesmeInsert) {
  const { data, error } = await supabase
    .from('sozlesmeler')
    .insert(contract)
    .select()

  if (error) throw error
  return data
}

// Create payment
export async function createPayment(payment: OdemeInsert) {
  const { data, error } = await supabase
    .from('odemeler')
    .insert(payment)
    .select()

  if (error) throw error
  return data
}

// Additional queries needed by hooks
export async function fetchExpiringContracts(days: number = 30) {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + days)
  
  const { data, error } = await supabase
    .from('sozlesmeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi)
    `)
    .eq('aktif_mi', true)
    .lte('bitis_tarihi', targetDate.toISOString().split('T')[0])
    .order('bitis_tarihi', { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateContract(
  id: number,
  updates: Database['public']['Tables']['sozlesmeler']['Update']
) {
  const { data, error } = await supabase
    .from('sozlesmeler')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function fetchOverduePayments() {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('odemeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi)
    `)
    .in('durum', ['Ödenmedi', 'Gecikmiş'])
    .lt('vade_tarihi', today)
    .order('vade_tarihi', { ascending: true })

  if (error) throw error
  return data || []
}

// Statistics for dashboard
export async function fetchDashboardStats() {
  const today = new Date()
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Get new customers count (last 7 days)
  const { data: newCustomers, error: customersError } = await supabase
    .from('musteriler')
    .select('id')
    .gte('created_at', lastWeek.toISOString())

  if (customersError) throw customersError

  // Get sales pipeline stats
  const { data: pipelineStats, error: pipelineError } = await supabase
    .from('satis_takip')
    .select('satis_durumu, count(*)', { count: 'exact' })

  if (pipelineError) throw pipelineError

  // Get payment stats
  const { data: paymentStats, error: paymentError } = await supabase
    .from('odemeler')
    .select('durum, count(*), tutar.sum()', { count: 'exact' })

  if (paymentError) throw paymentError

  return {
    newCustomersCount: newCustomers?.length || 0,
    pipelineStats: pipelineStats || [],
    paymentStats: paymentStats || []
  }
}

// Operations specific query
export async function fetchCustomersWithOperations() {
  if (isDemoMode) {
    await simulateDelay()
    return mockCustomers.map(customer => ({
      ...customer,
      operasyon_detaylari: mockOperationDetails.filter(op => op.musteri_id === customer.id)
    }))
  }

  const { data, error } = await supabase
    .from('musteriler')
    .select(`
      *,
      operasyon_detaylari(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
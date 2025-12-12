import { supabase } from './supabase'
import type { Database } from '@/types/database'
import type {
  Musteri,
  SatisTakip,
  Sozlesme,
  Odeme,
  OperasyonDetay,
  HaftalikOzet,
  MusteriInsert,
  SatisTakipInsert,
  SozlesmeInsert,
  OdemeInsert,
  OperasyonDetayInsert
} from '@/types/database'

// Customer queries
export async function fetchCustomers(): Promise<Musteri[]> {
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

// Update sales record
export async function updateSalesRecord(
  id: number,
  updates: Database['public']['Tables']['satis_takip']['Update']
) {
  const { data, error } = await supabase
    .from('satis_takip')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

// Contract queries
export async function fetchContracts(): Promise<(Sozlesme & { musteriler: { ad_soyad: string | null; sirket_adi?: string | null } | null })[]> {
  const { data, error } = await supabase
    .from('sozlesmeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as (Sozlesme & { musteriler: { ad_soyad: string | null; sirket_adi?: string | null } | null })[]
}

// Payment queries
export async function fetchPayments() {
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

// Dashboard lead trend query
export async function fetchWeeklyLeadTrend() {
  // Get last 7 days of customer creation data
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 6) // 7 days including today

  const { data, error } = await supabase
    .from('musteriler')
    .select('created_at')
    .gte('created_at', startDate.toISOString().split('T')[0])
    .lte('created_at', endDate.toISOString().split('T')[0])
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by day
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const shortDayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
  
  const trendData = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]
    
    const count = data?.filter(customer =>
      customer.created_at.startsWith(dateStr)
    ).length || 0

    trendData.push({
      name: shortDayNames[currentDate.getDay()],
      fullName: dayNames[currentDate.getDay()],
      value: count,
      date: dateStr
    })
  }

  return trendData
}

// Global search across all entities
export async function globalSearch(query: string) {
  if (!query.trim()) return { customers: [], deals: [], contracts: [], payments: [] }

  const searchPattern = `%${query.trim()}%`
  
  // Search customers
  const { data: customers, error: customersError } = await supabase
    .from('musteriler')
    .select('*')
    .or(`ad_soyad.ilike.${searchPattern},telefon.ilike.${searchPattern},sirket_adi.ilike.${searchPattern},email.ilike.${searchPattern}`)
    .limit(10)

  if (customersError) console.error('Customer search error:', customersError)

  // Search deals/sales
  const { data: deals, error: dealsError } = await supabase
    .from('satis_takip')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi, telefon)
    `)
    .or(`ilgilenilen_hizmet.ilike.${searchPattern},satis_durumu.ilike.${searchPattern}`)
    .limit(10)

  if (dealsError) console.error('Deals search error:', dealsError)

  // Search contracts
  const { data: contracts, error: contractsError } = await supabase
    .from('sozlesmeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi, telefon)
    `)
    .or(`hizmet_tipi.ilike.${searchPattern}`)
    .limit(10)

  if (contractsError) console.error('Contracts search error:', contractsError)

  // Search payments
  const { data: payments, error: paymentsError } = await supabase
    .from('odemeler')
    .select(`
      *,
      musteriler(ad_soyad, sirket_adi, telefon)
    `)
    .or(`durum.ilike.${searchPattern},aciklama.ilike.${searchPattern}`)
    .limit(10)

  if (paymentsError) console.error('Payments search error:', paymentsError)

  return {
    customers: customers || [],
    deals: deals || [],
    contracts: contracts || [],
    payments: payments || []
  }
}
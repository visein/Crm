import type { User } from '@supabase/supabase-js'
import type {
  SatisTakip,
  Sozlesme,
  Odeme,
  Etkilesim,
  OperasyonDetay
} from './database'

// User roles
export type UserRole = 'admin' | 'sales' | 'finance' | 'operations'

// Extended user type with role metadata
export interface AppUser extends User {
  user_metadata: {
    role: UserRole
    full_name?: string
  }
}

// Navigation item type
export interface NavItem {
  href: string
  label: string
  icon: string
  roles: UserRole[]
}

// Status badge types
export interface StatusBadge {
  label: string
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
  color: string
}

// Chart data types
export interface ChartData {
  name: string
  value: number
  color?: string
}

// Dashboard metrics
export interface DashboardMetrics {
  yeniLeadSayisi: number
  aiMesajSayisi: number
  kazanilanDakika: number
  kapananSatislar: number
  toplananTutar: number
}

// Table column definition
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, item: T) => React.ReactNode
}

// Filter options
export interface FilterOption {
  value: string
  label: string
  count?: number
}

// Pipeline stage for Kanban
export interface PipelineStage {
  id: string
  title: string
  count: number
  color: string
}

// Form field types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'currency'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: Record<string, unknown>
}

// Modal props
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

// Data with customer info (for joins)
export interface MusteriWithSatis {
  id: number
  ad_soyad: string
  telefon: string | null
  email: string | null
  sirket_adi: string | null
  sektor: string | null
  kaynak: string
  created_at: string
  satis_takip?: SatisTakip[]
  sozlesmeler?: Sozlesme[]
  odemeler?: Odeme[]
  etkilesimler?: Etkilesim[]
  operasyon_detaylari?: OperasyonDetay
}

export interface SatisWithMusteri {
  id: number
  musteri_id: number
  ilgilenilen_hizmet: string | null
  talep_tarihi: string
  satis_durumu: string
  mail_1_durumu: string
  mail_2_durumu: string
  kazanilma_tarihi: string | null
  musteri: {
    ad_soyad: string
    sirket_adi: string | null
    telefon: string | null
  }
}

export interface OdemeWithMusteri {
  id: number
  musteri_id: number
  tutar: number | null
  vade_tarihi: string | null
  durum: string
  aciklama: string | null
  hatirlatma_bugun_gitti: boolean
  hatirlatma_7gun_gitti: boolean
  musteri: {
    ad_soyad: string
    sirket_adi: string | null
  }
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T
  error: string | null
  success: boolean
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Pagination
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
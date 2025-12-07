// Türkçe sabitler ve çeviriler
export const TEXTS = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    customers: 'Müşteriler',
    sales: 'Satış Pipeline',
    contracts: 'Sözleşmeler',
    payments: 'Ödemeler',
    interactions: 'Mesajlar',
    operations: 'Operasyon',
    automations: 'Otomasyon',
  },

  // Common actions
  actions: {
    add: 'Ekle',
    edit: 'Düzenle',
    delete: 'Sil',
    save: 'Kaydet',
    cancel: 'İptal',
    close: 'Kapat',
    search: 'Ara',
    filter: 'Filtrele',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    refresh: 'Yenile',
    view: 'Görüntüle',
  },

  // Status labels
  status: {
    active: 'Aktif',
    inactive: 'Pasif',
    pending: 'Bekliyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
    paid: 'Ödendi',
    unpaid: 'Ödenmedi',
    overdue: 'Vadesi Geçmiş',
    partial: 'Kısmi',
  },

  // Sales pipeline stages
  pipeline: {
    yeniLead: 'Yeni Lead',
    gorusuluyor: 'Görüşülüyor',
    teklifAtildi: 'Teklif Atıldı',
    kazanildi: 'Kazanıldı',
    kaybedildi: 'Kaybedildi',
    cevapYok: 'Cevap Yok',
  },

  // Service types
  services: {
    sanalOfis: 'Sanal Ofis',
    hazirOfis: 'Hazır Ofis',
    coworking: 'Coworking',
    toplanti: 'Toplantı',
    etkinlik: 'Etkinlik',
  },

  // Payment periods
  paymentPeriods: {
    aylik: 'Aylık',
    ucAylik: '3 Aylık',
    altiAylik: '6 Aylık',
    yillik: 'Yıllık',
  },

  // Form labels
  forms: {
    customerName: 'Ad Soyad',
    companyName: 'Şirket Adı',
    phone: 'Telefon',
    email: 'Email',
    sector: 'Sektör',
    source: 'Kaynak',
    birthDate: 'Doğum Tarihi',
    notes: 'Notlar',
    serviceType: 'Hizmet Tipi',
    contractAmount: 'Sözleşme Bedeli',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    paymentPeriod: 'Ödeme Periyodu',
    amount: 'Tutar',
    dueDate: 'Vade Tarihi',
    description: 'Açıklama',
    wifiName: 'WiFi Adı',
    wifiPassword: 'WiFi Şifresi',
    doorCode: 'Kapı Şifresi',
    cargoPreference: 'Kargo Tercihi',
    specialNotes: 'Özel Notlar',
  },

  // Dashboard metrics
  dashboard: {
    newLeads: 'Yeni Lead\'ler',
    aiMessages: 'AI Mesajları',
    timesSaved: 'Kazanılan Dakika',
    closedDeals: 'Kapanan Satışlar',
    collectedAmount: 'Toplanan Tutar',
    lastWeek: 'Son 7 Gün',
    thisMonth: 'Bu Ay',
    alertsTitle: 'Dikkat Gereken Durumlar',
    overduPayments: 'Vadesi Geçen Ödemeler',
    expiringContracts: 'Süresi Dolan Sözleşmeler',
    pendingFollowups: 'Bekleyen Follow-up\'lar',
  },

  // Messages
  messages: {
    success: {
      customerAdded: 'Müşteri başarıyla eklendi',
      customerUpdated: 'Müşteri bilgileri güncellendi',
      contractSaved: 'Sözleşme kaydedildi',
      paymentMarked: 'Ödeme durumu güncellendi',
      operationsSaved: 'Operasyon bilgileri kaydedildi',
    },
    errors: {
      general: 'Bir hata oluştu',
      networkError: 'Bağlantı hatası',
      unauthorized: 'Yetkisiz erişim',
      notFound: 'Veri bulunamadı',
      validationError: 'Form bilgilerini kontrol edin',
    },
    confirmations: {
      deleteCustomer: 'Bu müşteriyi silmek istediğinizden emin misiniz?',
      deleteContract: 'Bu sözleşmeyi silmek istediğinizden emin misiniz?',
      markAsPaid: 'Bu ödemeyi ödendi olarak işaretlemek istediğinizden emin misiniz?',
    },
  },

  // Roles
  roles: {
    admin: 'Yönetici',
    sales: 'Satış',
    finance: 'Finans',
    operations: 'Operasyon',
  },

  // Filters and sorting
  filters: {
    all: 'Tümü',
    today: 'Bugün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    lastMonth: 'Geçen Ay',
    custom: 'Özel',
  },
} as const

// Role permissions
export const ROLE_PERMISSIONS = {
  admin: ['dashboard', 'musteriler', 'satis', 'sozlesmeler', 'odemeler', 'mesajlar', 'operasyon', 'otomasyon'],
  sales: ['dashboard', 'musteriler', 'satis', 'mesajlar'],
  finance: ['dashboard', 'sozlesmeler', 'odemeler'],
  operations: ['dashboard', 'musteriler', 'operasyon'],
} as const

// Color schemes for charts and status badges
export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#6366f1',
  gray: '#6b7280',
} as const

// Pipeline stage colors
export const PIPELINE_COLORS = {
  'Yeni Lead': '#6b7280',
  'Görüşülüyor': '#3b82f6',
  'Teklif Atıldı': '#f59e0b',
  'Kazanıldı': '#10b981',
  'Kaybedildi': '#ef4444',
  'Cevap Yok': '#9ca3af',
} as const
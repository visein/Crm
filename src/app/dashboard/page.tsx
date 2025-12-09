'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { MetricCard } from '@/components/charts/MetricCard'
import { SimpleBarChart } from '@/components/charts/SimpleBarChart'
import { SimplePieChart } from '@/components/charts/SimplePieChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWeeklyReport, useSalesPipeline, useOverduePayments, useExpiringContracts, useWeeklyLeadTrend } from '@/hooks/useData'
import { formatTurkishCurrency, getRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { AlertTriangle, TrendingUp, Users, MessageSquare, CreditCard, FileText, Download } from 'lucide-react'

// Type definitions for processed data
interface PaymentWithCustomer {
  id: number
  tutar: number | null
  vade_tarihi: string | null
  aciklama: string | null
  musteriler?: {
    ad_soyad: string
  } | null
}

interface ContractWithCustomer {
  id: number
  hizmet_tipi: string | null
  bitis_tarihi: string | null
  sozlesme_bedeli: number | null
  musteriler?: {
    ad_soyad: string
  } | null
}

interface SalesPipelineWithCustomer {
  satis_durumu: string
  musteriler?: {
    ad_soyad: string
  } | null
}

interface WeeklyReport {
  yeni_lead_sayisi?: number | null
  ai_mesaj_sayisi?: number | null
  kazanilan_dakika?: number | null
  kapanan_satislar?: number | null
  toplanan_tutar?: number | null
}

// Export dashboard report as CSV
const exportDashboardReport = (
  weeklyReport: WeeklyReport | undefined,
  overduePayments: PaymentWithCustomer[],
  expiringContracts: ContractWithCustomer[]
) => {
  const csvContent = [
    ['Turkish CRM - Dashboard Raporu'],
    ['Tarih:', new Date().toLocaleDateString('tr-TR')],
    [''],
    ['Haftalık Özet Metrikleri'],
    ['Yeni Leadler:', weeklyReport?.yeni_lead_sayisi || 0],
    ['AI Mesajları:', weeklyReport?.ai_mesaj_sayisi || 0],
    ['Kazanılan Dakika:', weeklyReport?.kazanilan_dakika || 0],
    ['Kapanan Satışlar:', weeklyReport?.kapanan_satislar || 0],
    ['Toplanan Tutar:', formatTurkishCurrency(weeklyReport?.toplanan_tutar || 0)],
    [''],
    ['Geciken Ödemeler'],
    ['Müşteri', 'Açıklama', 'Tutar', 'Vade Tarihi'],
    ...overduePayments?.slice(0, 10).map(payment => [
      payment.musteriler?.ad_soyad || '',
      payment.aciklama || '',
      formatTurkishCurrency(payment.tutar || 0),
      payment.vade_tarihi || ''
    ]) || [],
    [''],
    ['Yaklaşan Sözleşme Bitimleri'],
    ['Müşteri', 'Hizmet Tipi', 'Bitiş Tarihi', 'Tutar'],
    ...expiringContracts?.slice(0, 10).map(contract => [
      contract.musteriler?.ad_soyad || '',
      contract.hizmet_tipi || '',
      contract.bitis_tarihi || '',
      formatTurkishCurrency(contract.sozlesme_bedeli || 0)
    ]) || []
  ]

  const csvString = csvContent.map(row =>
    Array.isArray(row) ? row.join(',') : row
  ).join('\n')

  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `dashboard-raporu-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function DashboardPage() {
  const { data: weeklyReport, isLoading: weeklyLoading, error: weeklyError } = useWeeklyReport()
  const { data: salesPipeline, isLoading: pipelineLoading } = useSalesPipeline()
  const { data: overduePayments, isLoading: overdueLoading } = useOverduePayments()
  const { data: expiringContracts, isLoading: contractsLoading } = useExpiringContracts(30)
  const { data: weeklyLeadTrend, isLoading: leadTrendLoading } = useWeeklyLeadTrend()

  // Process pipeline data for charts
  const pipelineStats = (salesPipeline as SalesPipelineWithCustomer[])?.reduce((acc, deal) => {
    const status = deal.satis_durumu || 'Diğer'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const pipelineChartData = Object.entries(pipelineStats).map(([name, value]) => ({
    name,
    value,
    fill: getStatusColor(name)
  }))

  // Real lead trend data
  const leadsChartData = weeklyLeadTrend || []

  if (weeklyError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Dashboard verilerini yüklerken hata oluştu.</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Son 7 günlük performans özeti ve önemli uyarılar
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            try {
              exportDashboardReport(weeklyReport, overduePayments || [], expiringContracts || [])
              toast.success('Dashboard raporu indirildi!')
            } catch {
              toast.error('Rapor indirirken hata oluştu')
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Rapor İndir
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Yeni Lead&apos;ler"
          value={weeklyLoading ? '...' : (weeklyReport?.yeni_lead_sayisi?.toString() || '0')}
          change="+12%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        
        <MetricCard
          title="AI Mesajları"
          value={weeklyLoading ? '...' : (weeklyReport?.ai_mesaj_sayisi?.toString() || '0')}
          subtitle={`${weeklyReport?.kazanilan_dakika || 0} dk. kazanıldı`}
          change="+8%"
          trend="up"
          icon={<MessageSquare className="h-4 w-4" />}
        />
        
        <MetricCard
          title="Kapanan Satışlar"
          value={weeklyLoading ? '...' : (weeklyReport?.kapanan_satislar?.toString() || '0')}
          change="+15%"
          trend="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <MetricCard
          title="Toplanan Tutar"
          value={weeklyLoading ? '...' : formatTurkishCurrency(weeklyReport?.toplanan_tutar || 0)}
          change="+23%"
          trend="up"
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Haftalık Lead Trendi</CardTitle>
            <CardDescription>
              Son 7 günde gelen lead sayıları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leadTrendLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-500">Yükleniyor...</div>
              </div>
            ) : (
              <SimpleBarChart
                data={leadsChartData}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satış Pipeline Dağılımı</CardTitle>
            <CardDescription>
              Mevcut deal&apos;ların durumlarına göre dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-500">Yükleniyor...</div>
              </div>
            ) : (
              <SimplePieChart 
                data={pipelineChartData}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Geciken Ödemeler
            </CardTitle>
            <CardDescription>
              Vadesi geçmiş ödemeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueLoading ? (
              <div className="py-4">Yükleniyor...</div>
            ) : overduePayments && overduePayments.length > 0 ? (
              <div className="space-y-3">
                {(overduePayments as PaymentWithCustomer[]).slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{payment.musteriler?.ad_soyad}</div>
                      <div className="text-sm text-gray-600">{payment.aciklama}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        {formatTurkishCurrency(payment.tutar || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.vade_tarihi && getRelativeTime(payment.vade_tarihi)}
                      </div>
                    </div>
                  </div>
                ))}
                {overduePayments.length > 5 && (
                  <div className="text-sm text-center text-gray-500 pt-2">
                    +{overduePayments.length - 5} tane daha...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Geciken ödeme bulunmuyor 🎉
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Contracts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Yaklaşan Sözleşme Bitimleri
            </CardTitle>
            <CardDescription>
              30 gün içinde bitecek sözleşmeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="py-4">Yükleniyor...</div>
            ) : expiringContracts && expiringContracts.length > 0 ? (
              <div className="space-y-3">
                {(expiringContracts as ContractWithCustomer[]).slice(0, 5).map((contract) => (
                  <div key={contract.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{contract.musteriler?.ad_soyad}</div>
                      <div className="text-sm text-gray-600">{contract.hizmet_tipi}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {contract.bitis_tarihi && getRelativeTime(contract.bitis_tarihi)}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTurkishCurrency(contract.sozlesme_bedeli || 0)}
                      </div>
                    </div>
                  </div>
                ))}
                {expiringContracts.length > 5 && (
                  <div className="text-sm text-center text-gray-500 pt-2">
                    +{expiringContracts.length - 5} tane daha...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Yaklaşan sözleşme bitimi yok ✅
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Yeni Lead': '#3b82f6',
    'Görüşülüyor': '#f59e0b', 
    'Teklif Atıldı': '#8b5cf6',
    'Kazanıldı': '#10b981',
    'Kaybedildi': '#ef4444',
    'Cevap Yok': '#6b7280'
  }
  return colors[status] || '#6b7280'
}
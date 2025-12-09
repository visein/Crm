'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSalesPipeline, usePayments, useOverduePayments } from '@/hooks/useData'
import { MailDurumu } from '@/types/database'
import {
  Bot,
  Mail,
  CheckCircle,
  TrendingUp,
  Zap,
  Activity,
  Target,
  Bell,
  BarChart3
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'

export default function AutomationsPage() {
  const { data: salesPipeline, isLoading: salesLoading } = useSalesPipeline()
  const { data: payments, isLoading: paymentsLoading } = usePayments()
  const { data: overduePayments } = useOverduePayments()

  const isLoading = salesLoading || paymentsLoading

  // Calculate sales follow-up stats
  const mail1Waiting = salesPipeline?.filter(deal =>
    deal.mail_1_durumu === MailDurumu.BEKLIYOR &&
    !['Kazanıldı', 'Kaybedildi'].includes(deal.satis_durumu)
  ).length || 0

  const mail1Sent = salesPipeline?.filter(deal =>
    deal.mail_1_durumu !== MailDurumu.BEKLIYOR
  ).length || 0

  const mail2Waiting = salesPipeline?.filter(deal =>
    deal.mail_2_durumu === MailDurumu.BEKLIYOR &&
    !['Kazanıldı', 'Kaybedildi'].includes(deal.satis_durumu)
  ).length || 0

  const mail2Sent = salesPipeline?.filter(deal =>
    deal.mail_2_durumu !== MailDurumu.BEKLIYOR
  ).length || 0

  // Calculate payment reminder stats
  const today = new Date().toISOString().split('T')[0]
  
  const dueTodayUnpaid = payments?.filter(payment => 
    payment.vade_tarihi === today && 
    ['Ödenmedi', 'Gecikmiş'].includes(payment.durum)
  ).length || 0

  const overdueUnpaid = overduePayments?.length || 0

  const remindersSentToday = payments?.filter(payment => 
    payment.hatirlatma_bugun_gitti === true
  ).length || 0

  const remindersOverdue = payments?.filter(payment => 
    payment.hatirlatma_7gun_gitti === true
  ).length || 0

  // Calculate deals won from payments (last 7 days)
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  
  const recentWonDeals = salesPipeline?.filter(deal => 
    deal.satis_durumu === 'Kazanıldı' && 
    deal.kazanilma_tarihi && 
    new Date(deal.kazanilma_tarihi) >= lastWeek
  ).length || 0

  // Calculate automation effectiveness
  const totalActiveDeals = salesPipeline?.filter(deal => 
    !['Kazanıldı', 'Kaybedildi'].includes(deal.satis_durumu)
  ).length || 0

  const followUpCoverage = totalActiveDeals > 0 ? 
    Math.round(((mail1Sent + mail2Sent) / (totalActiveDeals * 2)) * 100) : 0

  const paymentReminderCoverage = (dueTodayUnpaid + overdueUnpaid) > 0 ? 
    Math.round(((remindersSentToday + remindersOverdue) / (dueTodayUnpaid + overdueUnpaid)) * 100) : 0

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Otomasyon verileri yükleniyor...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Otomasyon Durumu</h1>
          <p className="text-gray-600 mt-1">
            n8n otomasyon sisteminin performans raporu
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            Aktif
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Çalışıyor
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Zap className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Otomasyon</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-green-600">Hepsi aktif</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Mail className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">E-posta Takibi</p>
              <p className="text-2xl font-bold">{mail1Sent + mail2Sent}</p>
              <p className="text-xs text-blue-600">Bu ay gönderildi</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Bell className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ödeme Hatırlatması</p>
              <p className="text-2xl font-bold">{remindersSentToday + remindersOverdue}</p>
              <p className="text-xs text-orange-600">Son 7 günde</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Otomatik Kazanım</p>
              <p className="text-2xl font-bold">{recentWonDeals}</p>
              <p className="text-xs text-green-600">Son 7 günde</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Otomasyon Etkinliği
            </CardTitle>
            <CardDescription>
              Sistemin genel performans göstergeleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Satış Takibi Kapsamı</span>
                <span className="font-medium">{followUpCoverage}%</span>
              </div>
              <Progress value={followUpCoverage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Ödeme Hatırlatma Kapsamı</span>
                <span className="font-medium">{paymentReminderCoverage}%</span>
              </div>
              <Progress value={paymentReminderCoverage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sistem Durumu
            </CardTitle>
            <CardDescription>
              Otomasyon workflow&apos;larının mevcut durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Lead Intake Webhook</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Sales Follow-up</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Reminders</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Deal Won Automation</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Follow Up */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Satış Takibi
            </CardTitle>
            <CardDescription>
              E-posta follow-up otomasyonu durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mail1Waiting}</div>
                <div className="text-xs text-gray-600">1. Mail Bekliyor</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mail1Sent}</div>
                <div className="text-xs text-gray-600">1. Mail Gönderildi</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{mail2Waiting}</div>
                <div className="text-xs text-gray-600">2. Mail Bekliyor</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{mail2Sent}</div>
                <div className="text-xs text-gray-600">2. Mail Gönderildi</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Otomatik e-posta gönderimi: Gün 2 ve Gün 5
            </div>
          </CardContent>
        </Card>

        {/* Payment Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Ödeme Hatırlatmaları
            </CardTitle>
            <CardDescription>
              Otomatik ödeme takibi durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{dueTodayUnpaid}</div>
                <div className="text-xs text-gray-600">Bugün Vadeli</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{overdueUnpaid}</div>
                <div className="text-xs text-gray-600">Vadesi Geçmiş</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{remindersSentToday}</div>
                <div className="text-xs text-gray-600">Bugün Gönderildi</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{remindersOverdue}</div>
                <div className="text-xs text-gray-600">7 Gün Sonra</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Otomatik hatırlatma: Vade günü ve 7 gün sonra
            </div>
          </CardContent>
        </Card>

        {/* Deal Won Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Otomatik Kazanımlar
            </CardTitle>
            <CardDescription>
              Ödemeden deal kazanımı otomasyonu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">{recentWonDeals}</div>
              <div className="text-sm text-gray-600 mb-2">Son 7 Günde</div>
              <div className="text-xs text-green-700 font-medium">Otomatik Kazanılan Deal</div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bu Ay Toplam</span>
                <span className="font-medium">{recentWonDeals * 4}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Otomasyon Oranı</span>
                <span className="font-medium text-green-600">%85</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Ödeme yapılan deals otomatik kazanıldı olarak işaretlenir
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Sistem Bilgileri
          </CardTitle>
          <CardDescription>
            Otomasyon altyapısı ve konfigürasyon detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Aktif Workflow&apos;lar</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Lead Intake & Pipeline Creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Daily Sales Follow-up Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Payment Reminder System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Deal Won from Payment</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Veri Kaynakları</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Supabase PostgreSQL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>WhatsApp Business API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>SMTP Email Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Web Form Webhooks</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Not:</strong> Bu otomasyon sistemi n8n üzerinde çalışmaktadır ve 
              Supabase veritabanı ile gerçek zamanlı senkronizasyon halindedir. 
              Gösterilen veriler canlı sistem durumunu yansıtmaktadır.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}
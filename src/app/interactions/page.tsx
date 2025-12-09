'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInteractions, useCustomers } from '@/hooks/useData'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Bot,
  User,
  UserCheck,
  Phone,
  Mail,
  Clock,
  Building,
  Smartphone
} from 'lucide-react'
import type { Etkilesim, Musteri } from '@/types/database'
import { AppLayout } from '@/components/layout/AppLayout'

// Extended type for interactions with customer info
type InteractionWithCustomer = Etkilesim & {
  musteriler?: {
    ad_soyad: string
    sirket_adi?: string | null
    telefon?: string | null
  } | null
}

export default function InteractionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [senderFilter, setSenderFilter] = useState<string>('all')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'conversation'>('list')
  
  const { data: interactions, isLoading, error } = useInteractions()
  const { data: customers } = useCustomers()

  // Filter interactions
  const filteredInteractions = interactions?.filter((interaction: InteractionWithCustomer) => {
    const matchesSearch = searchQuery === '' || 
      interaction.musteriler?.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.musteriler?.sirket_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.mesaj_icerigi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.ozet_konu?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPlatform = platformFilter === 'all' || interaction.platform === platformFilter
    const matchesSender = senderFilter === 'all' || interaction.gonderen === senderFilter
    const matchesCustomer = !selectedCustomerId || interaction.musteri_id === selectedCustomerId
    
    return matchesSearch && matchesPlatform && matchesSender && matchesCustomer
  }) || []

  // Group interactions by customer and session
  const groupedInteractions = filteredInteractions.reduce((acc: Record<string, InteractionWithCustomer[]>, interaction: InteractionWithCustomer) => {
    const key = `${interaction.musteri_id}-${interaction.session_id || 'default'}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(interaction)
    return acc
  }, {})

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'ai':
        return <Bot className="h-4 w-4 text-blue-600" />
      case 'musteri':
        return <User className="h-4 w-4 text-gray-600" />
      case 'temsilci':
        return <UserCheck className="h-4 w-4 text-green-600" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getSenderBadge = (sender: string) => {
    switch (sender) {
      case 'ai':
        return <Badge variant="default" className="flex items-center gap-1">
          <Bot className="h-3 w-3" />
          AI Bot
        </Badge>
      case 'musteri':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Müşteri
        </Badge>
      case 'temsilci':
        return <Badge variant="outline" className="flex items-center gap-1">
          <UserCheck className="h-3 w-3" />
          Temsilci
        </Badge>
      default:
        return <Badge variant="outline">{sender}</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'whatsapp':
        return <Smartphone className="h-4 w-4 text-green-600" />
      case 'phone':
        return <Phone className="h-4 w-4 text-blue-600" />
      case 'email':
        return <Mail className="h-4 w-4 text-purple-600" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-400" />
    }
  }

  // Calculate stats
  const totalInteractions = interactions?.length || 0
  const aiMessages = interactions?.filter(i => i.gonderen === 'ai').length || 0
  const customerMessages = interactions?.filter(i => i.gonderen === 'musteri').length || 0
  const agentMessages = interactions?.filter(i => i.gonderen === 'temsilci').length || 0

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Etkileşim verilerini yüklerken hata oluştu.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Etkileşimler & Konuşmalar</h1>
          <p className="text-gray-600 mt-1">
            AI bot konuşmalarını ve müşteri etkileşimlerini görüntüleyin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
              <p className="text-2xl font-bold">{totalInteractions}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Bot className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Mesajları</p>
              <p className="text-2xl font-bold">{aiMessages}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Müşteri</p>
              <p className="text-2xl font-bold">{customerMessages}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Temsilci</p>
              <p className="text-2xl font-bold">{agentMessages}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler ve Arama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri, şirket veya mesaj içeriği ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Platformlar</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="phone">Telefon</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select value={senderFilter} onValueChange={setSenderFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Gönderen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Göndericiler</SelectItem>
                <SelectItem value="ai">AI Bot</SelectItem>
                <SelectItem value="musteri">Müşteri</SelectItem>
                <SelectItem value="temsilci">Temsilci</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedCustomerId?.toString() || 'all'}
              onValueChange={(value) => setSelectedCustomerId(value === 'all' ? null : parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Müşteri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Müşteriler</SelectItem>
                {customers?.map((customer: Musteri) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.ad_soyad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'conversation')}>
        <TabsList>
          <TabsTrigger value="list">Liste Görünümü</TabsTrigger>
          <TabsTrigger value="conversation">Konuşma Görünümü</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Etkileşimler</CardTitle>
              <CardDescription>
                {filteredInteractions.length} etkileşim gösteriliyor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Yükleniyor...</div>
                </div>
              ) : filteredInteractions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Etkileşim bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Arama kriterlerinizi değiştirerek tekrar deneyin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInteractions.map((interaction: InteractionWithCustomer) => (
                    <div key={interaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getSenderIcon(interaction.gonderen!)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSenderBadge(interaction.gonderen!)}
                              {getPlatformIcon(interaction.platform!)}
                              <span className="text-sm text-gray-600">
                                {interaction.musteriler?.ad_soyad}
                              </span>
                              {interaction.musteriler?.sirket_adi && (
                                <span className="text-sm text-gray-500">
                                  ({interaction.musteriler.sirket_adi})
                                </span>
                              )}
                            </div>
                            
                            {interaction.ozet_konu && (
                              <div className="font-medium text-gray-900 mb-2">
                                {interaction.ozet_konu}
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded max-w-2xl">
                              {interaction.mesaj_icerigi && interaction.mesaj_icerigi.length > 200
                                ? `${interaction.mesaj_icerigi.substring(0, 200)}...`
                                : interaction.mesaj_icerigi}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(interaction.created_at)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(interaction.created_at)}
                          </div>
                          {interaction.session_id && (
                            <div className="text-xs text-gray-400 mt-1">
                              Session: {interaction.session_id.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Konuşma Geçmişi</CardTitle>
              <CardDescription>
                {Object.keys(groupedInteractions).length} konuşma grubu gösteriliyor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Yükleniyor...</div>
                </div>
              ) : Object.keys(groupedInteractions).length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Konuşma bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Filtreleri değiştirerek tekrar deneyin.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedInteractions).map(([sessionKey, sessionInteractions]) => {
                    const customer = (sessionInteractions as InteractionWithCustomer[])[0]?.musteriler
                    const sortedInteractions = (sessionInteractions as InteractionWithCustomer[]).sort((a: InteractionWithCustomer, b: InteractionWithCustomer) =>
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                    
                    return (
                      <div key={sessionKey} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">{customer?.ad_soyad}</span>
                            {customer?.sirket_adi && (
                              <span className="text-sm text-gray-500">({customer.sirket_adi})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sortedInteractions.length} mesaj - {formatRelativeTime(sortedInteractions[0]?.created_at)}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {sortedInteractions.map((interaction: InteractionWithCustomer) => (
                            <div 
                              key={interaction.id} 
                              className={`flex ${interaction.gonderen === 'musteri' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                interaction.gonderen === 'musteri' 
                                  ? 'bg-gray-100 text-gray-900' 
                                  : interaction.gonderen === 'ai'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-green-500 text-white'
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {getSenderIcon(interaction.gonderen!)}
                                  <span className="text-xs opacity-75">
                                    {interaction.gonderen === 'ai' ? 'AI Bot' : 
                                     interaction.gonderen === 'musteri' ? 'Müşteri' : 'Temsilci'}
                                  </span>
                                  <span className="text-xs opacity-50">
                                    {new Date(interaction.created_at).toLocaleTimeString('tr-TR')}
                                  </span>
                                </div>
                                
                                {interaction.ozet_konu && (
                                  <div className="text-sm font-medium mb-1">
                                    {interaction.ozet_konu}
                                  </div>
                                )}
                                
                                <div className="text-sm">
                                  {interaction.mesaj_icerigi}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  )
}
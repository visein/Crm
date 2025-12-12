'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers, useSearchCustomers } from '@/hooks/useData'
import { formatDate } from '@/lib/utils'
import { CustomerDetailModal } from '@/components/modals/CustomerDetailModal'
import { AddCustomerModal } from '@/components/modals/AddCustomerModal'
import {
  Search,
  Plus,
  Filter,
  Users,
  Building,
  Phone,
  Mail,
  Eye
} from 'lucide-react'
import type { Musteri } from '@/types/database'

export function CustomersContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // Use search if query exists, otherwise get all customers
  const { data: searchResults } = useSearchCustomers(searchQuery)
  const { data: allCustomers, isLoading, error } = useCustomers()
  
  const customers = searchQuery.length > 0 ? searchResults : allCustomers

  // Filter customers based on selected filters
  const filteredCustomers = customers?.filter((customer: Musteri) => {
    if (sourceFilter !== 'all' && customer.kaynak !== sourceFilter) {
      return false
    }
    return true
  }) || []

  const handleViewCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedCustomerId(null)
  }

  const handleAddCustomer = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Müşteri verilerini yüklerken hata oluştu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Müşteriler & Lead&apos;ler</h1>
          <p className="text-gray-600 mt-1">
            Tüm müşterilerinizi ve potansiyel müşterilerinizi yönetin
          </p>
        </div>
        <Button onClick={handleAddCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
              <p className="text-2xl font-bold">{customers?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Building className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kurumsal</p>
              <p className="text-2xl font-bold">
                {customers?.filter(c => c.sirket_adi).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Phone className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Telefon Kayıtlı</p>
              <p className="text-2xl font-bold">
                {customers?.filter(c => c.telefon).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Mail className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Email Kayıtlı</p>
              <p className="text-2xl font-bold">
                {customers?.filter(c => c.email).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                  placeholder="Ad, telefon, email veya şirket adı ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Kaynak Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                <SelectItem value="Web">Web Sitesi</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Phone">Telefon</SelectItem>
                <SelectItem value="Referral">Referans</SelectItem>
                <SelectItem value="Social Media">Sosyal Medya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
          <CardDescription>
            {filteredCustomers.length} müşteri gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Yükleniyor...</div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Müşteri bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Yeni bir müşteri ekleyerek başlayın.
              </p>
              <Button className="mt-4" onClick={handleAddCustomer}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Müşteriyi Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Şirket/Sektör</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: Musteri) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.ad_soyad || 'İsimsiz Müşteri'}</div>
                          {customer.dogum_tarihi && (
                            <div className="text-sm text-gray-500">
                              {formatDate(customer.dogum_tarihi)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {customer.telefon && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {customer.telefon}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          {customer.sirket_adi && (
                            <div className="font-medium">{customer.sirket_adi}</div>
                          )}
                          {customer.sektor && (
                            <div className="text-sm text-gray-500">{customer.sektor}</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {customer.kaynak}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(customer.created_at)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Görüntüle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        customerId={selectedCustomerId}
      />
      
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
    </div>
  )
}
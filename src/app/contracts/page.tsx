'use client'

import { useState } from 'react'
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
import { useContracts, useExpiringContracts } from '@/hooks/useData'
import { formatDate, formatCurrency, getDaysUntil } from '@/lib/utils'
import { AddContractModal } from '@/components/modals/AddContractModal'
import { EditContractModal } from '@/components/modals/EditContractModal'
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Building,
  User
} from 'lucide-react'
import type { Sozlesme } from '@/types/database'
import { AppLayout } from '@/components/layout/AppLayout'

// Extended type for contracts with customer info
type ContractWithCustomer = Sozlesme & {
  musteriler?: {
    ad_soyad: string | null
    sirket_adi?: string | null
  } | null
}

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<ContractWithCustomer | null>(null)
  
  const { data: contracts, isLoading, error } = useContracts()
  const { data: expiringContracts } = useExpiringContracts(30)

  // Filter contracts
  const filteredContracts = contracts?.filter((contract: ContractWithCustomer) => {
    const matchesSearch = searchQuery === '' || 
      contract.musteriler?.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.musteriler?.sirket_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.hizmet_tipi?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesService = serviceFilter === 'all' || contract.hizmet_tipi === serviceFilter
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && contract.aktif_mi) ||
      (statusFilter === 'inactive' && !contract.aktif_mi) ||
      (statusFilter === 'expiring' && contract.aktif_mi && contract.bitis_tarihi && getDaysUntil(contract.bitis_tarihi) <= 30 && getDaysUntil(contract.bitis_tarihi) >= 0)
    
    return matchesSearch && matchesService && matchesStatus
  }) || []

  const getContractStatusBadge = (contract: ContractWithCustomer) => {
    if (!contract.aktif_mi) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Pasif
      </Badge>
    }

    if (contract.bitis_tarihi) {
      const daysUntil = getDaysUntil(contract.bitis_tarihi)
      
      if (daysUntil < 0) {
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Süresi Geçmiş
        </Badge>
      } else if (daysUntil <= 30) {
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {daysUntil} Gün Kaldı
        </Badge>
      }
    }

    return <Badge variant="default" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Aktif
    </Badge>
  }

  const handleAddContract = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  const handleEditContract = (contract: ContractWithCustomer) => {
    setSelectedContract(contract)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedContract(null)
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Sözleşme verilerini yüklerken hata oluştu.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Sözleşmeler</h1>
          <p className="text-gray-600 mt-1">
            Müşteri sözleşmelerini yönetin ve takip edin
          </p>
        </div>
        <Button onClick={handleAddContract}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sözleşme
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Sözleşme</p>
              <p className="text-2xl font-bold">{contracts?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Sözleşme</p>
              <p className="text-2xl font-bold">
                {contracts?.filter(c => c.aktif_mi).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Yaklaşan Bitim</p>
              <p className="text-2xl font-bold">
                {expiringContracts?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aylık Toplam</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  contracts?.filter(c => c.aktif_mi && c.odeme_periyodu === 'Aylık')
                    .reduce((sum, c) => sum + (c.sozlesme_bedeli || 0), 0) || 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for Expiring Contracts */}
      {expiringContracts && expiringContracts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dikkat: Yaklaşan Sözleşme Bitimleri
            </CardTitle>
            <CardDescription className="text-orange-700">
              {expiringContracts.length} sözleşmenin süresi 30 gün içinde dolacak.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
                  placeholder="Müşteri, şirket veya hizmet türü ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hizmet Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hizmetler</SelectItem>
                <SelectItem value="Sanal Ofis">Sanal Ofis</SelectItem>
                <SelectItem value="Hazır Ofis">Hazır Ofis</SelectItem>
                <SelectItem value="Coworking">Coworking</SelectItem>
                <SelectItem value="Toplantı">Toplantı Salonu</SelectItem>
                <SelectItem value="Etkinlik">Etkinlik</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="expiring">Yaklaşan Bitim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sözleşme Listesi</CardTitle>
          <CardDescription>
            {filteredContracts.length} sözleşme gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Yükleniyor...</div>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sözleşme bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Yeni bir sözleşme ekleyerek başlayın.
              </p>
              <Button className="mt-4" onClick={handleAddContract}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Sözleşmeyi Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Hizmet</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Bedel & Periyot</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract: ContractWithCustomer) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{contract.musteriler?.ad_soyad || 'İsimsiz Müşteri'}</span>
                          </div>
                          {contract.musteriler?.sirket_adi && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {contract.musteriler.sirket_adi}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {contract.hizmet_tipi}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {contract.baslangic_tarihi ? formatDate(contract.baslangic_tarihi) : 'Belirtilmemiş'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.bitis_tarihi ? formatDate(contract.bitis_tarihi) : 'Belirtilmemiş'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {contract.sozlesme_bedeli ? formatCurrency(contract.sozlesme_bedeli) : 'Belirtilmemiş'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.odeme_periyodu}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getContractStatusBadge(contract)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditContract(contract)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
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

      {/* Add Contract Modal */}
      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        contract={selectedContract}
      />
    </div>
    </AppLayout>
  )
}
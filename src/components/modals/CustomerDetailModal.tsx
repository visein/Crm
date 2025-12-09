'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useCustomerById,
  useCustomerDeals,
  useCustomerContracts,
  useCustomerPayments,
  useCustomerInteractions,
  useCustomerOperations,
  useUpdateCustomer
} from '@/hooks/useData'
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import {
  User,
  Building,
  Phone,
  Mail,
  MessageCircle,
  Edit,
  Save,
  X,
  Plus
} from 'lucide-react'
import type { Musteri, SatisTakip, Sozlesme, Odeme, Etkilesim } from '@/types/database'
import { AddDealModal } from './AddDealModal'
import { EditDealModal } from './EditDealModal'

interface CustomerDetailModalProps {
  customerId: number | null
  isOpen: boolean
  onClose: () => void
}

export function CustomerDetailModal({ customerId, isOpen, onClose }: CustomerDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Musteri>>({})
  
  // Deal modal states
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [showEditDeal, setShowEditDeal] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<SatisTakip | null>(null)

  const { data: customer, isLoading } = useCustomerById(customerId)
  const { data: deals } = useCustomerDeals(customerId)
  const { data: contracts } = useCustomerContracts(customerId)
  const { data: payments } = useCustomerPayments(customerId)
  const { data: interactions } = useCustomerInteractions(customerId)
  const { data: operations } = useCustomerOperations(customerId)
  const updateCustomer = useUpdateCustomer()

  const handleEdit = () => {
    if (customer) {
      setEditForm({
        ad_soyad: customer.ad_soyad,
        telefon: customer.telefon || '',
        email: customer.email || '',
        sirket_adi: customer.sirket_adi || '',
        sektor: customer.sektor || '',
        kaynak: customer.kaynak,
        notlar: customer.notlar || ''
      })
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (customer && customerId) {
      try {
        await updateCustomer.mutateAsync({
          id: customerId,
          updates: editForm
        })
        setIsEditing(false)
        toast.success('Müşteri bilgileri güncellendi!')
      } catch (error) {
        handleAsyncError(error, 'CustomerDetail-SaveCustomer')
        toast.error('Müşteri bilgileri güncellenemedi!')
      }
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({})
  }

  if (!isOpen || !customerId) {
    return null
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              Müşteri Detayları
            </DialogTitle>
            <DialogDescription>
              Müşteri bilgileri yükleniyor...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!customer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              Müşteri Detayları
            </DialogTitle>
            <DialogDescription>
              Müşteri bilgilerine erişilemiyor
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Müşteri bulunamadı</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              {customer.ad_soyad}
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={updateCustomer.isPending}>
                    <Save className="h-4 w-4 mr-1" />
                    Kaydet
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    İptal
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Müşteri detayları ve ilişkili veriler
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="deals">Satışlar</TabsTrigger>
            <TabsTrigger value="contracts">Sözleşmeler</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="interactions">Etkileşimler</TabsTrigger>
            <TabsTrigger value="operations">Operasyon</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad_soyad">Ad Soyad</Label>
                      <Input
                        id="ad_soyad"
                        value={editForm.ad_soyad || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, ad_soyad: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input
                        id="telefon"
                        value={editForm.telefon || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, telefon: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sirket_adi">Şirket Adı</Label>
                      <Input
                        id="sirket_adi"
                        value={editForm.sirket_adi || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, sirket_adi: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sektor">Sektör</Label>
                      <Input
                        id="sektor"
                        value={editForm.sektor || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, sektor: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="kaynak">Kaynak</Label>
                      <Select 
                        value={editForm.kaynak} 
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, kaynak: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Web">Web Sitesi</SelectItem>
                          <SelectItem value="Phone">Telefon</SelectItem>
                          <SelectItem value="Referral">Referans</SelectItem>
                          <SelectItem value="Social Media">Sosyal Medya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="notlar">Notlar</Label>
                      <Textarea
                        id="notlar"
                        value={editForm.notlar || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notlar: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{customer.ad_soyad}</span>
                      </div>
                      {customer.telefon && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{customer.telefon}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.sirket_adi && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{customer.sirket_adi}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {customer.sektor && (
                        <div>
                          <span className="text-sm text-gray-500">Sektör:</span>
                          <p>{customer.sektor}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Kaynak:</span>
                        <div className="mt-1">
                          <Badge variant="outline">{customer.kaynak}</Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Kayıt Tarihi:</span>
                        <p>{formatDate(customer.created_at)}</p>
                      </div>
                    </div>
                    {customer.notlar && (
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">Notlar:</span>
                        <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{customer.notlar}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Satış Takibi</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddDeal(true)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Satış Ekle
                </Button>
              </CardHeader>
              <CardContent>
                {deals && deals.length > 0 ? (
                  <div className="space-y-3">
                    {deals.map((deal: SatisTakip) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{deal.ilgilenilen_hizmet}</div>
                          <div className="text-sm text-gray-500">
                            Talep Tarihi: {formatDate(deal.talep_tarihi)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Mail: {deal.mail_1_durumu} | {deal.mail_2_durumu}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge
                              variant={deal.satis_durumu === 'Kazanıldı' ? 'default' :
                                     deal.satis_durumu === 'Kaybedildi' ? 'destructive' : 'secondary'}
                            >
                              {deal.satis_durumu}
                            </Badge>
                            {deal.kazanilma_tarihi && (
                              <div className="text-sm text-gray-500 mt-1">
                                {formatDate(deal.kazanilma_tarihi)}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDeal(deal)
                              setShowEditDeal(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Henüz satış kaydı bulunmuyor</p>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDeal(true)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      İlk Satış Kaydını Ekle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sözleşmeler</CardTitle>
              </CardHeader>
              <CardContent>
                {contracts && contracts.length > 0 ? (
                  <div className="space-y-3">
                    {contracts.map((contract: Sozlesme) => (
                      <div key={contract.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{contract.hizmet_tipi}</div>
                          <div className="text-sm text-gray-500">
                            {contract.baslangic_tarihi ? formatDate(contract.baslangic_tarihi) : 'Belirtilmemiş'} - {contract.bitis_tarihi ? formatDate(contract.bitis_tarihi) : 'Belirtilmemiş'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.odeme_periyodu}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{contract.sozlesme_bedeli ? formatCurrency(contract.sozlesme_bedeli) : 'Belirtilmemiş'}</div>
                          <Badge variant={contract.aktif_mi ? 'default' : 'secondary'}>
                            {contract.aktif_mi ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz sözleşme bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ödemeler</CardTitle>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment: Odeme) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{payment.aciklama}</div>
                          <div className="text-sm text-gray-500">
                            Vade: {payment.vade_tarihi ? formatDate(payment.vade_tarihi) : 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{payment.tutar ? formatCurrency(payment.tutar) : 'Belirtilmemiş'}</div>
                          <Badge 
                            variant={payment.durum === 'Ödendi' ? 'default' : 
                                   payment.durum === 'Gecikmiş' ? 'destructive' : 'secondary'}
                          >
                            {payment.durum}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz ödeme kaydı bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Son Etkileşimler</CardTitle>
              </CardHeader>
              <CardContent>
                {interactions && interactions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {interactions.map((interaction: Etkilesim) => (
                      <div key={interaction.id} className="flex items-start gap-3 p-3 border rounded">
                        <MessageCircle className="h-4 w-4 mt-1 text-gray-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {interaction.gonderen}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(interaction.created_at)}
                            </span>
                          </div>
                          {interaction.ozet_konu && (
                            <div className="font-medium mt-1">{interaction.ozet_konu}</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">
                            {interaction.mesaj_icerigi?.substring(0, 200)}
                            {interaction.mesaj_icerigi && interaction.mesaj_icerigi.length > 200 && '...'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz etkileşim kaydı bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Operasyon Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                {operations ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>WiFi Adı</Label>
                        <p className="mt-1">{operations.wifi_adi || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <Label>WiFi Şifresi</Label>
                        <p className="mt-1">{operations.wifi_sifresi || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <Label>Kapı Şifresi</Label>
                        <p className="mt-1">{operations.kapi_sifresi || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <Label>Kargo Tercihi</Label>
                        <p className="mt-1">{operations.kargo_tercihi || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    {operations.ozel_notlar && (
                      <div>
                        <Label>Özel Notlar</Label>
                        <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{operations.ozel_notlar}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz operasyon detayı bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Deal Modals */}
        {customerId && (
          <>
            <AddDealModal
              customerId={customerId}
              isOpen={showAddDeal}
              onClose={() => setShowAddDeal(false)}
            />
            <EditDealModal
              deal={selectedDeal}
              isOpen={showEditDeal}
              onClose={() => {
                setShowEditDeal(false)
                setSelectedDeal(null)
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
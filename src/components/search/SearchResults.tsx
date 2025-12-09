'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  User,
  Building,
  Phone,
  Mail,
  TrendingUp,
  FileText,
  CreditCard,
  Search
} from 'lucide-react'
import { CustomerDetailModal } from '@/components/modals/CustomerDetailModal'
import type { Musteri, SatisTakip, Sozlesme, Odeme } from '@/types/database'

interface SearchResultsProps {
  isOpen: boolean
  onClose: () => void
  query: string
  results: {
    customers: Musteri[]
    deals: (SatisTakip & {
      musteriler?: {
        ad_soyad: string
        sirket_adi?: string | null
        telefon?: string | null
      } | null
    })[]
    contracts: (Sozlesme & {
      musteriler?: {
        ad_soyad: string
        sirket_adi?: string | null
        telefon?: string | null
      } | null
    })[]
    payments: (Odeme & {
      musteriler?: {
        ad_soyad: string
        sirket_adi?: string | null
        telefon?: string | null
      } | null
    })[]
  }
  isLoading: boolean
}

export function SearchResults({ isOpen, onClose, query, results, isLoading }: SearchResultsProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)

  const totalResults = results.customers.length + results.deals.length + 
                      results.contracts.length + results.payments.length

  const handleCustomerClick = (customerId: number) => {
    setSelectedCustomerId(customerId)
    setShowCustomerDetail(true)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Arama Sonuçları
            </DialogTitle>
            <DialogDescription>
              &ldquo;{query}&rdquo; için {totalResults} sonuç bulundu
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Aranıyor...</div>
              </div>
            ) : totalResults === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">&ldquo;{query}&rdquo; için sonuç bulunamadı</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Farklı kelimeler veya daha genel terimler deneyin
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Customers */}
                {results.customers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">Müşteriler ({results.customers.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {results.customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCustomerClick(customer.id)}
                        >
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {customer.ad_soyad}
                            </div>
                            <div className="text-sm text-gray-500 space-x-3">
                              {customer.telefon && (
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.telefon}
                                </span>
                              )}
                              {customer.sirket_adi && (
                                <span className="inline-flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {customer.sirket_adi}
                                </span>
                              )}
                              {customer.email && (
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{customer.kaynak}</Badge>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(customer.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales Deals */}
                {results.deals.length > 0 && (
                  <>
                    <div className="h-[1px] w-full bg-border my-4" />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold">Satış Kayıtları ({results.deals.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {results.deals.map((deal) => (
                          <div
                            key={deal.id}
                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => deal.musteri_id && handleCustomerClick(deal.musteri_id)}
                          >
                            <div>
                              <div className="font-medium">{deal.ilgilenilen_hizmet}</div>
                              <div className="text-sm text-gray-500">
                                {deal.musteriler?.ad_soyad || 'Bilinmeyen Müşteri'}
                                {deal.musteriler?.sirket_adi && ` - ${deal.musteriler.sirket_adi}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                Talep: {formatDate(deal.talep_tarihi)}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={deal.satis_durumu === 'Kazanıldı' ? 'default' : 
                                       deal.satis_durumu === 'Kaybedildi' ? 'destructive' : 'secondary'}
                              >
                                {deal.satis_durumu}
                              </Badge>
                              {deal.kazanilma_tarihi && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {formatDate(deal.kazanilma_tarihi)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Contracts */}
                {results.contracts.length > 0 && (
                  <>
                    <div className="h-[1px] w-full bg-border my-4" />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <h3 className="font-semibold">Sözleşmeler ({results.contracts.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {results.contracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => contract.musteri_id && handleCustomerClick(contract.musteri_id)}
                          >
                            <div>
                              <div className="font-medium">{contract.hizmet_tipi}</div>
                              <div className="text-sm text-gray-500">
                                {contract.musteriler?.ad_soyad || 'Bilinmeyen Müşteri'}
                                {contract.musteriler?.sirket_adi && ` - ${contract.musteriler.sirket_adi}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                {contract.baslangic_tarihi && formatDate(contract.baslangic_tarihi)} - 
                                {contract.bitis_tarihi && formatDate(contract.bitis_tarihi)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {contract.sozlesme_bedeli ? formatCurrency(contract.sozlesme_bedeli) : 'Belirtilmemiş'}
                              </div>
                              <Badge variant={contract.aktif_mi ? 'default' : 'secondary'}>
                                {contract.aktif_mi ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Payments */}
                {results.payments.length > 0 && (
                  <>
                    <div className="h-[1px] w-full bg-border my-4" />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                        <h3 className="font-semibold">Ödemeler ({results.payments.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {results.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => payment.musteri_id && handleCustomerClick(payment.musteri_id)}
                          >
                            <div>
                              <div className="font-medium">{payment.aciklama || 'Açıklama yok'}</div>
                              <div className="text-sm text-gray-500">
                                {payment.musteriler?.ad_soyad || 'Bilinmeyen Müşteri'}
                                {payment.musteriler?.sirket_adi && ` - ${payment.musteriler.sirket_adi}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                Vade: {payment.vade_tarihi ? formatDate(payment.vade_tarihi) : 'Belirtilmemiş'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {payment.tutar ? formatCurrency(payment.tutar) : 'Belirtilmemiş'}
                              </div>
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
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customerId={selectedCustomerId}
        isOpen={showCustomerDetail}
        onClose={() => {
          setShowCustomerDetail(false)
          setSelectedCustomerId(null)
        }}
      />
    </>
  )
}
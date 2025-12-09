'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSalesPipeline, useUpdateSalesStatus } from '@/hooks/useData'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { handleAsyncError } from '@/lib/error-handler'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  Plus,
  User,
  Building,
  Calendar,
  Clock,
  Phone
} from 'lucide-react'
import type { SatisTakip } from '@/types/database'
import { AppLayout } from '@/components/layout/AppLayout'
import { NewDealModal } from './components/NewDealModal'

// Extended type for pipeline data with joined customer info
type PipelineDeal = SatisTakip & {
  musteriler?: {
    ad_soyad: string
    sirket_adi?: string | null
    telefon?: string | null
  } | null
}

// Pipeline stages in order
const PIPELINE_STAGES = [
  { id: 'Yeni Lead', title: 'Yeni Lead\'ler', color: 'bg-blue-50 border-blue-200' },
  { id: 'Görüşülüyor', title: 'Görüşülüyor', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'Teklif Atıldı', title: 'Teklif Atıldı', color: 'bg-purple-50 border-purple-200' },
  { id: 'Kazanıldı', title: 'Kazanıldı', color: 'bg-green-50 border-green-200' },
  { id: 'Kaybedildi', title: 'Kaybedildi', color: 'bg-red-50 border-red-200' },
  { id: 'Cevap Yok', title: 'Cevap Yok', color: 'bg-gray-50 border-gray-200' }
]

// Draggable Deal Card Component
function DealCard({ deal, isDragging }: { deal: PipelineDeal; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deal.id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-move transition-shadow ${
        isDragging ? 'shadow-lg rotate-2 opacity-80' : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Customer Info */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">
              {deal.musteriler?.ad_soyad}
            </span>
          </div>

          {deal.musteriler?.sirket_adi && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">
                {deal.musteriler.sirket_adi}
              </span>
            </div>
          )}

          {/* Service */}
          <Badge variant="outline" className="text-xs">
            {deal.ilgilenilen_hizmet}
          </Badge>

          {/* Contact Info */}
          {deal.musteriler?.telefon && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {deal.musteriler.telefon}
              </span>
            </div>
          )}

          {/* Date Info */}
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {formatRelativeTime(deal.talep_tarihi)}
            </span>
          </div>

          {/* Follow-up Status */}
          <div className="flex gap-1">
            {deal.mail_1_durumu !== 'Bekliyor' && (
              <Badge variant="secondary" className="text-xs">
                Mail 1 ✓
              </Badge>
            )}
            {deal.mail_2_durumu !== 'Bekliyor' && (
              <Badge variant="secondary" className="text-xs">
                Mail 2 ✓
              </Badge>
            )}
          </div>

          {/* Won Date */}
          {deal.kazanilma_tarihi && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">
                {formatDate(deal.kazanilma_tarihi)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Droppable Column Component
function PipelineColumn({
  stage,
  deals,
  isLoading
}: {
  stage: typeof PIPELINE_STAGES[0];
  deals: PipelineDeal[];
  isLoading: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  return (
    <div className="flex flex-col">
      <div className={`${stage.color} rounded-lg border-2 border-dashed p-4 mb-4`}>
        <h3 className="font-medium text-center">{stage.title}</h3>
        <p className="text-sm text-gray-600 text-center mt-1">
          {deals.length} deal
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 min-h-[400px] p-2 rounded-lg border-2 border-dashed transition-colors ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Yükleniyor...
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Deal bulunmuyor
          </div>
        ) : (
          <SortableContext items={deals.map(deal => deal.id.toString())} strategy={verticalListSortingStrategy}>
            {deals.map((deal: PipelineDeal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false)
  
  const { data: pipelineData, isLoading, error } = useSalesPipeline()
  const updateSalesStatus = useUpdateSalesStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group deals by status
  const groupedDeals = pipelineData?.reduce((acc: Record<string, PipelineDeal[]>, deal: PipelineDeal) => {
    const status = deal.satis_durumu
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(deal)
    return acc
  }, {}) || {}

  // Filter deals based on search and service
  const filterDeals = (deals: PipelineDeal[]) => {
    if (!deals) return []
    
    return deals.filter((deal: PipelineDeal) => {
      const matchesSearch = searchQuery === '' ||
        deal.musteriler?.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.musteriler?.sirket_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.ilgilenilen_hizmet?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesService = serviceFilter === 'all' || deal.ilgilenilen_hizmet === serviceFilter
      
      return matchesSearch && matchesService
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const dealId = parseInt(active.id as string)
    let newStatus: string | null = null

    // Check if dropped on a column (droppable zone)
    if (typeof over.id === 'string' && PIPELINE_STAGES.some(stage => stage.id === over.id)) {
      newStatus = over.id
    }

    if (!newStatus) return

    console.log('Updating deal:', { dealId, newStatus }) // Debug log

    try {
      await updateSalesStatus.mutateAsync({ id: dealId, status: newStatus })
      toast.success('Satış durumu güncellendi!')
    } catch (error) {
      console.error('Full error object:', error) // Better error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      handleAsyncError(error, 'Pipeline-UpdateStatus')
      toast.error('Satış durumu güncellenemedi: ' + (error instanceof Error ? error.message : String(error)))
    }
  }, [updateSalesStatus])

  // Find the active deal for drag overlay
  const activeDeal = activeId ? pipelineData?.find(deal => deal.id.toString() === activeId) : null

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Pipeline verilerini yüklerken hata oluştu.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Satış Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Satış sürecinizi takip edin ve yönetin
          </p>
        </div>
        <Button onClick={() => setIsNewDealModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Deal
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri, şirket veya hizmet ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hizmet Seç" />
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
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = filterDeals(groupedDeals[stage.id] || [])
            
            return (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                isLoading={isLoading}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeId && activeDeal ? (
            <DealCard deal={activeDeal} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const count = filterDeals(groupedDeals[stage.id] || []).length
              return (
                <div key={stage.id} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600">{stage.title}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* New Deal Modal */}
      <NewDealModal
        isOpen={isNewDealModalOpen}
        onOpenChange={setIsNewDealModalOpen}
      />
    </div>
    </AppLayout>
  )
}
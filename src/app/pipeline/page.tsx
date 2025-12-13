'use client'

import { useState, useCallback, useMemo } from 'react'
import { HizmetTipi } from '@/types/database'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Phone,
  Settings2,
  Maximize2,
  Minimize2,
  ArrowUpDown,
  Star
} from 'lucide-react'
import type { SatisTakip } from '@/types/database'
import { AppLayout } from '@/components/layout/AppLayout'
import { NewDealModal } from './components/NewDealModal'
import { EditDealModal } from '@/components/modals/EditDealModal'

// Extended type for pipeline data with joined customer info
type PipelineDeal = SatisTakip & {
  musteriler?: {
    ad_soyad: string | null
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

// Card density types
type CardDensity = 'compact' | 'normal' | 'spacious'

// Sort options
type SortOption = 'newest' | 'oldest' | 'priority' | 'service'

// Draggable Deal Card Component with multiple sizes and expandable
function DealCard({
  deal,
  isDragging,
  onEdit,
  density = 'normal',
  isExpanded = false,
  onToggleExpand
}: {
  deal: PipelineDeal;
  isDragging?: boolean;
  onEdit: (deal: PipelineDeal) => void;
  density?: CardDensity;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
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


  // Simplified approach - no priority calculations for now
  const isOld = false
  const isPriority = false

  // Card size classes based on density
  const cardClasses = {
    compact: isExpanded ? 'text-sm' : 'text-xs',
    normal: 'text-sm',
    spacious: 'text-base'
  }

  const paddingClasses = {
    compact: isExpanded ? 'p-3' : 'py-0 px-3',
    normal: 'p-3',
    spacious: 'p-4'
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 relative ${
        isDragging ? 'shadow-lg rotate-1 opacity-80 scale-105' : 'hover:shadow-md'
      } ${isOld ? 'border-red-300 bg-red-50' : isPriority ? 'border-yellow-300 bg-yellow-50' : ''} ${
        isExpanded && density === 'compact' ? 'z-10 shadow-md border-blue-300' : ''
      } ${density === 'compact' && !isExpanded ? 'shadow-sm' : ''}`}
    >
      <CardContent
        {...attributes}
        {...listeners}
        className={`${paddingClasses[density]} relative group ${cardClasses[density]} cursor-move`}
      >
        {/* Compact mode: Expand/Collapse in top right corner - COMPLETELY ISOLATED */}
        {density === 'compact' && (
          <div
            className={`absolute top-0.5 right-0.5 z-30 transition-opacity duration-200 ${
              isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 border border-blue-200 bg-white shadow-md rounded-sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onToggleExpand) {
                  onToggleExpand()
                }
              }}
              onPointerDown={(e) => {
                e.stopPropagation() // Stop drag from interfering
              }}
              onMouseDown={(e) => {
                e.stopPropagation() // Stop drag from interfering
              }}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-gray-600" />
              )}
            </Button>
          </div>
        )}

        {/* Priority indicator - Only for non-compact or expanded */}
        {(isOld || isPriority) && (density !== 'compact' || isExpanded) && (
          <div className="absolute top-1 left-1 z-10">
            <Star className={`h-3 w-3 ${isOld ? 'text-red-500 fill-red-500' : 'text-yellow-500 fill-yellow-500'}`} />
          </div>
        )}

        <div
          className={`${
            density === 'compact'
              ? isExpanded ? 'space-y-2' : ''
              : density === 'spacious'
                ? 'space-y-3'
                : 'space-y-2'
          }`}
        >
          {/* Compact mode: Only name and service when collapsed */}
          {density === 'compact' && !isExpanded ? (
            <div
              className="cursor-pointer hover:bg-gray-50/50 rounded-sm transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleExpand?.()
              }}
            >
              {/* Customer Name - Left aligned, ultra-tight line height */}
              <div className="text-left">
                <span className="font-medium text-sm leading-[0.9] block">
                  {deal.musteriler?.ad_soyad || 'İsimsiz Müşteri'}
                </span>
              </div>

              {/* Service Badge - Perfectly aligned with customer name start */}
              <div className="text-left mt-2">
                <Badge variant="outline" className="py-0.5 px-2 h-4 text-xs leading-tight">
                  {deal.ilgilenilen_hizmet}
                </Badge>
              </div>
            </div>
          ) : (
            <>
              {/* Expanded/Normal mode - Normal kartın tüm bilgileri */}
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                <span className="font-medium truncate">
                  {deal.musteriler?.ad_soyad || 'İsimsiz Müşteri'}
                </span>
              </div>

              {/* Service Badge */}
              <Badge variant="outline" className="text-xs truncate">
                {deal.ilgilenilen_hizmet}
              </Badge>

              {/* Company Info */}
              {deal.musteriler?.sirket_adi && (
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 truncate text-xs">
                    {deal.musteriler.sirket_adi}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              {deal.musteriler?.telefon && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs truncate">
                    {deal.musteriler.telefon}
                  </span>
                </div>
              )}

              {/* Date Info */}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 text-xs">
                  {formatRelativeTime(deal.talep_tarihi)}
                </span>
              </div>

              {/* Extra details for compact expanded mode */}
              {density === 'compact' && isExpanded && (
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  {/* Follow-up Status */}
                  <div className="flex gap-1 flex-wrap">
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
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        {formatDate(deal.kazanilma_tarihi)}
                      </span>
                    </div>
                  )}

                  {/* Edit button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onEdit(deal)
                    }}
                  >
                    ✏️ Düzenle
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Modern Droppable Column Component
function PipelineColumn({
  stage,
  deals,
  isLoading,
  onEditDeal,
  density,
  sortBy,
  columnSearchQuery,
  onColumnSearchChange,
  expandedCards,
  onToggleCardExpand
}: {
  stage: typeof PIPELINE_STAGES[0];
  deals: PipelineDeal[];
  isLoading: boolean;
  onEditDeal: (deal: PipelineDeal) => void;
  density: CardDensity;
  sortBy: SortOption;
  columnSearchQuery: string;
  onColumnSearchChange: (query: string) => void;
  expandedCards: Set<number>;
  onToggleCardExpand: (dealId: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  // Sort deals based on selected option
  const sortedDeals = useMemo(() => {
    const filtered = deals.filter(deal => {
      if (!columnSearchQuery) return true
      const searchLower = columnSearchQuery.toLowerCase()
      return (
        deal.musteriler?.ad_soyad?.toLowerCase().includes(searchLower) ||
        deal.musteriler?.sirket_adi?.toLowerCase().includes(searchLower) ||
        deal.ilgilenilen_hizmet?.toLowerCase().includes(searchLower)
      )
    })

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.talep_tarihi).getTime() - new Date(a.talep_tarihi).getTime()
        case 'oldest':
          return new Date(a.talep_tarihi).getTime() - new Date(b.talep_tarihi).getTime()
        case 'priority': {
          const aTime = new Date(a.talep_tarihi).getTime()
          const bTime = new Date(b.talep_tarihi).getTime()
          return aTime - bTime // Older first (older = higher priority)
        }
        case 'service':
          return (a.ilgilenilen_hizmet || '').localeCompare(b.ilgilenilen_hizmet || '')
        default:
          return 0
      }
    })
  }, [deals, sortBy, columnSearchQuery])

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${stage.color} rounded-lg border p-3 mb-2`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{stage.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {sortedDeals.length}
          </Badge>
        </div>
        
        {/* Column Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Ara..."
            value={columnSearchQuery}
            onChange={(e) => onColumnSearchChange(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </div>

      {/* Scrollable Cards Area - Expanded droppable zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border-2 border-dashed transition-colors min-h-[400px] ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
        style={{ position: 'relative' }}
      >
        {/* Invisible expanded drop zone */}
        <div
          className="absolute inset-0 z-0"
          style={{ margin: '-10px' }}
        />
        <ScrollArea className="h-[calc(100vh-180px)] min-h-[500px]" type="always">
          <div className={`p-2 ${
            density === 'compact'
              ? 'space-y-0.5'
              : density === 'spacious'
                ? 'space-y-3'
                : 'space-y-2'
          }`}>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Yükleniyor...
              </div>
            ) : sortedDeals.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {columnSearchQuery ? 'Sonuç bulunamadı' : 'Deal bulunmuyor'}
              </div>
            ) : (
              <SortableContext items={sortedDeals.map(deal => deal.id.toString())} strategy={verticalListSortingStrategy}>
                {sortedDeals.map((deal: PipelineDeal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onEdit={onEditDeal}
                    density={density}
                    isExpanded={expandedCards.has(deal.id)}
                    onToggleExpand={() => onToggleCardExpand(deal.id)}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<PipelineDeal | null>(null)
  
  // New states for enhanced pipeline
  const [density] = useState<CardDensity>('compact')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [columnSearchQueries, setColumnSearchQueries] = useState<Record<string, string>>({})
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  
  const { data: pipelineData, isLoading, error } = useSalesPipeline()
  const updateSalesStatus = useUpdateSalesStatus()

  // Toggle card expansion with debug logging
  const toggleCardExpand = useCallback((dealId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      const wasExpanded = newSet.has(dealId)
      if (wasExpanded) {
        newSet.delete(dealId)
      } else {
        newSet.add(dealId)
      }
      return newSet
    })
  }, [])

  // Handle column search
  const handleColumnSearch = useCallback((stageId: string, query: string) => {
    setColumnSearchQueries(prev => ({
      ...prev,
      [stageId]: query
    }))
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Küçük mesafe, daha responsive
        delay: 0,
        tolerance: 5,
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


    try {
      await updateSalesStatus.mutateAsync({ id: dealId, status: newStatus })
      toast.success('Satış durumu güncellendi!')
    } catch (error) {
      handleAsyncError(error, 'Pipeline-UpdateStatus')
      toast.error('Satış durumu güncellenemedi')
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

      {/* Pipeline Stats Summary - Moved to top */}
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

      {/* Enhanced Filters & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtreler & Görünüm
            </div>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm text-gray-600">Pipeline Ayarları</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Service Filter Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Global arama: müşteri, şirket, hizmet..."
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
                  <SelectItem value={HizmetTipi.SANAL_OFIS}>{HizmetTipi.SANAL_OFIS}</SelectItem>
                  <SelectItem value={HizmetTipi.HAZIR_OFIS}>{HizmetTipi.HAZIR_OFIS}</SelectItem>
                  <SelectItem value={HizmetTipi.COWORKING}>{HizmetTipi.COWORKING}</SelectItem>
                  <SelectItem value={HizmetTipi.TOPLANTI}>{HizmetTipi.TOPLANTI}</SelectItem>
                  <SelectItem value={HizmetTipi.ETKINLIK}>{HizmetTipi.ETKINLIK}</SelectItem>
                  <SelectItem value={HizmetTipi.DIGER}>{HizmetTipi.DIGER}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Controls Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Sıralama:</span>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Yeniler Üstte</SelectItem>
                    <SelectItem value="oldest">Eskiler Üstte</SelectItem>
                    <SelectItem value="priority">Öncelik</SelectItem>
                    <SelectItem value="service">Hizmet A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expanded Cards Count */}
              {expandedCards.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Maximize2 className="h-4 w-4" />
                  {expandedCards.size} kart büyütüldü
                </div>
              )}

              {/* Tip */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                💡 Kartlara tıklayarak büyütüp küçültebilirsiniz
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[700px] h-[calc(100vh-300px)]">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = filterDeals(groupedDeals[stage.id] || [])
            
            return (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                isLoading={isLoading}
                onEditDeal={setEditingDeal}
                density={density}
                sortBy={sortBy}
                columnSearchQuery={columnSearchQueries[stage.id] || ''}
                onColumnSearchChange={(query) => handleColumnSearch(stage.id, query)}
                expandedCards={expandedCards}
                onToggleCardExpand={toggleCardExpand}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeId && activeDeal ? (
            <DealCard
              deal={activeDeal}
              isDragging
              onEdit={() => {}}
              density={density}
              isExpanded={expandedCards.has(activeDeal.id)}
              onToggleExpand={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Deal Modal */}
      <NewDealModal
        isOpen={isNewDealModalOpen}
        onOpenChange={setIsNewDealModalOpen}
      />

      {/* Edit Deal Modal */}
      <EditDealModal
        deal={editingDeal}
        isOpen={!!editingDeal}
        onClose={() => setEditingDeal(null)}
      />
    </div>
    </AppLayout>
  )
}
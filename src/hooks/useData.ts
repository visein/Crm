'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as queries from '@/lib/queries'
import type { Musteri, Sozlesme, SatisTakip, Odeme } from '@/types/database'

// Pipeline deal type with customer info
type PipelineDeal = SatisTakip & {
  musteriler?: {
    ad_soyad: string
    sirket_adi?: string | null
    telefon?: string | null
  } | null
}

// Query keys
export const queryKeys = {
  customers: ['customers'] as const,
  customer: (id: number) => ['customers', id] as const,
  salesPipeline: ['sales-pipeline'] as const,
  contracts: ['contracts'] as const,
  payments: ['payments'] as const,
  overduePayments: ['payments', 'overdue'] as const,
  expiringContracts: (days: number) => ['contracts', 'expiring', days] as const,
  interactions: (customerId?: number) => 
    customerId ? ['interactions', 'customer', customerId] : ['interactions'] as const,
  operationDetails: (customerId: number) => ['operation-details', customerId] as const,
  weeklyReport: ['weekly-report'] as const,
  weeklyLeadTrend: ['weekly-lead-trend'] as const,
  search: (query: string) => ['search', query] as const,
  globalSearch: (query: string) => ['global-search', query] as const,
}

// Customer hooks
export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: queries.fetchCustomers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCustomersWithOperations() {
  return useQuery({
    queryKey: ['customers-with-operations'],
    queryFn: queries.fetchCustomersWithOperations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => queries.fetchCustomerById(id),
    enabled: !!id,
  })
}

export function useCustomerById(id: number | null) {
  return useQuery({
    queryKey: queryKeys.customer(id || 0),
    queryFn: () => queries.fetchCustomerById(id!),
    enabled: !!id,
  })
}

export function useCustomerDeals(customerId: number | null) {
  return useQuery({
    queryKey: ['customer-deals', customerId],
    queryFn: () => queries.fetchCustomerDeals(customerId!),
    enabled: !!customerId,
  })
}

export function useCustomerContracts(customerId: number | null) {
  return useQuery({
    queryKey: ['customer-contracts', customerId],
    queryFn: () => queries.fetchCustomerContracts(customerId!),
    enabled: !!customerId,
  })
}

export function useCustomerPayments(customerId: number | null) {
  return useQuery({
    queryKey: ['customer-payments', customerId],
    queryFn: () => queries.fetchCustomerPayments(customerId!),
    enabled: !!customerId,
  })
}

export function useCustomerInteractions(customerId: number | null) {
  return useQuery({
    queryKey: queryKeys.interactions(customerId || undefined),
    queryFn: () => queries.fetchInteractions(customerId || undefined),
    enabled: !!customerId,
  })
}

export function useCustomerOperations(customerId: number | null) {
  return useQuery({
    queryKey: queryKeys.operationDetails(customerId || 0),
    queryFn: () => queries.fetchOperationDetails(customerId!),
    enabled: !!customerId,
  })
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => queries.searchCustomers(query),
    enabled: query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.globalSearch(query),
    queryFn: () => queries.globalSearch(query),
    enabled: query.length >= 2, // Minimum 2 characters
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.createCustomer,
    onMutate: async (newCustomer) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.customers })

      // Snapshot previous value
      const previousCustomers = queryClient.getQueryData(queryKeys.customers)

      // Optimistically add the new customer (with temporary ID)
      const optimisticCustomer = {
        ...newCustomer,
        id: Date.now(), // Temporary ID
        created_at: new Date().toISOString()
      }

      queryClient.setQueryData(queryKeys.customers, (oldData: Musteri[] | undefined) => {
        return [optimisticCustomer as Musteri, ...(oldData || [])]
      })

      return { previousCustomers, optimisticCustomer }
    },
    onError: (err, variables, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(queryKeys.customers, context.previousCustomers)
      }
    },
    onSuccess: () => {
      // Remove optimistic update and let the real data come through
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Musteri> }) =>
      queries.updateCustomer(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.customers })
      await queryClient.cancelQueries({ queryKey: queryKeys.customer(id) })

      // Snapshot the previous values
      const previousCustomers = queryClient.getQueryData(queryKeys.customers)
      const previousCustomer = queryClient.getQueryData(queryKeys.customer(id))

      // Optimistically update customers list
      queryClient.setQueryData(queryKeys.customers, (oldData: Musteri[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(customer =>
          customer.id === id ? { ...customer, ...updates } : customer
        )
      })

      // Optimistically update individual customer
      queryClient.setQueryData(queryKeys.customer(id), (oldData: Musteri | undefined) => {
        if (!oldData) return oldData
        return { ...oldData, ...updates }
      })

      return { previousCustomers, previousCustomer }
    },
    onError: (err, { id }, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(queryKeys.customers, context.previousCustomers)
      }
      if (context?.previousCustomer) {
        queryClient.setQueryData(queryKeys.customer(id), context.previousCustomer)
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(id) })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

// Sales pipeline hooks
export function useSalesPipeline() {
  return useQuery({
    queryKey: queryKeys.salesPipeline,
    queryFn: queries.fetchSalesPipeline,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUpdateSalesStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      queries.updateSalesStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.salesPipeline })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKeys.salesPipeline)

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.salesPipeline, (oldData: PipelineDeal[] | undefined) => {
        if (!oldData) return oldData
        
        return oldData.map((deal: PipelineDeal) => {
          if (deal.id === id) {
            return {
              ...deal,
              satis_durumu: status,
              ...(status === 'Kazanıldı' && {
                kazanilma_tarihi: new Date().toISOString().split('T')[0]
              })
            }
          }
          return deal
        })
      })

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.salesPipeline, context.previousData)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our data is correct
      queryClient.invalidateQueries({ queryKey: queryKeys.salesPipeline })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

export function useCreateSalesRecord() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.createSalesRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesPipeline })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

export function useUpdateSalesRecord() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<SatisTakip> }) =>
      queries.updateSalesRecord(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.salesPipeline })
      await queryClient.cancelQueries({ queryKey: ['customer-deals'] })

      // Snapshot previous values
      const previousPipeline = queryClient.getQueryData(queryKeys.salesPipeline)
      const previousCustomerDeals = queryClient.getQueryData(['customer-deals'])

      // Optimistically update sales pipeline
      queryClient.setQueryData(queryKeys.salesPipeline, (oldData: PipelineDeal[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(deal =>
          deal.id === id ? { ...deal, ...updates } : deal
        )
      })

      return { previousPipeline, previousCustomerDeals }
    },
    onError: (err, variables, context) => {
      if (context?.previousPipeline) {
        queryClient.setQueryData(queryKeys.salesPipeline, context.previousPipeline)
      }
      if (context?.previousCustomerDeals) {
        queryClient.setQueryData(['customer-deals'], context.previousCustomerDeals)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesPipeline })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      queryClient.invalidateQueries({ queryKey: ['customer-deals'] })
    },
  })
}

// Contract hooks
export function useContracts() {
  return useQuery({
    queryKey: queryKeys.contracts,
    queryFn: queries.fetchContracts,
    staleTime: 5 * 60 * 1000,
  })
}

export function useExpiringContracts(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.expiringContracts(days),
    queryFn: () => queries.fetchExpiringContracts(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Sozlesme> }) =>
      queries.updateContract(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts })

      // Snapshot previous value
      const previousContracts = queryClient.getQueryData(queryKeys.contracts)

      // Optimistically update contracts
      queryClient.setQueryData(queryKeys.contracts, (oldData: (Sozlesme & { musteriler?: { ad_soyad: string; sirket_adi?: string | null } | null })[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(contract =>
          contract.id === id ? { ...contract, ...updates } : contract
        )
      })

      return { previousContracts }
    },
    onError: (err, variables, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData(queryKeys.contracts, context.previousContracts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

// Payment hooks
export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: queries.fetchPayments,
    staleTime: 2 * 60 * 1000,
  })
}

export function useOverduePayments() {
  return useQuery({
    queryKey: queryKeys.overduePayments,
    queryFn: queries.fetchOverduePayments,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      queries.updatePaymentStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.payments })
      await queryClient.cancelQueries({ queryKey: queryKeys.overduePayments })

      // Snapshot previous values
      const previousPayments = queryClient.getQueryData(queryKeys.payments)
      const previousOverduePayments = queryClient.getQueryData(queryKeys.overduePayments)

      // Optimistically update payments
      queryClient.setQueryData(queryKeys.payments, (oldData: (Odeme & { musteriler?: { ad_soyad: string; sirket_adi?: string | null } | null })[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(payment =>
          payment.id === id ? { ...payment, durum: status } : payment
        )
      })

      // Optimistically update overdue payments
      queryClient.setQueryData(queryKeys.overduePayments, (oldData: (Odeme & { musteriler?: { ad_soyad: string; sirket_adi?: string | null } | null })[] | undefined) => {
        if (!oldData) return oldData
        if (status === 'Ödendi') {
          // Remove from overdue list if paid
          return oldData.filter(payment => payment.id !== id)
        }
        return oldData.map(payment =>
          payment.id === id ? { ...payment, durum: status } : payment
        )
      })

      return { previousPayments, previousOverduePayments }
    },
    onError: (err, variables, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(queryKeys.payments, context.previousPayments)
      }
      if (context?.previousOverduePayments) {
        queryClient.setQueryData(queryKeys.overduePayments, context.previousOverduePayments)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments })
      queryClient.invalidateQueries({ queryKey: queryKeys.overduePayments })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      queryClient.invalidateQueries({ queryKey: queryKeys.salesPipeline })
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

// Interaction hooks
export function useInteractions(customerId?: number) {
  return useQuery({
    queryKey: queryKeys.interactions(customerId),
    queryFn: () => queries.fetchInteractions(customerId),
    staleTime: 1 * 60 * 1000,
  })
}

// Operation details hooks
export function useOperationDetails(customerId: number) {
  return useQuery({
    queryKey: queryKeys.operationDetails(customerId),
    queryFn: () => queries.fetchOperationDetails(customerId),
    enabled: !!customerId,
  })
}

export function useUpsertOperationDetails() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.upsertOperationDetails,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.operationDetails(variables.musteri_id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customer(variables.musteri_id) 
      })
    },
  })
}

// Dashboard hooks
export function useWeeklyReport() {
  return useQuery({
    queryKey: queryKeys.weeklyReport,
    queryFn: queries.fetchWeeklyReport,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useWeeklyLeadTrend() {
  return useQuery({
    queryKey: queryKeys.weeklyLeadTrend,
    queryFn: queries.fetchWeeklyLeadTrend,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  })
}

// Utility hook to invalidate all queries (useful for refresh)
export function useRefreshAll() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries()
  }
}

// Hook to get loading states for multiple queries
export function useLoadingState() {
  const customers = useCustomers()
  const salesPipeline = useSalesPipeline()
  const contracts = useContracts()
  const payments = usePayments()
  const weeklyReport = useWeeklyReport()
  
  return {
    isLoading: customers.isLoading || 
               salesPipeline.isLoading || 
               contracts.isLoading || 
               payments.isLoading ||
               weeklyReport.isLoading,
    hasError: customers.isError || 
              salesPipeline.isError || 
              contracts.isError || 
              payments.isError ||
              weeklyReport.isError,
  }
}
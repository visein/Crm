'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as queries from '@/lib/queries'
import type { Musteri, Sozlesme, SatisTakip } from '@/types/database'

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
  search: (query: string) => ['search', query] as const,
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

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: queries.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Musteri> }) =>
      queries.updateCustomer(id, updates),
    onSuccess: (_, { id }) => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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
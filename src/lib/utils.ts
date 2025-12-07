import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function getDaysUntil(date: string | Date): number {
  const targetDate = new Date(date)
  const today = new Date()
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isOverdue(date: string | Date): boolean {
  return getDaysUntil(date) < 0
}

// Alias for Turkish currency formatting
export function formatTurkishCurrency(amount: number): string {
  return formatCurrency(amount)
}

// Relative time function
export function getRelativeTime(date: string | Date): string {
  const days = getDaysUntil(date)
  
  if (days === 0) return 'Bugün'
  if (days === 1) return 'Yarın'
  if (days === -1) return 'Dün'
  if (days > 1) return `${days} gün sonra`
  if (days < -1) return `${Math.abs(days)} gün önce`
  
  return formatDateShort(date)
}

// Alias for relative time
export const formatRelativeTime = getRelativeTime
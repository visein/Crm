// src/lib/normalizePhoneNumber.ts

export function normalizePhoneNumber(input: string): string {
  if (!input) return ''

  // Sadece rakamları bırak
  let digits = input.replace(/\D/g, '')

  // Eğer 90 ile başlıyorsa zaten istediğimiz format
  if (digits.startsWith('90')) {
    return digits
  }

  // Başında 0 varsa at
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  // Kalan numaranın başına 90 ekle
  return '90' + digits
}
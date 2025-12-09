import { supabase } from './supabase'
import type { UserRole } from '@/types/app'
import type { User } from '@supabase/supabase-js'

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    throw error
  }
  return session
}

// Get current user
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    throw error
  }
  return user
}

// Get user role from metadata
export function getUserRole(user: User | null): UserRole {
  return user?.user_metadata?.role || 'sales'
}

// Get user full name from metadata
export function getUserFullName(user: User | null): string {
  return user?.user_metadata?.full_name || user?.email || 'Kullanıcı'
}

// Check if user has permission for a route
export function hasPermission(userRole: UserRole, route: string): boolean {
  const permissions = {
    admin: ['dashboard', 'customers', 'pipeline', 'contracts', 'payments', 'interactions', 'operations', 'automations'],
    sales: ['dashboard', 'customers', 'pipeline', 'interactions'],
    finance: ['dashboard', 'contracts', 'payments'],
    operations: ['dashboard', 'customers', 'operations'],
  }
  
  const cleanRoute = route.replace('/', '').split('/')[0]
  return permissions[userRole].includes(cleanRoute)
}

// Update user with role
export async function updateUserRole(userId: string, role: UserRole, fullName?: string) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      role,
      full_name: fullName
    }
  })
  
  if (error) {
    throw error
  }
  
  return data
}
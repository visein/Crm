'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { handleAsyncError } from './error-handler'
import type { UserRole } from '@/types/app'
import type { User } from '@supabase/supabase-js'

// Auth Context
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  role: UserRole
  fullName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// AuthProvider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInHandler = async (email: string, password: string) => {
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      handleAsyncError(error, 'Authentication-SignIn')
    } finally {
      setLoading(false)
    }
  }

  const signOutHandler = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (error) {
      handleAsyncError(error, 'Authentication-SignOut')
    } finally {
      setLoading(false)
    }
  }

  const role = getUserRole(user)
  const fullName = getUserFullName(user)

  const value = {
    user,
    loading,
    signIn: signInHandler,
    signOut: signOutHandler,
    role,
    fullName,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

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
    admin: ['dashboard', 'musteriler', 'satis', 'sozlesmeler', 'odemeler', 'mesajlar', 'operasyon', 'otomasyon'],
    sales: ['dashboard', 'musteriler', 'satis', 'mesajlar'],
    finance: ['dashboard', 'sozlesmeler', 'odemeler'],
    operations: ['dashboard', 'musteriler', 'operasyon'],
  }
  
  const cleanRoute = route.replace('/', '').split('/')[0]
  return permissions[userRole].includes(cleanRoute)
}

// Create/update user with role (for demo purposes)
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

// Demo user creation function
export async function createDemoUsers() {
  const demoUsers = [
    { email: 'admin@demo.com', password: 'demo123', role: 'admin' as UserRole, fullName: 'Admin Kullanıcı' },
    { email: 'sales@demo.com', password: 'demo123', role: 'sales' as UserRole, fullName: 'Satış Temsilcisi' },
    { email: 'finance@demo.com', password: 'demo123', role: 'finance' as UserRole, fullName: 'Finans Uzmanı' },
    { email: 'operations@demo.com', password: 'demo123', role: 'operations' as UserRole, fullName: 'Operasyon Uzmanı' },
  ]
  
  return demoUsers
}
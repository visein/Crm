'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserRole, getUserFullName } from '@/lib/auth'
import type { UserRole } from '@/types/app'

// Demo mode flag
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Demo user object for testing without Supabase
const createDemoUser = (role: UserRole = 'admin'): User => ({
  id: 'demo-user-123',
  email: 'demo@sanal-ofis.com',
  user_metadata: {
    role: role,
    full_name: 'Demo Kullanıcı'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
} as User)

interface AuthState {
  user: User | null
  role: UserRole
  fullName: string
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  switchRole: (newRole: UserRole) => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// AuthProvider Component - moved here from auth.ts
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode - simulate authentication
      const demoUser = localStorage.getItem('demoUser')
      if (demoUser) {
        setUser(JSON.parse(demoUser))
      }
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    if (isDemoMode) {
      // Demo mode - accept any credentials
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call delay
        const demoUser = createDemoUser('admin')
        setUser(demoUser)
        localStorage.setItem('demoUser', JSON.stringify(demoUser))
        setLoading(false)
        return
      } catch (error) {
        setLoading(false)
        throw error
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    if (isDemoMode) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call delay
        setUser(null)
        localStorage.removeItem('demoUser')
        setLoading(false)
        return
      } catch (error) {
        setLoading(false)
        throw error
      }
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // For demo purposes - allow role switching
  const switchRole = async (newRole: UserRole) => {
    if (!user) throw new Error('No user logged in')
    
    setLoading(true)
    
    if (isDemoMode) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call delay
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            role: newRole
          }
        }
        setUser(updatedUser)
        localStorage.setItem('demoUser', JSON.stringify(updatedUser))
        setLoading(false)
        return
      } catch (error) {
        setLoading(false)
        throw error
      }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          role: newRole,
          full_name: getUserFullName(user)
        }
      })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const role = getUserRole(user)
  const fullName = getUserFullName(user)

  const value: AuthState = {
    user,
    role,
    fullName,
    loading,
    signIn,
    signOut,
    switchRole,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // For demo purposes - allow role switching
  const switchRole = async (newRole: UserRole) => {
    if (!user) throw new Error('No user logged in')
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          role: newRole,
          full_name: getUserFullName(user)
        }
      })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const role = getUserRole(user)
  const fullName = getUserFullName(user)

  return {
    user,
    role,
    fullName,
    loading,
    signIn,
    signOut,
    switchRole,
  }
}

// For direct use without context
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
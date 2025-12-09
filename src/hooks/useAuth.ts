'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserRole, getUserFullName } from '@/lib/auth'
import type { UserRole } from '@/types/app'

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

// AuthProvider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
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
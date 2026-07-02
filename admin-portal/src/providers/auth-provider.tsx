'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
  user: User | null
  loading: boolean
  organizationId: string | null
  userRole: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  organizationId: null,
  userRole: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const metadata = user?.user_metadata ?? {}
  const organizationId = metadata.organization_id as string | null
  const userRole = metadata.role as string | null

  return (
    <AuthContext.Provider value={{ user, loading, organizationId, userRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

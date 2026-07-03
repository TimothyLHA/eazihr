'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

type SupabaseContextType = {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | null>(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext)
  if (!ctx) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return ctx.supabase
}

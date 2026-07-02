'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './auth-provider'
import { createClient } from '@/lib/supabase/client'

type Organization = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  payroll_config: Record<string, any> | null
  leave_config: Record<string, any> | null
  loan_config: Record<string, any> | null
  created_at: string
  updated_at: string
}

type OrgContextType = {
  organization: Organization | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const OrgContext = createContext<OrgContextType>({
  organization: null,
  loading: true,
  error: null,
  refetch: async () => {},
})

export function OrgProvider({ children }: { children: ReactNode }) {
  const { organizationId, user, loading: authLoading } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchOrganization = async () => {
    if (!organizationId) {
      setOrganization(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setOrganization(data as Organization)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch organization'))
      setOrganization(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrganization()
    } else if (!authLoading && !user) {
      setOrganization(null)
      setLoading(false)
    }
  }, [authLoading, user, organizationId])

  return (
    <OrgContext.Provider value={{ organization, loading, error, refetch: fetchOrganization }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrganization = () => useContext(OrgContext)
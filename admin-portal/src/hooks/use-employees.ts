'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type EmployeeCard = {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  status: string
  employee_code: string
}

export function useEmployees() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [employees, setEmployees] = useState<EmployeeCard[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEmployees = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { count: total } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)

      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('id, employee_code, position, department, status, profile:profile_id(id, email, full_name)')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCount(total ?? 0)
      setEmployees(
        ((data ?? []) as Array<Record<string, unknown>>).map((e) => {
          const p = e.profile as { email: string; full_name: string } | null
          return {
            id: e.id as string,
            name: p?.full_name || (e.employee_code as string) || 'Unknown',
            role: (e.position as string) ?? '',
            department: (e.department as string) ?? '',
            email: p?.email ?? '',
            phone: '',
            status: (e.status as string) ?? 'active',
            employee_code: (e.employee_code as string) ?? '',
          }
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch employees'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchEmployees()
  }, [organization?.id, fetchEmployees])

  return { employees, count, loading, error, refetch: fetchEmployees }
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type OvertimeEntry = {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  date: string
  hours: number
  rate: number
  total_amount: number
  reason: string | null
  status: string
}

export type OvertimeStats = {
  pending_count: number
  approved_hours: number
  total_payout: number
  active_multiplier: number
}

export type EmployeeOption = {
  id: string
  full_name: string
}

export function useOvertime() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [entries, setEntries] = useState<OvertimeEntry[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [stats, setStats] = useState<OvertimeStats>({
    pending_count: 0,
    approved_hours: 0,
    total_payout: 0,
    active_multiplier: 1.5,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const orgId = organization.id

      const [{ data, error: fetchError }, { data: employeesRaw, error: employeesError }] = await Promise.all([
        supabase
          .from('overtime_requests')
          .select('id, employee_id, date, hours, rate, total_amount, reason, status, employee:employee_id(id, employee_code, profile:profile_id(full_name))')
          .eq('organization_id', orgId)
          .order('date', { ascending: false }),
        supabase
          .from('employees')
          .select('id, profile:profile_id(full_name)')
          .eq('organization_id', orgId)
          .eq('status', 'active'),
      ])

      if (fetchError) throw fetchError
      if (employeesError) throw employeesError

      const raw = (data ?? []) as Array<Record<string, unknown>>

      const mapped: OvertimeEntry[] = raw.map((r) => {
        const emp = r.employee as { id: string; employee_code: string | null; profile: { full_name: string } | null } | null
        return {
          id: r.id as string,
          employee_id: r.employee_id as string,
          employee_name: emp?.profile?.full_name ?? 'Unknown',
          employee_code: emp?.employee_code ?? '',
          date: r.date as string,
          hours: (r.hours as number) ?? 0,
          rate: (r.rate as number) ?? 0,
          total_amount: (r.total_amount as number) ?? 0,
          reason: (r.reason as string) ?? null,
          status: (r.status as string) ?? '',
        }
      })
      setEntries(mapped)

      const mappedEmployees = ((employeesRaw ?? []) as Array<Record<string, unknown>>).map((e) => {
        const profile = e.profile as { full_name: string } | null
        return { id: e.id as string, full_name: profile?.full_name ?? 'Unknown' }
      })
      setEmployees(mappedEmployees)

      const pendingCount = mapped.filter((e) => e.status === 'pending').length
      const approvedHours = mapped
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + e.hours, 0)
      const totalPayout = mapped
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + (e.total_amount ?? 0), 0)

      setStats({
        pending_count: pendingCount,
        approved_hours: approvedHours,
        total_payout: totalPayout,
        active_multiplier: 1.5,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch overtime data'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchData()
  }, [organization?.id, fetchData])

  return { entries, employees, stats, loading, error, refetch: fetchData }
}

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

export function useOvertime() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [entries, setEntries] = useState<OvertimeEntry[]>([])
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

      const { data, error: fetchError } = await supabase
        .from('overtime_requests')
        .select('id, employee_id, date, hours, rate, total_amount, reason, status')
        .eq('organization_id', organization.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      const raw = (data ?? []) as Array<Record<string, unknown>>

      const employeeIds = new Set<string>()
      raw.forEach((r) => employeeIds.add(r.employee_id as string))

      let employeeMap: Record<string, { full_name: string; employee_code: string }> = {}
      if (employeeIds.size > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, employee_code, profile:profile_id(id, email, full_name)')
          .in('id', Array.from(employeeIds))

        if (employees) {
          for (const e of (employees as Array<Record<string, unknown>>)) {
            const p = e.profile as { full_name?: string } | null
            employeeMap[e.id as string] = {
              full_name: p?.full_name || (e.employee_code as string) || 'Unknown',
              employee_code: (e.employee_code as string) ?? '',
            }
          }
        }
      }

      const mapped: OvertimeEntry[] = raw.map((r) => ({
        id: r.id as string,
        employee_id: r.employee_id as string,
        employee_name: employeeMap[r.employee_id as string]?.full_name ?? 'Unknown',
        employee_code: employeeMap[r.employee_id as string]?.employee_code ?? '',
        date: r.date as string,
        hours: (r.hours as number) ?? 0,
        rate: (r.rate as number) ?? 0,
        total_amount: (r.total_amount as number) ?? 0,
        reason: (r.reason as string) ?? null,
        status: (r.status as string) ?? '',
      }))
      setEntries(mapped)

      const pendingCount = mapped.filter((e) => e.status === 'pending').length
      const approvedHours = mapped
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + e.hours, 0)
      const totalPayout = mapped
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + e.total_amount, 0)

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

  return { entries, stats, loading, error, refetch: fetchData }
}

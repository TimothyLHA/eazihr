'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type LeaveBalance = {
  id: string
  employee_id: string
  employee_name: string
  leave_type: string
  allocated_days: number
  used_days: number
  remaining_days: number
}

export type LeaveStats = {
  total_quota_days: number
  total_taken_days: number
  pending_requests: number
}

export function useLeave() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [stats, setStats] = useState<LeaveStats>({
    total_quota_days: 0,
    total_taken_days: 0,
    pending_requests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)
      const orgId = organization.id

      const [{ data: balancesRaw, error: balancesError }, { count: totalRequests }, { count: pendingRequests }, { data: typesRaw, error: typesError }] =
        await Promise.all([
          supabase
            .from('leave_balances')
            .select('id, employee_id, leave_type_id, total_days, used_days, remaining_days, leave_type:leave_type_id(name), employee:employee_id(id, profile:profile_id(full_name))')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false }),
          supabase
            .from('leave_requests')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('leave_requests')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('status', 'pending'),
          supabase
            .from('leave_types')
            .select('name, days_allowed')
            .eq('organization_id', orgId),
        ])

      if (balancesError) throw balancesError
      if (typesError) throw typesError

      const mapped = ((balancesRaw ?? []) as Array<Record<string, unknown>>).map((b) => {
        const lt = b.leave_type as { name: string } | null
        const emp = b.employee as { id: string; profile: { full_name: string } | null } | null
        return {
          id: b.id as string,
          employee_id: b.employee_id as string,
          employee_name: emp?.profile?.full_name ?? 'Unknown',
          leave_type: lt?.name ?? 'Unknown',
          allocated_days: (b.total_days as number) ?? 0,
          used_days: (b.used_days as number) ?? 0,
          remaining_days: (b.remaining_days as number) ?? 0,
        }
      })

      const types = ((typesRaw ?? []) as Array<Record<string, unknown>>).reduce(
        (acc, t) => {
          const name = t.name as string
          acc[name] = t.days_allowed as number
          return acc
        },
        {} as Record<string, number>,
      )

      const totalQuotaDays = (Object.values(types) as number[]).reduce((sum, d) => sum + d, 0)
      const totalTakenDays = mapped.reduce((sum, b) => sum + b.used_days, 0)

      setBalances(mapped)
      setStats({
        total_quota_days: totalQuotaDays,
        total_taken_days: totalTakenDays,
        pending_requests: pendingRequests ?? 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch leave data'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchData()
  }, [organization?.id, fetchData])

  return { balances, stats, loading, error, refetch: fetchData }
}

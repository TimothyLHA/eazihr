'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type LeaveBalanceRow = {
  id: string
  employee_id: string
  employee_name: string
  leave_type: string
  leave_type_id: string
  allocated_days: number
  used_days: number
  remaining_days: number
}

export type LeaveRequestRow = {
  id: string
  employee_id: string
  employee_name: string
  leave_type: string
  start_date: string
  end_date: string
  days: number
  reason: string | null
  status: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export type LeaveStats = {
  total_quota_days: number
  total_taken_days: number
  pending_requests: number
}

export type LeaveTypeOption = {
  id: string
  name: string
  days_allowed: number
}

export type EmployeeOption = {
  id: string
  full_name: string
}

export function useLeave() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [balances, setBalances] = useState<LeaveBalanceRow[]>([])
  const [requests, setRequests] = useState<LeaveRequestRow[]>([])
  const [pending, setPending] = useState<LeaveRequestRow[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
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

      const [
        { data: balancesRaw, error: balancesError },
        { data: leaveTypesRaw, error: leaveTypesError },
        { data: employeesRaw, error: employeesError },
        { data: requestsRaw, error: requestsError },
        { count: pendingCount },
      ] = await Promise.all([
        supabase
          .from('leave_balances')
          .select('id, employee_id, leave_type_id, allocated_days, used_days, remaining_days, leave_type:leave_type_id(name), employee:employee_id(id, profile:profile_id(full_name))')
          .eq('organization_id', orgId),
        supabase
          .from('leave_types')
          .select('id, name, days_allowed')
          .eq('organization_id', orgId),
        supabase
          .from('employees')
          .select('id, profile:profile_id(full_name)')
          .eq('organization_id', orgId)
          .eq('status', 'active'),
        supabase
          .from('leave_requests')
          .select('id, employee_id, leave_type_id, start_date, end_date, days, reason, status, approved_by, approved_at, created_at, employee:employee_id(id, profile:profile_id(full_name)), leave_type:leave_type_id(name)')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('leave_requests')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'pending'),
      ])

      if (balancesError) throw balancesError
      if (leaveTypesError) throw leaveTypesError
      if (employeesError) throw employeesError
      if (requestsError) throw requestsError

      const mappedBalances = ((balancesRaw ?? []) as Array<Record<string, unknown>>).map((b) => {
        const lt = b.leave_type as { name: string } | null
        const emp = b.employee as { id: string; profile: { full_name: string } | null } | null
        return {
          id: b.id as string,
          employee_id: b.employee_id as string,
          employee_name: emp?.profile?.full_name ?? 'Unknown',
          leave_type: lt?.name ?? 'Unknown',
          leave_type_id: b.leave_type_id as string,
          allocated_days: (b.allocated_days as number) ?? 0,
          used_days: (b.used_days as number) ?? 0,
          remaining_days: (b.remaining_days as number) ?? 0,
        }
      })

      const mappedRequests = ((requestsRaw ?? []) as Array<Record<string, unknown>>).map((r) => {
        const emp = r.employee as { id: string; profile: { full_name: string } | null } | null
        const lt = r.leave_type as { name: string } | null
        return {
          id: r.id as string,
          employee_id: r.employee_id as string,
          employee_name: emp?.profile?.full_name ?? 'Unknown',
          leave_type: lt?.name ?? 'Unknown',
          start_date: r.start_date as string,
          end_date: r.end_date as string,
          days: (r.days as number) ?? 0,
          reason: (r.reason as string) ?? null,
          status: r.status as string,
          approved_by: (r.approved_by as string) ?? null,
          approved_at: (r.approved_at as string) ?? null,
          created_at: r.created_at as string,
        }
      })

      const mappedEmployees = ((employeesRaw ?? []) as Array<Record<string, unknown>>).map((e) => {
        const profile = e.profile as { full_name: string } | null
        return { id: e.id as string, full_name: profile?.full_name ?? 'Unknown' }
      })

      const totalQuotaDays = mappedBalances.reduce((sum, b) => sum + b.allocated_days, 0)
      const totalTakenDays = mappedRequests
        .filter((r) => r.status === 'approved')
        .reduce((sum, r) => sum + r.days, 0)

      setBalances(mappedBalances)
      setRequests(mappedRequests)
      setPending(mappedRequests.filter((r) => r.status === 'pending'))
      setLeaveTypes((leaveTypesRaw ?? []) as LeaveTypeOption[])
      setEmployees(mappedEmployees)
      setStats({
        total_quota_days: totalQuotaDays,
        total_taken_days: totalTakenDays,
        pending_requests: pendingCount ?? 0,
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

  return { balances, requests, pending, leaveTypes, employees, stats, loading, error, refetch: fetchData }
}

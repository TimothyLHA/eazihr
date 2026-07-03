'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type DashboardStats = {
  activeEmployees: number
  pendingLoans: number
  lateLogsToday: number
  totalIncentivesMonth: number
  totalOvertimeHours: number
  totalPayslips: number
  activeVehicles: number
}

export type AttendanceSummary = {
  id: string
  employee_name: string
  employee_role: string
  check_in_time: string | null
  status: string
}

export function useDashboardStats() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)
      const orgId = organization.id
      const today = new Date().toISOString().split('T')[0]
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      const [
        { count: empCount },
        { count: loanCount },
        { count: lateCount },
        incentivesData,
        overtimeData,
        { count: payslipCount },
        { count: vehicleCount },
        attendanceData,
      ] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
        supabase.from('loans').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'pending'),
        supabase.from('late_logs').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('date', today),
        supabase.from('incentives').select('amount').eq('organization_id', orgId).eq('month', currentMonth).eq('year', currentYear),
        supabase.from('overtime_requests').select('hours').eq('organization_id', orgId).eq('status', 'approved').gte('date', currentYear + '-' + String(currentMonth).padStart(2, '0') + '-01'),
        supabase.from('payslips').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('month', currentMonth).eq('year', currentYear),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).neq('status', 'out_of_service'),
        supabase.from('attendance_logs').select('id, check_in, status, employee:employee_id(id, first_name, last_name, job_title)').eq('organization_id', orgId).eq('date', today).order('check_in', { ascending: false }).limit(10),
      ])

      const totalIncentives = ((incentivesData.data ?? []) as Array<{ amount: number }>).reduce((sum, i) => sum + Number(i.amount), 0)
      const totalOvertime = ((overtimeData.data ?? []) as Array<{ hours: number }>).reduce((sum, o) => sum + Number(o.hours), 0)

      setStats({
        activeEmployees: empCount ?? 0,
        pendingLoans: loanCount ?? 0,
        lateLogsToday: lateCount ?? 0,
        totalIncentivesMonth: totalIncentives,
        totalOvertimeHours: totalOvertime,
        totalPayslips: payslipCount ?? 0,
        activeVehicles: vehicleCount ?? 0,
      })

      const mapped = (attendanceData.data ?? []).map((a: Record<string, unknown>) => {
        const emp = a.employee as Record<string, string> | null
        return {
          id: a.id as string,
          employee_name: emp ? emp.first_name + ' ' + emp.last_name : 'Unknown',
          employee_role: emp?.job_title ?? '',
          check_in_time: a.check_in as string | null,
          status: a.status as string,
        }
      })
      setAttendance(mapped)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) {
      fetchStats()
    }
  }, [organization?.id, fetchStats])

  return { stats, attendance, loading, error, refetch: fetchStats }
}

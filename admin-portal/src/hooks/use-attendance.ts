'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type AttendanceRecord = {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  date: string
  check_in: string | null
  check_out: string | null
  status: string
  location: Record<string, unknown>
}

export type WeeklyTrend = {
  day: string
  on_time: number
  late: number
}

export type LateLogEntry = {
  id: string
  employee_name: string
  minutes: number
  reason: string | null
}

export function useAttendance() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [lateLogs, setLateLogs] = useState<LateLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const [recordsRes, lateRes] = await Promise.all([
        supabase
          .from('attendance_logs')
          .select('id, employee_id, date, check_in, check_out, status, location')
          .eq('organization_id', organization.id)
          .order('date', { ascending: false })
          .limit(50),
        supabase
          .from('late_logs')
          .select('id, employee_id, minutes_late, reason, date')
          .eq('organization_id', organization.id)
          .order('date', { ascending: false })
          .limit(10),
      ])

      if (recordsRes.error) throw recordsRes.error
      if (lateRes.error) throw lateRes.error

      const rawRecords = (recordsRes.data ?? []) as Array<Record<string, unknown>>
      const rawLate = (lateRes.data ?? []) as Array<Record<string, unknown>>

      const employeeIds = new Set<string>()
      rawRecords.forEach((r) => employeeIds.add(r.employee_id as string))
      rawLate.forEach((r) => employeeIds.add(r.employee_id as string))

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

      setRecords(
        rawRecords.map((r) => ({
          id: r.id as string,
          employee_id: r.employee_id as string,
          employee_name: employeeMap[r.employee_id as string]?.full_name ?? 'Unknown',
          employee_code: employeeMap[r.employee_id as string]?.employee_code ?? '',
          date: r.date as string,
          check_in: (r.check_in as string) ?? null,
          check_out: (r.check_out as string) ?? null,
          status: (r.status as string) ?? '',
          location: (r.location ?? {}) as Record<string, unknown>,
        }))
      )

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + 1)

      const weeklyData: WeeklyTrend[] = days.map((day, i) => {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        const dayLogs = rawRecords.filter((r) => r.date === dateStr)
        const onTime = dayLogs.filter((r) => r.status === 'on_time').length
        const late = dayLogs.filter((r) => r.status === 'late').length
        return { day, on_time: onTime, late }
      })
      setWeeklyTrends(weeklyData)

      setLateLogs(
        rawLate.map((r) => ({
          id: r.id as string,
          employee_name: employeeMap[r.employee_id as string]?.full_name ?? 'Unknown',
          minutes: (r.minutes_late as number) ?? 0,
          reason: (r.reason as string) ?? null,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch attendance data'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchData()
  }, [organization?.id, fetchData])

  return { records, weeklyTrends, lateLogs, loading, error, refetch: fetchData }
}

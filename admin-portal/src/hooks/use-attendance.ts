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
  notes: string | null
  shift_type: string | null
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
  date: string
}

type FetchParams = {
  dateFrom?: string
  dateTo?: string
  search?: string
  statusFilter?: string
  page?: number
  pageSize?: number
}

export function useAttendance(params?: FetchParams) {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [lateLogs, setLateLogs] = useState<LateLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const today = new Date()
  const dateFrom = params?.dateFrom || new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0]
  const dateTo = params?.dateTo || today.toISOString().split('T')[0]
  const search = params?.search || ''
  const statusFilter = params?.statusFilter || ''
  const page = params?.page || 1
  const pageSize = params?.pageSize || 50

  const buildEmployeeMap = useCallback(async (employeeIds: Set<string>) => {
    if (employeeIds.size === 0) return {}
    const { data: employees } = await supabase
      .from('employees')
      .select('id, employee_code, profile:profile_id(id, email, full_name)')
      .in('id', Array.from(employeeIds))

    const map: Record<string, { full_name: string; employee_code: string }> = {}
    if (employees) {
      for (const e of (employees as Array<Record<string, unknown>>)) {
        const p = e.profile as { full_name?: string } | null
        map[e.id as string] = {
          full_name: p?.full_name || (e.employee_code as string) || 'Unknown',
          employee_code: (e.employee_code as string) ?? '',
        }
      }
    }
    return map
  }, [supabase])

  const fetchData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      let attQuery = supabase
        .from('attendance_logs')
        .select('id, employee_id, date, check_in, check_out, status, shift_type, notes, location', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (statusFilter) {
        attQuery = attQuery.eq('status', statusFilter)
      }

      const [attRes, lateRes] = await Promise.all([
        attQuery,
        supabase
          .from('late_logs')
          .select('id, employee_id, minutes_late, reason, date')
          .eq('organization_id', organization.id)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: false })
          .limit(20),
      ])

      if (attRes.error) throw attRes.error
      if (lateRes.error) throw lateRes.error

      const rawRecords = (attRes.data ?? []) as Array<Record<string, unknown>>
      const rawLate = (lateRes.data ?? []) as Array<Record<string, unknown>>

      setTotalCount(attRes.count ?? 0)

      const employeeIds = new Set<string>()
      rawRecords.forEach((r) => employeeIds.add(r.employee_id as string))
      rawLate.forEach((r) => employeeIds.add(r.employee_id as string))

      const employeeMap = await buildEmployeeMap(employeeIds)

      let mapped = rawRecords.map((r) => ({
        id: r.id as string,
        employee_id: r.employee_id as string,
        employee_name: employeeMap[r.employee_id as string]?.full_name ?? 'Unknown',
        employee_code: employeeMap[r.employee_id as string]?.employee_code ?? '',
        date: r.date as string,
        check_in: (r.check_in as string) ?? null,
        check_out: (r.check_out as string) ?? null,
        status: (r.status as string) ?? '',
        notes: (r.notes as string) ?? null,
        shift_type: (r.shift_type as string) ?? null,
        location: (r.location ?? {}) as Record<string, unknown>,
      }))

      if (search) {
        const q = search.toLowerCase()
        mapped = mapped.filter((r) => r.employee_name.toLowerCase().includes(q) || r.employee_code.toLowerCase().includes(q))
      }

      setRecords(mapped)

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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
          date: r.date as string,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch attendance data'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase, buildEmployeeMap, dateFrom, dateTo, search, statusFilter, page, pageSize, today])

  useEffect(() => {
    if (organization?.id) fetchData()
  }, [organization?.id, fetchData])

  return { records, totalCount, weeklyTrends, lateLogs, loading, error, refetch: fetchData }
}

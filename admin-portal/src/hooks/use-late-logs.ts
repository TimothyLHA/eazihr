'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type LateLogEntry = {
  id: string
  employee_id: string
  employee_name: string
  date: string
  check_in_time: string
  minutes_late: number
  reason: string | null
}

export type BarDatum = {
  date: string
  count: number
}

export type Stats = {
  total_late: number
  avg_delay: number
  critical_offenders: number
  bar_data: BarDatum[]
}

export function useLateLogs() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [entries, setEntries] = useState<LateLogEntry[]>([])
  const [stats, setStats] = useState<Stats>({ total_late: 0, avg_delay: 0, critical_offenders: 0, bar_data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data: rawLogs, error: logsErr } = await supabase
        .from('late_logs')
        .select('id, employee_id, date, check_in_time, minutes_late, reason')
        .eq('organization_id', organization.id)
        .order('date', { ascending: false })

      if (logsErr) throw logsErr

      const lateLogs = (rawLogs ?? []) as Array<Record<string, unknown>>

      const employeeIds = new Set<string>()
      lateLogs.forEach((r) => employeeIds.add(r.employee_id as string))

      let employeeMap: Record<string, { full_name: string }> = {}
      if (employeeIds.size > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, profile:profile_id(id, email, full_name)')
          .in('id', Array.from(employeeIds))

        if (employees) {
          for (const e of (employees as Array<Record<string, unknown>>)) {
            const p = e.profile as { full_name?: string } | null
            employeeMap[e.id as string] = {
              full_name: p?.full_name || 'Unknown',
            }
          }
        }
      }

      const mapped: LateLogEntry[] = lateLogs.map((r) => ({
        id: r.id as string,
        employee_id: r.employee_id as string,
        employee_name: employeeMap[r.employee_id as string]?.full_name ?? 'Unknown',
        date: r.date as string,
        check_in_time: r.check_in_time as string,
        minutes_late: (r.minutes_late as number) ?? 0,
        reason: (r.reason as string) ?? null,
      }))

      setEntries(mapped)

      const total = mapped.length
      const avg = total > 0 ? Math.round(mapped.reduce((s, e) => s + e.minutes_late, 0) / total) : 0

      const offenderCounts: Record<string, number> = {}
      mapped.forEach((e) => {
        offenderCounts[e.employee_id] = (offenderCounts[e.employee_id] ?? 0) + 1
      })
      const critical = Object.values(offenderCounts).filter((c) => c > 3).length

      const last7: BarDatum[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        last7.push({ date: dateStr, count: mapped.filter((e) => e.date === dateStr).length })
      }

      setStats({ total_late: total, avg_delay: avg, critical_offenders: critical, bar_data: last7 })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch late logs'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchData()
  }, [organization?.id, fetchData])

  return { entries, stats, loading, error, refetch: fetchData }
}

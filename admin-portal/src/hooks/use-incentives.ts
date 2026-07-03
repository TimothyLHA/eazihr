'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type IncentiveEntry = {
  id: string
  employee_id: string
  employee_name: string
  type: string
  amount: number
  description: string
  date: string
  status: string
}

export type IncentiveStats = {
  total_pool: number
  average: number
  pending_count: number
  quarterly_growth: number
}

export function useIncentives() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [entries, setEntries] = useState<IncentiveEntry[]>([])
  const [stats, setStats] = useState<IncentiveStats>({
    total_pool: 0,
    average: 0,
    pending_count: 0,
    quarterly_growth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchIncentives = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('incentives')
        .select('id, employee_id, type, amount, description, date, approved_by, created_at')
        .eq('organization_id', organization.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      const raw = (data ?? []) as Array<Record<string, unknown>>

      const employeeIds = new Set<string>()
      raw.forEach((r) => employeeIds.add(r.employee_id as string))

      let employeeMap: Record<string, string> = {}
      if (employeeIds.size > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, profile:profile_id(id, full_name)')
          .in('id', Array.from(employeeIds))

        if (employees) {
          for (const e of (employees as Array<Record<string, unknown>>)) {
            const p = e.profile as { full_name?: string } | null
            employeeMap[e.id as string] = p?.full_name || 'Unknown'
          }
        }
      }

      const mapped: IncentiveEntry[] = raw.map((r) => ({
        id: r.id as string,
        employee_id: r.employee_id as string,
        employee_name: employeeMap[r.employee_id as string] ?? 'Unknown',
        type: r.type as string,
        amount: (r.amount as number) ?? 0,
        description: (r.description as string) ?? '',
        date: r.date as string,
        status: r.approved_by ? 'approved' : 'pending',
      }))

      setEntries(mapped)

      const now = new Date()
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const currentYear = now.getFullYear()

      const currentQuarterStart = new Date(currentYear, currentQuarter * 3, 1)
      const currentQuarterEnd = new Date(currentYear, currentQuarter * 3 + 3, 0)

      const prevQuarterStart = new Date(currentYear, (currentQuarter - 1) * 3, 1)
      const prevQuarterEnd = new Date(currentYear, currentQuarter * 3, 0)

      const amounts = mapped.map((e) => e.amount)
      const totalPool = amounts.reduce((sum, a) => sum + a, 0)
      const avg = mapped.length > 0 ? totalPool / mapped.length : 0
      const pending = mapped.filter((e) => e.status === 'pending').length

      const currentSum = mapped
        .filter((e) => {
          const d = new Date(e.date)
          return d >= currentQuarterStart && d <= currentQuarterEnd
        })
        .reduce((s, e) => s + e.amount, 0)

      const prevSum = mapped
        .filter((e) => {
          const d = new Date(e.date)
          return d >= prevQuarterStart && d <= prevQuarterEnd
        })
        .reduce((s, e) => s + e.amount, 0)

      const quarterlyGrowth = prevSum > 0 ? ((currentSum - prevSum) / prevSum) * 100 : currentSum > 0 ? 100 : 0

      setStats({
        total_pool: totalPool,
        average: Math.round(avg * 100) / 100,
        pending_count: pending,
        quarterly_growth: Math.round(quarterlyGrowth * 100) / 100,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch incentives'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchIncentives()
  }, [organization?.id, fetchIncentives])

  return { entries, stats, loading, error, refetch: fetchIncentives }
}

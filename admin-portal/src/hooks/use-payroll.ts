'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export type PayrollCycle = {
  id: string
  period: string
  range: string
  employee_count: number
  total_amount: number
  status: string
}

export type PayrollStats = {
  total_cost: number
  trend_percent: number
}

export type BarData = {
  month_label: string
  height_percent: number
}

export function usePayroll() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [cycles, setCycles] = useState<PayrollCycle[]>([])
  const [stats, setStats] = useState<PayrollStats>({ total_cost: 0, trend_percent: 0 })
  const [barData, setBarData] = useState<BarData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayroll = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('organization_id', organization.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (fetchError) throw fetchError

      const rows = (data ?? []) as Array<Record<string, unknown>>

      const mapped: PayrollCycle[] = rows.map((r) => {
        const month = r.month as number
        const year = r.year as number
        const mName = MONTH_NAMES[month - 1] ?? 'Unknown'
        return {
          id: r.id as string,
          period: `${month}/${year}`,
          range: `${mName} ${year}`,
          employee_count: (r.total_employees ?? r.employee_count ?? 0) as number,
          total_amount: (r.total_amount ?? 0) as number,
          status: r.status as string,
        }
      })

      setCycles(mapped)

      const total_cost = mapped.reduce((sum, c) => sum + c.total_amount, 0)

      const now = new Date()
      const curMonth = now.getMonth() + 1
      const curYear = now.getFullYear()

      const currentRun = mapped.find((c) => {
        const [m, y] = c.period.split('/').map(Number)
        return m === curMonth && y === curYear
      })
      const prevMonth = curMonth === 1 ? 12 : curMonth - 1
      const prevYear = curMonth === 1 ? curYear - 1 : curYear
      const prevRun = mapped.find((c) => {
        const [m, y] = c.period.split('/').map(Number)
        return m === prevMonth && y === prevYear
      })

      const currentAmount = currentRun?.total_amount ?? 0
      const previousAmount = prevRun?.total_amount ?? 0
      const trend_percent =
        previousAmount > 0
          ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
          : 0

      setStats({ total_cost, trend_percent })

      const nowDate = new Date()
      const sixMonths: BarData[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1)
        const m = d.getMonth() + 1
        const y = d.getFullYear()
        const run = mapped.find((c) => {
          const [cm, cy] = c.period.split('/').map(Number)
          return cm === m && cy === y
        })
        sixMonths.push({
          month_label: MONTH_NAMES[m - 1].slice(0, 3),
          height_percent: run ? (run.total_amount / (total_cost || 1)) * 100 : 0,
        })
      }
      setBarData(sixMonths)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payroll data'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchPayroll()
  }, [organization?.id, fetchPayroll])

  return { cycles, stats, barData, loading, error, refetch: fetchPayroll }
}

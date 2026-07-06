'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type PayslipEntry = {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  month: number
  year: number
  period: string
  gross_pay: number
  deductions: number
  net_pay: number
  status: string
  earnings_breakdown: Record<string, unknown> | null
  deductions_breakdown: Record<string, unknown> | null
  pdf_url: string | null
}

export type PayslipStats = {
  total_disbursed: number
  total_count: number
  pending_count: number
}

export type PeriodOption = {
  label: string
  value: string
  month: number
  year: number
}

export function usePayslips() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [entries, setEntries] = useState<PayslipEntry[]>([])
  const [stats, setStats] = useState<PayslipStats>({ total_disbursed: 0, total_count: 0, pending_count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayslips = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data: rawPayslips, error: payslipsErr } = await supabase
        .from('payslips')
        .select('id, employee_id, month, year, gross_pay, deductions, net_pay, earnings_breakdown, deductions_breakdown, pdf_url, status')
        .eq('organization_id', organization.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (payslipsErr) throw payslipsErr

      const payslips = (rawPayslips ?? []) as Array<Record<string, unknown>>

      const employeeIds = new Set<string>()
      payslips.forEach((p) => employeeIds.add(p.employee_id as string))

      let employeeMap: Record<string, { full_name: string; employee_code: string }> = {}
      if (employeeIds.size > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, employee_code, profile:profile_id(id, full_name)')
          .in('id', Array.from(employeeIds))

        if (employees) {
          for (const e of (employees as Array<Record<string, unknown>>)) {
            const p = e.profile as { full_name?: string } | null
            employeeMap[e.id as string] = {
              full_name: p?.full_name || 'Unknown',
              employee_code: (e.employee_code as string) ?? '',
            }
          }
        }
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      const mapped: PayslipEntry[] = payslips.map((p) => {
        const emp = employeeMap[p.employee_id as string]
        const month = p.month as number
        const year = p.year as number
        return {
          id: p.id as string,
          employee_id: p.employee_id as string,
          employee_name: emp?.full_name ?? 'Unknown',
          employee_code: emp?.employee_code ?? '',
          month,
          year,
          period: `${monthNames[month - 1] ?? month} ${year}`,
          gross_pay: (p.gross_pay as number) ?? 0,
          deductions: (p.deductions as number) ?? 0,
          net_pay: (p.net_pay as number) ?? 0,
          status: (p.status as string) ?? 'generated',
          earnings_breakdown: (p.earnings_breakdown as Record<string, unknown> | null) ?? null,
          deductions_breakdown: (p.deductions_breakdown as Record<string, unknown> | null) ?? null,
          pdf_url: (p.pdf_url as string | null) ?? null,
        }
      })

      setEntries(mapped)

      const total_count = mapped.length
      const total_disbursed = mapped.reduce((sum, e) => sum + e.net_pay, 0)
      const pending_count = mapped.filter((e) => e.status === 'generated').length

      setStats({ total_disbursed, total_count, pending_count })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payslips'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchPayslips()
  }, [organization?.id, fetchPayslips])

  const periodOptions: PeriodOption[] = (() => {
    const seen = new Set<string>()
    const options: PeriodOption[] = []
    for (const e of entries) {
      const key = `${e.year}-${e.month}`
      if (!seen.has(key)) {
        seen.add(key)
        options.push({ label: e.period, value: key, month: e.month, year: e.year })
      }
    }
    return options
  })()

  return { entries, periodOptions, stats, loading, error, refetch: fetchPayslips }
}

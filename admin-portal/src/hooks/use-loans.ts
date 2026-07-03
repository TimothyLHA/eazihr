'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type LoanEntry = {
  id: string
  employee_id: string
  employee_name: string
  amount: number
  balance: number
  status: string
  purpose: string | null
  monthly_emi: number
  created_at: string
  progress: number
}

export type LoanStats = {
  total_disbursed: number
  pending_count: number
  active_count: number
  collection_rate: number
}

export function useLoans() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [entries, setEntries] = useState<LoanEntry[]>([])
  const [stats, setStats] = useState<LoanStats>({ total_disbursed: 0, pending_count: 0, active_count: 0, collection_rate: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLoans = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('loans')
        .select('id, employee_id, amount, interest_rate, tenure_months, monthly_emi, balance, purpose, status, created_at')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const raw = (data ?? []) as Array<Record<string, unknown>>

      const employeeIds = new Set<string>()
      raw.forEach((r) => employeeIds.add(r.employee_id as string))

      let employeeMap: Record<string, string> = {}
      if (employeeIds.size > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, profile:profile_id(id, email, full_name)')
          .in('id', Array.from(employeeIds))

        if (employees) {
          for (const e of (employees as Array<Record<string, unknown>>)) {
            const p = e.profile as { full_name?: string } | null
            employeeMap[e.id as string] = p?.full_name || 'Unknown'
          }
        }
      }

      const mapped: LoanEntry[] = raw.map((r) => {
        const amount = Number(r.amount) || 0
        const balance = Number(r.balance) || 0
        return {
          id: r.id as string,
          employee_id: r.employee_id as string,
          employee_name: employeeMap[r.employee_id as string] ?? 'Unknown',
          amount,
          balance,
          status: (r.status as string) ?? '',
          purpose: (r.purpose as string) ?? null,
          monthly_emi: Number(r.monthly_emi) || 0,
          created_at: (r.created_at as string) ?? '',
          progress: amount > 0 ? Math.round(((amount - balance) / amount) * 100) : 0,
        }
      })

      setEntries(mapped)

      const total_disbursed = raw.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
      const pending_count = raw.filter((r) => r.status === 'pending').length
      const active_count = raw.filter((r) => r.status === 'active').length
      const total_emi_collected = raw.reduce((sum, r) => {
        const amt = Number(r.amount) || 0
        const bal = Number(r.balance) || 0
        const repaid = amt - bal
        return sum + (repaid >= 0 ? repaid : 0)
      }, 0)
      const collection_rate = total_disbursed > 0 ? Math.round((total_emi_collected / total_disbursed) * 100) : 0

      setStats({ total_disbursed, pending_count, active_count, collection_rate })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch loans'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchLoans()
  }, [organization?.id, fetchLoans])

  return { entries, stats, loading, error, refetch: fetchLoans }
}

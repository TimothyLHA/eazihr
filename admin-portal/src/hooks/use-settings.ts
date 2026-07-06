'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type OrgSettings = {
  id: string
  name: string
  logo_url: string | null
  settings: Record<string, unknown>
  payroll_config: Record<string, unknown>
  leave_config: Record<string, unknown>
  loan_config: Record<string, unknown>
  feature_config: Record<string, unknown>
}

export type RoleInfo = {
  name: string
  users: number
  level: string
}

export function useSettings() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [org, setOrg] = useState<OrgSettings | null>(null)
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const [orgRes, profileRes] = await Promise.all([
        supabase
          .from('organizations')
          .select('*')
          .eq('id', organization.id)
          .single() as unknown as Promise<{ data: Record<string, unknown> | null; error: Error | null }>,
        supabase
          .from('profiles')
          .select('role')
          .eq('organization_id', organization.id)
          .not('role', 'is', null) as unknown as Promise<{ data: Array<Record<string, unknown>> | null; error: Error | null }>,
      ])

      if (orgRes.error) throw orgRes.error
      if (profileRes.error) throw profileRes.error

      const raw = (orgRes.data ?? {}) as Record<string, unknown>

      setOrg({
        id: (raw.id as string) ?? '',
        name: (raw.name as string) ?? '',
        logo_url: (raw.logo_url as string) ?? null,
        settings: (raw.settings ?? {}) as Record<string, unknown>,
        payroll_config: (raw.payroll_config ?? {}) as Record<string, unknown>,
        leave_config: (raw.leave_config ?? {}) as Record<string, unknown>,
        loan_config: (raw.loan_config ?? {}) as Record<string, unknown>,
        feature_config: (raw.feature_config ?? {}) as Record<string, unknown>,
      })

      const roleCounts: Record<string, { users: number; level: string }> = {
        super_admin: { users: 0, level: 'Full system access' },
        org_admin: { users: 0, level: 'Payroll, benefits, approvals' },
        hr_manager: { users: 0, level: 'Team and attendance review' },
        employee: { users: 0, level: 'Basic self-service access' },
      }

      const rawProfiles = (profileRes.data ?? []) as Array<Record<string, unknown>>
      for (const p of rawProfiles) {
        const role = p.role as string
        if (roleCounts[role]) {
          roleCounts[role].users++
        }
      }

      setRoles(
        Object.entries(roleCounts)
          .filter(([_, v]) => v.users > 0)
          .map(([name, v]) => ({
            name: name === 'super_admin' ? 'Super Admin' : name === 'org_admin' ? 'Org Admin' : name === 'hr_manager' ? 'HR Manager' : 'Employee',
            users: v.users,
            level: v.level,
          }))
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchData()
  }, [organization?.id, fetchData])

  return { org, roles, loading, error, refetch: fetchData }
}

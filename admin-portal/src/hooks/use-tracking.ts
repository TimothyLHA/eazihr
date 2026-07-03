'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

export type VehicleEntry = {
  id: string
  name: string
  plate_number: string
  driver_name: string
  status: string
  last_location: Record<string, unknown> | null
  last_updated: string | null
}

export type TrackingStats = {
  active_count: number
  total_count: number
  alert_count: number
}

export function useTracking() {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([])
  const [stats, setStats] = useState<TrackingStats>({ active_count: 0, total_count: 0, alert_count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVehicles = useCallback(async () => {
    if (!organization?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select('id, name, plate_number, driver_name, status, last_location, last_updated')
        .eq('organization_id', organization.id)
        .order('last_updated', { ascending: false })

      if (fetchError) throw fetchError

      const entries = ((data ?? []) as Array<Record<string, unknown>>).map((v) => ({
        id: v.id as string,
        name: (v.name as string) ?? '',
        plate_number: (v.plate_number as string) ?? '',
        driver_name: (v.driver_name as string) ?? '',
        status: (v.status as string) ?? 'idle',
        last_location: (v.last_location as Record<string, unknown>) ?? null,
        last_updated: (v.last_updated as string) ?? null,
      }))

      setVehicles(entries)
      setStats({
        total_count: entries.length,
        active_count: entries.filter((v) => v.status === 'active').length,
        alert_count: entries.filter((v) => v.status === 'maintenance' || v.status === 'out_of_service').length,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch vehicles'))
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    if (organization?.id) fetchVehicles()
  }, [organization?.id, fetchVehicles])

  return { vehicles, stats, loading, error, refetch: fetchVehicles }
}

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type TrackingActionResponse = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function updateVehicleStatus(
  _prevState: TrackingActionResponse,
  formData: FormData
): Promise<TrackingActionResponse> {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const driverName = formData.get('driver_name') as string
  const location = formData.get('last_location') as string
  const latRaw = formData.get('lat') as string
  const lngRaw = formData.get('lng') as string

  if (!id || !status) return { error: 'Vehicle ID and status are required.' }

  const supabase = getAnonClient()
  const updates: Record<string, unknown> = {
    status,
    last_updated: new Date().toISOString(),
  }
  if (driverName) updates.driver_name = driverName

  const locPayload: Record<string, unknown> = {}
  if (location) locPayload.address = location
  const lat = parseFloat(latRaw)
  const lng = parseFloat(lngRaw)
  if (!isNaN(lat)) locPayload.lat = lat
  if (!isNaN(lng)) locPayload.lng = lng
  if (Object.keys(locPayload).length > 0) updates.last_location = locPayload

  const { error } = await supabase.from('vehicles').update(updates).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/tracking')
  return { success: true }
}

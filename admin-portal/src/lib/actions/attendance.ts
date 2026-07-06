'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type AttendanceActionResult = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function addAttendance(
  _prevState: AttendanceActionResult,
  formData: FormData
): Promise<AttendanceActionResult> {
  const employeeId = formData.get('employee_id') as string
  const date = formData.get('date') as string
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string
  const organizationId = formData.get('organization_id') as string

  if (!employeeId || !date || !organizationId) {
    return { error: 'Employee, date, and organization are required.' }
  }

  const supabase = getAnonClient()

  const checkInIso = checkIn ? new Date(`${date}T${checkIn}`).toISOString() : null
  const checkOutIso = checkOut ? new Date(`${date}T${checkOut}`).toISOString() : null

  const { error: insertError } = await supabase.from('attendance_logs').insert({
    employee_id: employeeId,
    organization_id: organizationId,
    date,
    check_in: checkInIso,
    check_out: checkOutIso,
    status: (status as 'on_time' | 'late' | 'absent' | 'half_day') || 'on_time',
    notes: notes || null,
    location: {},
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/attendance')
  return { success: true }
}

export async function updateAttendance(
  _prevState: AttendanceActionResult,
  formData: FormData
): Promise<AttendanceActionResult> {
  const id = formData.get('id') as string
  const date = formData.get('date') as string
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string
  const organizationId = formData.get('organization_id') as string

  if (!id || !organizationId) {
    return { error: 'Record ID and organization are required.' }
  }

  const supabase = getAnonClient()

  const checkInIso = checkIn ? new Date(`${date || '2024-01-01'}T${checkIn}`).toISOString() : null
  const checkOutIso = checkOut ? new Date(`${date || '2024-01-01'}T${checkOut}`).toISOString() : null

  const updates: Record<string, unknown> = {}
  if (date) updates.date = date
  if (checkIn !== undefined) updates.check_in = checkInIso
  if (checkOut !== undefined) updates.check_out = checkOutIso
  if (status) updates.status = status
  if (notes !== undefined) updates.notes = notes || null

  const { error } = await supabase
    .from('attendance_logs')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/attendance')
  return { success: true }
}

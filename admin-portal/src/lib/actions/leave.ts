'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type LeaveActionResponse = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function createLeaveRequest(
  _prevState: LeaveActionResponse,
  formData: FormData
): Promise<LeaveActionResponse> {
  const employeeId = formData.get('employee_id') as string
  const organizationId = formData.get('organization_id') as string
  const leaveTypeId = formData.get('leave_type_id') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const days = parseFloat(formData.get('days') as string)
  const reason = formData.get('reason') as string

  if (!employeeId || !organizationId || !leaveTypeId || !startDate || !endDate || !days) {
    return { error: 'All required fields must be filled.' }
  }

  const supabase = getAnonClient()

  const { error } = await supabase.from('leave_requests').insert({
    employee_id: employeeId,
    organization_id: organizationId,
    leave_type_id: leaveTypeId,
    start_date: startDate,
    end_date: endDate,
    days,
    reason: reason || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/leave')
  return { success: true }
}

export async function approveLeave(
  _prevState: LeaveActionResponse,
  formData: FormData
): Promise<LeaveActionResponse> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Leave request ID is required.' }

  const supabase = getAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('leave_requests')
    .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/leave')
  return { success: true }
}

export async function rejectLeave(
  _prevState: LeaveActionResponse,
  formData: FormData
): Promise<LeaveActionResponse> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Leave request ID is required.' }

  const supabase = getAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('leave_requests')
    .update({ status: 'rejected', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/leave')
  return { success: true }
}

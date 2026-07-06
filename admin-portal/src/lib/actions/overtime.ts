'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type OvertimeActionResponse = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function createOvertimeRequest(
  _prevState: OvertimeActionResponse,
  formData: FormData
): Promise<OvertimeActionResponse> {
  const employeeId = formData.get('employee_id') as string
  const organizationId = formData.get('organization_id') as string
  const date = formData.get('date') as string
  const hours = parseFloat(formData.get('hours') as string)
  const rate = parseFloat(formData.get('rate') as string)
  const reason = formData.get('reason') as string

  if (!employeeId || !organizationId || !date || !hours) {
    return { error: 'Employee, date, and hours are required.' }
  }

  const totalAmount = hours * rate

  const supabase = getAnonClient()

  const { error } = await supabase.from('overtime_requests').insert({
    employee_id: employeeId,
    organization_id: organizationId,
    date,
    hours,
    rate,
    total_amount: totalAmount,
    reason: reason || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/overtime')
  return { success: true }
}

export async function approveOvertime(
  _prevState: OvertimeActionResponse,
  formData: FormData
): Promise<OvertimeActionResponse> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Overtime request ID is required.' }

  const supabase = getAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('overtime_requests')
    .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/overtime')
  return { success: true }
}

export async function rejectOvertime(
  _prevState: OvertimeActionResponse,
  formData: FormData
): Promise<OvertimeActionResponse> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Overtime request ID is required.' }

  const supabase = getAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('overtime_requests')
    .update({ status: 'rejected', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/overtime')
  return { success: true }
}

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type IncentiveActionResponse = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function createIncentive(
  _prevState: IncentiveActionResponse,
  formData: FormData
): Promise<IncentiveActionResponse> {
  const organization_id = formData.get('organization_id') as string
  const employee_id = formData.get('employee_id') as string
  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string

  if (!organization_id || !employee_id || !type || !amountRaw) {
    return { error: 'Organization, employee, type, and amount are required.' }
  }

  const validTypes = ['bonus', 'commission', 'allowance', 'other']
  if (!validTypes.includes(type)) return { error: 'Invalid incentive type.' }

  const amount = parseFloat(amountRaw)
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number.' }

  const supabase = getAnonClient()
  const { error } = await supabase.from('incentives').insert({
    organization_id,
    employee_id,
    type,
    amount,
    description: description || null,
    date: date || new Date().toISOString().split('T')[0],
  })

  if (error) return { error: error.message }
  revalidatePath('/incentives')
  return { success: true }
}

export async function approveIncentive(
  _prevState: IncentiveActionResponse,
  formData: FormData
): Promise<IncentiveActionResponse> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Incentive ID is required.' }

  const supabase = getAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('incentives')
    .update({ approved_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/incentives')
  return { success: true }
}

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type LoanActionResponse = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function createLoanRequest(
  _prevState: LoanActionResponse,
  formData: FormData
): Promise<LoanActionResponse> {
  const organization_id = formData.get('organization_id') as string
  const employee_id = formData.get('employee_id') as string
  const amountRaw = formData.get('amount') as string
  const purpose = formData.get('purpose') as string
  const tenureMonthsRaw = formData.get('tenure_months') as string
  const interestRateRaw = formData.get('interest_rate') as string

  if (!organization_id || !employee_id || !amountRaw || !tenureMonthsRaw) {
    return { error: 'Organization, employee, amount, and tenure are required.' }
  }

  const amount = parseFloat(amountRaw)
  const tenureMonths = parseInt(tenureMonthsRaw, 10)
  const interestRate = parseFloat(interestRateRaw) || 0

  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number.' }
  if (isNaN(tenureMonths) || tenureMonths < 1) return { error: 'Tenure must be at least 1 month.' }

  const monthlyEmi = tenureMonths > 0 ? Math.round((amount / tenureMonths) * 100) / 100 : amount

  const supabase = getAnonClient()
  const { error } = await supabase.from('loans').insert({
    organization_id,
    employee_id,
    amount,
    interest_rate: interestRate,
    tenure_months: tenureMonths,
    monthly_emi: monthlyEmi,
    balance: amount,
    purpose: purpose || null,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/loans')
  return { success: true }
}

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type EmployeeActionResult = { error: string; success?: undefined } | { success: boolean; error?: undefined } | null

export async function addEmployee(
  _prevState: EmployeeActionResult,
  formData: FormData
): Promise<EmployeeActionResult> {
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const employeeCode = formData.get('employee_code') as string
  const position = formData.get('position') as string
  const department = formData.get('department') as string
  const hireDate = formData.get('hire_date') as string
  const basicSalary = formData.get('basic_salary') as string
  const status = formData.get('status') as string
  const emergencyName = formData.get('emergency_name') as string
  const emergencyPhone = formData.get('emergency_phone') as string
  const organizationId = formData.get('organization_id') as string

  if (!email || !fullName || !organizationId) {
    return { error: 'Email, full name, and organization are required.' }
  }

  const supabase = getAnonClient()

  const tempPassword = crypto.randomUUID().slice(0, 16) + 'Aa1!'

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: {
      data: {
        organization_id: organizationId,
        role: 'employee',
        full_name: fullName,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  const profileId = authData.user?.id
  if (!profileId) {
    return { error: 'Failed to create user account.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      role: 'employee',
    })
    .eq('id', profileId)

  if (profileError) {
    return { error: profileError.message }
  }

  const { error: insertError } = await supabase.from('employees').insert({
    profile_id: profileId,
    organization_id: organizationId,
    employee_code: employeeCode || null,
    position: position || null,
    department: department || null,
    hire_date: hireDate || null,
    basic_salary: basicSalary ? parseFloat(basicSalary) : null,
    status: (status as 'active' | 'resigned' | 'suspended') || 'active',
    emergency_contact: {
      name: emergencyName || '',
      phone: emergencyPhone || '',
    },
    documents: [],
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/employees')
  return { success: true }
}

export async function updateEmployee(
  _prevState: EmployeeActionResult,
  formData: FormData
): Promise<EmployeeActionResult> {
  const id = formData.get('id') as string
  const employeeCode = formData.get('employee_code') as string
  const position = formData.get('position') as string
  const department = formData.get('department') as string
  const hireDate = formData.get('hire_date') as string
  const basicSalary = formData.get('basic_salary') as string
  const status = formData.get('status') as string
  const emergencyName = formData.get('emergency_name') as string
  const emergencyPhone = formData.get('emergency_phone') as string
  const organizationId = formData.get('organization_id') as string

  if (!id || !organizationId) {
    return { error: 'Employee ID and organization are required.' }
  }

  const supabase = getAnonClient()

  const { error } = await supabase
    .from('employees')
    .update({
      employee_code: employeeCode || null,
      position: position || null,
      department: department || null,
      hire_date: hireDate || null,
      basic_salary: basicSalary ? parseFloat(basicSalary) : null,
      status: (status as 'active' | 'resigned' | 'suspended') || 'active',
      emergency_contact: {
        name: emergencyName || '',
        phone: emergencyPhone || '',
      },
    })
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/employees')
  return { success: true }
}

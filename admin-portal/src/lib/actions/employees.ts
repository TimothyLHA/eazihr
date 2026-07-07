'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '../supabase/server'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type EmployeeActionResult = { error: string; success?: undefined; credentials?: undefined } | { success: boolean; error?: undefined; credentials?: { email: string; password: string } } | null

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
  return {
    success: true,
    credentials: {
      email,
      password: tempPassword,
    },
  }
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

export type GenerateAccountResult = {
  success?: boolean
  error?: string
  credentials?: { email: string; password: string; employeeCode: string }
}

export async function generateEmployeeAccount(
  employeeId: string,
  organizationId: string
): Promise<GenerateAccountResult> {
  if (!employeeId || !organizationId) {
    return { error: 'Employee ID and organization are required.' }
  }

  const supabase = await createServerClient()

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, employee_code, profile_id')
    .eq('id', employeeId)
    .eq('organization_id', organizationId)
    .single()

  if (empError || !employee) {
    return { error: empError?.message || 'Employee not found.' }
  }

  if (employee.profile_id) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', employee.profile_id)
      .single()

    if (existingProfile) {
      return { error: 'Employee already has a login account.' }
    }
  }

  const employeeCode = employee.employee_code || employeeId.slice(0, 8)
  const email = `${employeeCode}@org.easyhr.app`
  const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!'

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: {
      data: {
        organization_id: organizationId,
        role: 'employee',
        full_name: '',
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
    .update({ full_name: '', role: 'employee' })
    .eq('id', profileId)

  if (profileError) {
    return { error: profileError.message }
  }

  const { error: linkError } = await supabase
    .from('employees')
    .update({ profile_id: profileId })
    .eq('id', employeeId)
    .eq('organization_id', organizationId)

  if (linkError) {
    return { error: linkError.message }
  }

  revalidatePath('/employees')

  return {
    success: true,
    credentials: {
      email,
      password: tempPassword,
      employeeCode: employeeCode,
    },
  }
}

export async function resetEmployeePassword(
  employeeId: string,
  organizationId: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  if (!employeeId || !organizationId || !newPassword) {
    return { error: 'Employee ID, organization, and new password are required.' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createServerClient()

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('profile_id')
    .eq('id', employeeId)
    .eq('organization_id', organizationId)
    .single()

  if (empError) {
    return { error: `Error looking up employee: ${empError.message}` }
  }

  if (!employee?.profile_id) {
    return { error: 'Employee not found or no login account exists.' }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set.' }
  }

  const adminClient = getAdminClient()

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    employee.profile_id,
    { password: newPassword }
  )

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}

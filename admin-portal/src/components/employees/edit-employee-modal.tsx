'use client'

import { useEffect, useState, useRef, useActionState, useCallback } from 'react'
import { updateEmployee, generateEmployeeAccount, resetEmployeePassword, type EmployeeActionResult, type GenerateAccountResult } from '@/lib/actions/employees'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

type Props = {
  employeeId: string | null
  onClose: () => void
  onSaved: () => void
}

type EmployeeData = {
  id: string
  employee_code: string | null
  profile_id: string | null
  position: string | null
  department: string | null
  hire_date: string | null
  basic_salary: number | null
  status: string
  emergency_contact: { name?: string; phone?: string } | null
}

export default function EditEmployeeModal({ employeeId, onClose, onSaved }: Props) {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [genState, setGenState] = useState<GenerateAccountResult | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetState, setResetState] = useState<{ success?: boolean; error?: string } | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const ref = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<EmployeeActionResult, FormData>(
    updateEmployee,
    null
  )

  const checkAccount = useCallback(async (empId: string, orgId: string) => {
    const { data: emp } = await supabase
      .from('employees')
      .select('profile_id')
      .eq('id', empId)
      .eq('organization_id', orgId)
      .single<{ profile_id: string | null }>()
    if (emp?.profile_id) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', emp.profile_id)
        .single()
      setHasAccount(!!prof)
    } else {
      setHasAccount(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!employeeId || !organization?.id) return
    setLoading(true)
    setFetchError(null)
    supabase
      .from('employees')
      .select('id, employee_code, profile_id, position, department, hire_date, basic_salary, status, emergency_contact')
      .eq('id', employeeId)
      .eq('organization_id', organization.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setFetchError(error.message)
        } else if (data) {
          const emp = data as unknown as EmployeeData
          setEmployee(emp)
          checkAccount(emp.id, organization.id)
        }
        setLoading(false)
      })
  }, [employeeId, organization?.id, supabase, checkAccount])

  useEffect(() => {
    if (state?.success) {
      onSaved()
    }
  }, [state?.success, onSaved])

  const handleGenerateAccount = async () => {
    if (!employeeId || !organization?.id) return
    setGenLoading(true)
    setGenState(null)
    const result = await generateEmployeeAccount(employeeId, organization.id)
    setGenState(result)
    setGenLoading(false)
    if (result.success) {
      setHasAccount(true)
    }
  }

  const handleResetPassword = async () => {
    if (!employeeId || !organization?.id || !newPassword) return
    setResetLoading(true)
    setResetState(null)
    const result = await resetEmployeePassword(employeeId, organization.id, newPassword)
    setResetState(result)
    setResetLoading(false)
  }

  if (!employeeId) return null

  const ec = employee?.emergency_contact as { name?: string; phone?: string } | null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Edit Employee</h2>
          <button onClick={onClose} disabled={pending} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 w-full bg-surface-container rounded animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="p-6">
            <div className="rounded-lg bg-error-container text-error p-3 text-sm">{fetchError}</div>
          </div>
        ) : employee ? (
          <form ref={ref} action={formAction}>
            <input type="hidden" name="id" value={employee.id} />
            <input type="hidden" name="organization_id" value={organization?.id ?? ''} />
            <div className="p-6 space-y-5">
              {state?.error && (
                <div className="rounded-lg bg-error-container text-error p-3 text-sm">{state.error}</div>
              )}

              {state?.success && (
                <div className="rounded-lg bg-secondary-container text-secondary p-3 text-sm">Employee updated successfully!</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Employee Code</label>
                  <input
                    name="employee_code"
                    defaultValue={employee.employee_code ?? ''}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Position</label>
                  <input
                    name="position"
                    defaultValue={employee.position ?? ''}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Department</label>
                  <select
                    name="department"
                    defaultValue={employee.department ?? ''}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hire_date"
                    defaultValue={employee.hire_date ?? ''}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Basic Salary</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">$</span>
                    <input
                      type="number"
                      name="basic_salary"
                      min="0"
                      step="0.01"
                      defaultValue={employee.basic_salary != null ? employee.basic_salary.toString() : ''}
                      className="w-full pl-7 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={employee.status}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="resigned">Resigned</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="md:col-span-2 border-t border-outline-variant pt-4">
                  <h3 className="text-sm font-bold text-on-surface mb-3">Emergency Contact</h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Contact Name</label>
                  <input
                    name="emergency_name"
                    defaultValue={ec?.name ?? ''}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Contact Phone</label>
                  <input
                    name="emergency_phone"
                    defaultValue={ec?.phone ?? ''}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {hasAccount !== null && (
              <div className="border-t border-outline-variant pt-4">
                {hasAccount ? (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-secondary-container text-secondary p-3 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Login account exists
                    </div>
                    {!showResetPassword ? (
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-lg">lock_reset</span>
                        Reset Password
                      </button>
                    ) : (
                      <div className="space-y-2 p-3 rounded-lg bg-surface-container">
                        <label className="block text-sm font-semibold text-on-surface mb-1">New Password</label>
                        <input
                          type="text"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 chars)"
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        {resetState?.error && (
                          <div className="rounded-lg bg-error-container text-error p-2 text-xs">{resetState.error}</div>
                        )}
                        {resetState?.success && (
                          <div className="rounded-lg bg-secondary-container text-secondary p-2 text-xs">Password reset successfully!</div>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleResetPassword}
                            disabled={resetLoading || !newPassword}
                            className="flex items-center gap-1 px-3 py-1.5 bg-error text-white rounded-lg font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {resetLoading ? (
                              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                            ) : 'Set Password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowResetPassword(false); setNewPassword(''); setResetState(null) }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-surface-container p-3 text-sm text-on-surface-variant">
                      This employee does not have a login account for the mobile app.
                    </div>
                    {genState?.error && (
                      <div className="rounded-lg bg-error-container text-error p-3 text-sm">{genState.error}</div>
                    )}
                    {genState?.success && genState.credentials ? (
                      <div className="rounded-lg bg-primary-container text-primary p-3 text-sm space-y-1">
                        <p className="font-bold">Account Created</p>
                        <p>Employee ID: <span className="font-mono font-bold">{genState.credentials.employeeCode}</span></p>
                        <p>Password: <span className="font-mono font-bold">{genState.credentials.password}</span></p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGenerateAccount}
                        disabled={genLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {genLoading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                        ) : (
                          <><span className="material-symbols-outlined text-lg">person_add</span> Generate Login Account</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-outline-variant">
              <button type="button" onClick={onClose} disabled={pending}
                className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={pending}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {pending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">save</span> Save Changes</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center text-on-surface-variant text-sm">Employee not found.</div>
        )}
      </div>
    </div>
  )
}

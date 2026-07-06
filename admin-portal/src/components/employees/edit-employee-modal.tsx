'use client'

import { useEffect, useState, useRef, useActionState } from 'react'
import { updateEmployee, type EmployeeActionResult } from '@/lib/actions/employees'
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
  const ref = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<EmployeeActionResult, FormData>(
    updateEmployee,
    null
  )

  useEffect(() => {
    if (!employeeId || !organization?.id) return
    setLoading(true)
    setFetchError(null)
    supabase
      .from('employees')
      .select('id, employee_code, position, department, hire_date, basic_salary, status, emergency_contact')
      .eq('id', employeeId)
      .eq('organization_id', organization.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setFetchError(error.message)
        } else if (data) {
          setEmployee(data as unknown as EmployeeData)
        }
        setLoading(false)
      })
  }, [employeeId, organization?.id, supabase])

  useEffect(() => {
    if (state?.success) {
      onSaved()
    }
  }, [state?.success, onSaved])

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

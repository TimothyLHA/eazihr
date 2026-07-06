'use client'

import { useRef, useActionState, useEffect } from 'react'
import { addEmployee, type EmployeeActionResult } from '@/lib/actions/employees'
import { useOrganization } from '@/providers/org-provider'

type Props = {
  open: boolean
  onClose: () => void
}

export default function AddEmployeeModal({ open, onClose }: Props) {
  const ref = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<EmployeeActionResult, FormData>(
    addEmployee,
    null
  )
  const { organization } = useOrganization()

  useEffect(() => {
    if (state?.success) {
      ref.current?.reset()
      onClose()
    }
  }, [state?.success, onClose])

  const handleClose = () => {
    if (!pending) onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Add New Employee</h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form ref={ref} action={formAction}>
          <input type="hidden" name="organization_id" value={organization?.id ?? ''} />
          <div className="p-6 space-y-5">
            {state?.error && (
              <div className="rounded-lg bg-error-container text-error p-3 text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="rounded-lg bg-secondary-container text-secondary p-3 text-sm">
                Employee added successfully! An invite email has been sent.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  name="full_name"
                  required
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g. jane@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Employee Code</label>
                <input
                  name="employee_code"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g. EMP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Position</label>
                <input
                  name="position"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Department</label>
                <select
                  name="department"
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
                    className="w-full pl-7 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Status</label>
                <select
                  name="status"
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
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Contact Phone</label>
                <input
                  name="emergency_phone"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g. +1 555-0000"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {pending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

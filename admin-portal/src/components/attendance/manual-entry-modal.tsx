'use client'

import { useEffect, useState, useRef, useActionState } from 'react'
import { addAttendance, type AttendanceActionResult } from '@/lib/actions/attendance'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

type Props = {
  open: boolean
  onClose: () => void
}

type EmployeeOption = {
  id: string
  name: string
  employee_code: string | null
}

export default function ManualEntryModal({ open, onClose }: Props) {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const ref = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<AttendanceActionResult, FormData>(addAttendance, null)

  useEffect(() => {
    if (state?.success) {
      ref.current?.reset()
      onClose()
    }
  }, [state?.success, onClose])

  useEffect(() => {
    if (!open || !organization?.id) return
    setEmployeesLoading(true)
    supabase
      .from('employees')
      .select('id, employee_code, profile:profile_id(id, full_name)')
      .eq('organization_id', organization.id)
      .eq('status', 'active')
      .then(({ data }) => {
        if (data) {
          setEmployees(
            (data as Array<Record<string, unknown>>).map((e) => {
              const p = e.profile as { full_name?: string } | null
              return {
                id: e.id as string,
                name: p?.full_name || (e.employee_code as string) || 'Unknown',
                employee_code: (e.employee_code as string) ?? null,
              }
            })
          )
        }
        setEmployeesLoading(false)
      })
  }, [open, organization?.id, supabase])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">New Attendance Entry</h2>
          <button onClick={onClose} disabled={pending} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form ref={ref} action={formAction}>
          <input type="hidden" name="organization_id" value={organization?.id ?? ''} />
          <div className="p-6 space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-error-container text-error p-3 text-sm">{state.error}</div>
            )}

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Employee <span className="text-error">*</span></label>
              <select
                name="employee_id"
                required
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">Select employee</option>
                {employeesLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}{emp.employee_code ? ` (${emp.employee_code})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Date <span className="text-error">*</span></label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Check In</label>
                <input
                  type="time"
                  name="check_in"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Check Out</label>
                <input
                  type="time"
                  name="check_out"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Status</label>
              <select
                name="status"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="on_time">On Time</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Notes</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder="Optional notes..."
              />
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
                <><span className="material-symbols-outlined text-lg">save</span> Save Entry</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef, useActionState } from 'react'
import { updateAttendance, type AttendanceActionResult } from '@/lib/actions/attendance'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

type Props = {
  recordId: string | null
  onClose: () => void
  onSaved: () => void
}

type AttendanceData = {
  id: string
  date: string
  check_in: string | null
  check_out: string | null
  status: string
  notes: string | null
  employee_name: string
}

function toTimeInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function EditAttendanceModal({ recordId, onClose, onSaved }: Props) {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [record, setRecord] = useState<AttendanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const ref = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState<AttendanceActionResult, FormData>(updateAttendance, null)

  useEffect(() => {
    if (!recordId || !organization?.id) return
    setLoading(true)
    setFetchError(null)
    supabase
      .from('attendance_logs')
      .select('id, date, check_in, check_out, status, notes, employee_id')
      .eq('id', recordId)
      .eq('organization_id', organization.id)
      .single()
      .then(async ({ data, error }) => {
        if (error) {
          setFetchError(error.message)
        } else if (data) {
          const d = data as Record<string, unknown>
          const empId = d.employee_id as string
          let empName = 'Unknown'
          if (empId) {
            const { data: emp } = await supabase
              .from('employees')
              .select('profile:profile_id(id, full_name)')
              .eq('id', empId)
              .single()
            const p = (emp as Record<string, unknown> | null)?.profile as { full_name?: string } | null
            empName = p?.full_name || 'Unknown'
          }
          setRecord({
            id: d.id as string,
            date: d.date as string,
            check_in: d.check_in as string | null,
            check_out: d.check_out as string | null,
            status: d.status as string,
            notes: d.notes as string | null,
            employee_name: empName,
          })
        }
        setLoading(false)
      })
  }, [recordId, organization?.id, supabase])

  useEffect(() => {
    if (state?.success) {
      onSaved()
    }
  }, [state?.success, onSaved])

  if (!recordId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Edit Attendance</h2>
          <button onClick={onClose} disabled={pending} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 w-full bg-surface-container rounded animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="p-6"><div className="rounded-lg bg-error-container text-error p-3 text-sm">{fetchError}</div></div>
        ) : record ? (
          <form ref={ref} action={formAction}>
            <input type="hidden" name="id" value={record.id} />
            <input type="hidden" name="organization_id" value={organization?.id ?? ''} />
            <div className="p-6 space-y-4">
              {state?.error && (
                <div className="rounded-lg bg-error-container text-error p-3 text-sm">{state.error}</div>
              )}

              <div className="pb-3 border-b border-outline-variant">
                <p className="text-sm font-bold text-on-surface">{record.employee_name}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={record.date}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Check In</label>
                  <input
                    type="time"
                    name="check_in"
                    defaultValue={toTimeInput(record.check_in)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Check Out</label>
                  <input
                    type="time"
                    name="check_out"
                    defaultValue={toTimeInput(record.check_out)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={record.status}
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
                  defaultValue={record.notes ?? ''}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
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
                  <><span className="material-symbols-outlined text-lg">save</span> Save Changes</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center text-on-surface-variant text-sm">Record not found.</div>
        )}
      </div>
    </div>
  )
}

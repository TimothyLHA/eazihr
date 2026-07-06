'use client'

import { useRef, useEffect, useActionState } from 'react'
import { useOrganization } from '@/providers/org-provider'
import { createIncentive } from '@/lib/actions/incentives'
import type { EmployeeOption } from '@/hooks/use-incentives'

const INCENTIVE_TYPES = [
  { value: 'bonus', label: 'Bonus (Performance)' },
  { value: 'commission', label: 'Sales Commission' },
  { value: 'allowance', label: 'Allowance' },
  { value: 'other', label: 'Other' },
] as const

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  employees: EmployeeOption[]
}

export default function IncentiveModal({ open, onClose, onSuccess, employees }: Props) {
  const ref = useRef<HTMLFormElement>(null)
  const { organization } = useOrganization()
  const [state, formAction, pending] = useActionState(createIncentive, null)

  useEffect(() => {
    if (state?.success) {
      ref.current?.reset()
      onSuccess()
      onClose()
    }
  }, [state?.success, onSuccess, onClose])

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
          <h2 className="text-lg font-bold text-on-surface">Add New Incentive</h2>
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

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Employee <span className="text-error">*</span>
              </label>
              <select
                name="employee_id"
                required
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Type <span className="text-error">*</span>
              </label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">Select type</option>
                {INCENTIVE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Amount ($) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="amount"
                min="1"
                step="0.01"
                required
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Date</label>
              <input
                type="date"
                name="date"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder="Reason for this incentive..."
              />
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
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Incentive
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

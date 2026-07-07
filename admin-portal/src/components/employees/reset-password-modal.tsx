'use client'

import { useState } from 'react'
import { resetEmployeePassword } from '@/lib/actions/employees'

type Props = {
  employeeId: string | null
  organizationId: string
  employeeName: string
  onClose: () => void
  onDone: () => void
}

export default function ResetPasswordModal({ employeeId, organizationId, employeeName, onClose, onDone }: Props) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  if (!employeeId) return null

  const handleReset = async () => {
    setLoading(true)
    setResult(null)
    const res = await resetEmployeePassword(employeeId, organizationId, password)
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Reset Password</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">
            Set a new password for <span className="font-bold text-on-surface">{employeeName}</span>.
          </p>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">New Password</label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {result?.error && (
            <div className="rounded-lg bg-error-container text-error p-3 text-sm">{result.error}</div>
          )}

          {result?.success && (
            <div className="rounded-lg bg-secondary-container text-secondary p-3 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Password reset successfully
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {result?.success ? 'Close' : 'Cancel'}
          </button>
          {!result?.success && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading || password.length < 6}
              className="flex items-center gap-2 px-6 py-2 bg-error text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
              ) : (
                <><span className="material-symbols-outlined text-lg">lock_reset</span> Reset Password</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

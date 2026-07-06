'use client'

import type { LateLogEntry } from '@/hooks/use-late-logs'

type Props = {
  open: boolean
  entry: LateLogEntry | null
  onClose: () => void
}

function formatDateTime(dateStr: string, timeStr: string | null) {
  const d = new Date(dateStr + 'T00:00:00')
  const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  if (!timeStr) return { date, time: '--:--' }
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hr12 = hour % 12 || 12
  return { date, time: `${hr12}:${m} ${ampm}` }
}

export default function LateLogDetailModal({ open, entry, onClose }: Props) {
  if (!open || !entry) return null

  const { date, time } = formatDateTime(entry.date, entry.check_in_time)
  const isLate = entry.minutes_late > 15

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Late Entry Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-lg font-bold text-primary border border-outline-variant">
              {entry.employee_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-base font-bold text-on-surface">{entry.employee_name}</p>
              <p className="text-sm text-on-surface-variant">{entry.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-lg p-3">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-bold text-on-surface">{date}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-3">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Check-in Time</p>
              <p className="text-sm font-bold text-on-surface">{time}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-lg p-3 ${isLate ? 'bg-error-container' : 'bg-secondary-container'}`}>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Delay</p>
              <p className={`text-lg font-black ${isLate ? 'text-error' : 'text-secondary'}`}>{entry.minutes_late} min</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-3">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Status</p>
              <p className={`text-sm font-bold ${isLate ? 'text-error' : 'text-secondary'}`}>
                {isLate ? 'Late' : 'Grace Period'}
              </p>
            </div>
          </div>

          {entry.reason && (
            <div className="bg-surface-container-low rounded-lg p-3">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Reason / Note</p>
              <p className="text-sm text-on-surface">{entry.reason}</p>
            </div>
          )}

          <div className="bg-surface-container-low rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Employee ID</p>
            <p className="text-sm text-on-surface font-mono">{entry.employee_id}</p>
          </div>

          {entry.created_at && (
            <div className="bg-surface-container-low rounded-lg p-3">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Logged At</p>
              <p className="text-sm text-on-surface">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

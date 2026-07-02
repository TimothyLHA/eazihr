import { CalendarClock } from 'lucide-react'

export default function LeavePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Leave</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage leave requests and balances.</p>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
          <CalendarClock className="w-8 h-8 text-primary/40" />
        </div>
        <h2 className="text-lg font-semibold text-on-surface mb-2">Leave Management</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">Handle leave types, balances, requests, and approvals.</p>
      </div>
    </div>
  )
}

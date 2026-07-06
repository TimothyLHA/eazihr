'use client'

import { useState, useCallback } from 'react'
import { useLeave } from '@/hooks/use-leave'
import LeaveRequestModal from '@/components/leave/leave-request-modal'
import { approveLeave, rejectLeave } from '@/lib/actions/leave'
import type { LeaveBalanceRow, LeaveRequestRow } from '@/hooks/use-leave'

type Tab = 'quotas' | 'taken' | 'pending'

const tabs: { key: Tab; label: string }[] = [
  { key: 'quotas', label: 'Leave Quotas' },
  { key: 'taken', label: 'Taken Leave' },
  { key: 'pending', label: 'Pending Approvals' },
]

function StatusBadge({ remaining }: { remaining: number }) {
  if (remaining <= 3) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-container text-on-error-container">
        Low Balance
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container">
      Healthy
    </span>
  )
}

function LeaveStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-warning-container text-warning',
    approved: 'bg-secondary-container text-secondary',
    rejected: 'bg-error-container text-error',
    cancelled: 'bg-surface-container-high text-on-surface-variant',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-surface-container-high text-on-surface-variant'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl p-6 border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="h-4 w-36 bg-surface-container-high rounded mb-4" />
            <div className="h-8 w-28 bg-surface-container-high rounded mb-2" />
            <div className="h-3 w-44 bg-surface-container-high rounded" />
          </div>
        ))}
      </div>
      <div>
        <div className="h-10 w-full bg-surface-container-high rounded-lg mb-4" />
        <div className="h-64 bg-surface-container-high rounded-xl" />
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-error/30 bg-error-container/10 p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-error">error_outline</span>
      </div>
      <h2 className="text-lg font-semibold text-on-surface mb-2">Failed to load leave data</h2>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all"
      >
        Retry
      </button>
    </div>
  )
}

type QuotasTabProps = {
  balances: LeaveBalanceRow[]
  onRequestLeave: () => void
}

function QuotasTab({ balances, onRequestLeave }: QuotasTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-on-surface">Employee Leave Quotas</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button
            onClick={onRequestLeave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Leave Request
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Annual Quota</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Used</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Remaining</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {balances.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary border border-outline-variant">
                      {row.employee_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-on-surface">{row.employee_name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface">{row.leave_type}</td>
                <td className="px-6 py-4 text-sm text-on-surface">{row.allocated_days} Days</td>
                <td className="px-6 py-4 text-sm text-on-surface">{row.used_days} Days</td>
                <td className={`px-6 py-4 text-sm font-bold ${row.remaining_days <= 3 ? 'text-error' : 'text-on-surface'}`}>
                  {row.remaining_days} Days
                </td>
                <td className="px-6 py-4">
                  <StatusBadge remaining={row.remaining_days} />
                </td>
              </tr>
            ))}
            {balances.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                  No leave balances found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-on-surface-variant">Showing {balances.length} of {balances.length} employees</p>
        <div className="flex gap-2">
          <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="px-3 py-1 border border-primary bg-primary text-on-primary rounded text-sm font-medium">1</button>
          <button className="px-3 py-1 border border-outline-variant rounded text-sm font-medium hover:bg-surface-container">2</button>
          <button className="px-3 py-1 border border-outline-variant rounded text-sm font-medium hover:bg-surface-container">3</button>
          <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const statusFilterOptions = ['all', 'approved', 'rejected', 'cancelled', 'pending'] as const

type TakenTabProps = {
  requests: LeaveRequestRow[]
}

function TakenTab({ requests }: TakenTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (searchQuery && !r.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-on-surface">Leave History</h3>
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-52 pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
          >
            {statusFilterOptions.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Days</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary border border-outline-variant">
                      {row.employee_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-bold text-on-surface">{row.employee_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface">{row.leave_type}</td>
                <td className="px-6 py-4 text-sm text-on-surface">
                  {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-on-surface">{row.days}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">{row.reason ?? '-'}</td>
                <td className="px-6 py-4">
                  <LeaveStatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                  {requests.length === 0 ? 'No leave requests found' : 'No requests match your filters'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type PendingTabProps = {
  pending: LeaveRequestRow[]
  onRefresh: () => void
}

function PendingTab({ pending, onRefresh }: PendingTabProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = useCallback(async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    const fd = new FormData()
    fd.set('id', id)
    if (action === 'approve') {
      await approveLeave(null, fd)
    } else {
      await rejectLeave(null, fd)
    }
    setActionLoading(null)
    onRefresh()
  }, [onRefresh])

  if (pending.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl text-primary/40">check_circle</span>
        </div>
        <h2 className="text-lg font-semibold text-on-surface mb-2">All Caught Up</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">No pending leave requests awaiting your review.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-on-surface">Pending Approvals</h3>
        <p className="text-sm text-on-surface-variant">{pending.length} request{pending.length !== 1 ? 's' : ''} awaiting review</p>
      </div>
      <div className="flex flex-col gap-4">
        {pending.map(row => (
          <div key={row.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary border border-outline-variant shrink-0">
                  {row.employee_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-base font-bold text-on-surface">{row.employee_name}</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">{row.leave_type}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-on-surface">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">calendar_today</span>
                      {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">event</span>
                      {row.days} day{row.days !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {row.reason && (
                    <p className="text-sm text-on-surface-variant mt-2 italic">"{row.reason}"</p>
                  )}
                  <p className="text-xs text-on-surface-variant mt-2">
                    Submitted {new Date(row.created_at).toLocaleDateString()} at {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(row.id, 'reject')}
                  disabled={actionLoading === row.id}
                  className="flex items-center gap-1.5 px-4 py-2 border border-error/30 text-error rounded-lg text-sm font-bold hover:bg-error/5 transition-colors disabled:opacity-50"
                >
                  {actionLoading === row.id ? (
                    <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">close</span>
                  )}
                  Reject
                </button>
                <button
                  onClick={() => handleAction(row.id, 'approve')}
                  disabled={actionLoading === row.id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {actionLoading === row.id ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">check</span>
                  )}
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LeavePage() {
  const { balances, requests, pending, leaveTypes, employees, stats, loading, error, refetch } = useLeave()
  const [activeTab, setActiveTab] = useState<Tab>('quotas')
  const [showModal, setShowModal] = useState(false)

  if (loading) return <Skeleton />

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black tracking-tight text-on-surface">Leave Balance Overview</h1>
        <p className="text-xs text-on-surface-variant">Manage and track employee leave quotas, usage history, and pending approval workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-4 border border-outline-variant bg-surface-container-lowest shadow-sm">
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Total Company Quota</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-on-surface tracking-tight text-2xl font-bold">{stats.total_quota_days.toLocaleString()} Days</p>
            <span className="text-secondary text-xs font-bold">+2.4%</span>
          </div>
          <p className="text-on-surface-variant text-[10px] mt-0.5">Total leave pool for current fiscal year</p>
        </div>
        <div className="rounded-lg p-4 border border-outline-variant bg-surface-container-lowest shadow-sm">
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Total Leave Taken</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-on-surface tracking-tight text-2xl font-bold">{stats.total_taken_days.toLocaleString()} Days</p>
            <span className="text-secondary text-xs font-bold">+8.1%</span>
          </div>
          <p className="text-on-surface-variant text-[10px] mt-0.5">Utilization rate: {stats.total_quota_days > 0 ? ((stats.total_taken_days / stats.total_quota_days) * 100).toFixed(1) : '0.0'}% of total pool</p>
        </div>
        <div className="rounded-lg p-4 border border-outline-variant bg-surface-container-lowest shadow-sm">
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Pending Approvals</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-on-surface tracking-tight text-2xl font-bold">{stats.pending_requests} Requests</p>
            <span className="text-error text-xs font-bold">-12%</span>
          </div>
          <p className="text-on-surface-variant text-[10px] mt-0.5">Requires attention within 48 hours</p>
        </div>
      </div>

      <div className="border-b border-outline-variant">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 border-b-2 text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'border-primary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'quotas' && (
        <QuotasTab
          balances={balances}
          onRequestLeave={() => setShowModal(true)}
        />
      )}

      {activeTab === 'taken' && (
        <TakenTab requests={requests} />
      )}

      {activeTab === 'pending' && (
        <PendingTab pending={pending} onRefresh={refetch} />
      )}

      <LeaveRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refetch}
        leaveTypes={leaveTypes}
        employees={employees}
      />
    </div>
  )
}

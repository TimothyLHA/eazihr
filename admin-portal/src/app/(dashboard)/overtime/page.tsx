'use client'

import { useState, useCallback } from 'react'
import { useOvertime } from '@/hooks/use-overtime'
import OvertimeRequestModal from '@/components/overtime/overtime-request-modal'
import { approveOvertime, rejectOvertime } from '@/lib/actions/overtime'
import type { OvertimeEntry } from '@/hooks/use-overtime'

const statusStyles: Record<string, string> = {
  approved: 'bg-secondary-container text-on-secondary-container',
  pending: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant',
  rejected: 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-surface-container-highest rounded" />
          <div className="h-4 w-80 bg-surface-container-highest rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <div className="h-3 w-24 bg-surface-container-highest rounded" />
            <div className="h-8 w-16 bg-surface-container-highest rounded" />
            <div className="h-3 w-28 bg-surface-container-highest rounded" />
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-surface-container-highest rounded" />
              <div className="h-3 w-24 bg-surface-container-highest rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-error">error_outline</span>
      </div>
      <p className="text-on-surface-variant text-sm">{message}</p>
      <button onClick={onRetry} className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all">
        Retry
      </button>
    </div>
  )
}

type TableRowProps = {
  entry: OvertimeEntry
  onApprove: (id: string) => void
  onReject: (id: string) => void
  actionLoading: string | null
}

function TableRow({ entry, onApprove, onReject, actionLoading }: TableRowProps) {
  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary border border-outline-variant">
            {entry.employee_name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{entry.employee_name}</p>
            <p className="text-xs text-on-surface-variant">{entry.employee_code}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface">{formatDate(entry.date)}</td>
      <td className="px-6 py-4 text-sm text-on-surface text-center font-bold">{entry.hours}h</td>
      <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">{entry.reason ?? '—'}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${statusStyles[entry.status]}`}>
          {entry.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        {entry.status === 'pending' ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onReject(entry.id)}
              disabled={actionLoading === entry.id}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-error hover:bg-error-container transition-colors disabled:opacity-50"
            >
              {actionLoading === entry.id ? (
                <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-lg">close</span>
              )}
            </button>
            <button
              onClick={() => onApprove(entry.id)}
              disabled={actionLoading === entry.id}
              className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {actionLoading === entry.id ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-lg">check</span>
              )}
            </button>
          </div>
        ) : (
          <span className="text-xs font-medium text-on-surface-variant">
            {entry.status === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        )}
      </td>
    </tr>
  )
}

export default function OvertimePage() {
  const { entries, employees, stats, loading, error, refetch } = useOvertime()
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id)
    const fd = new FormData()
    fd.set('id', id)
    await approveOvertime(null, fd)
    setActionLoading(null)
    refetch()
  }, [refetch])

  const handleReject = useCallback(async (id: string) => {
    setActionLoading(id)
    const fd = new FormData()
    fd.set('id', id)
    await rejectOvertime(null, fd)
    setActionLoading(null)
    refetch()
  }, [refetch])

  const now = new Date()
  const filtered = entries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (searchQuery && !e.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.employee_code.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (dateFilter !== 'all') {
      const d = new Date(e.date)
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      if (dateFilter === 'week' && diffDays > 7) return false
      if (dateFilter === 'month' && diffDays > 30) return false
      if (dateFilter === 'quarter' && diffDays > 90) return false
    }
    return true
  })

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (loading) return <Skeleton />

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Overtime Requests</h1>
          <p className="text-xs text-on-surface-variant">Review and approve additional working hour submissions.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-outline text-on-surface rounded-lg font-bold text-xs hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Export Report
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Log Overtime
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Pending Requests</p>
          <h2 className="text-2xl font-black text-on-surface">{stats.pending_count}</h2>
          <p className="text-[10px] text-secondary font-medium mt-1">&uarr; Pending approvals</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Approved Hours</p>
          <h2 className="text-2xl font-black text-on-surface">{stats.approved_hours.toFixed(1)}</h2>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">This month</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Payout</p>
          <h2 className="text-2xl font-black text-on-surface">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(stats.total_payout)}
          </h2>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">Projected costs</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Active Multiplier</p>
          <h2 className="text-2xl font-black text-on-surface">{stats.active_multiplier}x</h2>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">Standard rate</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by employee name or code..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[180px]">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
            <div className="relative min-w-[150px]">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last Quarter</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">filter_list</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Hours</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map((r) => (
              <TableRow key={r.id} entry={r} onApprove={handleApprove} onReject={handleReject} actionLoading={actionLoading} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                  {entries.length === 0 ? 'No overtime requests found' : 'No requests match your filters'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant">
            Showing <span className="font-bold text-on-surface">{filtered.length}</span> of{' '}
            <span className="font-bold text-on-surface">{entries.length}</span> requests
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface text-xs hover:bg-surface-container transition-colors opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <OvertimeRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refetch}
        employees={employees}
      />
    </div>
  )
}

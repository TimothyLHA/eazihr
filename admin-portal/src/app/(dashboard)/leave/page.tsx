'use client'

import { useState } from 'react'
import { useLeave } from '@/hooks/use-leave'

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

export default function LeavePage() {
  const { balances, stats, loading, error, refetch } = useLeave()
  const [activeTab, setActiveTab] = useState<Tab>('quotas')

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
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">Employee Leave Quotas</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90">
                <span className="material-symbols-outlined text-lg">add</span>
                Adjust Quotas
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

          <div className="relative h-64 rounded-2xl overflow-hidden mt-4 bg-primary-container">
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-10">
              <div className="max-w-xl text-center space-y-4">
                <h2 className="text-3xl font-black text-white">Advanced Policy Engine</h2>
                <p className="text-white/90 text-lg">Your leave balances are synchronized with the company-wide compliance standards. Precision management for peak performance.</p>
                <button className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:opacity-90 transition-all">Configure Policies</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'taken' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-primary/40">event_busy</span>
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Taken Leave View</h2>
          <p className="text-sm text-on-surface-variant max-w-sm">Leave usage history by employee.</p>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-primary/40">pending_actions</span>
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Pending Approvals</h2>
          <p className="text-sm text-on-surface-variant max-w-sm">
            {stats.pending_requests > 0
              ? `${stats.pending_requests} leave request${stats.pending_requests > 1 ? 's' : ''} awaiting your review.`
              : 'No pending leave requests.'}
          </p>
        </div>
      )}
    </div>
  )
}

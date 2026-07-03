'use client'

import { useOvertime } from '@/hooks/use-overtime'

const statusStyles: Record<string, string> = {
  Approved: 'bg-secondary-container text-on-secondary-container',
  Pending: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant',
  Rejected: 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function OvertimePage() {
  const { entries, stats, loading, error, refetch } = useOvertime()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-on-surface-variant text-sm">Failed to load overtime data.</p>
        <button onClick={refetch} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
          Retry
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-8 w-60 bg-surface-container-highest rounded animate-pulse" />
            <div className="h-4 w-80 bg-surface-container-highest rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
              <div className="h-3 w-24 bg-surface-container-highest rounded animate-pulse" />
              <div className="h-8 w-16 bg-surface-container-highest rounded animate-pulse" />
              <div className="h-3 w-28 bg-surface-container-highest rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-surface-container-highest rounded animate-pulse" />
                <div className="h-3 w-24 bg-surface-container-highest rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Overtime Requests</h1>
          <p className="text-sm text-on-surface-variant">Review and approve additional working hour submissions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 border border-outline text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">file_download</span>
            Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-xl">add</span>
            Log Overtime
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pending Requests</p>
          <h2 className="text-3xl font-black text-on-surface">{stats.pending_count}</h2>
          <p className="text-xs text-secondary font-medium mt-2">&uarr; Pending approvals</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Approved Hours</p>
          <h2 className="text-3xl font-black text-on-surface">{stats.approved_hours.toFixed(1)}</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-2">This month</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Payout</p>
          <h2 className="text-3xl font-black text-on-surface">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(stats.total_payout)}
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-2">Projected costs</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Active Multiplier</p>
          <h2 className="text-3xl font-black text-on-surface">{stats.active_multiplier}x</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-2">Standard rate</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input type="text" placeholder="Search by employee name or ID..." className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[180px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
            <div className="relative min-w-[150px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>Last 30 Days</option>
                <option>This Week</option>
                <option>Previous Month</option>
                <option>All Time</option>
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
            {entries.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary border border-outline-variant">
                      {r.employee_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{r.employee_name}</p>
                      <p className="text-xs text-on-surface-variant">{r.employee_code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface">{formatDate(r.date)}</td>
                <td className="px-6 py-4 text-sm text-on-surface text-center font-bold">{r.hours}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">{r.reason ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${statusStyles[capitalize(r.status)]}`}>
                    {capitalize(r.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {r.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-error hover:bg-error-container transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </button>
                    </div>
                  ) : (
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant">
            Showing <span className="font-bold text-on-surface">{entries.length}</span> of{' '}
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
    </div>
  )
}

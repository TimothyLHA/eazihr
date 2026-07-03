'use client'

import { useIncentives } from '@/hooks/use-incentives'

const typeLabel: Record<string, string> = {
  bonus: 'Performance',
  commission: 'Sales Commission',
  allowance: 'Allowance',
  other: 'Other',
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase()
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', dot: 'bg-yellow-600' },
  approved: { label: 'Approved', color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-600' },
}

export default function IncentivesPage() {
  const { entries, stats, loading, error } = useIncentives()

  const statCards = [
    {
      label: 'Total Bonus Pool',
      value: formatCurrency(stats.total_pool),
      icon: 'account_balance',
      trend: `${stats.quarterly_growth >= 0 ? '+' : ''}${stats.quarterly_growth}% vs last month`,
      trendClass: 'text-green-600',
    },
    {
      label: 'Average Incentive',
      value: formatCurrency(stats.average),
      icon: 'equalizer',
      trend: `Across ${entries.length} employees`,
      trendClass: 'text-on-surface-variant',
    },
    {
      label: 'Pending Approvals',
      value: String(stats.pending_count),
      icon: 'pending_actions',
      trend: 'Requires sign-off',
      trendClass: 'text-on-surface-variant',
    },
    {
      label: 'Quarterly Growth',
      value: `${stats.quarterly_growth >= 0 ? '+' : ''}${stats.quarterly_growth}%`,
      icon: 'rocket_launch',
      trend: 'Steady increase',
      trendClass: 'text-green-600',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="h-9 w-72 bg-outline-variant rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-outline-variant rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-outline-variant rounded mb-3" />
              <div className="h-8 w-28 bg-outline-variant rounded mb-2" />
              <div className="h-3 w-20 bg-outline-variant rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden animate-pulse">
          <div className="p-6 border-b border-outline-variant">
            <div className="h-5 w-32 bg-outline-variant rounded mb-2" />
            <div className="h-3 w-48 bg-outline-variant rounded" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-outline-variant" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-outline-variant rounded" />
                  <div className="h-3 w-48 bg-outline-variant rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface">Incentives & Bonuses</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage employee rewards, performance bonuses, and referral incentives.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-error bg-error-container/20 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
          <p className="text-lg font-semibold text-error">Failed to load incentives</p>
          <p className="text-sm text-on-surface-variant mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Incentives & Bonuses</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage employee rewards, performance bonuses, and referral incentives.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-surface-container-highest px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">file_download</span>
            Export Report
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-all">
            <span className="material-symbols-outlined">add</span>
            Add New Incentive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-on-surface-variant">{item.label}</span>
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-on-surface">{item.value}</p>
            <p className={`mt-2 text-xs font-semibold ${item.trendClass}`}>{item.trend}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 p-6 border-b border-outline-variant bg-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Incentive Logs</h2>
            <p className="text-sm text-on-surface-variant">Review recent incentive awards and payout statuses.</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 pl-11 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Search employee or type..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Employee Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Incentive Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {entries.map((entry) => {
                const status = statusConfig[entry.status] ?? statusConfig.pending
                const type = typeLabel[entry.type] ?? entry.type
                return (
                  <tr key={entry.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{getInitials(entry.employee_name)}</div>
                        <span className="text-sm font-medium text-on-surface">{entry.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">{type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">{formatCurrency(entry.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${status.color}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 bg-surface-container-low px-6 py-4 border-t border-outline-variant text-xs text-on-surface-variant">
          <p>Showing {entries.length} of {entries.length} entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded hover:bg-surface-container transition-colors text-on-surface-variant disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="px-2 py-1 rounded bg-primary text-on-primary text-xs font-bold">1</button>
            <button className="p-2 rounded hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

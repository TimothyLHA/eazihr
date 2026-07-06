'use client'

import { useState, useMemo, useCallback } from 'react'
import { useIncentives, type IncentiveEntry } from '@/hooks/use-incentives'
import { approveIncentive } from '@/lib/actions/incentives'
import IncentiveModal from '@/components/incentives/incentive-modal'

const typeLabel: Record<string, string> = {
  bonus: 'Performance',
  commission: 'Sales Commission',
  allowance: 'Allowance',
  other: 'Other',
}

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pending', badge: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant', dot: 'bg-outline' },
  approved: { label: 'Approved', badge: 'bg-secondary-container text-on-secondary-container', dot: 'bg-secondary' },
}

const TYPE_OPTIONS = ['all', 'bonus', 'commission', 'allowance', 'other'] as const
const STATUS_OPTIONS = ['all', 'pending', 'approved'] as const

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase()
}

function generateCSV(entries: IncentiveEntry[]) {
  const headers = ['Employee', 'Type', 'Amount', 'Date', 'Status', 'Description']
  const rows = entries.map(e => [
    e.employee_name,
    typeLabel[e.type] ?? e.type,
    String(e.amount),
    e.date,
    e.status === 'approved' ? 'Approved' : 'Pending',
    e.description ?? '',
  ])
  return [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `incentives-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="h-9 w-72 rounded-lg bg-surface-container-highest" />
          <div className="h-4 w-96 rounded bg-surface-container-highest mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="h-4 w-24 bg-surface-container-highest rounded mb-3" />
            <div className="h-8 w-28 bg-surface-container-highest rounded mb-2" />
            <div className="h-3 w-20 bg-surface-container-highest rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant">
          <div className="h-5 w-32 bg-surface-container-highest rounded mb-2" />
          <div className="h-3 w-48 bg-surface-container-highest rounded" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-surface-container-highest rounded" />
                <div className="h-3 w-48 bg-surface-container-highest rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function IncentivesPage() {
  const { entries, employees, stats, loading, error, refetch } = useIncentives()
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!e.employee_name.toLowerCase().includes(q) && !(typeLabel[e.type] ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [entries, searchQuery, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id)
    const fd = new FormData()
    fd.set('id', id)
    await approveIncentive(null, fd)
    setActionLoading(null)
    refetch()
  }, [refetch])

  const handleExport = useCallback(() => {
    const csv = generateCSV(filtered)
    downloadCSV(csv)
  }, [filtered])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-on-surface">Incentives & Bonuses</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage employee rewards, performance bonuses, and referral incentives.</p>
          </div>
        </div>
        <div className="rounded-xl border border-error bg-error-container/20 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
          <p className="text-lg font-semibold text-error">Failed to load incentives</p>
          <p className="text-sm text-on-surface-variant mt-1">{error.message}</p>
          <button onClick={refetch} className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:opacity-90 transition-all">Retry</button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Bonus Pool',
      value: formatCurrency(stats.total_pool),
      icon: 'account_balance',
      trend: `${stats.quarterly_growth >= 0 ? '+' : ''}${stats.quarterly_growth}% vs last quarter`,
      trendClass: stats.quarterly_growth >= 0 ? 'text-secondary' : 'text-error',
      bar: Math.min(100, Math.round(stats.total_pool / (stats.total_pool || 1) * 85)),
    },
    {
      label: 'Average Incentive',
      value: formatCurrency(stats.average),
      icon: 'equalizer',
      trend: `Across ${entries.length} employee${entries.length !== 1 ? 's' : ''}`,
      trendClass: 'text-on-surface-variant',
      bar: Math.min(100, Math.round((stats.average / (stats.average || 1)) * 70)),
    },
    {
      label: 'Pending Approvals',
      value: String(stats.pending_count),
      icon: 'pending_actions',
      trend: stats.pending_count > 0 ? 'Requires sign-off' : 'None pending',
      trendClass: stats.pending_count > 0 ? 'text-error' : 'text-on-surface-variant',
      bar: Math.min(100, stats.pending_count * 25),
    },
    {
      label: 'Quarterly Growth',
      value: `${stats.quarterly_growth >= 0 ? '+' : ''}${stats.quarterly_growth}%`,
      icon: 'rocket_launch',
      trend: stats.quarterly_growth >= 10 ? 'Strong growth' : stats.quarterly_growth >= 0 ? 'Steady' : 'Declining',
      trendClass: stats.quarterly_growth >= 0 ? 'text-secondary' : 'text-error',
      bar: Math.min(100, Math.max(0, 50 + stats.quarterly_growth)),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Incentives & Bonuses</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage employee rewards, performance bonuses, and referral incentives.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-3 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">file_download</span>
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add New Incentive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(item => (
          <div key={item.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{item.label}</p>
              </div>
              <span className="rounded-lg bg-surface-container p-2 text-primary">
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </span>
            </div>
            <p className="text-2xl font-black text-on-surface">{item.value}</p>
            <p className={`mt-1 text-xs font-semibold ${item.trendClass}`}>{item.trend}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.bar}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-outline-variant">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Incentive Logs</h2>
            <p className="text-xs text-on-surface-variant">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative sm:w-52">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Search employee or type..."
                type="text"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1) }}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>{typeLabel[t] ?? t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginated.map(entry => {
                const cfg = statusConfig[entry.status] ?? statusConfig.pending
                const type = typeLabel[entry.type] ?? entry.type
                return (
                  <tr key={entry.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {getInitials(entry.employee_name)}
                        </div>
                        <span className="text-sm font-bold text-on-surface">{entry.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">{type}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-on-surface">{formatCurrency(entry.amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-on-surface-variant">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        {entry.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(entry.id)}
                            disabled={actionLoading === entry.id}
                            className="p-2 text-secondary hover:bg-secondary-container/50 rounded-lg transition-all disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === entry.id ? (
                              <span className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin inline-block" />
                            ) : (
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                            )}
                          </button>
                        )}
                        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-all" title="More">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    {entries.length === 0 ? 'No incentives recorded yet.' : 'No records match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-outline-variant bg-surface-container-low/30">
          <span className="text-xs text-on-surface-variant">
            Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
              const pageNum = start + i
              if (pageNum > totalPages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    pageNum === currentPage
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <IncentiveModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refetch}
        employees={employees}
      />
    </div>
  )
}

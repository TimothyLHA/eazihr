'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLoans, type LoanEntry } from '@/hooks/use-loans'
import LoanRequestModal from '@/components/loans/loan-request-modal'

const statusConfig: Record<string, { label: string; badge: string; color: string; note: string }> = {
  pending: { label: 'Pending', badge: 'bg-surface-container-highest text-on-surface-variant', color: 'bg-primary', note: 'Awaiting HR Review' },
  approved: { label: 'Approved', badge: 'bg-secondary-container text-on-secondary-container', color: 'bg-secondary', note: 'Ready for disbursement' },
  disbursed: { label: 'Active', badge: 'bg-secondary-container text-on-secondary-container', color: 'bg-secondary', note: 'Repayment in progress' },
  rejected: { label: 'Rejected', badge: 'bg-error-container text-on-error-container', color: 'bg-error', note: 'Application declined' },
  closed: { label: 'Completed', badge: 'bg-surface-container-high text-on-surface', color: 'bg-surface', note: 'Fully repaid' },
}

const defaultStatus = { label: 'Unknown', badge: 'bg-surface-container-highest text-on-surface-variant', color: 'bg-primary', note: 'Unknown status' }

const STATUS_FILTER_OPTIONS = ['all', 'pending', 'approved', 'disbursed', 'rejected', 'closed'] as const

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calcEndDate(createdAt: string, tenureMonths: number): string {
  if (!createdAt) return 'N/A'
  const d = new Date(createdAt)
  d.setMonth(d.getMonth() + tenureMonths)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function generateCSV(entries: LoanEntry[]) {
  const headers = ['Employee', 'Amount', 'Balance', 'Status', 'Purpose', 'Monthly EMI', 'Tenure (months)', 'Created']
  const rows = entries.map(e => [
    e.employee_name,
    String(e.amount),
    String(e.balance),
    e.status,
    e.purpose ?? '',
    String(e.monthly_emi),
    String(e.tenure_months),
    e.created_at ? new Date(e.created_at).toLocaleDateString() : '',
  ])
  return [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `loans-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function getProgressColor(pct: number): string {
  if (pct >= 75) return 'bg-secondary'
  if (pct >= 40) return 'bg-amber-500'
  return 'bg-error'
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="h-9 w-64 rounded-lg bg-surface-container-highest" />
          <div className="mt-2 h-5 w-96 rounded bg-surface-container-highest" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-surface-container-highest mb-3" />
            <div className="h-3 w-24 rounded bg-surface-container-highest mb-2" />
            <div className="h-8 w-32 rounded bg-surface-container-highest" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-surface-container-highest" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-container-highest" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-surface-container-highest" />
                  <div className="h-3 w-24 rounded bg-surface-container-highest" />
                </div>
              </div>
              <div className="h-16 rounded-xl bg-surface-container-highest" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LoansPage() {
  const { entries, employees, stats, loading, error, refetch } = useLoans()

  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!e.employee_name.toLowerCase().includes(q) && !(e.purpose ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [entries, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleExport = useCallback(() => {
    const csv = generateCSV(filtered)
    downloadCSV(csv)
  }, [filtered])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-lg font-bold text-on-surface">Failed to load loans</p>
        <p className="text-sm text-on-surface-variant">{error.message}</p>
        <button onClick={refetch} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:opacity-90 transition-all">Retry</button>
      </div>
    )
  }

  if (loading) return <Skeleton />

  const statCards = [
    { key: 'total_disbursed' as const, label: 'Total Disbursed', value: formatCurrency(stats.total_disbursed), icon: 'account_balance_wallet', badge: 'bg-secondary-container text-on-secondary-container', note: '+12.5% vs last month', bar: Math.min(100, Math.round(stats.total_disbursed / (stats.total_disbursed || 1) * 85)) },
    { key: 'pending_count' as const, label: 'Pending Requests', value: String(stats.pending_count), icon: 'pending_actions', badge: stats.pending_count > 0 ? 'bg-error-container text-on-error' : 'bg-surface-container-low text-on-surface-variant', note: stats.pending_count > 0 ? 'Awaiting review' : 'None pending', bar: Math.min(100, stats.pending_count * 25) },
    { key: 'active_count' as const, label: 'Active Repayments', value: String(stats.active_count), icon: 'event_repeat', badge: 'bg-secondary-container text-on-secondary-container', note: stats.active_count > 0 ? 'On track' : 'No active loans', bar: Math.min(100, stats.active_count * 25) },
    { key: 'collection_rate' as const, label: 'Collection Rate', value: `${stats.collection_rate}%`, icon: 'emergency_home', badge: stats.collection_rate >= 90 ? 'bg-secondary-container text-on-secondary-container' : stats.collection_rate >= 70 ? 'bg-amber-500/10 text-amber-700' : 'bg-error-container text-on-error', note: stats.collection_rate >= 90 ? 'Very healthy' : stats.collection_rate >= 70 ? 'Moderate' : 'Needs attention', bar: stats.collection_rate },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Loan Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track employee loan applications, approvals, and repayment schedules with full transparency.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-3 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add_card</span>
            New Loan Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.key} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="rounded-lg bg-surface-container p-2.5 text-primary">
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${s.badge}`}>{s.note}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</p>
            <p className="mt-1.5 text-2xl font-black text-on-surface">{s.value}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${s.bar}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-outline-variant">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Loan Requests</h2>
            <p className="text-xs text-on-surface-variant">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative sm:w-56">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Search name or purpose..."
                type="text"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              {STATUS_FILTER_OPTIONS.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
          {paginated.map((loan) => {
            const cfg = statusConfig[loan.status] || defaultStatus
            const progressColor = getProgressColor(loan.progress)
            return (
              <div key={loan.id} className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md">
                <div className={`${cfg.color} h-1.5 w-full`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                        {loan.employee_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{loan.employee_name}</h3>
                        <p className="text-xs text-on-surface-variant truncate">{loan.purpose || 'Loan'}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>{cfg.label}</span>
                  </div>

                  <div className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Applied Amount</p>
                    <p className="mt-1 text-xl font-black text-on-surface">{formatCurrency(loan.amount)}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-primary">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {cfg.note}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>Repayment Progress</span>
                      <span className="font-bold text-on-surface">{loan.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                      <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${loan.progress}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-on-surface-variant">
                      <div>
                        <p className="font-bold uppercase">Balance</p>
                        <p className="mt-0.5 text-sm font-bold text-on-surface">{formatCurrency(loan.balance)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold uppercase">EMI</p>
                        <p className="mt-0.5 text-sm font-bold text-on-surface">{formatCurrency(loan.monthly_emi)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/50">
                      <span>{loan.tenure_months} mo term</span>
                      <span>Ends {calcEndDate(loan.created_at, loan.tenure_months)}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-outline-variant bg-surface-container-low px-5 py-3 flex items-center justify-between">
                  <button className="text-xs font-bold text-primary hover:underline">View Schedule</button>
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                  </button>
                </div>
              </div>
            )
          })}

          {paginated.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4">
              <span className="material-symbols-outlined text-5xl text-outline">account_balance</span>
              <p className="text-sm font-bold text-on-surface">
                {entries.length === 0 ? 'No loan records yet' : 'No loans match your filters'}
              </p>
              <p className="text-xs text-on-surface-variant">
                {entries.length === 0 ? 'Loan requests from employees will appear here.' : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          )}

          <div
            onClick={() => setShowModal(true)}
            className="rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-6 flex flex-col items-center justify-center text-center gap-3 transition hover:bg-surface-container cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-primary">
              <span className="material-symbols-outlined">add</span>
            </div>
            <p className="text-sm font-bold text-on-surface">Create New</p>
            <p className="text-xs text-on-surface-variant">Manual loan entry</p>
          </div>
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
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <LoanRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refetch}
        employees={employees}
      />
    </div>
  )
}


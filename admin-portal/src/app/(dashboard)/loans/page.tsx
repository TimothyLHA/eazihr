'use client'

import { useLoans } from '@/hooks/use-loans'

const statusConfig: Record<string, { label: string; statusClass: string; color: string; note: string }> = {
  pending: { label: 'Pending', statusClass: 'bg-surface-container-highest text-on-surface-variant', color: 'bg-primary', note: 'Awaiting HR Review' },
  approved: { label: 'Active', statusClass: 'bg-secondary-container text-on-secondary-container', color: 'bg-secondary', note: 'Repayment in progress' },
  disbursed: { label: 'Active', statusClass: 'bg-secondary-container text-on-secondary-container', color: 'bg-secondary', note: 'Repayment in progress' },
  rejected: { label: 'Rejected', statusClass: 'bg-error-container text-on-error-container', color: 'bg-error', note: 'Application declined' },
  closed: { label: 'Completed', statusClass: 'bg-surface-container-high text-on-surface', color: 'bg-surface', note: 'Fully repaid' },
}

const defaultStatus = { label: 'Unknown', statusClass: 'bg-surface-container-highest text-on-surface-variant', color: 'bg-primary', note: 'Unknown status' }

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  date.setDate(date.getDate() + 30)
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const statCards = [
  { key: 'total_disbursed' as const, label: 'Total Disbursed', icon: 'account_balance_wallet', badge: 'bg-secondary-container text-on-secondary-container', format: (v: number) => formatCurrency(v) },
  { key: 'pending_count' as const, label: 'Pending Requests', icon: 'pending_actions', badge: 'bg-error-container text-on-error', format: (v: number) => String(v) },
  { key: 'active_count' as const, label: 'Active Repayments', icon: 'event_repeat', badge: 'bg-secondary-container text-on-secondary-container', format: (v: number) => String(v) },
  { key: 'collection_rate' as const, label: 'Collection Rate', icon: 'emergency_home', badge: 'bg-surface-container-high text-on-surface', format: (v: number) => `${v}%` },
]

function statNote(key: string, value: number): string {
  switch (key) {
    case 'total_disbursed': return '+12.5%'
    case 'pending_count': return value > 0 ? 'Awaiting review' : 'None pending'
    case 'active_count': return value > 0 ? 'On track' : 'No active loans'
    case 'collection_rate': return value >= 90 ? 'Very healthy' : value >= 70 ? 'Moderate' : 'Needs attention'
    default: return ''
  }
}

export default function LoansPage() {
  const { entries, stats, loading, error, refetch } = useLoans()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-lg font-bold text-on-surface">Failed to load loans</p>
        <p className="text-sm text-on-surface-variant">{error.message}</p>
        <button onClick={refetch} className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary">Retry</button>
      </div>
    )
  }

  if (loading) {
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
            <div key={i} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-surface-container-highest mb-4" />
              <div className="h-3 w-24 rounded bg-surface-container-highest mb-2" />
              <div className="h-8 w-32 rounded bg-surface-container-highest" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
              <div className="h-2 w-full bg-surface-container-highest" />
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-surface-container-highest" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-surface-container-highest" />
                    <div className="h-3 w-24 rounded bg-surface-container-highest" />
                  </div>
                </div>
                <div className="rounded-3xl border border-outline-variant bg-surface-container-low p-4 space-y-2">
                  <div className="h-3 w-20 rounded bg-surface-container-highest" />
                  <div className="h-7 w-28 rounded bg-surface-container-highest" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const mappedEntries = entries.map((loan) => {
    const cfg = statusConfig[loan.status] || defaultStatus
    return {
      ...loan,
      label: cfg.label,
      statusClass: cfg.statusClass,
      color: cfg.color,
      note: cfg.note,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(loan.employee_name)}&background=random&size=128`,
      formattedAmount: formatCurrency(loan.amount),
      formattedBalance: formatCurrency(loan.balance),
      dueDate: formatDate(loan.created_at),
      title: loan.purpose || 'Loan',
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Loan Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track employee loan applications, approvals, and repayment schedules with full transparency.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-lg">add_card</span>
          New Loan Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const value = stats[s.key]
          return (
            <div key={s.key} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-lg bg-surface-container p-2 text-primary">
                  <span className="material-symbols-outlined text-xl">{s.icon}</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.badge}`}>{statNote(s.key, value)}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</p>
              <p className="mt-2 text-2xl font-black text-on-surface">{s.format(value)}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Loan Requests</h2>
            <p className="text-xs text-on-surface-variant">Search employee loan applications and filter by status or type.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-xs text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Search employee name or loan ID..."
                type="text"
              />
            </div>
            <select className="sm:w-44 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
              <option>All Loan Types</option>
              <option>Salary Advance</option>
              <option>Personal Loan</option>
              <option>Emergency Loan</option>
              <option>Housing Loan</option>
            </select>
            <select className="w-full sm:w-52 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
              <option>Status: All</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Overdue</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {mappedEntries.map((loan) => (
          <div key={loan.id} className="group overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm transition-shadow hover:shadow-md">
            <div className={`${loan.color} h-2 w-full`} />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-surface-container-highest">
                    <img className="h-full w-full object-cover" src={loan.avatar} alt={loan.employee_name} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{loan.employee_name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{loan.title} &bull; ID: {loan.id}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${loan.statusClass}`}>{loan.label}</span>
              </div>

              <div className="rounded-3xl border border-outline-variant bg-surface-container-low px-4 py-4">
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Applied Amount</p>
                <p className="mt-2 text-2xl font-black text-on-surface">{loan.formattedAmount}</p>
                <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-primary">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  {loan.note}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Repayment Progress</span>
                  <span className="font-semibold text-on-surface">{loan.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${loan.progress}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-on-surface-variant">
                  <div>
                    <p className="font-bold uppercase">Balance</p>
                    <p className="mt-1 text-on-surface">{loan.formattedBalance}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold uppercase">Next Due</p>
                    <p className="mt-1 text-on-surface">{loan.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-outline-variant bg-surface-container-low px-6 py-3 flex items-center justify-between">
              <button className="text-xs font-bold text-primary hover:underline">View Schedule</button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">more_horiz</span>
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-3xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 flex flex-col items-center justify-center text-center gap-4 transition hover:bg-surface-container cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest text-primary">
            <span className="material-symbols-outlined">add</span>
          </div>
          <p className="text-sm font-bold text-on-surface">Create New</p>
          <p className="text-xs text-on-surface-variant">Manual loan entry</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-{Math.min(entries.length, 3)}</span> of <span className="font-bold text-on-surface">{entries.length}</span> loan records</p>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded bg-primary text-white text-sm font-bold">1</button>
          <button className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">2</button>
          <span className="text-sm text-on-surface-variant">...</span>
          <button className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

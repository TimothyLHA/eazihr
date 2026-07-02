'use client'

const loanCards = [
  {
    name: 'Sarah Chen',
    type: 'Salary Advance',
    id: 'LN-4921',
    amount: '$12,500',
    progress: 60,
    status: 'Active',
    statusClass: 'bg-secondary-container text-on-secondary-container',
    dueDate: 'Nov 12, 2026',
  },
  {
    name: 'Marcus Thorne',
    type: 'Emergency Loan',
    id: 'LN-4918',
    amount: '$7,200',
    progress: 35,
    status: 'Pending',
    statusClass: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant',
    dueDate: 'Nov 05, 2026',
  },
  {
    name: 'Elena Rodriguez',
    type: 'Equipment Purchase',
    id: 'LN-4899',
    amount: '$21,000',
    progress: 85,
    status: 'Approved',
    statusClass: 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
    dueDate: 'Dec 02, 2026',
  },
]

const stats = [
  { label: 'Total Disbursed', value: '$1,240,500', note: '+12.5%', icon: 'account_balance_wallet', badge: 'bg-secondary-container text-on-secondary-container' },
  { label: 'Pending Requests', value: '18', note: '4 urgent', icon: 'pending_actions', badge: 'bg-error-container text-on-error' },
  { label: 'Active Repayments', value: '84', note: 'On track', icon: 'event_repeat', badge: 'bg-secondary-container text-on-secondary-container' },
  { label: 'Collection Rate', value: '99.2%', note: 'Very healthy', icon: 'emergency_home', badge: 'bg-surface-container-high text-on-surface' },
]

export default function LoansPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Loan Management</h1>
          <p className="text-sm text-on-surface-variant">Track employee loans, approvals, and repayment schedules from a single view.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">add_card</span>
          New Loan Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-surface-container p-3 text-primary">
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${stat.badge}`}>{stat.note}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Loan Requests</h2>
            <p className="text-xs text-on-surface-variant">Search and filter active and pending loan applications.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative min-w-[180px]">
              <select className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary">
                <option>All Loan Types</option>
                <option>Salary Advance</option>
                <option>Emergency Loan</option>
                <option>Equipment Purchase</option>
              </select>
            </div>
            <div className="relative min-w-[160px]">
              <select className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary">
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Active</option>
                <option>Approved</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {loanCards.map((loan) => (
            <div key={loan.id} className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-secondary w-full" />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{loan.name}</p>
                    <p className="text-xs text-on-surface-variant">{loan.type} • {loan.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${loan.statusClass}`}>{loan.status}</span>
                </div>
                <p className="text-3xl font-black text-on-surface">{loan.amount}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Repayment Progress</span>
                    <span>{loan.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${loan.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Due Date</span>
                  <span>{loan.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

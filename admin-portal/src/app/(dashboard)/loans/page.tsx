'use client'

const loanCards = [
  {
    id: 'LN-4921',
    name: 'Sarah Chen',
    title: 'Salary Advance',
    subtitle: 'ID: LN-4921',
    amount: '$1,200.00',
    progress: 60,
    status: 'Active',
    statusClass: 'bg-secondary-container text-on-secondary-container',
    note: 'Awaiting HR Review',
    balance: '$1,200.00',
    dueDate: 'Oct 28, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0XoduiiuD9rdZ_KikNog0VqS3RKqxCkqV5p4H5bK3sccyQ_lA84GD3Hd7eabHrUPACOADG0JRNwWI-a_vOo4UjSq3SsrZKVlWZeMoJhDPMyWJ4wrEvaEI72Puhgk5NKs7JskDF5IBrfdGPYnRZWCK2oyi8hOVKHuov0yoawjfNZTRDADwYiei8Rvu1NhsXsBdsRRNV9y1vM9-glRmBMnCmZS4vvtmeFTfurUHXtJS_bf6mzTUwIrdiskKw1mCZq9w_CJwjvKqlJ4',
    color: 'bg-secondary',
  },
  {
    id: 'LN-5012',
    name: 'Marcus Thorne',
    title: 'Personal Loan',
    subtitle: 'ID: LN-5012',
    amount: '$5,000.00',
    progress: 45,
    status: 'Pending',
    statusClass: 'bg-surface-container-highest text-on-surface-variant',
    note: 'Awaiting HR Review',
    balance: '$5,000.00',
    dueDate: 'Nov 08, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW4YL-3vAhDEGQ8lPYg1L5L5rDIvsLif90WGGmCna0lPx0Cf9exiMdrafdzvaD6_tFXjM4rOkQBKyEyDO2caMZVivtDHs-zll-yJe2tt6qlf7lSYTfajpavAHYl8dMKMV5jnphofxnogOhtyRYN-HQN0-Fl2uY52X3g9UXR6mlJP-GjIRXWupCKOsNF4FomXOjzYEWDEf1846oWy4kb9MNzTfBoSatZ9zmFHbpiH6soU79HZc-G3hM0ofs97BOE7by5Q3k3e3FPiQ',
    color: 'bg-primary',
  },
  {
    id: 'LN-4288',
    name: 'Elena Rodriguez',
    title: 'Housing Loan',
    subtitle: 'ID: LN-4288',
    amount: '$450.20',
    progress: 25,
    status: 'Overdue',
    statusClass: 'bg-error-container text-on-error-container',
    note: 'Delayed repayment',
    balance: '$450.20',
    dueDate: 'Nov 15, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOSXFBeSbtRMqlgtYgePm0lyW9ef_sVZBKYKwWTyVDecvGjXMowOlnv5EGHJ2jaN-95SL-1Caj1Q4V7ZiaE_gFHPIFLilodpQqOJZYIC85QbcUZjLAuFWG8HmIaRyfsk8NwhYOYpI0924T_g8-7BbOR-ZtO9dzjC823mfrNQ1NcXlyF_To_1mhtWMyf_XjpFHfhHEnuMA9NaPDogBdnxAHrrzhaDpBhkSXHBWuVTNbNpr9yEbTluoiefA69sgT55H3GEWqPWjFazI',
    color: 'bg-error',
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Loan Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track employee loan applications, approvals, and repayment schedules with full transparency.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90 transition-all">
          <span className="material-symbols-outlined">add_card</span>
          New Loan Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-2xl bg-surface-container p-3 text-primary">
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${stat.badge}`}>{stat.note}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)] lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Loan Requests</h2>
            <p className="text-sm text-on-surface-variant">Search employee loan applications and filter by status or type.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 pl-11 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Search employee name or loan ID..."
                type="text"
              />
            </div>
            <select className="w-full sm:w-52 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
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
        {loanCards.map((loan) => (
          <div key={loan.id} className="group overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm transition-shadow hover:shadow-md">
            <div className={`${loan.color} h-2 w-full`} />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-surface-container-highest">
                    <img className="h-full w-full object-cover" src={loan.avatar} alt={loan.name} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{loan.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{loan.title} • {loan.subtitle}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${loan.statusClass}`}>{loan.status}</span>
              </div>

              <div className="rounded-3xl border border-outline-variant bg-surface-container-low px-4 py-4">
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Applied Amount</p>
                <p className="mt-2 text-2xl font-black text-on-surface">{loan.amount}</p>
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
                    <p className="mt-1 text-on-surface">{loan.balance}</p>
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
        <p className="text-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-3</span> of <span className="font-bold text-on-surface">102</span> loan records</p>
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

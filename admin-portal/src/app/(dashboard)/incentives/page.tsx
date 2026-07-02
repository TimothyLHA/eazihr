'use client'

const incentiveCards = [
  { title: 'Total Incentives', value: '$82,400', note: 'Oct 2026 projection', icon: 'military_tech', badge: 'bg-secondary-container text-on-secondary-container' },
  { title: 'Referral Bonuses', value: '$12,400', note: 'Employee rewards', icon: 'people_alt', badge: 'bg-surface-container-highest text-on-surface-variant' },
  { title: 'Spot Awards', value: '$9,250', note: 'Real-time distribution', icon: 'emoji_events', badge: 'bg-surface-container-highest text-on-surface-variant' },
]

const incentiveData = [
  { label: 'Sales Commission', amount: '$54,000', progress: 65 },
  { label: 'Performance Bonus', amount: '$18,350', progress: 35 },
  { label: 'Safety Reward', amount: '$10,050', progress: 40 },
]

export default function IncentivesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Incentives & Bonuses</h1>
          <p className="text-sm text-on-surface-variant">Manage incentive pools, variable pay, and performance rewards.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">add</span>
          Add Incentive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {incentiveCards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-2xl bg-surface-container p-3 text-primary"><span className="material-symbols-outlined text-2xl">{card.icon}</span></span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${card.badge}`}>{card.note}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{card.title}</p>
            <p className="mt-3 text-3xl font-black text-on-surface">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Incentive Breakdown</h2>
            <p className="text-xs text-on-surface-variant">See how incentives are allocated across programs.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-2xl bg-surface-container text-on-surface font-semibold text-sm">Export Report</button>
            <button className="px-4 py-2 rounded-2xl bg-secondary text-on-secondary font-semibold text-sm">Sync Payouts</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {incentiveData.map((item) => (
            <div key={item.label} className="rounded-3xl border border-outline-variant bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{item.label}</p>
              <p className="mt-4 text-3xl font-black text-on-surface">{item.amount}</p>
              <div className="mt-4 text-xs text-on-surface-variant flex items-center justify-between">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

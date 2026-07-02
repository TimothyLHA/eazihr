'use client'

const stats = [
  { label: 'Total Bonus Pool', value: '$128,500', icon: 'account_balance', trend: '8.2% vs last month', trendClass: 'text-green-600' },
  { label: 'Average Incentive', value: '$2,450', icon: 'equalizer', trend: 'Across 52 employees', trendClass: 'text-on-surface-variant' },
  { label: 'Pending Approvals', value: '14', icon: 'pending_actions', trend: 'Requires sign-off', trendClass: 'text-on-surface-variant' },
  { label: 'Quarterly Growth', value: '+12.5%', icon: 'rocket_launch', trend: 'Steady increase', trendClass: 'text-green-600' },
]

const incentiveRows = [
  { name: 'Alex Cooper', type: 'Performance', amount: '$3,500.00', date: 'Oct 24, 2023', status: 'Paid', statusColor: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-600' },
  { name: 'Jordan Miller', type: 'Sales Commission', amount: '$1,250.00', date: 'Oct 25, 2023', status: 'Pending', statusColor: 'bg-yellow-50 text-yellow-700 border-yellow-100', dot: 'bg-yellow-600' },
  { name: 'Samantha Reed', type: 'Referral Bonus', amount: '$500.00', date: 'Oct 26, 2023', status: 'Approved', statusColor: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-600' },
  { name: 'Taylor Hudson', type: 'Performance', amount: '$2,100.00', date: 'Oct 26, 2023', status: 'Pending', statusColor: 'bg-yellow-50 text-yellow-700 border-yellow-100', dot: 'bg-yellow-600' },
]

export default function IncentivesPage() {
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
        {stats.map((item) => (
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
              {incentiveRows.map((row) => (
                <tr key={row.name} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{row.name.split(' ').map((part) => part[0]).join('')}</div>
                      <span className="text-sm font-medium text-on-surface">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">{row.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">{row.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${row.statusColor}`}> 
                      <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 bg-surface-container-low px-6 py-4 border-t border-outline-variant text-xs text-on-surface-variant">
          <p>Showing 4 of 52 entries</p>
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

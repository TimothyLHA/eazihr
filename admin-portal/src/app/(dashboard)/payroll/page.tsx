'use client'

const cycles = [
  { period: 'Oct Main Cycle', range: 'Oct 01 - Oct 31, 2023', employees: '428', status: 'Draft', statusStyle: 'bg-secondary-container text-on-secondary-container' },
  { period: 'Q3 Performance Bonus', range: 'One-time payout', employees: '112', status: 'Pending', statusStyle: 'bg-surface-container-high text-on-surface' },
  { period: 'Sep Main Cycle', range: 'Sep 01 - Sep 30, 2023', employees: '425', status: 'Completed', statusStyle: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
]

const barHeights = [40, 55, 48, 65, 80, 92]
const months = ['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT']

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-on-surface tracking-tight">Payroll Operations</h2>
          <p className="text-xs text-on-surface-variant font-medium">Cycle: October 1 - October 31, 2023</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-outline font-bold text-xs hover:bg-surface-container-high transition-all">Export Reports</button>
          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">add</span> Start New Run
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant p-4 rounded-[1.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 bg-secondary-container text-on-secondary-container rounded-lg material-symbols-outlined">account_balance</span>
              <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">trending_up</span> +4.2%
              </span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Total Payroll Cost</p>
            <h3 className="text-4xl font-black text-on-surface mt-2">$1,428,500<span className="text-xl font-normal text-outline">.00</span></h3>
            <p className="text-xs text-outline mt-1 italic">vs $1,371,000 last month</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant p-4 rounded-[1.5rem] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Historical Trend</p>
              <p className="text-[10px] text-outline">Gross Expenditure (Last 6 Months)</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[10px] font-bold px-3 py-1 bg-primary text-on-primary rounded-full">Monthly</button>
              <button className="text-[10px] font-bold px-3 py-1 text-on-surface-variant hover:bg-surface-container rounded-full">Quarterly</button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[160px] relative">
            <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-lg transition-all ${i === 5 ? 'bg-primary hover:shadow-xl' : 'bg-surface-container-high hover:bg-primary'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4 px-2">
            {months.map((m, i) => (
              <span key={i} className={`text-[10px] font-bold ${i === 5 ? 'text-primary' : 'text-outline'}`}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-on-surface">Active Payroll Cycles</h4>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              View All Records <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[1.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Cycle Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Employees</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {cycles.map((c, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-on-surface leading-tight">{c.period}</p>
                      <p className="text-[11px] text-outline">{c.range}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-on-surface">{c.employees}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${c.statusStyle}`}>
                        <span className={`size-1.5 rounded-full ${c.status === 'Draft' ? 'bg-secondary animate-pulse' : c.status === 'Pending' ? 'bg-primary' : 'bg-on-tertiary-fixed-variant'}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">
                          {c.status === 'Draft' ? 'edit' : c.status === 'Pending' ? 'visibility' : 'download'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-3">
          <h4 className="text-sm font-bold text-on-surface">Variable Pay Breakdown</h4>
          <div className="space-y-3">
            <div className="bg-surface-container-highest/30 border border-outline-variant rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                    <span className="material-symbols-outlined text-base">military_tech</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Total Incentives</p>
                    <p className="text-[10px] text-outline">Oct 2023 Projection</p>
                  </div>
                </div>
                <p className="text-base font-black text-on-surface">$82,400</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-on-surface-variant font-medium">Sales Commission</span>
                  <span className="text-on-surface font-bold">$54,000</span>
                </div>
                <div className="w-full bg-outline-variant h-1 rounded-full">
                  <div className="bg-tertiary-fixed-dim w-[65%] h-full rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-on-surface-variant font-medium">Referral Bonuses</span>
                  <span className="text-on-surface font-bold">$12,400</span>
                </div>
                <div className="w-full bg-outline-variant h-1 rounded-full">
                  <div className="bg-primary w-[15%] h-full rounded-full" />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-highest/30 border border-outline-variant rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
                    <span className="material-symbols-outlined text-base">timer</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Overtime Costs</p>
                    <p className="text-[10px] text-outline">1,240 Total Hours</p>
                  </div>
                </div>
                <p className="text-base font-black text-on-surface">$46,250</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Dev Team</p>
                  <p className="text-sm font-black text-on-surface">$28,100</p>
                  <p className="text-[9px] text-error font-bold">+12% vs avg</p>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Customer Support</p>
                  <p className="text-sm font-black text-on-surface">$18,150</p>
                  <p className="text-[9px] text-secondary font-bold">-4% vs avg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-on-primary rounded-[2rem] p-8 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10 space-y-2 max-w-lg">
          <h3 className="text-2xl font-black leading-tight">Predictive Insight: Tax Optimization</h3>
          <p className="text-on-primary/70 text-sm">Our AI models have identified $12,500 in potential tax savings by adjusting your current allocation for the European division. Review the proposed adjustments before final approval.</p>
          <div className="pt-4">
            <button className="px-6 py-3 bg-secondary-fixed text-on-secondary-fixed-variant font-bold text-sm rounded-xl hover:scale-105 transition-transform">Run Simulation</button>
          </div>
        </div>
        <div className="relative z-10 hidden md:block">
          <span className="material-symbols-outlined text-[80px] text-white/20">auto_awesome</span>
        </div>
      </section>
    </div>
  )
}

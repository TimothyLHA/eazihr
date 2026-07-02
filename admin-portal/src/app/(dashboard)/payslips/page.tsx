'use client'

const topCards = [
  { label: 'Total Disbursed', value: '$428,500.00', note: '+2.4% vs last month', icon: 'trending_up', intent: 'secondary' },
  { label: 'Generated Slips', value: '1,240', note: '100% Completed', icon: 'check_circle', intent: 'surface' },
  { label: 'Pending Review', value: '14', note: 'Action required', icon: 'schedule', intent: 'tertiary' },
]

const payslipRows = [
  { name: 'Jane Doe', id: 'EMP-0042', period: 'Oct 01 - Oct 31, 2023', gross: '$8,400.00', status: 'Published', statusClass: 'bg-secondary/10 text-secondary', actions: ['visibility', 'download'] },
  { name: 'Marcus Aurelius', id: 'EMP-0091', period: 'Oct 01 - Oct 31, 2023', gross: '$12,200.00', status: 'Published', statusClass: 'bg-secondary/10 text-secondary', actions: ['visibility', 'download'] },
  { name: 'Sarah Lima', id: 'EMP-0105', period: 'Oct 01 - Oct 31, 2023', gross: '$6,950.00', status: 'Pending Review', statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed', actions: ['visibility', 'download'] },
]

export default function PayslipsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Payslips Archive</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage, generate, and review employee earnings records.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-2xl bg-white border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter Archive
          </button>
          <button className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-all shadow-md">
            <span className="material-symbols-outlined text-[20px]">sync</span>
            Run Bulk Generation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {topCards.map((card) => (
              <div key={card.label} className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-2">{card.label}</p>
                <p className="text-title-md font-bold text-primary">{card.value}</p>
                <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${card.intent === 'secondary' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                  {card.note}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="flex flex-col gap-4 p-6 border-b border-outline-variant bg-surface-container-lowest md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <select className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>October 2023</option>
                  <option>September 2023</option>
                  <option>August 2023</option>
                </select>
                <select className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Sales</option>
                </select>
              </div>
              <div className="text-sm text-on-surface-variant">Showing 1-10 of 1,240</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Pay Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Gross</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {payslipRows.map((row, index) => (
                    <tr key={index} className="group cursor-pointer border-l-4 border-transparent transition-colors hover:bg-surface-container-lowest hover:border-primary">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-primary font-bold text-caption">{row.name.split(' ').map((n) => n[0]).join('')}</div>
                          <div>
                            <p className="font-semibold text-on-surface">{row.name}</p>
                            <p className="text-xs text-on-surface-variant">ID: {row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface">{row.period}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-on-surface">{row.gross}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${row.statusClass}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-outline transition-colors group-hover:text-primary">
                        {row.actions.map((icon) => (
                          <button key={icon} className="ml-2 text-on-surface-variant hover:text-primary">
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-outline-variant bg-white shadow-sm sticky top-24 overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">Preview</h3>
                <p className="text-xs text-on-surface-variant">Last Generated: Oct 28, 2023</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-2xl bg-white border border-outline-variant p-2 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">print</span>
                </button>
                <button className="rounded-2xl bg-white border border-outline-variant p-2 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(100vh-240px)] bg-white payslip-preview-scroll">
              <div className="relative rounded-3xl border-2 border-dashed border-outline-variant p-6">
                <div className="absolute right-6 top-6 opacity-10">
                  <span className="material-symbols-outlined text-[64px]">receipt_long</span>
                </div>
                <div className="mb-8">
                  <p className="text-headline-lg font-bold text-primary">HRMS PORTAL</p>
                  <p className="text-xs text-on-surface-variant">Corporate Head Office, NY 10001</p>
                </div>
                <div className="flex justify-between border-b border-outline-variant pb-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">EMPLOYEE</p>
                    <p className="text-base font-bold text-on-surface">Jane Doe</p>
                    <p className="text-xs text-on-surface-variant">Senior Product Designer</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">PAY DATE</p>
                    <p className="text-base font-bold text-on-surface">Oct 31, 2023</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-3">EARNINGS</p>
                  <div className="space-y-2 text-sm text-on-surface">
                    <div className="flex justify-between"><span>Basic Salary</span><span className="font-semibold">$6,500.00</span></div>
                    <div className="flex justify-between"><span>House Rent Allowance</span><span className="font-semibold">$1,200.00</span></div>
                    <div className="flex justify-between"><span>Performance Bonus</span><span className="font-semibold">$700.00</span></div>
                    <div className="mt-2 flex justify-between border-t border-outline-variant pt-2 font-bold"><span>Gross Earnings</span><span>$8,400.00</span></div>
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-wider text-error mb-3">DEDUCTIONS</p>
                  <div className="space-y-2 text-sm text-on-surface">
                    <div className="flex justify-between"><span>Income Tax (PAYE)</span><span className="font-semibold">-$1,420.00</span></div>
                    <div className="flex justify-between"><span>Health Insurance</span><span className="font-semibold">-$150.00</span></div>
                    <div className="flex justify-between"><span>Retirement Fund</span><span className="font-semibold">-$310.00</span></div>
                    <div className="mt-2 flex justify-between border-t border-outline-variant pt-2 font-bold text-error"><span>Total Deductions</span><span>-$1,880.00</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-primary px-4 py-4 text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/80">Net Take-Home Pay</p>
                    <p className="text-2xl font-bold">$6,520.00</p>
                  </div>
                  <span className="material-symbols-outlined text-[32px] text-white/80">payments</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full rounded-2xl bg-surface-container text-primary px-5 py-3 text-sm font-semibold hover:bg-surface-container-high transition-colors">Send to Employee Email</button>
            <button className="w-full rounded-2xl border border-outline-variant bg-white px-5 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">Void This Payslip</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

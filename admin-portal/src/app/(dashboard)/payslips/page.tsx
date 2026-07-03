'use client'

import { usePayslips } from '@/hooks/use-payslips'

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const countFmt = (n: number) => n.toLocaleString('en-US')

function getStatusInfo(status: string) {
  if (status === 'generated')
    return { label: 'Pending Review', className: 'bg-tertiary-fixed text-on-tertiary-fixed' }
  return { label: 'Published', className: 'bg-secondary/10 text-secondary' }
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-outline-variant/40 ${className ?? ''}`} />
}

export default function PayslipsPage() {
  const { entries, stats, loading, error, refetch } = usePayslips()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-80 mt-2" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-2xl" />
            <Skeleton className="h-11 w-44 rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-40 mt-4" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant">
                <Skeleton className="h-10 w-48" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-36 mt-1" />
              </div>
              <div className="p-8">
                <Skeleton className="h-64 w-full rounded-3xl" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-on-surface">Payslips Archive</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage, generate, and review employee earnings records.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-error/20 bg-error/5 p-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[24px]">error_outline</span>
            <div>
              <p className="font-semibold text-error">Failed to load payslips</p>
              <p className="text-sm text-on-surface-variant mt-0.5">{error.message}</p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const topCards = [
    { label: 'Total Disbursed', value: fmt(stats.total_disbursed), note: '+2.4% vs last month', icon: 'trending_up', intent: 'secondary' },
    { label: 'Generated Slips', value: countFmt(stats.total_count), note: '100% Completed', icon: 'check_circle', intent: 'surface' },
    { label: 'Pending Review', value: countFmt(stats.pending_count), note: 'Action required', icon: 'schedule', intent: 'tertiary' },
  ]

  return (
      <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Payslips Archive</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage, generate, and review employee earnings records.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-white border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter Archive
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-all shadow-md">
            <span className="material-symbols-outlined text-[20px]">sync</span>
            Run Bulk Generation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-outline-variant bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-2">{card.label}</p>
                <p className="text-title-md font-bold text-primary">{card.value}</p>
                <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${card.intent === 'secondary' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                  {card.note}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 p-4 border-b border-outline-variant bg-surface-container-lowest md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1.5">
                <select className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>October 2023</option>
                  <option>September 2023</option>
                  <option>August 2023</option>
                </select>
                <select className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Sales</option>
                </select>
              </div>
              <div className="text-sm text-on-surface-variant">Showing 1-10 of {countFmt(stats.total_count)}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Pay Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Gross</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {entries.map((row) => {
                    const status = getStatusInfo(row.status)
                    return (
                      <tr key={row.id} className="group cursor-pointer border-l-4 border-transparent transition-colors hover:bg-surface-container-lowest hover:border-primary">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-primary font-bold text-caption">{row.employee_name.split(' ').map((n) => n[0]).join('')}</div>
                            <div>
                              <p className="font-semibold text-on-surface">{row.employee_name}</p>
                              <p className="text-xs text-on-surface-variant">ID: {row.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface">{row.period}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-on-surface">{fmt(row.gross_pay)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${status.className}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-outline transition-colors group-hover:text-primary">
                          {['visibility', 'download'].map((icon) => (
                            <button key={icon} className="ml-2 text-on-surface-variant hover:text-primary">
                              <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            </button>
                          ))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-outline-variant bg-white shadow-sm sticky top-24 overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-2">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Preview</h3>
                <p className="text-[10px] text-on-surface-variant">Last Generated: Oct 28, 2023</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg bg-white border border-outline-variant p-1.5 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-base">print</span>
                </button>
                <button className="rounded-lg bg-white border border-outline-variant p-1.5 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-base">share</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)] bg-white payslip-preview-scroll">
              <div className="relative rounded-xl border-2 border-dashed border-outline-variant p-4">
                <div className="absolute right-4 top-4 opacity-10">
                  <span className="material-symbols-outlined text-4xl">receipt_long</span>
                </div>
                <div className="mb-6">
                  <p className="text-headline-lg font-bold text-primary">HRMS PORTAL</p>
                  <p className="text-xs text-on-surface-variant">Corporate Head Office, NY 10001</p>
                </div>
                <div className="flex justify-between border-b border-outline-variant pb-3 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">EMPLOYEE</p>
                    <p className="text-sm font-bold text-on-surface">Jane Doe</p>
                    <p className="text-[10px] text-on-surface-variant">Senior Product Designer</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">PAY DATE</p>
                    <p className="text-sm font-bold text-on-surface">Oct 31, 2023</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">EARNINGS</p>
                  <div className="space-y-1 text-xs text-on-surface">
                    <div className="flex justify-between"><span>Basic Salary</span><span className="font-semibold">$6,500.00</span></div>
                    <div className="flex justify-between"><span>House Rent Allowance</span><span className="font-semibold">$1,200.00</span></div>
                    <div className="flex justify-between"><span>Performance Bonus</span><span className="font-semibold">$700.00</span></div>
                    <div className="mt-1 flex justify-between border-t border-outline-variant pt-1 font-bold"><span>Gross Earnings</span><span>$8,400.00</span></div>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-wider text-error mb-2">DEDUCTIONS</p>
                  <div className="space-y-1 text-xs text-on-surface">
                    <div className="flex justify-between"><span>Income Tax (PAYE)</span><span className="font-semibold">-$1,420.00</span></div>
                    <div className="flex justify-between"><span>Health Insurance</span><span className="font-semibold">-$150.00</span></div>
                    <div className="flex justify-between"><span>Retirement Fund</span><span className="font-semibold">-$310.00</span></div>
                    <div className="mt-1 flex justify-between border-t border-outline-variant pt-1 font-bold text-error"><span>Total Deductions</span><span>-$1,880.00</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/80">Net Take-Home Pay</p>
                    <p className="text-xl font-bold">$6,520.00</p>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-white/80">payments</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full rounded-lg bg-surface-container text-primary px-4 py-2 text-xs font-semibold hover:bg-surface-container-high transition-colors">Send to Employee Email</button>
            <button className="w-full rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">Void This Payslip</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m} ${ampm}`
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString()}`
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { stats, attendance, loading: statsLoading, error } = useDashboardStats()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  const payslipPercent = stats && stats.activeEmployees > 0
    ? Math.round((stats.totalPayslips / stats.activeEmployees) * 100)
    : 0

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-on-surface-variant">Active Workforce</p>
            <h3 className="text-2xl font-bold text-on-surface">
              {statsLoading ? (
                <span className="w-14 h-7 bg-surface-container rounded animate-pulse inline-block" />
              ) : (
                (stats?.activeEmployees ?? 0).toLocaleString()
              )}
            </h3>
            <p className="text-[10px] text-secondary mt-0.5 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">trending_up</span> Current active employees
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-primary-fixed-variant shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-on-surface-variant">Pending Loans</p>
            <h3 className="text-2xl font-bold text-on-surface">
              {statsLoading ? (
                <span className="w-14 h-7 bg-surface-container rounded animate-pulse inline-block" />
              ) : (
                stats?.pendingLoans ?? 0
              )}
            </h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5 font-semibold">Requires immediate review</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-error-container/40 flex items-center justify-center text-error shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>timer_off</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-on-surface-variant">Late Logs</p>
            <h3 className="text-2xl font-bold text-on-surface">
              {statsLoading ? (
                <span className="w-14 h-7 bg-surface-container rounded animate-pulse inline-block" />
              ) : (
                stats?.lateLogsToday ?? 0
              )}
            </h3>
            <p className="text-[10px] text-error mt-0.5 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">warning</span>
              Recorded today
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <Link href="/loans" className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-primary hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-on-surface">Loans</p>
            <span className="material-symbols-outlined text-xl text-primary">account_balance_wallet</span>
          </div>
          <p className="text-2xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-10 h-7 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              stats?.pendingLoans ?? 0
            )}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-1">Pending review and approval.</p>
        </Link>
        <Link href="/incentives" className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-primary hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-on-surface">Incentives</p>
            <span className="material-symbols-outlined text-xl text-primary">emoji_events</span>
          </div>
          <p className="text-2xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-16 h-7 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              formatCurrency(stats?.totalIncentivesMonth ?? 0)
            )}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-1">Active payout pools.</p>
        </Link>
        <Link href="/payslips" className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-primary hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-on-surface">Payslips</p>
            <span className="material-symbols-outlined text-xl text-primary">receipt_long</span>
          </div>
          <p className="text-2xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-10 h-7 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              stats?.totalPayslips ?? 0
            )}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-1">Issued this cycle.</p>
        </Link>
        <Link href="/tracking" className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-primary hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-on-surface">Tracking</p>
            <span className="material-symbols-outlined text-xl text-primary">place</span>
          </div>
          <p className="text-2xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-10 h-7 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              stats?.activeVehicles ?? 0
            )}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-1">Active devices monitored.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-bold text-on-surface">Real-Time Employee Tracking</h4>
            <Link href="/attendance" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              View Full History <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Employee</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Check-in Time</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {attendance.length === 0 && !statsLoading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-xs text-on-surface-variant">
                      No attendance records for today.
                    </td>
                  </tr>
                )}
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="w-36 h-6 bg-surface-container rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="w-16 h-6 bg-surface-container rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="w-14 h-6 bg-surface-container rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary border border-outline-variant shrink-0">
                            {a.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-on-surface truncate">{a.employee_name}</p>
                            <p className="text-[10px] text-on-surface-variant truncate">{a.employee_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{formatTime(a.check_in_time)}</td>
                      <td className="px-4 py-3 text-right">
                        {a.status === 'on_time' || a.status === 'present' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                            <span className="w-1 h-1 rounded-full bg-secondary mr-1" />
                            On Time
                          </span>
                        ) : a.status === 'late' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">
                            <span className="w-1 h-1 rounded-full bg-error mr-1" />
                            Late
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
                            {a.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {attendance.length > 0 && (
              <div className="p-3 bg-surface-container-low text-center border-t border-outline-variant">
                <Link href="/attendance" className="text-xs font-medium text-on-primary-fixed-variant hover:text-primary transition-colors">
                  View all attendance records
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-on-surface">Payroll Execution</h4>
            <button className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-on-surface-variant mb-0.5">Total Incentives this month</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-on-surface">
                  {statsLoading ? (
                    <span className="w-20 h-7 bg-surface-container rounded animate-pulse inline-block" />
                  ) : (
                    formatCurrency(stats?.totalIncentivesMonth ?? 0)
                  )}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Overtime hours calculation</p>
                <span className="material-symbols-outlined text-base text-on-surface-variant">schedule</span>
              </div>
              <h5 className="text-lg font-bold text-on-surface">
                {statsLoading ? (
                  <span className="w-16 h-6 bg-surface-container rounded animate-pulse inline-block" />
                ) : (
                  <>{stats?.totalOvertimeHours.toLocaleString()} <span className="text-xs font-medium text-on-surface-variant">hrs</span></>
                )}
              </h5>
              <p className="text-[10px] text-on-surface-variant mt-1">Approved overtime this month.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-on-surface">Payslip Generation Status</span>
                <span className="text-on-primary-fixed-variant">
                  {statsLoading ? (
                    <span className="w-6 h-4 bg-surface-container rounded animate-pulse inline-block" />
                  ) : (
                    `${payslipPercent}%`
                  )}
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full relative overflow-hidden transition-all" style={{ width: `${payslipPercent}%` }}>
                  <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
                <span className="material-symbols-outlined text-xs text-secondary">check_circle</span>
                {statsLoading ? (
                  <span className="w-24 h-3 bg-surface-container rounded animate-pulse inline-block" />
                ) : (
                  <>{stats?.totalPayslips ?? 0} of {stats?.activeEmployees ?? 0} slips generated</>
                )}
              </div>
            </div>

            <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group">
              Execute Monthly Payroll
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">rocket_launch</span>
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-error-container text-error text-xs">
              Failed to load dashboard data. Please try refreshing.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

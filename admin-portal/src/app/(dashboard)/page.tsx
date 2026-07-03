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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Active Workforce</p>
            <h3 className="text-3xl font-bold text-on-surface">
              {statsLoading ? (
                <span className="w-16 h-8 bg-surface-container rounded animate-pulse inline-block" />
              ) : (
                (stats?.activeEmployees ?? 0).toLocaleString()
              )}
            </h3>
            <p className="text-xs text-secondary mt-1 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> Current active employees
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-primary-fixed-variant">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Pending Loans</p>
            <h3 className="text-3xl font-bold text-on-surface">
              {statsLoading ? (
                <span className="w-16 h-8 bg-surface-container rounded animate-pulse inline-block" />
              ) : (
                stats?.pendingLoans ?? 0
              )}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 font-semibold">Requires immediate review</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>timer_off</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Late Logs</p>
            <h3 className="text-3xl font-bold text-on-surface">
              {statsLoading ? (
                <span className="w-16 h-8 bg-surface-container rounded animate-pulse inline-block" />
              ) : (
                stats?.lateLogsToday ?? 0
              )}
            </h3>
            <p className="text-xs text-error mt-1 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              Recorded today
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Link href="/loans" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Loans</p>
            <span className="material-symbols-outlined text-2xl text-primary">account_balance_wallet</span>
          </div>
          <p className="text-3xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-12 h-8 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              stats?.pendingLoans ?? 0
            )}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">Pending review and approval.</p>
        </Link>
        <Link href="/incentives" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Incentives</p>
            <span className="material-symbols-outlined text-2xl text-primary">emoji_events</span>
          </div>
          <p className="text-3xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-20 h-8 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              formatCurrency(stats?.totalIncentivesMonth ?? 0)
            )}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">Active payout pools.</p>
        </Link>
        <Link href="/payslips" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Payslips</p>
            <span className="material-symbols-outlined text-2xl text-primary">receipt_long</span>
          </div>
          <p className="text-3xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-12 h-8 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              stats?.totalPayslips ?? 0
            )}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">Issued this cycle.</p>
        </Link>
        <Link href="/tracking" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Tracking</p>
            <span className="material-symbols-outlined text-2xl text-primary">place</span>
          </div>
          <p className="text-3xl font-black text-on-surface">
            {statsLoading ? (
              <span className="w-12 h-8 bg-surface-container rounded animate-pulse inline-block" />
            ) : (
              stats?.activeVehicles ?? 0
            )}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">Active devices monitored.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-bold text-on-surface">Real-Time Employee Tracking</h4>
            <Link href="/attendance" className="text-sm font-semibold text-secondary hover:underline flex items-center gap-1">
              View Full History <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Check-in Time</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {attendance.length === 0 && !statsLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-on-surface-variant">
                      No attendance records for today.
                    </td>
                  </tr>
                )}
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="w-48 h-8 bg-surface-container rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="w-20 h-8 bg-surface-container rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="w-16 h-8 bg-surface-container rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary border border-outline-variant">
                            {a.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{a.employee_name}</p>
                            <p className="text-xs text-on-surface-variant">{a.employee_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{formatTime(a.check_in_time)}</td>
                      <td className="px-6 py-4 text-right">
                        {a.status === 'on_time' || a.status === 'present' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                            On Time
                          </span>
                        ) : a.status === 'late' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
                            <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5" />
                            Late
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">
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
              <div className="p-4 bg-surface-container-low text-center border-t border-outline-variant">
                <Link href="/attendance" className="text-sm font-medium text-on-primary-fixed-variant hover:text-primary transition-colors">
                  View all attendance records
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-on-surface">Payroll Execution</h4>
            <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6 flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Total Incentives this month</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface">
                  {statsLoading ? (
                    <span className="w-24 h-8 bg-surface-container rounded animate-pulse inline-block" />
                  ) : (
                    formatCurrency(stats?.totalIncentivesMonth ?? 0)
                  )}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Overtime hours calculation</p>
                <span className="material-symbols-outlined text-xl text-on-surface-variant">schedule</span>
              </div>
              <h5 className="text-2xl font-bold text-on-surface">
                {statsLoading ? (
                  <span className="w-20 h-8 bg-surface-container rounded animate-pulse inline-block" />
                ) : (
                  <>{stats?.totalOvertimeHours.toLocaleString()} <span className="text-base font-medium text-on-surface-variant">hrs</span></>
                )}
              </h5>
              <p className="text-[10px] text-on-surface-variant mt-2">Approved overtime this month.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-on-surface">Payslip Generation Status</span>
                <span className="text-on-primary-fixed-variant">
                  {statsLoading ? (
                    <span className="w-8 h-5 bg-surface-container rounded animate-pulse inline-block" />
                  ) : (
                    `${payslipPercent}%`
                  )}
                </span>
              </div>
              <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full relative overflow-hidden transition-all" style={{ width: `${payslipPercent}%` }}>
                  <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                {statsLoading ? (
                  <span className="w-32 h-4 bg-surface-container rounded animate-pulse inline-block" />
                ) : (
                  <>{stats?.totalPayslips ?? 0} of {stats?.activeEmployees ?? 0} slips generated</>
                )}
              </div>
            </div>

            <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group">
              Execute Monthly Payroll
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">rocket_launch</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-error-container text-error text-sm">
              Failed to load dashboard data. Please try refreshing.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

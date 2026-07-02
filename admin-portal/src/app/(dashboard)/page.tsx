'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

const employees = [
  { name: 'John Doe', role: 'Senior Engineer', time: '08:45 AM', status: 'On Time' as const },
  { name: 'Jane Smith', role: 'Product Designer', time: '09:15 AM', status: 'Late' as const },
  { name: 'Robert Fox', role: 'Marketing Lead', time: '08:55 AM', status: 'On Time' as const },
  { name: 'Alice Brown', role: 'HR Specialist', time: '09:30 AM', status: 'Late' as const },
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) return null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Active Workforce</p>
            <h3 className="text-3xl font-bold text-on-surface">1,282</h3>
            <p className="text-xs text-secondary mt-1 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +2.5% vs last month
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-primary-fixed-variant">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Pending Loans</p>
            <h3 className="text-3xl font-bold text-on-surface">12</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-semibold">Requires immediate review</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>timer_off</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Late Logs</p>
            <h3 className="text-3xl font-bold text-on-surface">45</h3>
            <p className="text-xs text-error mt-1 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              5% higher than average
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
          <p className="text-3xl font-black text-on-surface">12</p>
          <p className="text-xs text-on-surface-variant mt-2">Pending review and approval.</p>
        </Link>
        <Link href="/incentives" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Incentives</p>
            <span className="material-symbols-outlined text-2xl text-primary">emoji_events</span>
          </div>
          <p className="text-3xl font-black text-on-surface">$82.4K</p>
          <p className="text-xs text-on-surface-variant mt-2">Active payout pools.</p>
        </Link>
        <Link href="/payslips" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Payslips</p>
            <span className="material-symbols-outlined text-2xl text-primary">receipt_long</span>
          </div>
          <p className="text-3xl font-black text-on-surface">1,124</p>
          <p className="text-xs text-on-surface-variant mt-2">Issued this cycle.</p>
        </Link>
        <Link href="/tracking" className="group rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-on-surface">Tracking</p>
            <span className="material-symbols-outlined text-2xl text-primary">place</span>
          </div>
          <p className="text-3xl font-black text-on-surface">218</p>
          <p className="text-xs text-on-surface-variant mt-2">Active devices monitored.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-bold text-on-surface">Real-Time Employee Tracking</h4>
            <button className="text-sm font-semibold text-secondary hover:underline flex items-center gap-1">
              View Full History <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
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
                {employees.map((emp, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-primary border border-outline-variant">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{emp.name}</p>
                          <p className="text-xs text-on-surface-variant">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{emp.time}</td>
                    <td className="px-6 py-4 text-right">
                      {emp.status === 'On Time' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                          On Time
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5" />
                          Late
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-surface-container-low text-center border-t border-outline-variant">
              <button className="text-sm font-medium text-on-primary-fixed-variant hover:text-primary transition-colors">
                Load 20 more records
              </button>
            </div>
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
                <span className="text-3xl font-bold text-on-surface">$45,200</span>
                <span className="text-sm font-bold text-on-secondary-container px-2 py-0.5 bg-secondary-container rounded-lg">+12%</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Overtime hours calculation</p>
                <span className="material-symbols-outlined text-xl text-on-surface-variant">schedule</span>
              </div>
              <h5 className="text-2xl font-bold text-on-surface">1,420 <span className="text-base font-medium text-on-surface-variant">hrs</span></h5>
              <div className="mt-3 flex gap-2">
                <div className="h-1.5 flex-1 bg-secondary rounded-full" />
                <div className="h-1.5 w-1/3 bg-outline-variant rounded-full" />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2">75% of projected monthly capacity reached.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-on-surface">Payslip Generation Status</span>
                <span className="text-on-primary-fixed-variant">82%</span>
              </div>
              <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full w-[82%] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                1,053 of 1,284 slips generated
              </div>
            </div>

            <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group">
              Execute Monthly Payroll
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">rocket_launch</span>
            </button>

            <div className="pt-2 border-t border-outline-variant">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Next Disbursal Date:</span>
                <span className="font-bold text-on-surface">Oct 28, 2023</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-primary-container text-primary-fixed overflow-hidden relative">
            <div className="relative z-10">
              <h5 className="text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg animate-pulse">sensors</span>
                System Health: Optimal
              </h5>
              <p className="text-[11px] opacity-80 mt-1">Cloud synchronization active. All biometric nodes reporting 100% uptime.</p>
            </div>
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <span className="material-symbols-outlined text-6xl text-primary-fixed">blur_on</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

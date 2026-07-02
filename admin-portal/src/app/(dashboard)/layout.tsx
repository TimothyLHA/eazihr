'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { OrgProvider } from '@/providers/org-provider'

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/employees', label: 'Employees', icon: 'groups' },
  { href: '/attendance', label: 'Attendance', icon: 'calendar_today' },
  { href: '/leave', label: 'Leave Balance', icon: 'event_busy' },
  { href: '/overtime', label: 'Overtime', icon: 'more_time' },
  { href: '/late-logs', label: 'Late Logs', icon: 'schedule' },
  { href: '/tracking', label: 'Tracking', icon: 'place' },
  { href: '/loans', label: 'Loans', icon: 'account_balance_wallet' },
  { href: '/incentives', label: 'Incentives', icon: 'emoji_events' },
  { href: '/payslips', label: 'Payslips', icon: 'receipt_long' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) return null

  const fullName = user.user_metadata?.full_name as string || user.email?.split('@')[0] || 'User'
  const role = user.user_metadata?.role as string || 'admin'

  return (
    <OrgProvider>
      <div className="min-h-screen flex bg-surface">
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container border-r border-outline-variant overflow-y-auto z-20">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low overflow-hidden">
              <img src="/web_logo.svg" alt="EaziHR logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="font-bold text-xl text-primary">EaziHR</h1>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-low'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-1">
            <button className="w-full bg-primary text-on-primary font-semibold text-sm py-3 rounded-lg transition-transform active:scale-95 mb-4 shadow-md">
              Generate Report
            </button>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
              Settings
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-error hover:bg-error-container/20 transition-all"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Logout
            </Link>
            <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border-2 border-primary/10">
                {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-none text-on-surface">{fullName}</p>
                <p className="text-xs text-on-surface-variant capitalize">{role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-72">
        <header className="sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant z-10 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Main Dashboard</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-72">
              <span className="material-symbols-outlined text-lg absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                placeholder="Search employees, files..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors relative">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-xl">help</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
    </OrgProvider>
  )
}

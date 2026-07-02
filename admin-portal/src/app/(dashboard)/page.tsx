import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Users, CalendarClock, Clock, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase, UserPlus, FileText, Bell } from 'lucide-react'

const stats = [
  { label: 'Total Employees', value: '128', change: '+12', changeType: 'up' as const, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'On Leave', value: '8', change: '+3', changeType: 'up' as const, icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Pending Requests', value: '14', change: '-2', changeType: 'down' as const, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Present Today', value: '92%', change: '+5%', changeType: 'up' as const, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const recentActivity = [
  { action: 'New employee onboarded', detail: 'Sarah Chen joined as UI Designer', time: '2 hours ago', type: 'add' },
  { action: 'Leave approved', detail: 'Annual leave for Michael Park (Mar 15-19)', time: '3 hours ago', type: 'approve' },
  { action: 'Payroll generated', detail: 'February 2026 payroll processed', time: '5 hours ago', type: 'payroll' },
  { action: 'Overtime request', detail: 'David Kim - 4 hours (Overtime)', time: '1 day ago', type: 'overtime' },
  { action: 'Leave request', detail: 'Emily Johnson - Sick Leave (Mar 10-11)', time: '1 day ago', type: 'request' },
]

const quickLinks = [
  { label: 'Add Employee', href: '/dashboard/employees', icon: UserPlus, desc: 'Onboard a new team member' },
  { label: 'Process Payroll', href: '/dashboard/payroll', icon: Wallet, desc: 'Run monthly payroll' },
  { label: 'Review Requests', href: '/dashboard/leave', icon: FileText, desc: 'Pending leave & overtime' },
  { label: 'View Reports', href: '/dashboard/reports', icon: TrendingUp, desc: 'Analytics & insights' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const fullName = user.user_metadata?.full_name as string || user.email?.split('@')[0] || 'User'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Welcome back, {fullName.split(' ')[0]}</h1>
        <p className="text-sm text-on-surface-variant mt-1">Here&apos;s what&apos;s happening at your organization today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 hover:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)] transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{stat.value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-on-surface">Recent Activity</h2>
            <Link href="/dashboard/activity" className="text-xs font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-0 divide-y divide-outline-variant/20">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'add' ? 'bg-emerald-50 text-emerald-600' :
                  activity.type === 'approve' ? 'bg-blue-50 text-blue-600' :
                  activity.type === 'payroll' ? 'bg-purple-50 text-purple-600' :
                  activity.type === 'overtime' ? 'bg-amber-50 text-amber-600' :
                  'bg-surface-container text-on-surface-variant'
                }`}>
                  {activity.type === 'add' ? <UserPlus className="w-4 h-4" /> :
                   activity.type === 'approve' ? <Shield className="w-4 h-4" /> :
                   activity.type === 'payroll' ? <Wallet className="w-4 h-4" /> :
                   activity.type === 'overtime' ? <Clock className="w-4 h-4" /> :
                   <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface">{activity.action}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{activity.detail}</div>
                </div>
                <div className="text-xs text-on-surface-variant/60 shrink-0">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
          <h2 className="text-base font-semibold text-on-surface mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors group"
              >
                <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <link.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-on-surface">{link.label}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{link.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 p-4 bg-primary rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="text-white text-sm font-medium">Next Payroll</div>
            </div>
            <div className="text-white/70 text-xs">March 31, 2026</div>
            <div className="text-white text-xl font-bold mt-1">$84,250.00</div>
            <div className="mt-4">
              <Link
                href="/dashboard/payroll"
                className="text-xs font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1"
              >
                View Details
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

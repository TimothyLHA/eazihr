'use client'

import { useState } from 'react'

interface LateEntry {
  id: string
  name: string
  employeeId: string
  role: string
  department: string
  scheduledTime: string
  actualTime: string
  minutesLate: number
  reason: string | null
  status: 'Late' | 'Grace Period' | 'Excused'
  avatarUrl?: string
}

const lateEntries: LateEntry[] = [
  {
    id: '1',
    name: 'Marcus Sterling',
    employeeId: 'EMP-9021',
    role: 'UI Designer',
    department: 'Marketing',
    scheduledTime: '09:00 AM',
    actualTime: '09:42 AM',
    minutesLate: 42,
    reason: 'Traffic congestion on M1',
    status: 'Late',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    employeeId: 'EMP-8842',
    role: 'Senior Engineer',
    department: 'Engineering',
    scheduledTime: '09:00 AM',
    actualTime: '09:08 AM',
    minutesLate: 8,
    reason: null,
    status: 'Grace Period',
  },
  {
    id: '3',
    name: 'Julian Thorne',
    employeeId: 'EMP-7712',
    role: 'Operations Manager',
    department: 'Operations',
    scheduledTime: '08:30 AM',
    actualTime: '10:15 AM',
    minutesLate: 105,
    reason: 'Medical appointment',
    status: 'Excused',
  },
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const barData = [40, 65, 90, 55, 45, 20, 15]

const statusConfig = {
  'Late': {
    badge: 'bg-error-container text-on-error-container',
    dot: 'bg-error',
    icon: 'schedule',
  },
  'Grace Period': {
    badge: 'bg-secondary-container text-on-secondary-container',
    dot: 'bg-secondary',
    icon: 'check_circle',
  },
  'Excused': {
    badge: 'bg-surface-container text-on-surface-variant',
    dot: 'bg-surface-tint',
    icon: 'verified',
  },
}

export default function LateLogsPage() {
  const [activeFilter, setActiveFilter] = useState<'Week' | 'Month'>('Week')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Late Logs</h1>
          <p className="text-sm text-on-surface-variant">Track and manage employee late arrivals and attendance anomalies.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-xs font-semibold hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-xs font-semibold hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-container rounded-lg">
              <span className="material-symbols-outlined text-on-error-container">warning</span>
            </div>
            <span className="text-error font-bold flex items-center text-caption bg-error/5 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +12%
            </span>
          </div>
          <h3 className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider mb-1">
            Total Late Today
          </h3>
          <p className="text-headline-lg font-headline-lg text-on-surface font-bold">42</p>
          <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-error w-3/4"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-primary">timer</span>
            </div>
            <span className="text-secondary font-bold flex items-center text-caption bg-secondary/5 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
              -4m
            </span>
          </div>
          <h3 className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider mb-1">
            Average Delay Time
          </h3>
          <p className="text-headline-lg font-headline-lg text-on-surface font-bold">
            14<span className="text-body-lg font-normal ml-1">mins</span>
          </p>
          <p className="text-caption text-on-surface-variant mt-4">Calculated across all departments today</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-primary">person_alert</span>
            </div>
            <span className="text-on-surface-variant text-caption font-bold bg-surface-container px-2 py-1 rounded">
              Top Frequency
            </span>
          </div>
          <h3 className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider mb-1">
            Critical Offenders
          </h3>
          <p className="text-headline-lg font-headline-lg text-on-surface font-bold">08</p>
          <p className="text-caption text-on-surface-variant mt-4">Employees with >3 late marks this week</p>
        </div>
      </div>

      {/* Chart and Policy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Historical Trend Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-title-md font-title-md text-on-surface font-bold">Late Frequency Trend</h2>
              <p className="text-caption text-on-surface-variant">Last 7 days performance metrics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('Week')}
                className={`px-3 py-1.5 text-label-md rounded-md font-bold transition-colors ${
                  activeFilter === 'Week'
                    ? 'bg-surface-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveFilter('Month')}
                className={`px-3 py-1.5 text-label-md rounded-md font-bold transition-colors ${
                  activeFilter === 'Month'
                    ? 'bg-surface-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {barData.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                    i === 3 ? 'bg-primary shadow-lg shadow-primary/10' : 'bg-surface-container'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className={`text-caption ${i === 3 ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                  {days[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Quick-View */}
        <div className="bg-primary-container p-6 rounded-xl shadow-lg flex flex-col justify-between text-on-primary-fixed">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary-fixed">gavel</span>
              <h2 className="text-title-md font-title-md font-bold text-surface-container-lowest">Policy Rules</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-highest/10 p-4 rounded-lg border border-surface-container-highest/20">
                <p className="text-label-md font-label-md text-surface-container-lowest mb-1">Grace Period</p>
                <p className="text-body-md opacity-80">15 minutes leeway from scheduled start time. No penalty applied.</p>
              </div>
              <div className="bg-surface-container-highest/10 p-4 rounded-lg border border-surface-container-highest/20">
                <p className="text-label-md font-label-md text-surface-container-lowest mb-1">Late Deduction</p>
                <p className="text-body-md opacity-80">0.5% daily rate deduction for every 30 mins after grace period.</p>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full py-3 border border-surface-container-highest/30 rounded-lg text-label-md hover:bg-white/5 transition-colors">
            Edit Rules
          </button>
        </div>
      </div>

      {/* Late Records Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h2 className="text-title-md font-title-md text-on-surface font-bold">Late Records Today</h2>
            <p className="text-caption text-on-surface-variant">Real-time attendance log for late arrivals</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-body-md hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-sm">filter_alt</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-body-md hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Schedule vs Actual</th>
                <th className="px-6 py-4 font-semibold">Delay</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {lateEntries.map((entry) => {
                const status = statusConfig[entry.status]
                return (
                  <tr key={entry.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                          {entry.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-body-md font-bold text-on-surface">{entry.name}</p>
                          <p className="text-caption text-on-surface-variant">{entry.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{entry.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-body-md">
                        <span className="text-on-surface-variant">{entry.scheduledTime}</span>
                        <span className="material-symbols-outlined text-sm text-outline">east</span>
                        <span className={`font-bold ${entry.status === 'Late' ? 'text-error' : 'text-on-surface'}`}>
                          {entry.actualTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded font-label-md text-[10px] ${
                          entry.minutesLate > 30 ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {entry.minutesLate} Mins
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                        <span className="text-body-md">{entry.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-all ${
                            entry.status === 'Late'
                              ? 'text-error hover:bg-error-container/50'
                              : 'text-on-surface-variant/50 cursor-not-allowed'
                          }`}
                          title="Send Warning"
                          disabled={entry.status !== 'Late'}
                        >
                          <span className="material-symbols-outlined">priority_high</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low/30">
          <span className="text-caption text-on-surface-variant">Showing 3 of 42 late records</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-surface-container text-on-surface">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-surface-container text-on-surface">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-surface-container text-on-surface">
              14
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

</parameter>
<task_progress>
- [x] Check current folder contents
- [x] Explore project structure
- [x] Read admin portal plan
- [x] Review current implementation status
- [x] Create org-provider.tsx for multi-tenant architecture
- [x] Update layout to include OrgProvider
- [x] Create TypeScript types for database tables
- [x] Check Vercel configuration
- [x] Verify build works
- [x] Stage changes
- [x] Commit changes
- [x] Push to GitHub
- [x] Verify Vercel auto-deployment setup
- [x] Review late management design files
- [x] Compare design with current implementation
- [ ] Update late-logs page to match design
</task_progress>
</write_to_file>
'use client'

import { useState } from 'react'
import { useLateLogs } from '@/hooks/use-late-logs'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

function deriveStatus(minutesLate: number): 'Late' | 'Grace Period' {
  return minutesLate <= 15 ? 'Grace Period' : 'Late'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return '--:--'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hr12 = hour % 12 || 12
  return `${hr12}:${m} ${ampm}`
}

export default function LateLogsPage() {
  const [activeFilter, setActiveFilter] = useState<'Week' | 'Month'>('Week')
  const { entries, stats, loading, error, refetch } = useLateLogs()

  const barMax = stats.bar_data.length > 0 ? Math.max(...stats.bar_data.map((b) => b.count), 1) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Late Logs</h1>
          <p className="text-xs text-on-surface-variant">Track and manage employee late arrivals and attendance anomalies.</p>
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

      {error && (
        <div className="rounded-xl bg-error-container text-error p-4 text-sm">
          Failed to load late log data.{' '}
          <button onClick={() => refetch()} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
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
          {loading ? (
            <div className="h-9 w-16 bg-surface-container rounded animate-pulse" />
          ) : (
            <p className="text-headline-lg font-headline-lg text-on-surface font-bold">{stats.total_late}</p>
          )}
          <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-error w-3/4"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-surface-container rounded-lg">
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
          {loading ? (
            <div className="h-9 w-24 bg-surface-container rounded animate-pulse" />
          ) : (
            <p className="text-headline-lg font-headline-lg text-on-surface font-bold">
              {stats.avg_delay}<span className="text-body-lg font-normal ml-1">mins</span>
            </p>
          )}
          <p className="text-caption text-on-surface-variant mt-4">Calculated across all departments today</p>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-primary">person_alert</span>
            </div>
            <span className="text-on-surface-variant text-caption font-bold bg-surface-container px-2 py-1 rounded">
              Top Frequency
            </span>
          </div>
          <h3 className="text-on-surface-variant text-label-md font-label-md uppercase tracking-wider mb-1">
            Critical Offenders
          </h3>
          {loading ? (
            <div className="h-9 w-12 bg-surface-container rounded animate-pulse" />
          ) : (
            <p className="text-headline-lg font-headline-lg text-on-surface font-bold">{String(stats.critical_offenders).padStart(2, '0')}</p>
          )}
          <p className="text-caption text-on-surface-variant mt-4">Employees with &gt;3 late marks this week</p>
        </div>
      </div>

      {/* Chart and Policy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Historical Trend Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-3">
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
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-surface-container animate-pulse" style={{ height: '60%' }} />
                  <span className="text-caption text-on-surface-variant">{days[i]}</span>
                </div>
              ))
            ) : (
              stats.bar_data.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                      i === 3 ? 'bg-primary shadow-lg shadow-primary/10' : 'bg-surface-container'
                    }`}
                    style={{ height: `${(bar.count / barMax) * 100}%` }}
                  />
                  <span className={`text-caption ${i === 3 ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                    {days[i]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Policy Quick-View */}
        <div className="bg-primary-container p-4 rounded-lg shadow-lg flex flex-col justify-between text-on-primary-fixed">
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
        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h2 className="text-title-md font-title-md text-on-surface font-bold">Late Records Today</h2>
            <p className="text-caption text-on-surface-variant">Real-time attendance log for late arrivals</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-body-md hover:bg-surface-container-low transition-all">
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
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Schedule vs Actual</th>
                <th className="px-4 py-3 font-semibold">Delay</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-24 bg-surface-container rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No late records found.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const statusKey = deriveStatus(entry.minutes_late)
                  const status = statusConfig[statusKey]
                  return (
                    <tr key={entry.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                            {entry.employee_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-body-md font-bold text-on-surface">{entry.employee_name}</p>
                            <p className="text-caption text-on-surface-variant">{entry.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body-md text-on-surface-variant">{entry.employee_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-body-md">
                          <span className="text-on-surface-variant">{formatDate(entry.date)}</span>
                          <span className="material-symbols-outlined text-sm text-outline">east</span>
                          <span className="font-bold text-error">
                            {formatTime(entry.check_in_time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded font-label-md text-[10px] ${
                            entry.minutes_late > 30 ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {entry.minutes_late} Mins
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                          <span className="text-body-md">{statusKey}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button
                            className={`p-2 rounded-lg transition-all ${
                              statusKey === 'Late'
                                ? 'text-error hover:bg-error-container/50'
                                : 'text-on-surface-variant/50 cursor-not-allowed'
                            }`}
                            title="Send Warning"
                            disabled={statusKey !== 'Late'}
                          >
                            <span className="material-symbols-outlined">priority_high</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low/30">
          <span className="text-caption text-on-surface-variant">Showing {entries.length} of {stats.total_late} late records</span>
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

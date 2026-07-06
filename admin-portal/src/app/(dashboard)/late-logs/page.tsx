'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLateLogs } from '@/hooks/use-late-logs'
import LateLogDetailModal from '@/components/late-logs/late-log-detail-modal'
import type { LateLogEntry } from '@/hooks/use-late-logs'

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function deriveStatus(minutesLate: number): 'Late' | 'Grace Period' {
  return minutesLate <= 15 ? 'Grace Period' : 'Late'
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return '--:--'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hr12 = hour % 12 || 12
  return `${hr12}:${m} ${ampm}`
}

function generateCSV(entries: LateLogEntry[]) {
  const headers = ['Employee Name', 'Department', 'Date', 'Check-In Time', 'Minutes Late', 'Status', 'Reason']
  const rows = entries.map(e => [
    e.employee_name,
    e.department,
    e.date,
    e.check_in_time ?? '',
    String(e.minutes_late),
    deriveStatus(e.minutes_late),
    e.reason ?? '',
  ])
  return [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `late-logs-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
            <div className="h-3 w-24 bg-surface-container rounded mb-4" />
            <div className="h-9 w-16 bg-surface-container rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="h-64 bg-surface-container rounded" />
        </div>
        <div className="bg-primary-container p-4 rounded-lg">
          <div className="h-64 bg-surface-container-highest/20 rounded" />
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant">
          <div className="h-4 w-40 bg-surface-container rounded" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-outline-variant">
            <div className="w-10 h-10 rounded-full bg-surface-container" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-surface-container rounded" />
              <div className="h-3 w-20 bg-surface-container rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LateLogsPage() {
  const { entries, stats, loading, error, refetch } = useLateLogs()
  const [chartFilter, setChartFilter] = useState<'Week' | 'Month'>('Week')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Late' | 'Grace Period'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailEntry, setDetailEntry] = useState<LateLogEntry | null>(null)
  const pageSize = 10

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (searchQuery && !e.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.department.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (statusFilter !== 'all') {
        const st = deriveStatus(e.minutes_late)
        if (st !== statusFilter) return false
      }
      return true
    })
  }, [entries, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const barData = useMemo(() => {
    const days = chartFilter === 'Week' ? 7 : 30
    const result: { label: string; count: number; isToday: boolean }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = entries.filter(e => e.date === dateStr).length
      const label = chartFilter === 'Week'
        ? dayLabels[(d.getDay() + 6) % 7]
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      result.push({ label, count, isToday: i === 0 })
    }
    return result
  }, [entries, chartFilter])

  const barMax = barData.length > 0 ? Math.max(...barData.map(b => b.count), 1) : 1

  const handleExport = useCallback(() => {
    const csv = generateCSV(filtered)
    downloadCSV(csv)
  }, [filtered])

  if (error) {
    return (
      <div className="rounded-xl bg-error-container text-error p-6 flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-4xl">error_outline</span>
        <p className="text-sm">Failed to load late log data.</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90">
          Retry
        </button>
      </div>
    )
  }

  if (loading) return <Skeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Late Logs</h1>
          <p className="text-xs text-on-surface-variant">Track and manage employee late arrivals and attendance anomalies.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-xs font-semibold hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-container rounded-lg">
              <span className="material-symbols-outlined text-on-error-container">warning</span>
            </div>
            <span className="text-error font-bold flex items-center text-xs bg-error/5 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +12%
            </span>
          </div>
          <h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Total Late Records</h3>
          <p className="text-3xl font-black text-on-surface">{stats.total_late}</p>
          <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-error" style={{ width: `${Math.min(100, stats.total_late * 10)}%` }} />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-primary">timer</span>
            </div>
            <span className="text-secondary font-bold flex items-center text-xs bg-secondary/5 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
              -4m
            </span>
          </div>
          <h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Average Delay Time</h3>
          <p className="text-3xl font-black text-on-surface">
            {stats.avg_delay}<span className="text-base font-normal ml-1">mins</span>
          </p>
          <p className="text-xs text-on-surface-variant mt-4">Calculated across all records</p>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-primary">person_alert</span>
            </div>
            <span className="text-on-surface-variant text-xs font-bold bg-surface-container px-2 py-1 rounded">Top Frequency</span>
          </div>
          <h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Critical Offenders</h3>
          <p className="text-3xl font-black text-on-surface">{String(stats.critical_offenders).padStart(2, '0')}</p>
          <p className="text-xs text-on-surface-variant mt-4">Employees with &gt;3 late marks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base font-bold text-on-surface">Late Frequency Trend</h2>
              <p className="text-xs text-on-surface-variant">Last {chartFilter === 'Week' ? '7 days' : '30 days'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartFilter('Week')}
                className={`px-3 py-1.5 text-xs rounded-md font-bold transition-colors ${
                  chartFilter === 'Week'
                    ? 'bg-surface-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setChartFilter('Month')}
                className={`px-3 py-1.5 text-xs rounded-md font-bold transition-colors ${
                  chartFilter === 'Month'
                    ? 'bg-surface-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-1">
            {barData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                    bar.isToday ? 'bg-primary shadow-lg shadow-primary/10' : 'bg-surface-container'
                  }`}
                  style={{ height: `${(bar.count / barMax) * 100}%`, minHeight: bar.count > 0 ? '4px' : '0px' }}
                  title={`${bar.label}: ${bar.count} late${bar.count !== 1 ? 's' : ''}`}
                />
                <span className={`text-[10px] truncate w-full text-center ${bar.isToday ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary-container p-4 rounded-lg shadow-lg flex flex-col justify-between text-on-primary-fixed">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary-fixed">gavel</span>
              <h2 className="text-base font-bold text-surface-container-lowest">Policy Rules</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-highest/10 p-4 rounded-lg border border-surface-container-highest/20">
                <p className="text-xs font-bold text-surface-container-lowest mb-1">Grace Period</p>
                <p className="text-sm opacity-80">15 minutes leeway from scheduled start time. No penalty applied.</p>
              </div>
              <div className="bg-surface-container-highest/10 p-4 rounded-lg border border-surface-container-highest/20">
                <p className="text-xs font-bold text-surface-container-lowest mb-1">Late Deduction</p>
                <p className="text-sm opacity-80">0.5% daily rate deduction for every 30 mins after grace period.</p>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full py-3 border border-surface-container-highest/30 rounded-lg text-sm hover:bg-white/5 transition-colors">
            Edit Rules
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-on-surface">Late Records</h2>
            <p className="text-xs text-on-surface-variant">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="Search name or dept..."
                className="w-full sm:w-48 pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1) }}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Late">Late</option>
              <option value="Grace Period">Grace Period</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Date & Check-in</th>
                <th className="px-4 py-3">Delay</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginated.map((entry) => {
                const statusKey = deriveStatus(entry.minutes_late)
                const isLate = statusKey === 'Late'
                return (
                  <tr key={entry.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                          {entry.employee_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{entry.employee_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{entry.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-on-surface-variant">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="material-symbols-outlined text-sm text-outline">east</span>
                        <span className={`font-bold ${isLate ? 'text-error' : 'text-secondary'}`}>
                          {formatTime(entry.check_in_time)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        isLate ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {entry.minutes_late} min
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isLate ? 'bg-error' : 'bg-secondary'}`} />
                        <span className="text-sm">{statusKey}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setDetailEntry(entry)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-all"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-all ${
                            isLate
                              ? 'text-error hover:bg-error-container/50'
                              : 'text-on-surface-variant/30 cursor-not-allowed'
                          }`}
                          title="Send Warning"
                          disabled={!isLate}
                        >
                          <span className="material-symbols-outlined text-lg">priority_high</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    {entries.length === 0 ? 'No late records found.' : 'No records match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low/30">
          <span className="text-xs text-on-surface-variant">
            Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} records
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
              const pageNum = start + i
              if (pageNum > totalPages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold ${
                    pageNum === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <LateLogDetailModal
        open={detailEntry !== null}
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
      />
    </div>
  )
}

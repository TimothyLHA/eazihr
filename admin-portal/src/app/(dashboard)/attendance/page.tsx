'use client'

import { useState, useCallback } from 'react'
import { useAttendance } from '@/hooks/use-attendance'
import ManualEntryModal from '@/components/attendance/manual-entry-modal'
import EditAttendanceModal from '@/components/attendance/edit-attendance-modal'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const statusLabel: Record<string, string> = {
  on_time: 'ON TIME',
  late: 'LATE',
  absent: 'ABSENT',
  half_day: 'HALF DAY',
}

const statusColor: Record<string, string> = {
  on_time: 'text-on-secondary-container',
  late: 'text-amber-600',
  absent: 'text-error',
  half_day: 'text-amber-600',
}

const statusBadge: Record<string, string> = {
  on_time: 'bg-secondary-container text-on-secondary-container',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-error-container text-error',
  half_day: 'bg-amber-100 text-amber-700',
}

function formatTime(dt: string | null) {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function maxValue(items: { on_time: number; late: number }[]) {
  return Math.max(...items.map((i) => i.on_time + i.late), 1)
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export default function AttendancePage() {
  const [dateFrom, setDateFrom] = useState(daysAgo(30))
  const [dateTo, setDateTo] = useState(todayStr())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { records, totalCount, weeklyTrends, lateLogs, loading, error, refetch } = useAttendance({
    dateFrom,
    dateTo,
    search,
    statusFilter,
    page,
    pageSize: 50,
  })

  const [showManualModal, setShowManualModal] = useState(false)
  const [editRecordId, setEditRecordId] = useState<string | null>(null)

  const barMax = maxValue(weeklyTrends)

  const handleExportCSV = useCallback(() => {
    const headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Notes']
    const rows = records.map((r) => [
      r.employee_name,
      r.date,
      formatTime(r.check_in) || '',
      formatTime(r.check_out) || '',
      statusLabel[r.status] || r.status,
      r.notes || '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [records, dateFrom, dateTo])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-on-surface">Attendance & Tracking</h2>
          <p className="text-xs text-on-surface-variant">Real-time oversight of personnel movement and precision logging.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">calendar_today</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="bg-transparent text-xs text-on-surface outline-none w-28"
            />
            <span className="text-xs text-on-surface-variant">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="bg-transparent text-xs text-on-surface outline-none w-28"
            />
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-xs font-semibold hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-lg">download</span> Export CSV
          </button>
          <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-lg">add</span> New Manual Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container text-error p-4 text-sm">
          Failed to load attendance data.{' '}
          <button onClick={() => window.location.reload()} className="underline font-semibold">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Weekly Attendance Trends</h3>
              <p className="text-xs text-on-surface-variant">Daily comparison of check-ins versus late arrivals.</p>
            </div>
            <select
              value={dateTo}
              onChange={e => {
                const val = e.target.value
                if (val === '7') { setDateFrom(daysAgo(7)); setDateTo(todayStr()) }
                else if (val === '30') { setDateFrom(daysAgo(30)); setDateTo(todayStr()) }
                else if (val === '90') { setDateFrom(daysAgo(90)); setDateTo(todayStr()) }
                setPage(1)
              }}
              className="bg-surface-container-low border-none rounded-lg text-xs font-semibold px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7">Last 7 Days</option>
              <option value="30" selected>Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 h-64 px-4">
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
                  <div className="w-full bg-surface-container rounded-t-lg animate-pulse" style={{ height: '60%' }} />
                  <span className="mt-2 text-[10px] text-on-surface-variant">{days[i]}</span>
                </div>
              ))
            ) : (
              weeklyTrends.map((bar, i) => {
                const onTimePct = barMax > 0 ? (bar.on_time / barMax) * 100 : 0
                const latePct = barMax > 0 ? (bar.late / barMax) * 100 : 0
                return (
                  <div key={i} className="flex-1 group relative flex flex-col justify-end items-center h-full">
                    {latePct > 0 && (
                      <div
                        className="w-full bg-amber-500 rounded-t-lg transition-all absolute bottom-0"
                        style={{ height: `${latePct}%` }}
                      />
                    )}
                    <div
                      className="w-full bg-secondary-container rounded-t-lg transition-all hover:opacity-80 relative z-10"
                      style={{ height: `${onTimePct}%` }}
                    />
                    <span className="mt-2 text-[10px] text-on-surface-variant">{days[i]}</span>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {bar.on_time} on time, {bar.late} late
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="mt-8 flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary-container" />
              <span className="text-[10px] text-on-surface-variant">On-Time Check-ins</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-[10px] text-on-surface-variant">Late Arrivals</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-on-surface">Today&apos;s Late Logs</h3>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">{lateLogs.length} Alerts</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 bg-surface-container rounded" />
                      <div className="h-3 w-20 bg-surface-container rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : lateLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">check_circle</span>
                <p className="text-xs text-on-surface-variant">No late arrivals today</p>
              </div>
            ) : (
              lateLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-amber-500 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <span className="material-symbols-outlined text-lg">timer_off</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{log.employee_name}</p>
                        <p className="text-xs text-on-surface-variant">{log.minutes}m late — {formatDate(log.date)}</p>
                      </div>
                    </div>
                  </div>
                  {log.reason && (
                    <div className="mt-3 bg-surface-container-low rounded-lg p-2 flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant italic">&ldquo;{log.reason}&rdquo;</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">UNEXCUSED</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => {
              document.getElementById('attendance-table')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full mt-4 py-3 text-center text-xs font-semibold text-primary hover:bg-surface-container-low rounded-lg transition-colors border border-dashed border-outline-variant"
          >
            View All Late Logs
          </button>
        </div>

        <div id="attendance-table" className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h3 className="text-xl font-semibold text-on-surface">Attendance Records</h3>
              <nav className="flex gap-1 bg-surface-container-low p-1 rounded-lg">
                {['', 'on_time', 'late', 'absent', 'half_day'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1) }}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      statusFilter === s
                        ? 'bg-surface-container-lowest shadow-sm text-primary'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {s === '' ? 'All' : s === 'on_time' ? 'On Time' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search employee..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button onClick={handleRefresh} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">refresh</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/30 border-b border-outline-variant">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Employee</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Check In</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Check Out</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
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
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const checkInTime = formatTime(r.check_in)
                    const checkOutTime = formatTime(r.check_out)
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setEditRecordId(r.id)}
                        className="hover:bg-surface-container-low/20 transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[10px]">
                              {initials(r.employee_name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{r.employee_name}</p>
                              <p className="text-xs text-on-surface-variant">{r.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{formatDate(r.date)}</td>
                        <td className="px-4 py-3">
                          {checkInTime ? (
                            <>
                              <span className="text-sm font-mono text-on-surface">{checkInTime}</span>
                              <p className={`text-[10px] font-bold ${statusColor[r.status] || ''}`}>
                                {statusLabel[r.status] || r.status}
                              </p>
                            </>
                          ) : (
                            <span className="text-on-surface-variant/40">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {checkOutTime ? (
                            <span className="text-sm font-mono text-on-surface">{checkOutTime}</span>
                          ) : (
                            <span className="text-on-surface-variant/40">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusBadge[r.status] || 'bg-surface-container text-on-surface-variant'}`}>
                            {statusLabel[r.status] || r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[150px] truncate">
                          {r.notes || <span className="text-on-surface-variant/40">&mdash;</span>}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Showing {records.length} of {totalCount} records</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={records.length < 50}
                className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ManualEntryModal
        open={showManualModal}
        onClose={() => { setShowManualModal(false); refetch() }}
      />

      <EditAttendanceModal
        recordId={editRecordId}
        onClose={() => setEditRecordId(null)}
        onSaved={() => { setEditRecordId(null); refetch() }}
      />
    </div>
  )
}

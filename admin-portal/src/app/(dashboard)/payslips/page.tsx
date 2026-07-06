'use client'

import { useState, useMemo, useCallback } from 'react'
import { usePayslips, type PayslipEntry } from '@/hooks/use-payslips'

const STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  generated: { label: 'Pending Review', badge: 'bg-surface-container-highest text-on-surface-variant', dot: 'bg-outline' },
  sent: { label: 'Published', badge: 'bg-secondary-container text-on-secondary-container', dot: 'bg-secondary' },
  viewed: { label: 'Viewed', badge: 'bg-secondary-container text-on-secondary-container', dot: 'bg-secondary' },
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function generateCSV(entries: PayslipEntry[]) {
  const headers = ['Employee', 'Code', 'Period', 'Gross Pay', 'Deductions', 'Net Pay', 'Status']
  const rows = entries.map(e => [
    e.employee_name,
    e.employee_code,
    e.period,
    String(e.gross_pay),
    String(e.deductions),
    String(e.net_pay),
    e.status,
  ])
  return [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payslips-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="h-9 w-64 rounded-lg bg-surface-container-highest" />
          <div className="h-5 w-80 rounded bg-surface-container-highest mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 w-32 rounded-xl bg-surface-container-highest" />
          <div className="h-11 w-44 rounded-xl bg-surface-container-highest" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                <div className="h-3 w-24 rounded bg-surface-container-highest mb-2" />
                <div className="h-7 w-32 rounded bg-surface-container-highest" />
                <div className="h-4 w-40 rounded bg-surface-container-highest mt-4" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant">
              <div className="h-10 w-48 rounded bg-surface-container-highest" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant">
                <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-surface-container-highest" />
                  <div className="h-3 w-24 rounded bg-surface-container-highest mt-1" />
                </div>
                <div className="h-4 w-32 rounded bg-surface-container-highest" />
                <div className="h-4 w-20 rounded bg-surface-container-highest" />
                <div className="h-4 w-10 rounded bg-surface-container-highest" />
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant">
              <div className="h-5 w-20 rounded bg-surface-container-highest" />
              <div className="h-3 w-36 rounded bg-surface-container-highest mt-1" />
            </div>
            <div className="p-6">
              <div className="h-64 rounded-xl bg-surface-container-highest" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function PreviewPane({ entry }: { entry: PayslipEntry | null }) {
  if (!entry) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Preview</h3>
            <p className="text-[10px] text-on-surface-variant">Select a payslip to preview</p>
          </div>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <span className="material-symbols-outlined text-5xl text-outline">receipt_long</span>
          <p className="text-sm font-bold text-on-surface">No payslip selected</p>
          <p className="text-xs text-on-surface-variant">Click on any row to preview its details here.</p>
        </div>
      </div>
    )
  }

  const earningsBreakdown = entry.earnings_breakdown as Record<string, unknown> | null
  const deductionsBreakdown = entry.deductions_breakdown as Record<string, unknown> | null
  const earningsItems = earningsBreakdown && Object.keys(earningsBreakdown).length > 0
    ? Object.entries(earningsBreakdown)
    : [['Gross Pay', entry.gross_pay]]
  const deductionItems = deductionsBreakdown && Object.keys(deductionsBreakdown).length > 0
    ? Object.entries(deductionsBreakdown)
    : [['Deductions', entry.deductions]]
  const totalDeductions = deductionItems.reduce((s, [, v]) => s + Number(v), 0)

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden sticky top-24">
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Preview</h3>
          <p className="text-[10px] text-on-surface-variant">{entry.period}</p>
        </div>
        <div className="flex gap-1">
          {entry.pdf_url && (
            <a
              href={entry.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-surface-container-lowest border border-outline-variant p-1.5 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
              title="Download PDF"
            >
              <span className="material-symbols-outlined text-base">download</span>
            </a>
          )}
          <button className="rounded-lg bg-surface-container-lowest border border-outline-variant p-1.5 text-on-surface hover:bg-surface-container-low transition-colors shadow-sm" title="Print">
            <span className="material-symbols-outlined text-base">print</span>
          </button>
        </div>
      </div>
      <div className="p-5 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="relative rounded-xl border-2 border-dashed border-outline-variant p-4">
          <div className="absolute right-4 top-4 opacity-10">
            <span className="material-symbols-outlined text-4xl">receipt_long</span>
          </div>
          <div className="mb-5">
            <p className="text-lg font-bold text-primary">HRMS PORTAL</p>
            <p className="text-[10px] text-on-surface-variant">Corporate Head Office</p>
          </div>
          <div className="flex justify-between border-b border-outline-variant pb-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">EMPLOYEE</p>
              <p className="text-sm font-bold text-on-surface">{entry.employee_name}</p>
              <p className="text-[10px] text-on-surface-variant">ID: {entry.employee_code}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">PAY PERIOD</p>
              <p className="text-sm font-bold text-on-surface">{entry.period}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">EARNINGS</p>
            <div className="space-y-1 text-xs text-on-surface">
              {earningsItems.map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span className="font-semibold">{fmt(Number(val))}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-outline-variant pt-1 font-bold">
                <span>Gross Earnings</span>
                <span>{fmt(entry.gross_pay)}</span>
              </div>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-error mb-2">DEDUCTIONS</p>
            <div className="space-y-1 text-xs text-on-surface">
              {deductionItems.map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span className="font-semibold">-{fmt(Number(val))}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-outline-variant pt-1 font-bold text-error">
                <span>Total Deductions</span>
                <span>-{fmt(totalDeductions)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/80">Net Take-Home Pay</p>
              <p className="text-xl font-bold">{fmt(entry.net_pay)}</p>
            </div>
            <span className="material-symbols-outlined text-2xl text-white/80">payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PayslipsPage() {
  const { entries, periodOptions, stats, loading, error, refetch } = usePayslips()
  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const pageSize = 8

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (periodFilter !== 'all') {
        const key = `${e.year}-${e.month}`
        if (key !== periodFilter) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!e.employee_name.toLowerCase().includes(q) && !e.employee_code.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [entries, searchQuery, periodFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedEntry = entries.find(e => e.id === selectedId) ?? null

  const handleExport = useCallback(() => {
    const csv = generateCSV(filtered)
    downloadCSV(csv)
  }, [filtered])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-on-surface">Payslips Archive</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage, generate, and review employee earnings records.</p>
          </div>
        </div>
        <div className="rounded-xl border border-error/20 bg-error/5 p-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-2xl">error_outline</span>
            <div>
              <p className="font-semibold text-error">Failed to load payslips</p>
              <p className="text-sm text-on-surface-variant mt-0.5">{error.message}</p>
            </div>
          </div>
          <button onClick={refetch} className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const topCards = [
    { label: 'Total Disbursed', value: fmt(stats.total_disbursed), note: `${stats.total_count} slip${stats.total_count !== 1 ? 's' : ''}`, icon: 'trending_up', trendClass: 'text-secondary' },
    { label: 'Generated Slips', value: String(stats.total_count), note: 'Total records', icon: 'check_circle', trendClass: 'text-on-surface-variant' },
    { label: 'Pending Review', value: String(stats.pending_count), note: stats.pending_count > 0 ? 'Action required' : 'All reviewed', icon: 'schedule', trendClass: stats.pending_count > 0 ? 'text-error' : 'text-on-surface-variant' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Payslips Archive</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage, generate, and review employee earnings records.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-3 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">file_download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCards.map(card => (
              <div key={card.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">{card.label}</p>
                <p className="text-2xl font-black text-on-surface">{card.value}</p>
                <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${card.trendClass}`}>
                  <span className="material-symbols-outlined text-base">{card.icon}</span>
                  {card.note}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-outline-variant">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative sm:w-52">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
                  <input
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Search name or ID..."
                    type="text"
                  />
                </div>
                <select
                  value={periodFilter}
                  onChange={e => { setPeriodFilter(e.target.value); setCurrentPage(1) }}
                  className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                >
                  <option value="all">All Periods</option>
                  {periodOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-on-surface-variant">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Pay Period</th>
                    <th className="px-4 py-3">Gross</th>
                    <th className="px-4 py-3">Net</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {paginated.map(row => {
                    const st = STATUS_STYLES[row.status] ?? STATUS_STYLES.generated
                    const isSelected = row.id === selectedId
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        className={`cursor-pointer border-l-4 transition-colors hover:bg-surface-container-low/50 ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-transparent'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {row.employee_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{row.employee_name}</p>
                              <p className="text-xs text-on-surface-variant">ID: {row.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface">{row.period}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-on-surface">{fmt(row.gross_pay)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-on-surface">{fmt(row.net_pay)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${st.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedId(row.id) }}
                            className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-all"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                        {entries.length === 0 ? 'No payslips generated yet.' : 'No records match your filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-outline-variant bg-surface-container-low/30">
              <span className="text-xs text-on-surface-variant">
                Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} records
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                        pageNum === currentPage
                          ? 'bg-primary text-white shadow-sm'
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
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <PreviewPane entry={selectedEntry} />
        </aside>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTracking, type VehicleEntry } from '@/hooks/use-tracking'
import VehicleDetailModal from '@/components/tracking/vehicle-detail-modal'

const STATUS_MAP: Record<string, { display: string; badge: string; action: string; logStatus: string }> = {
  active: { display: 'ON-TRACK', badge: 'bg-secondary/10 text-secondary', action: 'On track update', logStatus: 'ON-TRACK' },
  idle: { display: 'CHECK_IN_SUCCESS', badge: 'bg-primary-container/10 text-primary-container', action: 'Check-in success', logStatus: 'SUCCESS' },
  maintenance: { display: 'DELAY_RISK', badge: 'bg-amber-500/10 text-amber-700', action: 'Route delay detected', logStatus: 'DELAY' },
  out_of_service: { display: 'CRITICAL', badge: 'bg-error/10 text-error', action: 'Critical alert raised', logStatus: 'CRITICAL' },
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '--:--:--'
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  } catch {
    return '--:--:--'
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '--'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--'
  }
}

function getLocationDisplay(vehicle: { last_location: Record<string, unknown> | null; name: string; plate_number: string }): string {
  if (vehicle.last_location && typeof vehicle.last_location === 'object') {
    const loc = vehicle.last_location as Record<string, unknown>
    const addr = loc.address ?? loc.city ?? loc.name
    if (addr) return String(addr)
    const parts = Object.values(loc).filter((v) => typeof v === 'string' || typeof v === 'number')
    if (parts.length > 0) return parts.join(', ')
  }
  return vehicle.plate_number || vehicle.name || 'Unknown'
}

function generateCSV(vehicles: VehicleEntry[]) {
  const headers = ['Vehicle Name', 'Plate Number', 'Driver', 'Status', 'Location', 'Last Updated']
  const rows = vehicles.map(v => [
    v.name,
    v.plate_number,
    v.driver_name ?? '',
    v.status.replace('_', ' ').toUpperCase(),
    getLocationDisplay(v),
    v.last_updated ? new Date(v.last_updated).toLocaleString() : '',
  ])
  return [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fleet-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="h-12 bg-surface-container rounded-2xl mb-4 w-12" />
            <div className="h-4 bg-surface-container rounded w-24 mb-3" />
            <div className="h-8 bg-surface-container rounded w-20" />
          </div>
        ))}
      </section>
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 h-[500px]">
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-4 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container rounded-3xl" />)}
        </div>
        <div className="rounded-3xl border border-outline-variant bg-surface-container" />
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-error">error_outline</span>
        <h2 className="text-xl font-bold text-on-surface">Failed to load tracking data</h2>
        <p className="text-sm text-on-surface-variant">{message}</p>
        <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-semibold hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-lg">refresh</span>
          Retry
        </button>
      </div>
    </div>
  )
}

export default function TrackingPage() {
  const { vehicles, stats, loading, error, refetch } = useTracking()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [detailVehicle, setDetailVehicle] = useState<VehicleEntry | null>(null)
  const [logPage, setLogPage] = useState(1)
  const logPageSize = 8

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!v.name.toLowerCase().includes(q) && !v.plate_number.toLowerCase().includes(q) && !(v.driver_name ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [vehicles, searchQuery, statusFilter])

  const sortedByUpdate = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTime = a.last_updated ? new Date(a.last_updated).getTime() : 0
      const bTime = b.last_updated ? new Date(b.last_updated).getTime() : 0
      return bTime - aTime
    })
  }, [filtered])

  const logTotalPages = Math.max(1, Math.ceil(sortedByUpdate.length / logPageSize))
  const logPageItems = sortedByUpdate.slice((logPage - 1) * logPageSize, logPage * logPageSize)

  const staffInField = vehicles.filter(v => v.driver_name).length
  const activePct = stats.total_count > 0 ? Math.round((stats.active_count / stats.total_count) * 100) : 0

  const derivedStats = [
    { label: 'Active Fleet', value: `${stats.active_count} / ${stats.total_count}`, trend: `${activePct}%`, icon: 'local_shipping', accent: 'text-secondary', badge: 'bg-surface-container-low text-secondary' },
    { label: 'Staff in Field', value: `${staffInField}`, trend: `${vehicles.length} total`, icon: 'groups', accent: 'text-error', badge: 'bg-surface-container-low text-error' },
    { label: 'Fleet Readiness', value: `${stats.total_count > 0 ? ((stats.active_count / stats.total_count) * 100).toFixed(0) : '0'}%`, trend: 'Active ratio', icon: 'gas_meter', accent: 'text-secondary', badge: 'bg-surface-container-low text-secondary' },
    { label: 'System Alerts', value: `${String(stats.alert_count).padStart(2, '0')}`, trend: stats.alert_count > 0 ? 'Critical' : 'Normal', icon: 'warning', accent: 'text-error', badge: stats.alert_count > 0 ? 'bg-error-container text-error' : 'bg-surface-container-low text-secondary' },
  ]

  const handleExport = useCallback(() => {
    const csv = generateCSV(filtered)
    downloadCSV(csv)
  }, [filtered])

  if (loading) return <Skeleton />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">FleetControl Live Tracking</h1>
          <p className="text-sm text-on-surface-variant">Live asset tracking, fleet status, and activity logs for your field workforce.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              showFilters || searchQuery || statusFilter !== 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-semibold hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, plate, or driver..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active (On-Track)</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {derivedStats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-surface-container p-3 text-on-surface">
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${stat.badge}`}>{stat.trend}</span>
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">{stat.label}</p>
            <p className={`mt-4 text-3xl font-black ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 h-[calc(100vh-240px)] min-h-[500px]">
        <section className="flex flex-col rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Asset List</h2>
              <p className="text-[11px] text-on-surface-variant">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <span className="inline-flex rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-on-secondary-container">
              {stats.active_count} Active
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-on-surface-variant">
                {vehicles.length === 0 ? 'No vehicles found' : 'No vehicles match your filters'}
              </div>
            ) : (
              filtered.map((v) => {
                const mapping = STATUS_MAP[v.status] ?? STATUS_MAP.idle
                const loc = getLocationDisplay(v)
                return (
                  <div key={v.id} className="rounded-3xl border border-outline-variant p-4 bg-surface-container-lowest hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface truncate">{v.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{loc}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${mapping.badge}`}>
                        {mapping.display}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>{formatTime(v.last_updated)}</span>
                      <button
                        onClick={() => setDetailVehicle(v)}
                        className="text-primary hover:underline text-[11px] font-semibold"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section className="flex flex-col rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-6 py-4 bg-surface-container-low">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Live Map View</h2>
              <p className="text-[11px] text-on-surface-variant">Real-time location tracking of active vehicles.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-on-surface shadow-sm hover:bg-surface-container transition-colors" title="Zoom in">
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-on-surface shadow-sm hover:bg-surface-container transition-colors" title="Zoom out">
                <span className="material-symbols-outlined text-lg">remove</span>
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-on-surface shadow-sm hover:bg-surface-container transition-colors" title="Recenter">
                <span className="material-symbols-outlined text-lg">my_location</span>
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden bg-surface-dim">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1400&q=80')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/10 to-transparent" />
            <div className="absolute top-6 left-6 rounded-3xl bg-white/90 border border-outline-variant p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Live Syncing</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-2 text-[11px] font-semibold text-primary">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                {stats.active_count > 0
                  ? `${stats.active_count} vehicle${stats.active_count !== 1 ? 's' : ''} active`
                  : 'No active vehicles'}
              </div>
            </div>
            <div className="absolute bottom-6 left-6 rounded-3xl bg-white/90 border border-outline-variant p-4 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-secondary" /> On-Track
              </div>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Delay Risk
              </div>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-error" /> Critical Alert
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest">Activity Log</h2>
            <p className="text-[11px] text-on-surface-variant">Recent vehicle status changes and updates</p>
          </div>
          <button
            onClick={handleExport}
            className="rounded-2xl bg-surface-container px-4 py-2 text-[11px] font-bold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Plate</th>
                <th className="px-6 py-3">Driver</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {logPageItems.map((v) => {
                const mapping = STATUS_MAP[v.status] ?? STATUS_MAP.idle
                return (
                  <tr key={v.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface">{v.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{v.plate_number}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{v.driver_name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${mapping.badge}`}>
                        {mapping.display}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">{formatDateTime(v.last_updated)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDetailVehicle(v)}
                        className="text-primary font-semibold text-xs hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
              {logPageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No activity records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {sortedByUpdate.length > logPageSize && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-low/30">
            <span className="text-xs text-on-surface-variant">
              Page {logPage} of {logTotalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(logTotalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(logPage - 2, logTotalPages - 4))
                const pageNum = start + i
                if (pageNum > logTotalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setLogPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold ${
                      pageNum === logPage
                        ? 'bg-primary text-white'
                        : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setLogPage(p => Math.min(logTotalPages, p + 1))}
                disabled={logPage === logTotalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <VehicleDetailModal
        open={detailVehicle !== null}
        vehicle={detailVehicle}
        onClose={() => setDetailVehicle(null)}
        onSuccess={refetch}
      />
    </div>
  )
}

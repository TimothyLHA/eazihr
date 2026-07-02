'use client'

const stats = [
  { label: 'Active Fleet', value: '42 / 50', trend: '+5%', icon: 'local_shipping', accent: 'text-secondary', badge: 'bg-surface-container-low text-secondary' },
  { label: 'Staff in Field', value: '128', trend: '-2%', icon: 'groups', accent: 'text-error', badge: 'bg-surface-container-low text-error' },
  { label: 'Fuel Efficiency', value: '8.4 L/km', trend: '-12%', icon: 'gas_meter', accent: 'text-secondary', badge: 'bg-surface-container-low text-secondary' },
  { label: 'System Alerts', value: '03 High', trend: 'Critical', icon: 'warning', accent: 'text-error', badge: 'bg-error-container text-error' },
]

const assets = [
  { id: 'FLT-992-K', status: 'ON-TRACK', location: 'Broadway St Intersect', time: '14:10:50', badge: 'bg-secondary/10 text-secondary' },
  { id: 'EMP-8812', status: 'CHECK_IN_SUCCESS', location: 'Zone 4 Warehouse', time: '14:18:45', badge: 'bg-primary-container/10 text-primary-container' },
  { id: 'TRK-550-B', status: 'DELAY_RISK', location: 'Hudson Terminal', time: '14:22:10', badge: 'bg-amber-500/10 text-amber-700' },
  { id: 'VHC-314-N', status: 'CRITICAL', location: 'East Dock', time: '14:25:02', badge: 'bg-error/10 text-error' },
]

const activityLog = [
  { id: 'FLT-992-K', action: 'On track update', location: 'Broadway St Intersect', time: '14:10:50', status: 'ON-TRACK' },
  { id: 'EMP-8812', action: 'Check-in success', location: 'Zone 4 Warehouse', time: '14:18:45', status: 'SUCCESS' },
  { id: 'TRK-550-B', action: 'Route delay detected', location: 'Hudson Terminal', time: '14:22:10', status: 'DELAY' },
  { id: 'VHC-314-N', action: 'Critical alert raised', location: 'East Dock', time: '14:25:02', status: 'CRITICAL' },
]

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">FleetControl Live Tracking</h1>
          <p className="text-sm text-on-surface-variant">Live asset tracking, fleet status, and activity logs for your field workforce.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-semibold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            Export
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 h-[calc(100vh-240px)]">
        <section className="flex flex-col rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-6 py-4 bg-surface-container-lowest">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Asset List</h2>
              <p className="text-[11px] text-on-surface-variant">Live vehicle and staff tracking status</p>
            </div>
            <span className="inline-flex rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-on-secondary-container">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="rounded-3xl border border-outline-variant p-4 bg-surface-container-lowest">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-on-surface">{asset.id}</p>
                    <p className="text-xs text-on-surface-variant">{asset.location}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${asset.badge}`}>{asset.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{asset.time}</span>
                  <button className="text-primary hover:underline text-[11px] font-semibold">View</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-6 py-4 bg-white">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Live Map View</h2>
              <p className="text-[11px] text-on-surface-variant">Real-time location tracking of active vehicles.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-on-surface shadow-sm hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-on-surface shadow-sm hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-on-surface shadow-sm hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">my_location</span>
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden bg-surface-dim">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/10 to-transparent" />
            <div className="absolute top-6 left-6 rounded-3xl bg-white/90 border border-outline-variant p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Live Syncing</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-2 text-[11px] font-semibold text-primary">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                FLT-992-K (3 min)
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

      <section className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4 bg-surface-container-lowest">
          <div>
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest">Recent Activity Log</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-2xl bg-surface-container px-4 py-2 text-[11px] font-bold text-on-surface hover:bg-surface-container-high transition-colors">Filter</button>
            <button className="rounded-2xl bg-surface-container px-4 py-2 text-[11px] font-bold text-on-surface hover:bg-surface-container-high transition-colors">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="px-6 py-3">Asset ID</th>
                <th className="px-6 py-3">Action / Status</th>
                <th className="px-6 py-3">Location Update</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {activityLog.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4 font-medium text-on-surface">{item.id}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{item.action}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{item.location}</td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">{item.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-semibold text-xs hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

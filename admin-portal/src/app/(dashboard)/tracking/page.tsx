'use client'

const stats = [
  { label: 'Live Devices', value: '218', icon: 'devices', badge: 'bg-secondary-container text-on-secondary-container' },
  { label: 'Geo-fence Alerts', value: '12', icon: 'place', badge: 'bg-error-container text-on-error' },
  { label: 'Check-ins Today', value: '1,124', icon: 'calendar_today', badge: 'bg-secondary-container text-on-secondary-container' },
]

const locations = [
  { name: 'HQ Floor 4', employees: '82', status: 'Nominal', statusClass: 'bg-secondary-container text-on-secondary-container' },
  { name: 'Remote Hub A', employees: '230', status: 'Stable', statusClass: 'bg-secondary-container text-on-secondary-container' },
  { name: 'Production Line', employees: '146', status: 'Alert', statusClass: 'bg-error-container text-on-error' },
]

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Tracking Overview</h1>
          <p className="text-sm text-on-surface-variant">Monitor location access, device activity, and geo-compliance across your workforce.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">share_location</span>
          Add Tracking Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-surface-container p-3 text-primary">
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${stat.badge}`}>{stat.label}</span>
            </div>
            <p className="mt-3 text-3xl font-black text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Geo-fence Status</h2>
            <p className="text-xs text-on-surface-variant">Current perimeter compliance with employee locations.</p>
          </div>
          <button className="px-4 py-2 rounded-2xl bg-secondary text-on-secondary font-semibold text-sm">Review Alerts</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div key={location.name} className="rounded-3xl bg-white border border-outline-variant p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-on-surface">{location.name}</p>
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${location.statusClass}`}>{location.status}</span>
              </div>
              <p className="text-3xl font-black text-on-surface">{location.employees}</p>
              <p className="text-xs text-on-surface-variant mt-2">Employees currently checked into this location.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

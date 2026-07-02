'use client'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const barData = [
  { onTime: 80, late: 20 },
  { onTime: 95, late: 0 },
  { onTime: 75, late: 15 },
  { onTime: 85, late: 5 },
  { onTime: 60, late: 25 },
  { onTime: 20, late: 0 },
  { onTime: 15, late: 0 },
]

const lateLogs = [
  { name: 'Marcus Thorne', role: 'UI Designer', minutes: '15m', reason: 'Traffic congestion on M1', excused: false },
  { name: 'Sarah Jenkins', role: 'Dev Ops', minutes: '42m', reason: null, excused: false },
  { name: 'Leo Grcic', role: 'Finance', minutes: '08m', reason: null, excused: false },
]

const records = [
  { initials: 'JD', name: 'Jane Doe', role: 'Engineer', date: 'Oct 24, 2023', checkIn: '08:52:14', checkInLabel: 'ON TIME', checkInLabelColor: 'text-on-secondary-container', checkOut: '17:35:02', location: 'HQ - Floor 4 (Zone B)', locationIcon: 'location_on', locationColor: 'text-secondary', status: 'PRESENT' },
  { initials: 'AS', name: 'Alan Smith', role: 'Manager', date: 'Oct 24, 2023', checkIn: '09:45:33', checkInLabel: 'LATE (45m)', checkInLabelColor: 'text-amber-600', checkOut: null, location: 'Remote (Verified IP)', locationIcon: 'home_pin', locationColor: 'text-amber-500', status: 'ACTIVE' },
  { initials: 'RW', name: 'Robert Wilson', role: 'Senior Dev', date: 'Oct 24, 2023', checkIn: '08:02:10', checkInLabel: 'EARLY', checkInLabelColor: 'text-on-secondary-container', checkOut: '18:05:44', location: 'HQ - Floor 2 (Dev Lab)', locationIcon: 'location_on', locationColor: 'text-secondary', status: 'COMPLETED' },
]

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[32px] font-semibold tracking-tight text-on-surface">Attendance & Tracking</h2>
          <p className="text-sm text-on-surface-variant">Real-time oversight of personnel movement and precision logging.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-xs font-semibold hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-lg">download</span> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-lg">add</span> New Manual Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Weekly Attendance Trends</h3>
              <p className="text-xs text-on-surface-variant">Daily comparison of check-ins versus late arrivals.</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg text-xs font-semibold px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 h-64 px-4">
            {barData.map((bar, i) => (
              <div key={i} className="flex-1 group relative flex flex-col justify-end items-center h-full">
                <div className="w-full bg-secondary-container rounded-t-lg transition-all hover:opacity-80" style={{ height: `${bar.onTime}%` }} />
                {bar.late > 0 && (
                  <div className="w-full bg-amber-500 rounded-t-lg transition-all absolute" style={{ height: `${bar.late}%`, bottom: 0 }} />
                )}
                <span className="mt-2 text-[10px] text-on-surface-variant">{days[i]}</span>
              </div>
            ))}
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
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">12 Alerts</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {lateLogs.map((log, i) => (
              <div key={i} className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-amber-500 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <span className="material-symbols-outlined text-lg">timer_off</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{log.name}</p>
                      <p className="text-xs text-on-surface-variant">{log.role} &bull; {log.minutes} late</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-amber-200 rounded-full text-amber-700 transition-colors">
                    <span className="material-symbols-outlined text-sm">notifications_active</span>
                  </button>
                </div>
                {log.reason && (
                  <div className="mt-3 bg-surface-container-low rounded-lg p-2 flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant italic">&ldquo;{log.reason}&rdquo;</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">UNEXCUSED</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 text-center text-xs font-semibold text-primary hover:bg-surface-container-low rounded-lg transition-colors border border-dashed border-outline-variant">
            View All Late Logs
          </button>
        </div>

        <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-xl font-semibold text-on-surface">Attendance Records</h3>
              <nav className="flex gap-1 bg-surface-container-low p-1 rounded-lg">
                <button className="px-4 py-1.5 rounded-md bg-surface-container-lowest shadow-sm text-xs font-semibold text-primary">All Entries</button>
                <button className="px-4 py-1.5 rounded-md text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">On-Site</button>
                <button className="px-4 py-1.5 rounded-md text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Remote</button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">filter_list</span>
              </button>
              <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">refresh</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/30 border-b border-outline-variant">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Check In</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Check Out</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Location Tracking</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[10px]">{r.initials}</div>
                        <div>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-on-surface-variant">{r.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{r.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-on-surface">{r.checkIn}</span>
                      <p className={`text-[10px] font-bold ${r.checkInLabelColor}`}>{r.checkInLabel}</p>
                    </td>
                    <td className="px-6 py-4">
                      {r.checkOut ? (
                        <span className="text-sm font-mono text-on-surface">{r.checkOut}</span>
                      ) : (
                        <span className="text-on-surface-variant/40">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className={`material-symbols-outlined text-lg ${r.locationColor}`}>{r.locationIcon}</span>
                        <span className="text-xs">{r.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Showing 1-10 of 422 entries</span>
            <div className="flex gap-2">
              <button className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-low disabled:opacity-30 opacity-30 cursor-not-allowed">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

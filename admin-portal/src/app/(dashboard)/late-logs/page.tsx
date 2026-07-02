'use client'

interface LateEntry {
  name: string
  role: string
  department: string
  date: string
  minutesLate: number
  reason: string
  status: 'Excused' | 'Unexcused'
}

const lateEntries: LateEntry[] = [
  { name: 'Marcus Thorne', role: 'UI Designer', department: 'Design', date: 'Oct 24, 2023', minutesLate: 15, reason: 'Traffic congestion on M1', status: 'Unexcused' },
  { name: 'Sarah Jenkins', role: 'Dev Ops', department: 'Engineering', date: 'Oct 24, 2023', minutesLate: 42, reason: 'Medical appointment', status: 'Excused' },
  { name: 'Leo Grcic', role: 'Finance Analyst', department: 'Finance', date: 'Oct 25, 2023', minutesLate: 8, reason: 'Public transport delay', status: 'Unexcused' },
  { name: 'Alice Brown', role: 'HR Specialist', department: 'HR', date: 'Oct 25, 2023', minutesLate: 22, reason: 'Childcare emergency', status: 'Excused' },
  { name: 'James Wilson', role: 'Backend Developer', department: 'Engineering', date: 'Oct 26, 2023', minutesLate: 35, reason: 'Road construction detour', status: 'Unexcused' },
  { name: 'Emma Davis', role: 'Marketing Coordinator', department: 'Marketing', date: 'Oct 26, 2023', minutesLate: 10, reason: 'Overslept', status: 'Unexcused' },
  { name: 'David Kim', role: 'QA Engineer', department: 'Engineering', date: 'Oct 27, 2023', minutesLate: 18, reason: 'Car issues', status: 'Excused' },
]

const statusStyles: Record<string, string> = {
  'Excused': 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
  'Unexcused': 'bg-error-container text-on-error-container',
}

export default function LateLogsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Late Logs</h1>
          <p className="text-sm text-on-surface-variant">Track and manage employee late arrivals and attendance anomalies.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 border border-outline text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">file_download</span>
            Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-xl">add</span>
            Log Late Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Late Logs</p>
          <h2 className="text-3xl font-black text-on-surface">45</h2>
          <p className="text-xs text-error font-medium mt-2">&uarr; 5% higher than average</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Unexcused</p>
          <h2 className="text-3xl font-black text-on-surface">28</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-2">Requires follow-up</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Excused</p>
          <h2 className="text-3xl font-black text-on-surface">17</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-2">Valid reasons provided</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Avg. Late Duration</p>
          <h2 className="text-3xl font-black text-on-surface">21m</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-2">Per incident</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input type="text" placeholder="Search by employee name, department..." className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[180px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>HR</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
            <div className="relative min-w-[150px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>All Status</option>
                <option>Excused</option>
                <option>Unexcused</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">filter_list</span>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button className="p-1.5 bg-surface-container-lowest rounded shadow-sm text-primary">
                <span className="material-symbols-outlined block text-lg">grid_view</span>
              </button>
              <button className="p-1.5 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined block text-lg">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {lateEntries.map((entry, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
            <div className={`h-2 ${entry.status === 'Unexcused' ? 'bg-error' : 'bg-tertiary-fixed-dim'} w-full`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                  {entry.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${statusStyles[entry.status]}`}>
                  {entry.status}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{entry.name}</h4>
                <p className="text-sm text-on-surface-variant font-medium">{entry.role}</p>
                <p className="text-xs text-outline font-medium mt-1">{entry.department}</p>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {entry.date}
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">timer_off</span>
                  {entry.minutesLate} minutes late
                </div>
                {entry.reason && (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant italic">
                    <span className="material-symbols-outlined text-sm">chat</span>
                    &ldquo;{entry.reason}&rdquo;
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-outline-variant bg-surface-container-low px-6 py-3 flex justify-between">
              <button className="text-xs font-bold text-primary hover:underline">View Details</button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">more_horiz</span>
              </button>
            </div>
          </div>
        ))}
        <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-8 bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary">add</span>
          </div>
          <p className="text-sm font-bold text-on-surface">Log Entry</p>
          <p className="text-xs text-on-surface-variant text-center mt-1">Record a late arrival</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant pt-6">
        <p className="text-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-7</span> of <span className="font-bold text-on-surface">45</span> entries</p>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded bg-primary text-white text-sm font-bold">1</button>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">2</button>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">3</button>
          <span className="px-2 text-on-surface-variant">...</span>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">7</button>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

type Status = 'Active' | 'Remote' | 'On Leave'

interface Employee {
  name: string
  role: string
  department: string
  location: string
  email: string
  phone: string
  status: Status
  color: 'secondary' | 'primary' | 'tertiary-fixed-dim'
}

const employees: Employee[] = [
  { name: 'Sarah Chen', role: 'Senior Frontend Engineer', department: 'Engineering', location: 'San Francisco', email: 's.chen@company.com', phone: '+1 (555) 012-3456', status: 'Active', color: 'secondary' },
  { name: 'Marcus Thorne', role: 'Creative Director', department: 'Design', location: 'London', email: 'm.thorne@company.com', phone: '+44 20 7946 0123', status: 'Remote', color: 'primary' },
  { name: 'Elena Rodriguez', role: 'VP of Operations', department: 'Management', location: 'New York', email: 'e.rod@company.com', phone: '+1 (555) 987-6543', status: 'Active', color: 'primary' },
  { name: 'Yuki Tanaka', role: 'Product Designer', department: 'Design', location: 'Tokyo', email: 'y.tanaka@company.com', phone: '+81 3 1234 5678', status: 'On Leave', color: 'tertiary-fixed-dim' },
  { name: 'Arjun Varma', role: 'Marketing Lead', department: 'Marketing', location: 'Mumbai', email: 'a.varma@company.com', phone: '+91 22 9876 5432', status: 'Active', color: 'secondary' },
  { name: 'Sophie Mueller', role: 'UX Researcher', department: 'Design', location: 'Berlin', email: 's.mueller@company.com', phone: '+49 30 1234567', status: 'Active', color: 'primary' },
  { name: 'David Foster', role: 'Chief Security Officer', department: 'Management', location: 'Washington DC', email: 'd.foster@company.com', phone: '+1 (202) 555-0199', status: 'Remote', color: 'primary' },
]

const statusStyles: Record<Status, string> = {
  'Active': 'bg-secondary-container text-on-secondary-container',
  'Remote': 'bg-secondary-container text-on-secondary-container',
  'On Leave': 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
}

const colorBars: Record<string, string> = {
  'secondary': 'bg-secondary',
  'primary': 'bg-primary',
  'tertiary-fixed-dim': 'bg-tertiary-fixed-dim',
}

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Employee Directory</h1>
          <p className="text-sm text-on-surface-variant">Manage and organize your global workforce with precision.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-xl">person_add</span>
          Add New Employee
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input type="text" placeholder="Search by name, email, role, or ID..." className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[180px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Sales</option>
                <option>Operations</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
            <div className="relative min-w-[150px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>Active Status</option>
                <option>Active</option>
                <option>On Leave</option>
                <option>Remote</option>
                <option>Contractor</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">filter_list</span>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button className="p-1.5 bg-surface rounded shadow-sm text-primary">
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
        {employees.map((emp, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group" style={{ transform: 'translateY(0px)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
            <div className={`h-2 ${colorBars[emp.color]} w-full`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${statusStyles[emp.status]}`}>
                  {emp.status}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{emp.name}</h4>
                <p className="text-sm text-on-surface-variant font-medium">{emp.role}</p>
                <p className="text-xs text-outline font-medium mt-1">{emp.department} &bull; {emp.location}</p>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  {emp.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {emp.phone}
                </div>
              </div>
            </div>
            <div className="border-t border-outline-variant bg-surface-container-low px-6 py-3 flex justify-between">
              <button className="text-xs font-bold text-primary hover:underline">View Profile</button>
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
          <p className="text-sm font-bold text-on-surface">Add Member</p>
          <p className="text-xs text-on-surface-variant text-center mt-1">Expand your department</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant pt-6">
        <p className="text-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-8</span> of <span className="font-bold text-on-surface">124</span> employees</p>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded bg-primary text-white text-sm font-bold">1</button>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">2</button>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">3</button>
          <span className="px-2 text-on-surface-variant">...</span>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface text-sm hover:bg-surface-container transition-colors">16</button>
          <button className="w-9 h-9 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

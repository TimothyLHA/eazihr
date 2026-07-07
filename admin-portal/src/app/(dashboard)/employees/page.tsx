'use client'

import { useState } from 'react'
import { useEmployees } from '@/hooks/use-employees'
import { useOrganization } from '@/providers/org-provider'
import AddEmployeeModal from '@/components/employees/add-employee-modal'
import ViewEmployeeModal from '@/components/employees/view-employee-modal'
import EditEmployeeModal from '@/components/employees/edit-employee-modal'
import EmployeeCardDropdown from '@/components/employees/employee-card-dropdown'
import ResetPasswordModal from '@/components/employees/reset-password-modal'

const statusStyles: Record<string, string> = {
  'active': 'bg-secondary-container text-on-secondary-container',
  'resigned': 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
  'suspended': 'bg-error-container text-on-error-container',
}

const colorBars: Record<string, string> = {
  'active': 'bg-secondary',
  'resigned': 'bg-tertiary-fixed-dim',
  'suspended': 'bg-error',
}

export default function EmployeesPage() {
  const { employees, count, loading, refreshing, error, refetch } = useEmployees()
  const { organization } = useOrganization()
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(null)
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null)
  const [resetEmployee, setResetEmployee] = useState<{ id: string; name: string } | null>(null)

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-on-surface">Employee Directory</h1>
          <p className="text-xs text-on-surface-variant">Manage and organize your global workforce with precision.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
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
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
            <div className="relative min-w-[150px]">
              <select className="w-full pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer outline-none">
                <option>All Status</option>
                <option>Active</option>
                <option>Resigned</option>
                <option>Suspended</option>
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

      {error && (
        <div className="rounded-xl bg-error-container text-error p-4 text-sm">
          Failed to load employees. <button onClick={() => window.location.reload()} className="underline font-semibold">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && employees.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="h-2 bg-surface-container w-full" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-full bg-surface-container animate-pulse" />
                  <div className="w-16 h-5 bg-surface-container rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-surface-container rounded animate-pulse" />
                  <div className="h-4 w-24 bg-surface-container rounded animate-pulse" />
                  <div className="h-3 w-32 bg-surface-container rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-44 bg-surface-container rounded animate-pulse" />
                  <div className="h-4 w-32 bg-surface-container rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : employees.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-12 bg-surface-container-lowest">
            <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">groups</span>
            </div>
            <p className="text-lg font-bold text-on-surface">No employees yet</p>
            <p className="text-sm text-on-surface-variant mt-1">Add your first employee to get started.</p>
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-md transition-shadow group"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
              <div className={`h-2 rounded-t-xl ${colorBars[emp.status] || 'bg-surface-container'} w-full`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
                    {initials(emp.name)}
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${statusStyles[emp.status] || 'bg-surface-container text-on-surface-variant'}`}>
                    {emp.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{emp.name}</h4>
                  <p className="text-sm text-on-surface-variant font-medium">{emp.role}</p>
                  <p className="text-xs text-outline font-medium mt-1">{emp.department}</p>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">mail</span>
                    {emp.email || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    {emp.employee_code || '—'}
                  </div>
                </div>
              </div>
              <div className="border-t border-outline-variant bg-surface-container-low px-4 py-2 flex justify-between">
                <button onClick={() => setViewEmployeeId(emp.id)} className="text-xs font-bold text-primary hover:underline">View Profile</button>
                <EmployeeCardDropdown onEdit={() => setEditEmployeeId(emp.id)} onResetPassword={() => setResetEmployee({ id: emp.id, name: emp.name })} />
              </div>
            </div>
          ))
        )}

        <button onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-8 bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group text-left"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary">add</span>
          </div>
          <p className="text-sm font-bold text-on-surface">Add Member</p>
          <p className="text-xs text-on-surface-variant text-center mt-1">Expand your department</p>
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant pt-6">
        <p className="text-sm text-on-surface-variant">
          Showing <span className="font-bold text-on-surface">{employees.length}</span> of <span className="font-bold text-on-surface">{count}</span> employees
        </p>
      </div>

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); refetch() }}
      />

      <ViewEmployeeModal
        employeeId={viewEmployeeId}
        onClose={() => setViewEmployeeId(null)}
        onEdit={(id) => { setViewEmployeeId(null); setEditEmployeeId(id) }}
      />

      <EditEmployeeModal
        employeeId={editEmployeeId}
        onClose={() => setEditEmployeeId(null)}
        onSaved={() => { setEditEmployeeId(null); refetch() }}
      />

      <ResetPasswordModal
        employeeId={resetEmployee?.id ?? null}
        organizationId={organization?.id ?? ''}
        employeeName={resetEmployee?.name ?? ''}
        onClose={() => setResetEmployee(null)}
        onDone={() => setResetEmployee(null)}
      />
    </div>
  )
}

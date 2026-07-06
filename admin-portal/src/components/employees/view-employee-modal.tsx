'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useOrganization } from '@/providers/org-provider'

type Props = {
  employeeId: string | null
  onClose: () => void
  onEdit: (id: string) => void
}

type FullEmployee = {
  id: string
  employee_code: string | null
  position: string | null
  department: string | null
  hire_date: string | null
  basic_salary: number | null
  status: string
  emergency_contact: { name?: string; phone?: string } | null
  profile: { email: string; full_name: string } | null
}

export default function ViewEmployeeModal({ employeeId, onClose, onEdit }: Props) {
  const supabase = useSupabase()
  const { organization } = useOrganization()
  const [employee, setEmployee] = useState<FullEmployee | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!employeeId || !organization?.id) return
    setLoading(true)
    supabase
      .from('employees')
      .select('id, employee_code, position, department, hire_date, basic_salary, status, emergency_contact, profile:profile_id(id, email, full_name)')
      .eq('id', employeeId)
      .eq('organization_id', organization.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setEmployee(data as unknown as FullEmployee)
        }
        setLoading(false)
      })
  }, [employeeId, organization?.id, supabase])

  if (!employeeId) return null

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const ec = employee?.emergency_contact as { name?: string; phone?: string } | null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Employee Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 w-full bg-surface-container rounded animate-pulse" />
            ))}
          </div>
        ) : employee ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-lg font-bold text-primary">
                {initials(employee.profile?.full_name || '')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">{employee.profile?.full_name || 'Unknown'}</h3>
                <p className="text-sm text-on-surface-variant">{employee.position || '—'}</p>
              </div>
              <span className={`ml-auto px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${
                employee.status === 'active' ? 'bg-secondary-container text-on-secondary-container' :
                employee.status === 'resigned' ? 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant' :
                'bg-error-container text-on-error-container'
              }`}>{employee.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Email</p>
                <p className="text-sm text-on-surface font-medium mt-0.5">{employee.profile?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Employee Code</p>
                <p className="text-sm text-on-surface font-medium mt-0.5">{employee.employee_code || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Department</p>
                <p className="text-sm text-on-surface font-medium mt-0.5">{employee.department || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Position</p>
                <p className="text-sm text-on-surface font-medium mt-0.5">{employee.position || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Hire Date</p>
                <p className="text-sm text-on-surface font-medium mt-0.5">{employee.hire_date || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Basic Salary</p>
                <p className="text-sm text-on-surface font-medium mt-0.5">
                  {employee.basic_salary != null ? `$${Number(employee.basic_salary).toLocaleString()}` : '—'}
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-4">
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-2">Emergency Contact</p>
              <p className="text-sm text-on-surface font-medium">{ec?.name || '—'}</p>
              <p className="text-sm text-on-surface-variant">{ec?.phone || '—'}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-on-surface-variant text-sm">Employee not found.</div>
        )}

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-outline-variant">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
            Close
          </button>
          {employee && (
            <button
              onClick={() => onEdit(employee.id)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

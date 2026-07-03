'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/use-settings'

const tabs = [
  { id: 'company', label: 'Company Profile', icon: 'business' },
  { id: 'rbac', label: 'Access Control', icon: 'admin_panel_settings' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
  { id: 'payroll', label: 'Payroll Cycle', icon: 'event_repeat' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const { org, roles, loading, error } = useSettings()

  const payrollConfig = org?.payroll_config as Record<string, unknown> ?? {}
  const currency = (payrollConfig.currency as string) ?? 'USD'

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-lg font-bold text-on-surface">Failed to load settings</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">System Configuration</h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Manage your organization's global identity, security protocols, and operational frameworks from a central command center.
        </p>
      </div>

      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-outline-variant/30 bg-surface-container-lowest">
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                  active
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant border-b-2 border-transparent hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-8">
          {activeTab === 'company' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                  <h2 className="text-xl font-semibold text-on-surface mb-2">Company Profile</h2>
                  <p className="text-sm text-on-surface-variant">
                    Update your legal entity information, branding assets, and regional defaults used across the portal.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-semibold text-on-surface-variant">Legal Company Name</label>
                      <input
                        className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        type="text"
                        defaultValue={org?.name ?? ''}
                        readOnly={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-on-surface-variant">Registration Number</label>
                      <input
                        className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        type="text"
                        defaultValue={(org?.settings?.registration_number as string) ?? ''}
                        readOnly={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-semibold text-on-surface-variant">Headquarters Address</label>
                    <textarea
                      className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      rows={3}
                      defaultValue={(org?.settings?.address as string) ?? ''}
                      readOnly={loading}
                    />
                  </div>

                  <div className="flex flex-col gap-6 rounded-3xl border border-dashed border-outline-variant px-6 py-6 bg-white">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-3xl bg-surface-container-highest p-4 flex items-center justify-center overflow-hidden">
                          {org?.logo_url ? (
                            <img className="h-full w-full object-contain" src={org.logo_url} alt="Company logo" />
                          ) : (
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant">business</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">Company Logo</p>
                          <p className="text-xs text-on-surface-variant">PNG, SVG up to 5MB. Recommended size 400x400px.</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:opacity-90">
                          Update Logo
                        </button>
                        <button className="rounded-2xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div>
                    <h3 className="text-xl font-semibold text-on-surface mb-2">Regional Settings</h3>
                    <p className="text-sm text-on-surface-variant">Default timezone and currency for all system-generated reports.</p>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-semibold text-on-surface-variant">Primary Timezone</label>
                      <select className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                        <option>Asia/Yangon (GMT +06:30)</option>
                        <option>{org?.settings?.timezone as string ?? 'Asia/Yangon (GMT +06:30)'}</option>
                        <option>(GMT +00:00) London</option>
                        <option>(GMT -05:00) New York</option>
                        <option>(GMT +08:00) Singapore</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-on-surface-variant">Base Currency</label>
                      <select className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                        <option>MMK (K)</option>
                        <option>{currency === 'USD' ? 'USD ($)' : currency === 'GBP' ? 'GBP (£)' : currency === 'EUR' ? 'EUR (€)' : currency === 'MMK' ? 'MMK (K)' : `${currency}`}</option>
                        <option>USD ($)</option>
                        <option>GBP (£)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-on-surface">Role-Based Access Control</h2>
                  <p className="text-sm text-on-surface-variant">Define permissions and access levels for system users.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:opacity-90">
                  <span className="material-symbols-outlined">add</span>
                  Create New Role
                </button>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-outline-variant bg-white">
                <table className="w-full text-left min-w-[680px]">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Role Name</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Assigned Users</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Access Level</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right text-on-surface-variant">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 4 }).map((_, j) => (
                            <td key={j} className="px-6 py-5">
                              <div className="h-4 w-24 bg-surface-container rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : roles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-on-surface-variant">No roles found</td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role.name} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-6 py-5 font-semibold text-on-surface">{role.name}</td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant">{role.users}</td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant">{role.level}</td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-primary text-sm font-semibold hover:underline">Manage</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-on-surface">Notification Settings</h2>
                <p className="text-sm text-on-surface-variant">Keep the right teams informed with configurable alerts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Email alerts', 'SMS alerts', 'In-app notifications'].map((label) => {
                  const notifConfig = org?.settings?.notifications as Record<string, boolean> ?? {}
                  const key = label.toLowerCase().replace(/\s+/g, '_')
                  const enabled = notifConfig[key] ?? (label === 'Email alerts' || label === 'In-app notifications')
                  return (
                    <div key={label} className="rounded-3xl border border-outline-variant bg-white p-6">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{label}</p>
                          <p className="text-xs text-on-surface-variant">
                            {label === 'Email alerts' ? 'Send system updates to administrators.' :
                             label === 'SMS alerts' ? 'Notify managers on critical events.' :
                             'Show alerts inside the portal.'}
                          </p>
                        </div>
                        <span className={`inline-flex h-6 w-12 items-center rounded-full p-1 transition ${enabled ? 'bg-primary/10' : 'bg-surface-container-highest'}`}>
                          <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-all ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </span>
                      </div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant">Status</p>
                      <p className="mt-2 font-semibold text-on-surface">{enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-on-surface">Payroll Cycle</h2>
                  <p className="text-sm text-on-surface-variant">Configure pay schedule, approval workflow, and release cadence.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:opacity-90">
                  <span className="material-symbols-outlined">sync</span>
                  Run Bulk Generation
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-outline-variant bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Payroll Frequency</p>
                  <p className="mt-4 text-2xl font-bold text-on-surface">Monthly</p>
                  <p className="mt-3 text-sm text-on-surface-variant">Automatic payroll creation on the last business day of each month.</p>
                </div>
                <div className="rounded-3xl border border-outline-variant bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Base Currency</p>
                  <p className="mt-4 text-2xl font-bold text-on-surface">{currency}</p>
                  <p className="mt-3 text-sm text-on-surface-variant">Currency used for all payroll calculations.</p>
                </div>
                <div className="rounded-3xl border border-outline-variant bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Overtime Rate</p>
                  <p className="mt-4 text-2xl font-bold text-on-surface">{(payrollConfig.overtime_rate as string ?? '1.5')}x</p>
                  <p className="mt-3 text-sm text-on-surface-variant">Standard overtime multiplier.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

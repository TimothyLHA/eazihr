'use client'

const payslips = [
  { employee: 'Elena Rodriguez', period: 'Oct 2026', net: '$7,820', status: 'Issued', statusClass: 'bg-secondary-container text-on-secondary-container' },
  { employee: 'Marcus Thorne', period: 'Oct 2026', net: '$5,420', status: 'Processing', statusClass: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant' },
  { employee: 'Sarah Chen', period: 'Oct 2026', net: '$9,240', status: 'Issued', statusClass: 'bg-secondary-container text-on-secondary-container' },
]

export default function PayslipsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-on-surface">Payslips & Payroll</h1>
          <p className="text-sm text-on-surface-variant">Review current payslip issuance status and payroll run details.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">receipt_long</span>
          Generate Payslip
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Most Recent Payroll</p>
          <p className="mt-4 text-3xl font-black text-on-surface">Oct 25, 2026</p>
          <p className="text-sm text-on-surface-variant mt-2">Finalized and queued for payout.</p>
        </div>
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Payroll</p>
          <p className="mt-4 text-3xl font-black text-on-surface">$218,400</p>
          <p className="text-sm text-on-surface-variant mt-2">Net payroll for current period.</p>
        </div>
        <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Payslips Issued</p>
          <p className="mt-4 text-3xl font-black text-on-surface">1,124</p>
          <p className="text-sm text-on-surface-variant mt-2">All employees paid this cycle.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Payslip History</h2>
            <p className="text-xs text-on-surface-variant">Recently issued payslips and archive status.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-2xl bg-surface-container text-on-surface font-semibold text-sm">Download CSV</button>
            <button className="px-4 py-2 rounded-2xl bg-secondary text-on-secondary font-semibold text-sm">Review Audit</button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-outline-variant bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline-variant">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Payroll Period</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Net Amount</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {payslips.map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-on-surface">{row.employee}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.period}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{row.net}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${row.statusClass}`}>{row.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-semibold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

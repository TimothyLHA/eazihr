'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { updateVehicleStatus } from '@/lib/actions/tracking'
import type { VehicleEntry } from '@/hooks/use-tracking'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active (On-Track)' },
  { value: 'idle', label: 'Idle (Check-in Success)' },
  { value: 'maintenance', label: 'Maintenance (Delay Risk)' },
  { value: 'out_of_service', label: 'Out of Service (Critical)' },
] as const

const STATUS_BADGES: Record<string, { badge: string; dot: string }> = {
  active: { badge: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  idle: { badge: 'bg-primary-container/10 text-primary-container', dot: 'bg-primary-container' },
  maintenance: { badge: 'bg-amber-500/10 text-amber-700', dot: 'bg-amber-500' },
  out_of_service: { badge: 'bg-error/10 text-error', dot: 'bg-error' },
}

type Props = {
  open: boolean
  vehicle: VehicleEntry | null
  onClose: () => void
  onSuccess: () => void
}

export default function VehicleDetailModal({ open, vehicle, onClose, onSuccess }: Props) {
  if (!open || !vehicle) return null

  const [status, setStatus] = useState(vehicle.status)
  const [driverName, setDriverName] = useState(vehicle.driver_name || '')
  const [location, setLocation] = useState(
    vehicle.last_location && typeof vehicle.last_location === 'object'
      ? String((vehicle.last_location as Record<string, unknown>).address ?? '')
      : ''
  )

  useEffect(() => {
    if (vehicle) {
      setStatus(vehicle.status)
      setDriverName(vehicle.driver_name || '')
      setLocation(
        vehicle.last_location && typeof vehicle.last_location === 'object'
          ? String((vehicle.last_location as Record<string, unknown>).address ?? '')
          : ''
      )
    }
  }, [vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('id', vehicle.id)
    fd.set('status', status)
    fd.set('driver_name', driverName)
    fd.set('last_location', location)
    const result = await updateVehicleStatus(null, fd)
    if (result?.success) {
      onSuccess()
      onClose()
    }
  }

  const badge = STATUS_BADGES[vehicle.status] ?? STATUS_BADGES.idle
  const locationDisplay = vehicle.last_location && typeof vehicle.last_location === 'object'
    ? String((vehicle.last_location as Record<string, unknown>).address ?? vehicle.plate_number)
    : vehicle.plate_number

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface">Vehicle Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-2xl text-primary">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-on-surface">{vehicle.name}</p>
                <p className="text-sm text-on-surface-variant">{vehicle.plate_number}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${badge.badge}`}>
                {vehicle.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Current Location</p>
                <p className="text-sm font-bold text-on-surface">{locationDisplay}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm font-bold text-on-surface">
                  {vehicle.last_updated
                    ? new Date(vehicle.last_updated).toLocaleString()
                    : '--:--:--'}
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-5 space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Update Vehicle</h3>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Driver name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Location / Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Current address or coordinates"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

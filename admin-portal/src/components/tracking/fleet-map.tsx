'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { VehicleEntry } from '@/hooks/use-tracking'

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  idle: '#3b82f6',
  maintenance: '#f59e0b',
  out_of_service: '#ef4444',
}

type Props = {
  vehicles: VehicleEntry[]
}

export default function FleetMap({ vehicles }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const vehiclesJson = JSON.stringify(vehicles.map(v => ({ id: v.id, name: v.name, status: v.status, last_location: v.last_location, plate_number: v.plate_number, driver_name: v.driver_name })))

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [40.7128, -74.006],
      zoom: 12,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
  }, [])

  useEffect(() => {
    initMap()
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [initMap])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const vehiclesData: VehicleEntry[] = JSON.parse(vehiclesJson)
    const bounds: L.LatLngTuple[] = []

    vehiclesData.forEach(v => {
      const loc = v.last_location
      if (!loc || typeof loc !== 'object') return
      const locObj = loc as Record<string, unknown>
      const lat = Number(locObj.lat)
      const lng = Number(locObj.lng)
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return

      const color = STATUS_COLORS[v.status] ?? '#6b7280'

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: white;
        "><span style="font-weight:bold;font-size:12px;">${v.name.charAt(0).toUpperCase()}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:180px;">
          <p style="font-weight:700;margin:0 0 4px;font-size:14px;">${v.name}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#666;">${v.plate_number}</p>
          ${v.driver_name ? `<p style="margin:0 0 2px;font-size:12px;color:#666;">Driver: ${v.driver_name}</p>` : ''}
          <p style="margin:0;font-size:12px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:4px;"></span>
            ${v.status.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      `)

      markersRef.current.push(marker)
      bounds.push([lat, lng])
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [vehiclesJson])

  const handleZoomIn = () => mapRef.current?.zoomIn()
  const handleZoomOut = () => mapRef.current?.zoomOut()
  const handleRecenter = () => {
    const map = mapRef.current
    if (!map) return
    const markers = markersRef.current
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 15 })
    } else {
      map.setView([40.7128, -74.006], 12)
    }
  }

  return (
    <div className="relative flex-1">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-[1000]">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-on-surface shadow-md hover:bg-surface-container transition-colors border border-outline-variant"
          title="Zoom in"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-on-surface shadow-md hover:bg-surface-container transition-colors border border-outline-variant"
          title="Zoom out"
        >
          <span className="material-symbols-outlined text-lg">remove</span>
        </button>
        <button
          onClick={handleRecenter}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-on-surface shadow-md hover:bg-surface-container transition-colors border border-outline-variant"
          title="Recenter"
        >
          <span className="material-symbols-outlined text-lg">my_location</span>
        </button>
      </div>
    </div>
  )
}

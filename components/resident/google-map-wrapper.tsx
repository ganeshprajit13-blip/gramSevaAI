'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Loader2 } from 'lucide-react'

// Default fallback to Kinathukadavu, Coimbatore, Tamil Nadu
const KINATHUKADAVU_CENTER = { lat: 10.8208, lng: 77.0195 }

interface MapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: { lat: number; lng: number }[]
  onMarkerClick?: (index: number) => void
}

export default function GoogleMapWrapper({
  apiKey,
  center = KINATHUKADAVU_CENTER,
  zoom = 13,
  markers = [],
  onMarkerClick,
}: { apiKey?: string } & MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersGroupRef = useRef<L.LayerGroup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      L.control.attribution({ position: 'bottomright', prefix: 'Leaflet &bull; &copy; OpenStreetMap' }).addTo(map)

      const group = L.layerGroup().addTo(map)
      markersGroupRef.current = group
      mapInstanceRef.current = map
      setLoading(false)
    } catch (e) {
      console.error('Failed to initialize Leaflet wrapper:', e)
      setLoading(false)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update center and zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom)
    }
  }, [center.lat, center.lng, zoom])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return

    markersGroupRef.current.clearLayers()

    markers.forEach((pos, idx) => {
      const icon = L.divIcon({
        className: 'gs-simple-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
          ">
            <svg width="28" height="36" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 0C7.611 0 0 7.611 0 17c0 12.75 17 27 17 27s17-14.25 17-27c0-9.389-7.611-17-17-17z" fill="#0F766E" stroke="#ffffff" stroke-width="2.5"/>
              <circle cx="17" cy="16" r="6" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      })

      const marker = L.marker([pos.lat, pos.lng], { icon })
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(idx))
      }
      marker.addTo(markersGroupRef.current!)
    })
  }, [markers, onMarkerClick])

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-2xl overflow-hidden bg-secondary/30">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/50 backdrop-blur-xs">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />
    </div>
  )
}

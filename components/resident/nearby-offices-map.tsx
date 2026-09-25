'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import {
  Loader2, AlertTriangle, ExternalLink, Navigation2,
  Clock, Phone, MapPin, Building2, Shield, HeartPulse,
  Mail, Landmark, CheckCircle2, RefreshCw
} from 'lucide-react'

export interface PlaceOffice {
  id: string
  place_id?: string
  name: string
  category: 'Taluk Office' | 'VAO' | 'Panchayat' | 'E-Sevai' | 'Hospital' | 'Police' | 'Post Office' | 'Government Offices'
  address: string
  phone?: string
  working_hours?: string
  lat: number
  lng: number
  distanceKm: number
  distanceText: string
  rating?: number
  user_ratings_total?: number
  isOpenNow?: boolean
  mapsUrl?: string
  source?: 'google_places' | 'fallback'
}

interface NearbyOfficesMapProps {
  apiKey: string
  center: { lat: number; lng: number }
  locationName: string
  radiusMeters: number
  selectedCategory: string
  searchQuery: string
  selectedOffice: PlaceOffice | null
  userGpsLocation?: { lat: number; lng: number } | null
  onOfficesLoaded?: (offices: PlaceOffice[]) => void
  onOfficeSelect: (office: PlaceOffice | null) => void
}

// Marker styling helpers by category
const CATEGORY_COLORS: Record<string, { bg: string; fill: string; text: string }> = {
  'Taluk Office': { bg: '#0F766E', fill: '#0D9488', text: '#ffffff' },
  'VAO': { bg: '#15803D', fill: '#16A34A', text: '#ffffff' },
  'Panchayat': { bg: '#0369A1', fill: '#0284C7', text: '#ffffff' },
  'E-Sevai': { bg: '#7C3AED', fill: '#8B5CF6', text: '#ffffff' },
  'Hospital': { bg: '#DC2626', fill: '#EF4444', text: '#ffffff' },
  'Police': { bg: '#1E3A8A', fill: '#2563EB', text: '#ffffff' },
  'Post Office': { bg: '#D97706', fill: '#F59E0B', text: '#ffffff' },
  'Government Offices': { bg: '#334155', fill: '#475569', text: '#ffffff' },
}

// Verified Kinathukadavu Fallback Offices
export const KINATHUKADAVU_FALLBACK_OFFICES: Omit<PlaceOffice, 'distanceKm' | 'distanceText'>[] = [
  {
    id: 'kinathukadavu-taluk-office',
    name: 'Tahsildar / Taluk Office, Kinathukadavu',
    category: 'Taluk Office',
    address: 'Taluk Office Road, Kinathukadavu, Coimbatore District, Tamil Nadu 642109',
    lat: 10.822000,
    lng: 77.016000,
    phone: 'Information unavailable',
    working_hours: '10:00 AM – 5:45 PM (Mon–Fri)',
    source: 'fallback',
  },
  {
    id: 'kinathukadavu-sub-registrar-office',
    name: 'Kinathukadavu Sub-Registrar Office',
    category: 'Government Offices',
    address: 'Pollachi Main Road, Kinathukadavu, Coimbatore District, Tamil Nadu 642109',
    lat: 10.820900,
    lng: 77.019100,
    phone: 'Information unavailable',
    working_hours: '10:00 AM – 5:00 PM (Mon–Fri)',
    source: 'fallback',
  },
  {
    id: 'kinathukadavu-post-office',
    name: 'Kinathukadavu Post Office',
    category: 'Post Office',
    address: 'Post Office Street, Kinathukadavu, Coimbatore District, Tamil Nadu 642109',
    lat: 10.820722,
    lng: 77.019389,
    phone: 'Information unavailable',
    working_hours: '9:00 AM – 5:00 PM (Mon–Sat)',
    source: 'fallback',
  },
  {
    id: 'kinathukadavu-panchayat-union-office',
    name: 'Kinathukadavu Village Panchayat Union Office',
    category: 'Panchayat',
    address: 'NH 209, Periyar Nagar, Kinathukadavu, Tamil Nadu 642109, India',
    lat: 10.822200,
    lng: 77.018500,
    phone: 'Information unavailable',
    working_hours: '10:00 AM – 5:45 PM (Mon–Fri)',
    source: 'fallback',
  },
]

// Pure helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDist(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`
  }
  return `${distKm.toFixed(1)} km`
}

export function buildFallbackOffices(centerLat: number, centerLng: number, userGps?: { lat: number; lng: number } | null): PlaceOffice[] {
  return KINATHUKADAVU_FALLBACK_OFFICES.map((f) => {
    const dist = calculateDistance(centerLat, centerLng, f.lat, f.lng)
    const originQuery = userGps ? `&origin=${userGps.lat},${userGps.lng}` : ''
    return {
      ...f,
      distanceKm: dist,
      distanceText: formatDist(dist),
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}${originQuery}`,
    } as PlaceOffice
  }).sort((a, b) => a.distanceKm - b.distanceKm)
}

function MapView({
  center,
  locationName,
  radiusMeters,
  selectedCategory,
  searchQuery,
  selectedOffice,
  userGpsLocation,
  onOfficesLoaded,
  onOfficeSelect,
}: Omit<NearbyOfficesMapProps, 'apiKey'>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const lastSearchKeyRef = useRef<string>('')

  const centerLat = center.lat
  const centerLng = center.lng

  const [allPlaces, setAllPlaces] = useState<PlaceOffice[]>(() =>
    buildFallbackOffices(centerLat, centerLng, userGpsLocation)
  )

  // 1. Initialize Map Instance once
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && typeof window !== 'undefined' && window.google?.maps) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        ],
      })

      mapInstanceRef.current = map
      infoWindowRef.current = new window.google.maps.InfoWindow({ disableAutoPan: false })
    }
  }, [centerLat, centerLng])

  // 2. Pan Map when Center Changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: centerLat, lng: centerLng })
    }
  }, [centerLat, centerLng])

  // 3. Update User Location Pin & Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return
    const map = mapInstanceRef.current

    if (userMarkerRef.current) userMarkerRef.current.setMap(null)
    if (circleRef.current) circleRef.current.setMap(null)

    const userMarker = new window.google.maps.Marker({
      position: { lat: centerLat, lng: centerLng },
      map,
      title: `Search Center: ${locationName}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#0F766E',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 999,
    })
    userMarkerRef.current = userMarker

    const circle = new window.google.maps.Circle({
      strokeColor: '#0F766E',
      strokeOpacity: 0.35,
      strokeWeight: 1.5,
      fillColor: '#0F766E',
      fillOpacity: 0.05,
      map,
      center: { lat: centerLat, lng: centerLng },
      radius: radiusMeters,
    })
    circleRef.current = circle
  }, [centerLat, centerLng, locationName, radiusMeters])

  // 4. Stable Places Fetcher (Guarded to prevent duplicate calls or loops)
  useEffect(() => {
    const searchKey = `${centerLat.toFixed(4)}_${centerLng.toFixed(4)}_${radiusMeters}`
    if (lastSearchKeyRef.current === searchKey) return
    lastSearchKeyRef.current = searchKey

    const fallbacks = buildFallbackOffices(centerLat, centerLng, userGpsLocation)
    setAllPlaces(fallbacks)

    if (onOfficesLoaded) {
      onOfficesLoaded(fallbacks)
    }

    if (!mapInstanceRef.current || !window.google?.maps?.places) return

    try {
      const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
      const latLng = new window.google.maps.LatLng(centerLat, centerLng)

      service.textSearch(
        {
          location: latLng,
          radius: radiusMeters,
          query: `government office in ${locationName}`,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const placesMap = new Map<string, PlaceOffice>()
            fallbacks.forEach((f) => placesMap.set(f.id, f))

            results.forEach((place) => {
              if (!place.geometry?.location || !place.name) return
              const pId = place.place_id || `${place.name}-${place.geometry.location.lat()}`
              if (!placesMap.has(pId)) {
                const pLat = place.geometry.location.lat()
                const pLng = place.geometry.location.lng()
                const dist = calculateDistance(centerLat, centerLng, pLat, pLng)

                if (dist <= (radiusMeters / 1000) * 1.3) {
                  const lower = place.name.toLowerCase()
                  let category: PlaceOffice['category'] = 'Government Offices'
                  if (lower.includes('taluk') || lower.includes('tahsildar')) category = 'Taluk Office'
                  else if (lower.includes('vao')) category = 'VAO'
                  else if (lower.includes('panchayat') || lower.includes('union')) category = 'Panchayat'
                  else if (lower.includes('post')) category = 'Post Office'
                  else if (lower.includes('police')) category = 'Police'
                  else if (lower.includes('hospital') || lower.includes('phc')) category = 'Hospital'
                  else if (lower.includes('e-sevai') || lower.includes('esevai')) category = 'E-Sevai'

                  const originQuery = userGpsLocation ? `&origin=${userGpsLocation.lat},${userGpsLocation.lng}` : ''

                  placesMap.set(pId, {
                    id: pId,
                    place_id: place.place_id,
                    name: place.name,
                    category,
                    address: place.formatted_address || place.vicinity || 'Kinathukadavu, Coimbatore District, Tamil Nadu',
                    lat: pLat,
                    lng: pLng,
                    distanceKm: dist,
                    distanceText: formatDist(dist),
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total,
                    isOpenNow: place.opening_hours?.isOpen ? place.opening_hours.isOpen() : undefined,
                    mapsUrl: place.place_id
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}${originQuery}`
                      : `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}${originQuery}`,
                    source: 'google_places',
                  })
                }
              }
            })

            const merged = Array.from(placesMap.values()).sort((a, b) => a.distanceKm - b.distanceKm)
            setAllPlaces(merged)
            if (onOfficesLoaded) onOfficesLoaded(merged)
          }
        }
      )
    } catch {
      // Keep fallbacks on error
    }
  }, [centerLat, centerLng, locationName, radiusMeters, userGpsLocation, onOfficesLoaded])

  // 5. Filter & Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return
    const map = mapInstanceRef.current

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    const filtered = allPlaces.filter((office) => {
      const matchCat =
        selectedCategory === 'All' ||
        office.category === selectedCategory ||
        (selectedCategory === 'Taluk Office' && office.category.toLowerCase().includes('taluk')) ||
        (selectedCategory === 'Panchayat' && office.category.toLowerCase().includes('panchayat')) ||
        (selectedCategory === 'VAO' && office.category.toLowerCase().includes('vao'))

      const matchSearch =
        !searchQuery.trim() ||
        office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.category.toLowerCase().includes(searchQuery.toLowerCase())

      return matchCat && matchSearch
    })

    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(new window.google.maps.LatLng(centerLat, centerLng))

    const newMarkers = filtered.map((office) => {
      const color = CATEGORY_COLORS[office.category] || CATEGORY_COLORS['Government Offices']

      const marker = new window.google.maps.Marker({
        position: { lat: office.lat, lng: office.lng },
        map,
        title: office.name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: color.bg,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.6,
          anchor: new window.google.maps.Point(12, 22),
        },
      })

      bounds.extend(marker.getPosition()!)

      marker.addListener('click', () => {
        onOfficeSelect(office)

        if (infoWindowRef.current) {
          const originQuery = userGpsLocation ? `&origin=${userGpsLocation.lat},${userGpsLocation.lng}` : ''
          const content = `
            <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 260px; color: #0f172a;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${color.bg}; color: white; padding: 2px 6px; border-radius: 4px;">
                  ${office.category}
                </span>
                <span style="font-size: 10px; font-weight: 700; color: #0f766e;">
                  ${office.distanceText}
                </span>
              </div>
              <h4 style="font-size: 13px; font-weight: 800; margin: 4px 0; color: #0f172a; line-height: 1.3;">
                ${office.name}
              </h4>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0; line-height: 1.4;">
                ${office.address}
              </p>
              <div style="display: flex; gap: 6px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}${
            office.place_id ? `&destination_place_id=${office.place_id}` : ''
          }${originQuery}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="display: flex; align-items: center; justify-content: center; gap: 4px; flex: 1; padding: 6px 10px; background: #0f766e; color: white; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          `
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(map, marker)
        }
      })

      return marker
    })

    markersRef.current = newMarkers

    if (newMarkers.length > 0 && !selectedOffice) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
    }
  }, [allPlaces, selectedCategory, searchQuery, centerLat, centerLng, selectedOffice, userGpsLocation, onOfficeSelect])

  // 6. Highlight selected office
  useEffect(() => {
    if (selectedOffice && mapInstanceRef.current && window.google?.maps) {
      const map = mapInstanceRef.current
      map.panTo({ lat: selectedOffice.lat, lng: selectedOffice.lng })
      map.setZoom(16)
    }
  }, [selectedOffice])

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
}

export default function NearbyOfficesMap(props: NearbyOfficesMapProps) {
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const prevAuth = (window as any).gm_authFailure
    ;(window as any).gm_authFailure = () => {
      setAuthError(true)
      if (typeof prevAuth === 'function') prevAuth()
    }
  }, [])

  const renderStatus = (status: Status) => {
    if (status === Status.LOADING) {
      return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Loading Google Maps...</p>
        </div>
      )
    }

    if (status === Status.FAILURE || authError) {
      return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
          <MapPin className="w-10 h-10 text-[#0F766E] mb-2" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Kinathukadavu Government GIS</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
            Displaying Kinathukadavu verified government offices list with turn-by-turn Google Maps routing.
          </p>
        </div>
      )
    }

    return <></>
  }

  if (!props.apiKey) {
    return (
      <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
        <MapPin className="w-10 h-10 text-[#0F766E] mb-2" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Kinathukadavu Government GIS</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Interactive verified government offices active for Kinathukadavu.
        </p>
      </div>
    )
  }

  return (
    <Wrapper apiKey={props.apiKey} libraries={['places', 'geometry']} render={renderStatus}>
      <MapView {...props} />
    </Wrapper>
  )
}

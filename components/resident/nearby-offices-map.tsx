'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  MapPin, Navigation2, Building2, Shield, HeartPulse,
  Mail, Landmark, RefreshCw, ZoomIn, ZoomOut, Layers
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
  source?: 'osm_places' | 'fallback' | 'google_places'
}

interface NearbyOfficesMapProps {
  apiKey?: string
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
export const CATEGORY_COLORS: Record<string, { bg: string; fill: string; text: string }> = {
  'Taluk Office': { bg: '#0F766E', fill: '#0D9488', text: '#ffffff' },
  'VAO': { bg: '#15803D', fill: '#16A34A', text: '#ffffff' },
  'Panchayat': { bg: '#0369A1', fill: '#0284C7', text: '#ffffff' },
  'E-Sevai': { bg: '#7C3AED', fill: '#8B5CF6', text: '#ffffff' },
  'Hospital': { bg: '#DC2626', fill: '#EF4444', text: '#ffffff' },
  'Police': { bg: '#1E3A8A', fill: '#2563EB', text: '#ffffff' },
  'Post Office': { bg: '#D97706', fill: '#F59E0B', text: '#ffffff' },
  'Government Offices': { bg: '#334155', fill: '#475569', text: '#ffffff' },
}

// Verified Kinathukadavu Fallback Offices (Exact Coordinates & Addresses)
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

// Geographic distance calculation using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function formatDist(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`
  }
  return `${distKm.toFixed(1)} km`
}

export function buildFallbackOffices(
  centerLat: number,
  centerLng: number,
  userGps?: { lat: number; lng: number } | null
): PlaceOffice[] {
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

export default function NearbyOfficesMap({
  center,
  locationName,
  radiusMeters,
  selectedCategory,
  searchQuery,
  selectedOffice,
  userGpsLocation,
  onOfficesLoaded,
  onOfficeSelect,
}: NearbyOfficesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map())
  const lastSearchKeyRef = useRef<string>('')

  const centerLat = center.lat
  const centerLng = center.lng

  const [allPlaces, setAllPlaces] = useState<PlaceOffice[]>(() =>
    buildFallbackOffices(centerLat, centerLng, userGpsLocation)
  )
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeTileLayer, setActiveTileLayer] = useState<'osm' | 'voyager'>('osm')

  // ── 1. Map Initialization with OpenStreetMap Tiles ──
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    // Clean up existing instance if already attached
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false, // Custom modern zoom controls
        attributionControl: false,
      })

      // Add OpenStreetMap Tile Layer
      const tileUrl =
        activeTileLayer === 'osm'
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: activeTileLayer === 'voyager' ? 'abcd' : 'abc',
      }).addTo(map)

      // OpenStreetMap attribution in bottom right
      L.control.attribution({ position: 'bottomright', prefix: 'Leaflet &bull; &copy; OpenStreetMap' }).addTo(map)

      // Create marker layer group
      const markersGroup = L.layerGroup().addTo(map)
      markersLayerRef.current = markersGroup
      mapInstanceRef.current = map

      // Invalidate size after layout settles to prevent blank map
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 200)

      setMapLoaded(true)
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err)
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('toggle-sidebar', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('toggle-sidebar', handleResize)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [activeTileLayer])

  // ── 2. Pan Map when Center Changes ──
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([centerLat, centerLng], { animate: true, duration: 0.6 })
      mapInstanceRef.current.invalidateSize()
    }
  }, [centerLat, centerLng])

  // ── 3. Update User Location Pin & Radius Circle ──
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Remove previous user marker and circle
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }
    if (circleRef.current) {
      circleRef.current.remove()
      circleRef.current = null
    }

    // Custom Glowing User Center Icon
    const userIcon = L.divIcon({
      className: 'gs-user-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <span style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: rgba(15, 118, 110, 0.4);
            animation: gsPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></span>
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: #0F766E;
            border: 3px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            z-index: 2;
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -16],
    })

    const userMarker = L.marker([centerLat, centerLng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map)

    userMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700; color: #0f766e; text-align: center; padding: 2px 4px;">
        📍 Search Center: ${locationName}
      </div>
    `)

    userMarkerRef.current = userMarker

    // Radius Circle
    const circle = L.circle([centerLat, centerLng], {
      radius: radiusMeters,
      color: '#0F766E',
      weight: 2,
      opacity: 0.5,
      fillColor: '#0F766E',
      fillOpacity: 0.06,
      dashArray: '5, 5',
    }).addTo(map)

    circleRef.current = circle
  }, [centerLat, centerLng, locationName, radiusMeters, mapLoaded])

  // ── 4. Open-Source Places Query / Fallback Management ──
  useEffect(() => {
    const searchKey = `${centerLat.toFixed(4)}_${centerLng.toFixed(4)}_${radiusMeters}`
    if (lastSearchKeyRef.current === searchKey) return
    lastSearchKeyRef.current = searchKey

    const fallbacks = buildFallbackOffices(centerLat, centerLng, userGpsLocation)
    setAllPlaces(fallbacks)
    if (onOfficesLoaded) onOfficesLoaded(fallbacks)

    // Query OpenStreetMap Overpass API for real-time government offices within radius
    const fetchOsmPlaces = async () => {
      try {
        const query = `
          [out:json][timeout:5];
          (
            node["office"="government"](around:${radiusMeters},${centerLat},${centerLng});
            node["amenity"="townhall"](around:${radiusMeters},${centerLat},${centerLng});
            node["amenity"="courthouse"](around:${radiusMeters},${centerLat},${centerLng});
            node["amenity"="police"](around:${radiusMeters},${centerLat},${centerLng});
            node["amenity"="hospital"](around:${radiusMeters},${centerLat},${centerLng});
            node["amenity"="post_office"](around:${radiusMeters},${centerLat},${centerLng});
          );
          out center 20;
        `
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) })
        if (!res.ok) return

        const data = await res.json()
        if (data.elements && data.elements.length > 0) {
          const placesMap = new Map<string, PlaceOffice>()
          fallbacks.forEach((f) => placesMap.set(f.id, f))

          data.elements.forEach((el: any) => {
            const pLat = el.lat || el.center?.lat
            const pLng = el.lon || el.center?.lon
            if (!pLat || !pLng) return

            const tags = el.tags || {}
            const name = tags.name || tags['name:en'] || tags['name:ta'] || tags.operator || tags.office || tags.amenity
            if (!name) return

            const pId = `osm-${el.id}`
            if (!placesMap.has(pId)) {
              const dist = calculateDistance(centerLat, centerLng, pLat, pLng)
              let category: PlaceOffice['category'] = 'Government Offices'
              const lower = (name + ' ' + (tags.office || '') + ' ' + (tags.amenity || '')).toLowerCase()

              if (lower.includes('taluk') || lower.includes('tahsildar')) category = 'Taluk Office'
              else if (lower.includes('vao')) category = 'VAO'
              else if (lower.includes('panchayat') || lower.includes('union') || tags.amenity === 'townhall') category = 'Panchayat'
              else if (lower.includes('post') || tags.amenity === 'post_office') category = 'Post Office'
              else if (lower.includes('police') || tags.amenity === 'police') category = 'Police'
              else if (lower.includes('hospital') || tags.amenity === 'hospital' || tags.amenity === 'clinic') category = 'Hospital'
              else if (lower.includes('e-sevai') || lower.includes('esevai') || lower.includes('csc')) category = 'E-Sevai'

              const originQuery = userGpsLocation ? `&origin=${userGpsLocation.lat},${userGpsLocation.lng}` : ''
              const addr = tags['addr:street']
                ? `${tags['addr:street']}, ${tags['addr:city'] || 'Tamil Nadu'}`
                : tags['addr:full'] || `${name}, Coimbatore District, Tamil Nadu`

              placesMap.set(pId, {
                id: pId,
                name,
                category,
                address: addr,
                phone: tags.phone || tags['contact:phone'],
                working_hours: tags.opening_hours,
                lat: pLat,
                lng: pLng,
                distanceKm: dist,
                distanceText: formatDist(dist),
                mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}${originQuery}`,
                source: 'osm_places',
              })
            }
          })

          const merged = Array.from(placesMap.values()).sort((a, b) => a.distanceKm - b.distanceKm)
          setAllPlaces(merged)
          if (onOfficesLoaded) onOfficesLoaded(merged)
        }
      } catch {
        // Silently retain verified fallbacks on timeout or network error
      }
    }

    fetchOsmPlaces()
  }, [centerLat, centerLng, radiusMeters, userGpsLocation, onOfficesLoaded])

  // ── 5. Filter & Render Leaflet Markers ──
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    const markersGroup = markersLayerRef.current
    markersGroup.clearLayers()
    markerMapRef.current.clear()

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

    const latLngBounds: [number, number][] = [[centerLat, centerLng]]

    filtered.forEach((office) => {
      const isSelected = selectedOffice?.id === office.id
      const color = CATEGORY_COLORS[office.category] || CATEGORY_COLORS['Government Offices']

      // Custom Vector DivIcon ensuring reliable rendering without image 404s
      const icon = L.divIcon({
        className: 'gs-office-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            transform: ${isSelected ? 'scale(1.28)' : 'scale(1.0)'};
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
            cursor: pointer;
          ">
            <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 0C7.611 0 0 7.611 0 17c0 12.75 17 27 17 27s17-14.25 17-27c0-9.389-7.611-17-17-17z" fill="${color.bg}" stroke="#ffffff" stroke-width="2.5"/>
              <circle cx="17" cy="16" r="6.5" fill="#ffffff"/>
              <circle cx="17" cy="16" r="3.5" fill="${color.bg}"/>
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -42],
      })

      const marker = L.marker([office.lat, office.lng], {
        icon,
        zIndexOffset: isSelected ? 800 : 200,
      })

      const originQuery = userGpsLocation ? `&origin=${userGpsLocation.lat},${userGpsLocation.lng}` : ''

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 230px; max-width: 270px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${color.bg}; color: white; padding: 2px 7px; border-radius: 5px; letter-spacing: 0.5px;">
              ${office.category}
            </span>
            <span style="font-size: 11px; font-weight: 800; color: #0f766e; background: #ccfbf1; padding: 2px 6px; border-radius: 5px;">
              ${office.distanceText}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; margin: 4px 0; color: #0f172a; line-height: 1.35;">
            ${office.name}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0; line-height: 1.4;">
            ${office.address}
          </p>
          ${
            office.working_hours
              ? `<p style="font-size: 10px; color: #475569; margin: 0 0 8px 0;">
                   ⏱️ <strong>Hours:</strong> ${office.working_hours}
                 </p>`
              : ''
          }
          <div style="display: flex; gap: 6px; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}${
        office.place_id ? `&destination_place_id=${office.place_id}` : ''
      }${originQuery}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: flex; align-items: center; justify-content: center; gap: 5px; flex: 1; padding: 7px 12px; background: #0f766e; color: #ffffff; border-radius: 8px; font-size: 11px; font-weight: 800; text-decoration: none; box-shadow: 0 2px 4px rgba(15,118,110,0.25);"
            >
              <span>Get Directions</span> <span>→</span>
            </a>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        className: 'gs-leaflet-popup',
        closeButton: true,
        autoPan: true,
      })

      marker.on('click', () => {
        onOfficeSelect(office)
      })

      marker.addTo(markersGroup)
      markerMapRef.current.set(office.id, marker)
      latLngBounds.push([office.lat, office.lng])
    })

    // Fit bounds smoothly on filter change if no individual office is currently selected
    if (latLngBounds.length > 1 && !selectedOffice) {
      mapInstanceRef.current.fitBounds(latLngBounds, {
        padding: [45, 45],
        maxZoom: 15,
      })
    }
  }, [allPlaces, selectedCategory, searchQuery, centerLat, centerLng, selectedOffice, userGpsLocation, onOfficeSelect, mapLoaded])

  // ── 6. Pan and Open Popup on Selected Office ──
  useEffect(() => {
    if (selectedOffice && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedOffice.lat, selectedOffice.lng], 16, {
        duration: 0.8,
      })

      const marker = markerMapRef.current.get(selectedOffice.id)
      if (marker) {
        setTimeout(() => {
          marker.openPopup()
        }, 400)
      }
    }
  }, [selectedOffice])

  // Custom Zoom Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn()
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut()
  }

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 14, { duration: 0.8 })
    }
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
      {/* ── Leaflet Container ── */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

      {/* ── Custom Interactive Map Controls Overlay ── */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-lg rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#0F766E] transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#0F766E] transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />
        <button
          onClick={handleResetCenter}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#0F766E] transition-all cursor-pointer"
          title="Recenter Map"
        >
          <MapPin className="w-4 h-4 text-[#0F766E]" />
        </button>
        <button
          onClick={() => setActiveTileLayer((prev) => (prev === 'osm' ? 'voyager' : 'osm'))}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#0F766E] transition-all cursor-pointer"
          title={`Switch Map Style (${activeTileLayer === 'osm' ? 'OpenStreetMap Default' : 'Carto Voyager'})`}
        >
          <Layers className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* ── Open-Source Leaflet Badge in Bottom Left ── */}
      <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
        <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Leaflet &bull; OpenStreetMap Interactive GIS
        </span>
      </div>

      {/* ── Embedded CSS for Leaflet Pulse Animation and Clean Popups ── */}
      <style jsx global>{`
        @keyframes gsPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.7);
            opacity: 0;
          }
          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }
        .leaflet-container {
          font-family: inherit;
          z-index: 0 !important;
        }
        .gs-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 6px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .dark .gs-leaflet-popup .leaflet-popup-content-wrapper {
          background-color: #0f172a;
          color: #f8fafc;
          border-color: #1e293b;
        }
        .gs-leaflet-popup .leaflet-popup-tip {
          box-shadow: none;
        }
        .dark .gs-leaflet-popup .leaflet-popup-tip {
          background-color: #0f172a;
        }
      `}</style>
    </div>
  )
}

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
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
}

interface NearbyOfficesMapProps {
  apiKey: string
  center: { lat: number; lng: number }
  locationName: string
  radiusMeters: number
  selectedCategory: string
  searchQuery: string
  selectedOffice: PlaceOffice | null
  onOfficesLoaded: (offices: PlaceOffice[], isLoading: boolean, error: string | null) => void
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

function MapView({
  center,
  locationName,
  radiusMeters,
  selectedCategory,
  searchQuery,
  selectedOffice,
  onOfficesLoaded,
  onOfficeSelect
}: Omit<NearbyOfficesMapProps, 'apiKey'>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const [allPlaces, setAllPlaces] = useState<PlaceOffice[]>([])

  // Calculate distance in km
  const getDistanceKm = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  }, [])

  const formatDistance = useCallback((distKm: number): string => {
    if (distKm < 1) {
      return `${Math.round(distKm * 1000)} m`
    }
    return `${distKm.toFixed(1)} km`
  }, [])

  // Classify place into Tamil Nadu Government office categories
  const classifyOffice = useCallback((name: string, types: string[] = []): PlaceOffice['category'] => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('taluk') || lowerName.includes('tahsildar') || lowerName.includes('revenue divisional')) {
      return 'Taluk Office'
    }
    if (lowerName.includes('vao') || lowerName.includes('village administrative')) {
      return 'VAO'
    }
    if (lowerName.includes('panchayat') || lowerName.includes('gram panchayat') || lowerName.includes('town panchayat') || lowerName.includes('union office') || lowerName.includes('bdo')) {
      return 'Panchayat'
    }
    if (lowerName.includes('e-sevai') || lowerName.includes('esevai') || lowerName.includes('e sevai') || lowerName.includes('csc') || lowerName.includes('common service')) {
      return 'E-Sevai'
    }
    if (lowerName.includes('hospital') || lowerName.includes('phc') || lowerName.includes('health centre') || lowerName.includes('dispensary') || types.includes('hospital') || types.includes('health')) {
      return 'Hospital'
    }
    if (lowerName.includes('police') || types.includes('police')) {
      return 'Police'
    }
    if (lowerName.includes('post office') || lowerName.includes('sub post') || types.includes('post_office')) {
      return 'Post Office'
    }
    return 'Government Offices'
  }, [])

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && window.google?.maps) {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      mapInstanceRef.current = map
      infoWindowRef.current = new window.google.maps.InfoWindow({
        disableAutoPan: false,
      })

      setMapReady(true)
    }
  }, [center])

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center)
    }
  }, [center])

  // Update User Center Marker & Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return
    const map = mapInstanceRef.current

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
    }
    if (circleRef.current) {
      circleRef.current.setMap(null)
    }

    // User Location Pin
    const userMarker = new window.google.maps.Marker({
      position: center,
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
      zIndex: 999
    })
    userMarkerRef.current = userMarker

    // Search Radius Circle
    const circle = new window.google.maps.Circle({
      strokeColor: '#0F766E',
      strokeOpacity: 0.35,
      strokeWeight: 1.5,
      fillColor: '#0F766E',
      fillOpacity: 0.05,
      map,
      center,
      radius: radiusMeters,
    })
    circleRef.current = circle
  }, [center, locationName, radiusMeters, mapReady])

  // Query Real Places using Google PlacesService
  const fetchPlaces = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps?.places) return

    onOfficesLoaded([], true, null)

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    const latLng = new window.google.maps.LatLng(center.lat, center.lng)

    // Government queries focused around the active location
    const searchQueries = [
      `government office in ${locationName}`,
      `taluk office in ${locationName}`,
      `village administrative officer in ${locationName}`,
      `panchayat office in ${locationName}`,
      `government hospital in ${locationName}`,
      `e-sevai center in ${locationName}`,
      `post office in ${locationName}`,
      `police station in ${locationName}`,
      `sub registrar office in ${locationName}`,
      `agriculture office in ${locationName}`
    ]

    const placesMap = new Map<string, PlaceOffice>()
    let completedRequests = 0

    const finalizeResults = () => {
      const placesList = Array.from(placesMap.values())
      // Sort nearest distance first
      placesList.sort((a, b) => a.distanceKm - b.distanceKm)
      setAllPlaces(placesList)
      onOfficesLoaded(placesList, false, null)
    }

    searchQueries.forEach((query) => {
      const request: google.maps.places.TextSearchRequest = {
        location: latLng,
        radius: radiusMeters,
        query,
      }

      service.textSearch(request, (results, status) => {
        completedRequests++

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach((place) => {
            if (!place.geometry?.location || !place.name) return
            const pId = place.place_id || `${place.name}-${place.geometry.location.lat()}`

            if (!placesMap.has(pId)) {
              const pLat = place.geometry.location.lat()
              const pLng = place.geometry.location.lng()
              const distKm = getDistanceKm(center.lat, center.lng, pLat, pLng)

              // Only include places within the requested radius (with a 20% boundary cushion)
              if (distKm <= (radiusMeters / 1000) * 1.25) {
                const category = classifyOffice(place.name, place.types)
                const formattedAddress = place.formatted_address || place.vicinity || 'Kinathukadavu, Coimbatore District, Tamil Nadu'

                placesMap.set(pId, {
                  id: pId,
                  place_id: place.place_id,
                  name: place.name,
                  category,
                  address: formattedAddress,
                  lat: pLat,
                  lng: pLng,
                  distanceKm: distKm,
                  distanceText: formatDistance(distKm),
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  isOpenNow: place.opening_hours?.isOpen ? place.opening_hours.isOpen() : undefined,
                  mapsUrl: place.place_id
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}`,
                })
              }
            }
          })
        }

        if (completedRequests === searchQueries.length) {
          finalizeResults()
        }
      })
    })

    // Safety timeout in case some queries hang
    setTimeout(() => {
      if (completedRequests < searchQueries.length) {
        finalizeResults()
      }
    }, 4500)
  }, [center, locationName, radiusMeters, getDistanceKm, formatDistance, classifyOffice, onOfficesLoaded])

  // Run place search when map is ready or center/radius changes
  useEffect(() => {
    if (mapReady) {
      fetchPlaces()
    }
  }, [mapReady, fetchPlaces])

  // Filter & Render Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return
    const map = mapInstanceRef.current

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    const filtered = allPlaces.filter((office) => {
      const matchCat = selectedCategory === 'All' || office.category === selectedCategory
      const matchSearch =
        !searchQuery.trim() ||
        office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })

    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(new window.google.maps.LatLng(center.lat, center.lng))

    const newMarkers = filtered.map((office) => {
      const color = CATEGORY_COLORS[office.category] || CATEGORY_COLORS['Government Offices']

      // Custom SVG Marker Pin
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

      // Handle marker click
      marker.addListener('click', () => {
        onOfficeSelect(office)

        if (infoWindowRef.current) {
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
                  href="https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}${office.place_id ? `&destination_place_id=${office.place_id}` : ''}" 
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

    // Adjust bounds if we have results
    if (newMarkers.length > 0 && !selectedOffice) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
    }
  }, [allPlaces, selectedCategory, searchQuery, center, selectedOffice, onOfficeSelect])

  // Center on selected office when user clicks a card in the list
  useEffect(() => {
    if (selectedOffice && mapInstanceRef.current && window.google?.maps) {
      const map = mapInstanceRef.current
      const pos = new window.google.maps.LatLng(selectedOffice.lat, selectedOffice.lng)
      map.panTo(pos)
      map.setZoom(16)

      // Find marker and trigger infoWindow
      const marker = markersRef.current.find(
        (m) =>
          m.getPosition()?.lat().toFixed(4) === selectedOffice.lat.toFixed(4) &&
          m.getPosition()?.lng().toFixed(4) === selectedOffice.lng.toFixed(4)
      )

      if (marker && infoWindowRef.current) {
        const color = CATEGORY_COLORS[selectedOffice.category] || CATEGORY_COLORS['Government Offices']
        const content = `
          <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 260px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${color.bg}; color: white; padding: 2px 6px; border-radius: 4px;">
                ${selectedOffice.category}
              </span>
              <span style="font-size: 10px; font-weight: 700; color: #0f766e;">
                ${selectedOffice.distanceText}
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; margin: 4px 0; color: #0f172a; line-height: 1.3;">
              ${selectedOffice.name}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0; line-height: 1.4;">
              ${selectedOffice.address}
            </p>
            <div style="display: flex; gap: 6px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${selectedOffice.lat},${selectedOffice.lng}${selectedOffice.place_id ? `&destination_place_id=${selectedOffice.place_id}` : ''}" 
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
    }
  }, [selectedOffice])

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
}

export default function NearbyOfficesMap(props: NearbyOfficesMapProps) {
  const [authError, setAuthError] = useState(false)

  // Listen for Google Maps auth error events
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure
    ;(window as any).gm_authFailure = () => {
      console.warn('Google Maps auth error detected (gm_authFailure). Please verify API key configuration.')
      setAuthError(true)
      if (typeof prevAuthFailure === 'function') prevAuthFailure()
    }
  }, [])

  const renderStatus = (status: Status) => {
    if (status === Status.LOADING) {
      return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Loading Google Maps & Places...</p>
        </div>
      )
    }

    if (status === Status.FAILURE || authError) {
      return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-amber-50/70 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Google Maps could not be loaded
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mt-1 mb-4 leading-relaxed">
            Please check your Google Cloud API configuration. Ensure the following services are active for this key:
          </p>
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 text-left text-[11px] space-y-1.5 max-w-md w-full shadow-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span><strong>Maps JavaScript API</strong> enabled</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span><strong>Places API / Places API (New)</strong> enabled</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span><strong>Geocoding API</strong> enabled</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Billing enabled on Google Cloud Project</span>
            </div>
          </div>
        </div>
      )
    }

    return <></>
  }

  if (!props.apiKey) {
    return (
      <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-6 text-center">
        <MapPin className="w-10 h-10 text-slate-400 mb-2" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Google Maps API Key Missing</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> file.
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

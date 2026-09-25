'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Navigation2, Clock, Phone, Search,
  Compass, Crosshair, Building2, Filter, AlertCircle,
  ExternalLink, ChevronRight, CheckCircle2, Shield,
  HeartPulse, Mail, Landmark, RefreshCw, X, Radio,
  LocateFixed, LocateOff
} from 'lucide-react'
import { toast } from 'sonner'
import NearbyOfficesMap, {
  type PlaceOffice,
  buildFallbackOffices
} from '@/components/resident/nearby-offices-map'

// Default Kinathukadavu Location Constant
export const DEFAULT_KINATHUKADAVU_LOCATION = {
  name: 'Kinathukadavu, Coimbatore',
  address: 'Kinathukadavu, Coimbatore District, Tamil Nadu, India',
  latitude: 10.822000,
  longitude: 77.016000,
  source: 'fallback' as const,
}

// Filter Categories
const CATEGORY_FILTERS = [
  { id: 'All', label: 'All Offices' },
  { id: 'Government Offices', label: 'Govt Offices' },
  { id: 'Panchayat', label: 'Panchayat' },
  { id: 'VAO', label: 'VAO Office' },
  { id: 'Taluk Office', label: 'Taluk Office' },
  { id: 'Post Office', label: 'Post Office' },
  { id: 'E-Sevai', label: 'E-Sevai' },
  { id: 'Hospital', label: 'Hospital' },
  { id: 'Police', label: 'Police' },
] as const

const RADIUS_OPTIONS = [
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
]

// ── ERROR BOUNDARY FOR ROBUST ISOLATION ──
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('MapErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800">
          <MapPin className="w-10 h-10 text-[#0F766E] mb-2" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Nearby Office Map View
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4 leading-relaxed">
            Kinathukadavu Government GIS mode active. You can browse and get directions for all government offices from the list.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[#0F766E] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#0d645e] transition-all cursor-pointer"
          >
            Reload Map
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default function NearbyOfficesPage() {
  // ── 1. SINGLE SOURCE OF TRUTH LOCATION STATE ──
  const [currentLocation, setCurrentLocation] = useState<{
    name: string
    address: string
    latitude: number
    longitude: number
    source: 'fallback' | 'gps'
  }>({
    name: DEFAULT_KINATHUKADAVU_LOCATION.name,
    address: DEFAULT_KINATHUKADAVU_LOCATION.address,
    latitude: DEFAULT_KINATHUKADAVU_LOCATION.latitude,
    longitude: DEFAULT_KINATHUKADAVU_LOCATION.longitude,
    source: DEFAULT_KINATHUKADAVU_LOCATION.source,
  })

  // Search & Filter States
  const [radiusMeters, setRadiusMeters] = useState<number>(10000)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [isTracking, setIsTracking] = useState<boolean>(false)

  // Pre-fill offices with the 4 verified Kinathukadavu fallback offices
  const [offices, setOffices] = useState<PlaceOffice[]>(() =>
    buildFallbackOffices(DEFAULT_KINATHUKADAVU_LOCATION.latitude, DEFAULT_KINATHUKADAVU_LOCATION.longitude, null)
  )
  const [selectedOffice, setSelectedOffice] = useState<PlaceOffice | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const lastTrackedPosRef = useRef<{ lat: number; lng: number } | null>(null)

  // API Key from Environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Memoize map center object so its reference is stable across renders
  const mapCenter = useMemo(
    () => ({ lat: currentLocation.latitude, lng: currentLocation.longitude }),
    [currentLocation.latitude, currentLocation.longitude]
  )

  const userGps = useMemo(
    () => (currentLocation.source === 'gps' ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null),
    [currentLocation.source, currentLocation.latitude, currentLocation.longitude]
  )

  // ── 2. "USE MY CURRENT LOCATION" HANDLER ──
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    toast.info('Detecting your GPS location...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Recalculate distances for fallback offices
        const updatedFallbacks = buildFallbackOffices(lat, lng, { lat, lng })
        setOffices(updatedFallbacks)

        if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            setIsLocating(false)
            let detectedName = 'Your Current Location'
            let fullAddr = 'Coimbatore, Tamil Nadu, India'

            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
              const locality = results[0].address_components.find(
                (c) => c.types.includes('sublocality') || c.types.includes('locality')
              )?.long_name
              detectedName = locality ? `${locality}, Coimbatore` : results[0].formatted_address.split(',')[0]
              fullAddr = results[0].formatted_address
            }

            setCurrentLocation({
              name: detectedName,
              address: fullAddr,
              latitude: lat,
              longitude: lng,
              source: 'gps',
            })
            toast.success(`📍 Located near ${detectedName}`)
          })
        } else {
          setIsLocating(false)
          setCurrentLocation({
            name: 'Your Current Location',
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            latitude: lat,
            longitude: lng,
            source: 'gps',
          })
          toast.success('📍 Centered around your GPS location')
        }
      },
      (error) => {
        setIsLocating(false)
        console.warn('Geolocation error:', error.message)
        toast.error('Location permission denied. Keeping Kinathukadavu as default.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // ── 3. LIVE LOCATION TRACKING (watchPosition) ──
  const handleToggleTracking = useCallback(() => {
    if (isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setIsTracking(false)
      toast.info('Live GPS tracking paused.')
      return
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation tracking not supported.')
      return
    }

    toast.info('Starting live GPS tracking...')
    setIsTracking(true)

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Only update if moved >= 150m to avoid unnecessary renders
        const prev = lastTrackedPosRef.current
        if (prev) {
          const latDiff = Math.abs(prev.lat - lat)
          const lngDiff = Math.abs(prev.lng - lng)
          if (latDiff < 0.0015 && lngDiff < 0.0015) {
            return
          }
        }

        lastTrackedPosRef.current = { lat, lng }

        setCurrentLocation((prevLoc) => ({
          ...prevLoc,
          latitude: lat,
          longitude: lng,
          source: 'gps',
        }))
      },
      (error) => {
        console.warn('GPS Watch error:', error.message)
        setIsTracking(false)
        toast.error('Location tracking error or permission denied.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    )

    watchIdRef.current = watchId
  }, [isTracking])

  // Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  // ── 4. RECEIVE PLACES FROM MAP COMPONENT ──
  const handleOfficesLoaded = useCallback((loadedOffices: PlaceOffice[]) => {
    if (loadedOffices && loadedOffices.length > 0) {
      setOffices(loadedOffices)
    }
  }, [])

  // ── 5. FILTERED & SORTED OFFICES FOR RIGHT PANEL ──
  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
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
  }, [offices, selectedCategory, searchQuery])

  // Category Icon Resolver
  const getCategoryIcon = (category: PlaceOffice['category']) => {
    switch (category) {
      case 'Taluk Office':
        return <Landmark className="w-4 h-4 text-teal-600" />
      case 'VAO':
        return <Building2 className="w-4 h-4 text-emerald-600" />
      case 'Panchayat':
        return <Building2 className="w-4 h-4 text-sky-600" />
      case 'E-Sevai':
        return <Navigation2 className="w-4 h-4 text-purple-600" />
      case 'Hospital':
        return <HeartPulse className="w-4 h-4 text-red-600" />
      case 'Police':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'Post Office':
        return <Mail className="w-4 h-4 text-amber-600" />
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />
    }
  }

  return (
    <div className="space-y-6 pt-4 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col pb-12 font-sans">
      
      {/* ── TOP HEADER & ACTION BAR ── */}
      <div className="bg-gradient-to-r from-[#0F766E] via-[#115E59] to-[#134E4A] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Compass className="w-5 h-5 text-teal-300" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                Kinathukadavu Government GIS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Nearby Government Offices
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
              Find Taluk Offices, Panchayat Union Offices, Sub-Registrar Offices, and Post Offices near you with exact GPS directions.
            </p>
          </div>

          {/* Action buttons (Use My Location & Radius Switcher) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* GPS Locate Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-4 py-3 rounded-2xl bg-white text-[#0F766E] hover:bg-teal-50 text-xs font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Detect GPS Location"
            >
              <Crosshair className={`w-4 h-4 text-[#0F766E] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting Location...' : 'Use My Current Location'}</span>
            </button>

            {/* Live Track Toggle Button */}
            <button
              onClick={handleToggleTracking}
              className={`px-3.5 py-3 rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                isTracking
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
              title="Toggle Live Location Tracking"
            >
              {isTracking ? <LocateFixed className="w-4 h-4" /> : <LocateOff className="w-4 h-4 text-teal-200" />}
              <span>{isTracking ? 'Tracking ON' : 'Track My Location'}</span>
            </button>

            {/* Radius Selector */}
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 text-xs">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRadiusMeters(r.value)}
                  className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    radiusMeters === r.value
                      ? 'bg-white text-[#0F766E] shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location badge banner */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-100">
            <MapPin className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>
              Active Search Area: <strong className="text-white font-bold">{currentLocation.name}</strong> (within {radiusMeters / 1000} km)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-teal-200/90 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{currentLocation.source === 'gps' ? 'Live GPS Active' : 'Kinathukadavu Center Active'}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN WORKSPACE (Map on Left, Office List on Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[620px]">
        
        {/* ── LEFT COLUMN (7 COLS): GOOGLE MAP VIEW ── */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col min-h-[440px] lg:min-h-full">
          <div className="w-full h-full flex-1 rounded-2xl overflow-hidden relative min-h-[400px]">
            <MapErrorBoundary>
              <NearbyOfficesMap
                apiKey={apiKey}
                center={mapCenter}
                locationName={currentLocation.name}
                radiusMeters={radiusMeters}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                selectedOffice={selectedOffice}
                userGpsLocation={userGps}
                onOfficesLoaded={handleOfficesLoaded}
                onOfficeSelect={setSelectedOffice}
              />
            </MapErrorBoundary>
          </div>

          {/* Map Legend */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span className="font-bold text-slate-700 dark:text-slate-200">Markers:</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" /> Taluk Office</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0369A1]" /> Panchayat / Union</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#334155]" /> Govt Office</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Post Office</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Hospital</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" /> Police</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 COLS): SEARCH & OFFICE CARDS ── */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col overflow-hidden">
          
          {/* Search Box Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search VAO, Taluk Office, Panchayat, Post Office..."
                className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results Counter Subtitle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Near {currentLocation.name}</span>
              </p>
              <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-900/50">
                {`${filteredOffices.length} offices found`}
              </span>
            </div>
          </div>

          {/* Office Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[580px]">
            {filteredOffices.length === 0 ? (
              // Empty State with Radius Expansion options
              <div className="py-12 px-4 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">
                    No government offices found nearby
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {searchQuery
                      ? `No offices matching "${searchQuery}" within ${radiusMeters / 1000} km.`
                      : `No government offices found within ${radiusMeters / 1000} km of ${currentLocation.name}.`}
                  </p>
                </div>

                {radiusMeters < 50000 && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    {radiusMeters < 25000 && (
                      <button
                        onClick={() => setRadiusMeters(25000)}
                        className="px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0D655E] transition-all cursor-pointer shadow-sm"
                      >
                        Search within 25 km
                      </button>
                    )}
                    <button
                      onClick={() => setRadiusMeters(50000)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
                    >
                      Search within 50 km
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Real Places Cards
              filteredOffices.map((office) => {
                const isSelected = selectedOffice?.id === office.id
                const originQuery =
                  currentLocation.source === 'gps'
                    ? `&origin=${currentLocation.latitude},${currentLocation.longitude}`
                    : ''

                return (
                  <motion.div
                    key={office.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedOffice(office)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#0F766E] bg-teal-50/70 dark:bg-teal-950/30 shadow-md ring-2 ring-[#0F766E]/20'
                        : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0F766E]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Header: Name + Distance */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {getCategoryIcon(office.category)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                            {office.name}
                          </h3>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider">
                            {office.category}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black whitespace-nowrap shadow-xs">
                        {office.distanceText}
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 mb-3 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#0F766E]" />
                      <span>{office.address}</span>
                    </p>

                    {/* Additional Metadata (Working Hours / Phone) */}
                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {office.working_hours
                            ? office.working_hours
                            : office.isOpenNow !== undefined
                            ? office.isOpenNow
                              ? '🟢 Open Now (Govt Timings: 10:00 AM – 5:45 PM)'
                              : '🔴 Closed Now'
                            : 'Information unavailable'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{office.phone ? office.phone : 'Information unavailable'}</span>
                      </div>
                    </div>

                    {/* Action Button: Get Directions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}${
                          office.place_id ? `&destination_place_id=${office.place_id}` : ''
                        }${originQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <Navigation2 className="w-3.5 h-3.5" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Navigation2, Clock, Phone, Search,
  Compass, Crosshair, Building2, Filter, AlertCircle,
  ExternalLink, ChevronRight, CheckCircle2, Shield,
  HeartPulse, Mail, Landmark, RefreshCw, X, Radio
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import NearbyOfficesMap, { type PlaceOffice } from '@/components/resident/nearby-offices-map'

// Default fallback location: Kinathukadavu, Coimbatore District, Tamil Nadu, India
const DEFAULT_FALLBACK_LOCATION = {
  name: 'Kinathukadavu, Coimbatore',
  fullAddress: 'Kinathukadavu, Coimbatore District, Tamil Nadu, India',
  lat: 10.8208,
  lng: 77.0195,
}

// Filter Categories
const CATEGORY_FILTERS = [
  { id: 'All', label: 'All Offices' },
  { id: 'Government Offices', label: 'Govt Offices' },
  { id: 'Panchayat', label: 'Panchayat' },
  { id: 'VAO', label: 'VAO Office' },
  { id: 'Taluk Office', label: 'Taluk Office' },
  { id: 'E-Sevai', label: 'E-Sevai Center' },
  { id: 'Hospital', label: 'Hospital / PHC' },
  { id: 'Police', label: 'Police Station' },
  { id: 'Post Office', label: 'Post Office' },
] as const

const RADIUS_OPTIONS = [
  { value: 10000, label: '10 km (Default)' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
]

export default function NearbyOfficesPage() {
  const { profile } = useAuth()

  // Location State (Priority: 1. User Profile Village -> 2. User Selected -> 3. Kinathukadavu Fallback)
  const [currentLocation, setCurrentLocation] = useState({
    name: DEFAULT_FALLBACK_LOCATION.name,
    lat: DEFAULT_FALLBACK_LOCATION.lat,
    lng: DEFAULT_FALLBACK_LOCATION.lng,
  })

  // Search & Filter States
  const [radiusMeters, setRadiusMeters] = useState<number>(10000)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLocating, setIsLocating] = useState<boolean>(false)

  // Real Google Places State
  const [offices, setOffices] = useState<PlaceOffice[]>([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(true)
  const [placesError, setPlacesError] = useState<string | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<PlaceOffice | null>(null)

  // API Key from Environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // ── 1. LOCATION INITIALIZATION (Priority: User Profile Village -> Kinathukadavu) ──
  useEffect(() => {
    if (profile?.village) {
      const userVillageName = `${profile.village}, ${profile.district || 'Coimbatore'}`
      
      // If Google Maps is ready, geocode the user's registered village
      if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode(
          { address: `${profile.village}, ${profile.district || 'Coimbatore'}, Tamil Nadu, India` },
          (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]?.geometry?.location) {
              const loc = results[0].geometry.location
              setCurrentLocation({
                name: userVillageName,
                lat: loc.lat(),
                lng: loc.lng(),
              })
            } else {
              // Fallback to Kinathukadavu coordinates if geocoding fails
              setCurrentLocation({
                name: userVillageName,
                lat: DEFAULT_FALLBACK_LOCATION.lat,
                lng: DEFAULT_FALLBACK_LOCATION.lng,
              })
            }
          }
        )
      } else {
        setCurrentLocation({
          name: userVillageName,
          lat: DEFAULT_FALLBACK_LOCATION.lat,
          lng: DEFAULT_FALLBACK_LOCATION.lng,
        })
      }
    } else {
      // Default to Kinathukadavu, Coimbatore, Tamil Nadu
      setCurrentLocation({
        name: DEFAULT_FALLBACK_LOCATION.name,
        lat: DEFAULT_FALLBACK_LOCATION.lat,
        lng: DEFAULT_FALLBACK_LOCATION.lng,
      })
    }
  }, [profile])

  // ── 2. "USE MY LOCATION" GEOLOCATION HANDLER ──
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

        // Reverse geocode to get a readable local address name
        if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            setIsLocating(false)
            let detectedName = 'Your Current Location'
            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
              const sublocality = results[0].address_components.find(c => c.types.includes('sublocality') || c.types.includes('locality'))?.long_name
              detectedName = sublocality ? `${sublocality}, Coimbatore` : results[0].formatted_address.split(',')[0]
            }
            setCurrentLocation({
              name: detectedName,
              lat,
              lng,
            })
            toast.success(`📍 Centered around ${detectedName}`)
          })
        } else {
          setIsLocating(false)
          setCurrentLocation({
            name: 'Your Current Location',
            lat,
            lng,
          })
          toast.success('📍 Centered around your GPS location')
        }
      },
      (error) => {
        setIsLocating(false)
        console.warn('Geolocation error:', error.message)
        toast.error('Location permission denied. Keeping Kinathukadavu, Coimbatore as location.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  // ── 3. RECEIVE PLACES FROM MAP COMPONENT ──
  const handleOfficesLoaded = useCallback((loadedOffices: PlaceOffice[], loading: boolean, error: string | null) => {
    setOffices(loadedOffices)
    setIsLoadingPlaces(loading)
    setPlacesError(error)
  }, [])

  // ── 4. FILTERED OFFICES FOR RIGHT PANEL ──
  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      const matchCat = selectedCategory === 'All' || office.category === selectedCategory
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
    <div className="space-y-6 pt-4 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col pb-12">
      
      {/* ── TOP HEADER & ACTION BAR ── */}
      <div className="bg-gradient-to-r from-[#0F766E] via-[#115E59] to-[#134E4A] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Compass className="w-5 h-5 text-teal-300" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                Citizen GIS Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Nearby Government Offices
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
              Find Taluk Offices, VAO Chambers, Town Panchayat Halls, E-Sevai Centers, Primary Health Centers, and Police Stations near you with real-time Google Maps directions.
            </p>
          </div>

          {/* Action buttons (Use My Location & Radius Switcher) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-4 py-3 rounded-2xl bg-white text-[#0F766E] hover:bg-teal-50 text-xs font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Crosshair className={`w-4 h-4 text-[#0F766E] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting Location...' : 'Use My Location'}</span>
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
                  {r.value / 1000} km
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
            <span>Real Google Places GIS Active</span>
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN WORKSPACE (Map on Left, Office List on Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[620px]">
        
        {/* ── LEFT COLUMN (7 COLS): GOOGLE MAP VIEW ── */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col min-h-[420px] lg:min-h-full">
          <div className="w-full h-full flex-1 rounded-2xl overflow-hidden relative min-h-[380px]">
            <NearbyOfficesMap
              apiKey={apiKey}
              center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              locationName={currentLocation.name}
              radiusMeters={radiusMeters}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              selectedOffice={selectedOffice}
              onOfficesLoaded={handleOfficesLoaded}
              onOfficeSelect={setSelectedOffice}
            />
          </div>

          {/* Map Legend */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span className="font-bold text-slate-700 dark:text-slate-200">Markers:</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" /> Taluk / Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" /> VAO / Panchayat</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> E-Sevai</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Hospital / PHC</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" /> Police</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Post Office</span>
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
                placeholder="Search VAO, Taluk Office, E-Sevai, Hospital..."
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
              <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900/50">
                {isLoadingPlaces ? 'Searching...' : `${filteredOffices.length} offices found`}
              </span>
            </div>
          </div>

          {/* Office Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[560px]">
            {isLoadingPlaces ? (
              // Loading Skeleton State
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-40" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-14" />
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-56" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredOffices.length === 0 ? (
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
                              ? '🟢 Open Now (Govt Timings: 10:00 AM – 5:00 PM)'
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
                        href={`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}${office.place_id ? `&destination_place_id=${office.place_id}` : ''}`}
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

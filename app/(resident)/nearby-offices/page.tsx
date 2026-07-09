'use client'

import { useState } from 'react'
import { MapPin, Navigation2, Clock, Phone, Search } from 'lucide-react'
import GoogleMapWrapper from '@/components/resident/google-map-wrapper'
import { GovernmentOffice } from '@/types'

const MOCK_OFFICES: GovernmentOffice[] = [
  {
    id: '1',
    name: 'Taluk Office, North Zone',
    type: 'Taluk Office',
    address: '123 Main Road, North District',
    phone: '044-12345678',
    working_hours: 'Mon-Fri, 10:00 AM - 5:00 PM',
    lat: 13.0827,
    lng: 80.2707,
    distance: 2.4
  },
  {
    id: '2',
    name: 'Village Administrative Office (VAO)',
    type: 'VAO Office',
    address: '45 Panchayat Street',
    phone: '044-87654321',
    working_hours: 'Mon-Sat, 9:00 AM - 4:00 PM',
    lat: 13.0900,
    lng: 80.2600,
    distance: 1.2
  },
  {
    id: '3',
    name: 'Govt E-Sevai Center',
    type: 'E-Sevai Center',
    address: 'Market Complex, Near Bus Stand',
    working_hours: 'Mon-Sat, 10:00 AM - 6:00 PM',
    lat: 13.0750,
    lng: 80.2800,
    distance: 3.8
  }
]

export default function NearbyOfficesPage() {
  const [selectedOfficeIndex, setSelectedOfficeIndex] = useState<number | null>(null)
  
  // Default to Chennai coordinates for demo
  const center = { lat: 13.0827, lng: 80.2707 }
  
  const handleMarkerClick = (index: number) => {
    setSelectedOfficeIndex(index)
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBLzq_EZtnaAL736DOtz7XSkkfuSLUaPn4'


  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="page-title">Nearby Government Offices</h1>
        <p className="page-subtitle">Find VAO, Taluk Offices, and E-Sevai Centers near your location</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Map View */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden h-[400px] lg:h-full relative border border-border shadow-sm">
          <GoogleMapWrapper 
            apiKey={apiKey}
            center={center}
            zoom={13}
            markers={MOCK_OFFICES.map(o => ({ lat: o.lat, lng: o.lng }))}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Office List */}
        <div className="glass-card flex flex-col h-[400px] lg:h-full border border-border shadow-sm">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search offices..." 
                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {MOCK_OFFICES.map((office, i) => (
              <div 
                key={office.id} 
                onClick={() => setSelectedOfficeIndex(i)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedOfficeIndex === i 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-background hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm leading-tight">{office.name}</h3>
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
                    {office.distance} km
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {office.address}
                </p>
                
                <div className="space-y-1.5">
                  {office.working_hours && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {office.working_hours}
                    </div>
                  )}
                  {office.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" /> {office.phone}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-border/50">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground text-xs font-medium rounded-lg transition-colors"
                  >
                    <Navigation2 className="w-3.5 h-3.5" /> Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

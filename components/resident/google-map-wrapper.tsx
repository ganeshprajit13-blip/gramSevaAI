'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { Loader2 } from 'lucide-react'

// Default fallback to Kinathukadavu, Coimbatore, Tamil Nadu (Never Chennai)
const KINATHUKADAVU_CENTER = { lat: 10.8208, lng: 77.0195 }

interface MapProps {
  center?: google.maps.LatLngLiteral
  zoom?: number
  markers?: google.maps.LatLngLiteral[]
  onMarkerClick?: (index: number) => void
}

function MapComponent({ center = KINATHUKADAVU_CENTER, zoom = 13, markers, onMarkerClick }: MapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()

  useEffect(() => {
    if (ref.current && !map && window.google?.maps) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }))
    }
  }, [ref, map, center, zoom])

  useEffect(() => {
    if (map) {
      map.setCenter(center)
      map.setZoom(zoom)
    }
  }, [map, center, zoom])

  useEffect(() => {
    if (map && markers && window.google?.maps) {
      const gMarkers = markers.map((position, i) => {
        const marker = new window.google.maps.Marker({
          position,
          map,
        })
        if (onMarkerClick) {
          marker.addListener('click', () => onMarkerClick(i))
        }
        return marker
      })
      
      return () => {
        gMarkers.forEach(m => m.setMap(null))
      }
    }
  }, [map, markers, onMarkerClick])

  return <div ref={ref} className="w-full h-full rounded-2xl" />
}

export default function GoogleMapWrapper({ apiKey, ...props }: { apiKey: string } & MapProps) {
  const render = (status: Status) => {
    if (status === Status.LOADING) return <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-secondary/50 rounded-2xl"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    if (status === Status.FAILURE) return <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-secondary/50 rounded-2xl text-red-500">Error loading maps</div>
    return <></>
  }

  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-secondary/50 rounded-2xl flex-col gap-2 p-6 text-center text-muted-foreground border border-dashed border-border">
        <p className="font-medium text-foreground">Google Maps API Key Missing</p>
        <p className="text-sm">Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file to view the map.</p>
      </div>
    )
  }

  return (
    <Wrapper apiKey={apiKey} libraries={['places', 'geometry']} render={render}>
      <MapComponent {...props} />
    </Wrapper>
  )
}

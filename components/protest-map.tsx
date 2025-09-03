"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users } from "lucide-react"
import L from "leaflet"

// Dynamically import Leaflet components to avoid SSR issues
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

// Mock protest data with security level and more info
const mockProtests = [
  {
    id: 1,
    name: "Climate Action Rally",
    cause: "Environmental Justice",
    date: "2024-01-15",
    time: "14:00",
    coordinates: [40.7589, -73.9851],
    attendees: 250,
    description: "Join us for a peaceful demonstration calling for immediate climate action and environmental justice.",
    securityLevel: "medium", // low, medium, high
    motives: "Raise awareness for climate change and demand policy action.",
    campaigns: "Green New Deal, Fridays for Future",
  },
  {
    id: 2,
    name: "Workers Rights March",
    cause: "Labor Rights",
    date: "2024-01-18",
    time: "10:00",
    coordinates: [40.7505, -73.9934],
    attendees: 180,
    description: "Standing together for fair wages, safe working conditions, and workers' dignity.",
    securityLevel: "high",
    motives: "Demand fair wages and safe working conditions.",
    campaigns: "Fight for $15, Unionize Now",
  },
  {
    id: 3,
    name: "Housing Justice Demonstration",
    cause: "Housing Rights",
    date: "2024-01-20",
    time: "16:00",
    coordinates: [40.7614, -73.9776],
    attendees: 320,
    description: "Demanding affordable housing and tenant protections for all community members.",
    securityLevel: "low",
    motives: "Advocate for affordable housing and tenant protections.",
    campaigns: "Rent Control, Homes for All",
  },
  {
    id: 4,
    name: "Education Funding Rally",
    cause: "Education",
    date: "2024-01-22",
    time: "11:00",
    coordinates: [40.7282, -73.9942],
    attendees: 150,
    description: "Advocating for increased education funding and resources for public schools.",
    securityLevel: "medium",
    motives: "Increase funding for public education.",
    campaigns: "Fund Our Schools, Teachers United",
  },
]

interface UserLocation {
  lat: number
  lng: number
}

export default function ProtestMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [selectedProtest, setSelectedProtest] = useState<(typeof mockProtests)[0] | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied, using default location")
          // Default to NYC if location access is denied
          setUserLocation({ lat: 40.7589, lng: -73.9851 })
        },
      )
    } else {
      // Default location if geolocation is not supported
      setUserLocation({ lat: 40.7589, lng: -73.9851 })
    }
  }, [])

  if (!isClient || !userLocation) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Protest markers */}
          {mockProtests.map((protest) => {
            // Color by security level
            let markerColor = "#3b82f6" // blue for low
            if (protest.securityLevel === "medium") markerColor = "#f59e42" // orange
            if (protest.securityLevel === "high") markerColor = "#ef4444" // red

            return (
              <Marker
                key={protest.id}
                position={[protest.coordinates[0], protest.coordinates[1]]}
                eventHandlers={{
                  click: () => setSelectedProtest(protest),
                }}
                icon={L.icon({
                  iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${markerColor.replace('#','')}`,
                  iconSize: [30, 42],
                  iconAnchor: [15, 42],
                  popupAnchor: [0, -40],
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[220px]">
                    <h3 className="font-semibold text-sm mb-2">{protest.name}</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{protest.cause}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${protest.securityLevel === "high" ? "bg-red-100 text-red-700" : protest.securityLevel === "medium" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{protest.securityLevel.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {protest.date} at {protest.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{protest.attendees} expected</span>
                      </div>
                      <div className="mt-2">
                        <span className="font-semibold">Motives:</span> {protest.motives}
                      </div>
                      <div>
                        <span className="font-semibold">Campaigns:</span> {protest.campaigns}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">{protest.description}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Selected Protest Details */}
      {selectedProtest && (
        <div className="p-4 border-t border-border bg-card">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{selectedProtest.name}</h3>
                <Badge variant="secondary">{selectedProtest.cause}</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{selectedProtest.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{selectedProtest.date}</p>
                    <p className="text-muted-foreground">{selectedProtest.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{selectedProtest.attendees}</p>
                    <p className="text-muted-foreground">Expected</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProtest(null)}
                className="mt-3 w-full bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Close Details
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

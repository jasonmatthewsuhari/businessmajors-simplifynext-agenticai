"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Users, Navigation, X, Target, Search } from "lucide-react"

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

// Create a click handler component using useMapEvents
const MapClickHandler = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { useMapEvents } = mod
    return function ClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
      useMapEvents({
        click: onMapClick,
      })
      return null
    }
  }),
  { ssr: false }
)

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

interface NavigationPoint {
  lat: number
  lng: number
  name: string
}

interface RouteSegment {
  start: [number, number]
  end: [number, number]
  color: string
}

interface RouteInfo {
  distance: number // in meters
  duration: number // in seconds
  coordinates: [number, number][]
}

export default function ProtestMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [selectedProtest, setSelectedProtest] = useState<(typeof mockProtests)[0] | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)
  const [loadingStep, setLoadingStep] = useState("Initializing...")
  
  // Navigation state
  const [isNavigationMode, setIsNavigationMode] = useState(false)
  const [startPoint, setStartPoint] = useState<NavigationPoint | null>(null)
  const [endPoint, setEndPoint] = useState<NavigationPoint | null>(null)
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([])
  const [isSelectingStart, setIsSelectingStart] = useState(false)
  const [isSelectingEnd, setIsSelectingEnd] = useState(false)
  
  // Address input state
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [isGeocodingStart, setIsGeocodingStart] = useState(false)
  const [isGeocodingEnd, setIsGeocodingEnd] = useState(false)
  
  // Routing state
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setLoadingStep("Loading map library...")

    // Import Leaflet dynamically to avoid SSR issues
    import("leaflet").then((leaflet) => {
      console.log("Leaflet loaded successfully")
      setL(leaflet.default)
      setLoadingStep("Getting location...")
    }).catch((error) => {
      console.error("Failed to load Leaflet:", error)
      setLoadingStep("Failed to load map library")
    })

    // Set default location immediately, then try to get user's location
    setUserLocation({ lat: 40.7589, lng: -73.9851 })
    setLoadingStep("Using default location...")

    // Try to get user's location with a timeout
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        console.log("Geolocation timeout, using default location")
        setLoadingStep("Location ready")
      }, 3000) // 3 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          console.log("Got user location:", position.coords)
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLoadingStep("Location ready")
        },
        (error) => {
          clearTimeout(timeoutId)
          console.log("Location access denied:", error.message)
          setLoadingStep("Location ready")
        },
        { timeout: 3000, enableHighAccuracy: false } // Options to prevent hanging
      )
    } else {
      setLoadingStep("Location ready")
    }
  }, [])

  // Geocoding function using Nominatim (OpenStreetMap's geocoding service)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  // Handle address search for start location
  const handleStartAddressSearch = async () => {
    if (!startAddress.trim()) return
    
    setIsGeocodingStart(true)
    const coords = await geocodeAddress(startAddress)
    setIsGeocodingStart(false)
    
    if (coords) {
      const point: NavigationPoint = {
        lat: coords.lat,
        lng: coords.lng,
        name: startAddress
      }
      setStartPoint(point)
      
      if (endPoint) {
        await calculateRoute(point, endPoint)
      }
    } else {
      alert("Address not found. Please try a different address.")
    }
  }

  // Handle address search for end location
  const handleEndAddressSearch = async () => {
    if (!endAddress.trim()) return
    
    setIsGeocodingEnd(true)
    const coords = await geocodeAddress(endAddress)
    setIsGeocodingEnd(false)
    
    if (coords) {
      const point: NavigationPoint = {
        lat: coords.lat,
        lng: coords.lng,
        name: endAddress
      }
      setEndPoint(point)
      
      if (startPoint) {
        await calculateRoute(startPoint, point)
      }
    } else {
      alert("Address not found. Please try a different address.")
    }
  }

  // Get real route using OpenRouteService API
  const getRealRoute = async (start: NavigationPoint, end: NavigationPoint): Promise<RouteInfo | null> => {
    try {
      // Using OpenRouteService public API (free, no API key required for basic usage)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
        {
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          }
        }
      )

      if (!response.ok) {
        // Fallback to OSRM if OpenRouteService fails
        return await getOSRMRoute(start, end)
      }

      const data = await response.json()
      
      if (data.features && data.features[0]) {
        const route = data.features[0]
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) // Convert [lng, lat] to [lat, lng]
        
        return {
          distance: route.properties.segments[0].distance,
          duration: route.properties.segments[0].duration,
          coordinates
        }
      }
      
      return null
    } catch (error) {
      console.error("OpenRouteService routing error:", error)
      // Fallback to OSRM
      return await getOSRMRoute(start, end)
    }
  }

  // Fallback routing using OSRM (Open Source Routing Machine)
  const getOSRMRoute = async (start: NavigationPoint, end: NavigationPoint): Promise<RouteInfo | null> => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      )

      if (!response.ok) {
        throw new Error("OSRM API failed")
      }

      const data = await response.json()
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) // Convert [lng, lat] to [lat, lng]
        
        return {
          distance: route.distance,
          duration: route.duration,
          coordinates
        }
      }
      
      return null
    } catch (error) {
      console.error("OSRM routing error:", error)
      return null
    }
  }

  // Calculate route segments from real route coordinates (chunked for gradient support)
  const calculateRouteSegments = (routeCoordinates: [number, number][]) => {
    const segments: RouteSegment[] = []
    const numSegments = Math.min(20, routeCoordinates.length - 1) // Use actual route points or max 20 segments
    const segmentSize = Math.floor(routeCoordinates.length / numSegments)
    
    for (let i = 0; i < numSegments; i++) {
      const startIdx = i * segmentSize
      const endIdx = i === numSegments - 1 ? routeCoordinates.length - 1 : (i + 1) * segmentSize
      
      if (startIdx < routeCoordinates.length && endIdx < routeCoordinates.length) {
        segments.push({
          start: routeCoordinates[startIdx],
          end: routeCoordinates[endIdx],
          color: "#3b82f6" // Default blue color, will be modified based on danger zones later
        })
      }
    }
    
    setRouteSegments(segments)
  }

  // Calculate route between two points using real routing
  const calculateRoute = async (start: NavigationPoint, end: NavigationPoint) => {
    setIsCalculatingRoute(true)
    
    try {
      const route = await getRealRoute(start, end)
      
      if (route) {
        setRouteInfo(route)
        calculateRouteSegments(route.coordinates)
      } else {
        // Fallback to straight line if routing fails
        console.warn("Routing failed, falling back to straight line")
        const segments: RouteSegment[] = []
        const numSegments = 20
        
        for (let i = 0; i < numSegments; i++) {
          const ratio1 = i / numSegments
          const ratio2 = (i + 1) / numSegments
          
          const lat1 = start.lat + (end.lat - start.lat) * ratio1
          const lng1 = start.lng + (end.lng - start.lng) * ratio1
          const lat2 = start.lat + (end.lat - start.lat) * ratio2
          const lng2 = start.lng + (end.lng - start.lng) * ratio2
          
          segments.push({
            start: [lat1, lng1],
            end: [lat2, lng2],
            color: "#ef4444" // Red color to indicate fallback
          })
        }
        
        setRouteSegments(segments)
        
        // Calculate approximate straight-line distance
        const distance = getDistanceBetweenPoints(start.lat, start.lng, end.lat, end.lng)
        setRouteInfo({
          distance: distance * 1000, // Convert to meters
          duration: (distance / 50) * 3600, // Rough estimate: 50 km/h average
          coordinates: [[start.lat, start.lng], [end.lat, end.lng]]
        })
      }
    } catch (error) {
      console.error("Route calculation failed:", error)
    } finally {
      setIsCalculatingRoute(false)
    }
  }

  // Helper function to calculate distance between two points (Haversine formula)
  const getDistanceBetweenPoints = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Handle map click for location selection
  const handleMapClick = async (e: any) => {
    console.log("Map clicked:", e.latlng) // Debug log
    
    if (!isNavigationMode) return
    if (!isSelectingStart && !isSelectingEnd) return
    
    const { lat, lng } = e.latlng
    
    if (isSelectingStart) {
      const point: NavigationPoint = {
        lat,
        lng,
        name: `Start (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      }
      setStartPoint(point)
      setIsSelectingStart(false)
      
      if (endPoint) {
        await calculateRoute(point, endPoint)
      }
    } else if (isSelectingEnd) {
      const point: NavigationPoint = {
        lat,
        lng,
        name: `End (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      }
      setEndPoint(point)
      setIsSelectingEnd(false)
      
      if (startPoint) {
        await calculateRoute(startPoint, point)
      }
    }
  }

  if (!isClient || !userLocation || !L) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{loadingStep}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            {!isClient && "Starting client..."}
            {isClient && !L && "Loading Leaflet library..."}
            {isClient && L && !userLocation && "Getting location..."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className={`z-0 rounded-lg ${(isSelectingStart || isSelectingEnd) ? 'navigation-mode' : ''}`}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          boxZoom={true}
          keyboard={true}
        >
          <MapClickHandler onMapClick={handleMapClick} />
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
                icon={L && L.icon({
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

          {/* Navigation markers */}
          {startPoint && (
            <Marker
              position={[startPoint.lat, startPoint.lng]}
              icon={L && L.icon({
                iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=S|00ff00`,
                iconSize: [25, 35],
                iconAnchor: [12.5, 35],
                popupAnchor: [0, -35],
              })}
            >
              <Popup>
                <div className="text-center">
                  <strong>Start Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {endPoint && (
            <Marker
              position={[endPoint.lat, endPoint.lng]}
              icon={L && L.icon({
                iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=E|ff0000`,
                iconSize: [25, 35],
                iconAnchor: [12.5, 35],
                popupAnchor: [0, -35],
              })}
            >
              <Popup>
                <div className="text-center">
                  <strong>End Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Full route line */}
          {routeInfo && routeInfo.coordinates.length > 0 && (
            <Polyline
              positions={routeInfo.coordinates}
              color="#2563eb"
              weight={5}
              opacity={0.9}
            />
          )}

          {/* Route segments for future gradient coloring */}
          {routeSegments.map((segment, index) => (
            <Polyline
              key={`route-segment-${index}`}
              positions={[segment.start, segment.end]}
              color={segment.color}
              weight={3}
              opacity={0.6}
            />
          ))}
        </MapContainer>
      </div>

      {/* Navigation Floating Window */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        {!isNavigationMode ? (
          <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg">
            <CardContent className="p-3">
              <Button
                onClick={() => setIsNavigationMode(true)}
                className="w-full flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Start Navigation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Navigation
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsNavigationMode(false)
                    setStartPoint(null)
                    setEndPoint(null)
                    setRouteSegments([])
                    setIsSelectingStart(false)
                    setIsSelectingEnd(false)
                    setStartAddress("")
                    setEndAddress("")
                    setRouteInfo(null)
                    setIsCalculatingRoute(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Start Location Input */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Start Location
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter start address..."
                      value={startAddress}
                      onChange={(e) => setStartAddress(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStartAddressSearch()}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleStartAddressSearch}
                      disabled={isGeocodingStart || !startAddress.trim()}
                      className="px-3"
                    >
                      {isGeocodingStart ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                      ) : (
                        <Search className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={isSelectingStart ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setIsSelectingStart(true)
                        setIsSelectingEnd(false)
                      }}
                      className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                    >
                      <Target className="h-2 w-2" />
                      {startPoint ? "Tap to Change" : "Tap on Map"}
                    </Button>
                  </div>
                </div>

                {/* End Location Input */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    End Location
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter end address..."
                      value={endAddress}
                      onChange={(e) => setEndAddress(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEndAddressSearch()}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleEndAddressSearch}
                      disabled={isGeocodingEnd || !endAddress.trim()}
                      className="px-3"
                    >
                      {isGeocodingEnd ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                      ) : (
                        <Search className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={isSelectingEnd ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setIsSelectingEnd(true)
                        setIsSelectingStart(false)
                      }}
                      className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                    >
                      <Target className="h-2 w-2" />
                      {endPoint ? "Tap to Change" : "Tap on Map"}
                    </Button>
                  </div>
                </div>

                {isSelectingStart && (
                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded border-l-4 border-blue-500 animate-pulse">
                    📍 <strong>Click anywhere on the map</strong> to set your start location
                    <div className="text-xs mt-1 opacity-75">The cursor should show a crosshair when hovering over the map</div>
                  </div>
                )}

                {isSelectingEnd && (
                  <div className="text-sm text-muted-foreground bg-red-50 dark:bg-red-950 p-2 rounded border-l-4 border-red-500 animate-pulse">
                    📍 <strong>Click anywhere on the map</strong> to set your end location
                    <div className="text-xs mt-1 opacity-75">The cursor should show a crosshair when hovering over the map</div>
                  </div>
                )}

                {isCalculatingRoute && (
                  <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-2 rounded border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600" />
                      🗺️ Calculating optimal route...
                    </div>
                  </div>
                )}

                {startPoint && endPoint && routeSegments.length > 0 && !isCalculatingRoute && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950 p-2 rounded border-l-4 border-green-500">
                      ✅ Route calculated with {routeSegments.length} segments ready for safety analysis
                    </div>
                    
                    {routeInfo && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Distance:</span>
                            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                              {routeInfo.distance >= 1000 
                                ? `${(routeInfo.distance / 1000).toFixed(1)} km`
                                : `${Math.round(routeInfo.distance)} m`
                              }
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">Duration:</span>
                            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                              {routeInfo.duration >= 3600 
                                ? `${Math.floor(routeInfo.duration / 3600)}h ${Math.floor((routeInfo.duration % 3600) / 60)}m`
                                : `${Math.floor(routeInfo.duration / 60)} min`
                              }
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          🛣️ Real road routing • 📊 {routeInfo.coordinates.length} route points
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {startPoint && (
                  <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <strong>From:</strong> {startPoint.name}
                  </div>
                )}

                {endPoint && (
                  <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <strong>To:</strong> {endPoint.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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

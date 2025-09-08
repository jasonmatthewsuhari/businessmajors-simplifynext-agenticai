"use client"

import { useState, useEffect } from "react"
import { getWeather } from "@/lib/getWeather"
import { getTraffic } from "@/lib/getTraffic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  Car,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface SafetyData {
  weather: {
    condition: "sunny" | "cloudy" | "rainy" | "stormy"
    temperature: number
    description: string
  }
  traffic: {
    density: "low" | "medium" | "high"
    description: string
    avgDelay: number
  }
  riskScore: number
  lastUpdated: string
  location: string
  recommendations: string[]
  trends: {
    weather: "improving" | "stable" | "worsening"
    traffic: "improving" | "stable" | "worsening"
    safety: "improving" | "stable" | "worsening"
  }
}

const weatherConditions = [
  { condition: "sunny" as const, icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50" },
  { condition: "cloudy" as const, icon: Cloud, color: "text-gray-500", bg: "bg-gray-50" },
  { condition: "rainy" as const, icon: CloudRain, color: "text-blue-500", bg: "bg-blue-50" },
  { condition: "stormy" as const, icon: CloudRain, color: "text-purple-500", bg: "bg-purple-50" },
]

const trafficLevels = [
  { level: "low" as const, color: "text-green-600", bg: "bg-green-50", description: "Light traffic, easy movement" },
  {
    level: "medium" as const,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    description: "Moderate congestion expected",
  },
  { level: "high" as const, color: "text-red-600", bg: "bg-red-50", description: "Heavy traffic, plan extra time" },
]

// Real API calls will be used in the component logic below

export default function SafetyForecast() {
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate initial data
  useEffect(() => {
    // Get user profile from localStorage
    const getUserProfile = () => {
      try {
        const savedProfile = localStorage.getItem("protestCopilot_userProfile")
        if (savedProfile) {
          return JSON.parse(savedProfile)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
      return null
    }
    const fetchWeatherData = async () => {
      setIsLoading(true)
      const profile = getUserProfile()
      let lat = -6.1751 // Default: Jakarta
      let lon = 106.8650
      let locationLabel = "Unknown"
      if (profile && profile.location) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.location)}`)
          const geo = await geoRes.json()
          if (geo && geo.length > 0) {
            lat = parseFloat(geo[0].lat)
            lon = parseFloat(geo[0].lon)
            locationLabel = profile.location
          }
        } catch (err) {
          console.error("Error fetching location geocode:", err)
        }
      }
      try {
        const [weatherData, trafficData] = await Promise.all([
          getWeather(lat, lon),
          getTraffic(lat, lon),
        ])
        // Weather mapping
        let condition: SafetyData["weather"]["condition"] = "sunny"
        const main = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].main.toLowerCase() : ""
        if (main.includes("cloud")) condition = "cloudy"
        else if (main.includes("rain")) condition = "rainy"
        else if (main.includes("storm")) condition = "stormy"
        else if (main.includes("sun") || main.includes("clear")) condition = "sunny"
        const temp = weatherData.main ? weatherData.main.temp : 22
        const desc = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].description : "No data"
        // Traffic mapping (TomTom API)
        let trafficDensity: SafetyData["traffic"]["density"] = "medium"
        let trafficDesc = "No traffic data"
        let avgDelay = 0
        if (trafficData && trafficData.flowSegmentData) {
          const speed = trafficData.flowSegmentData.currentSpeed
          const freeFlow = trafficData.flowSegmentData.freeFlowSpeed
          avgDelay = Math.round(
            ((freeFlow - speed) / freeFlow) * 10
          ) // 0-10 scale
          if (avgDelay <= 2) trafficDensity = "low"
          else if (avgDelay <= 6) trafficDensity = "medium"
          else trafficDensity = "high"
          trafficDesc = `Current speed: ${speed} km/h, Free flow: ${freeFlow} km/h, Delay: ${avgDelay} min`
        } else {
          trafficDesc = "Traffic data not available"
        }
        const data: SafetyData = {
          weather: {
            condition,
            temperature: temp,
            description: desc,
          },
          traffic: {
            density: trafficDensity,
            description: trafficDesc,
            avgDelay,
          },
          riskScore: 3,
          lastUpdated: new Date().toISOString(),
          location: locationLabel,
          recommendations: [
            "Stay hydrated and wear appropriate clothing",
            "Keep emergency contacts readily available",
            "Plan multiple exit routes from event areas",
          ],
          trends: {
            weather: "stable",
            traffic: "stable",
            safety: "stable",
          },
        }
        setSafetyData(data)
      } catch (err) {
        setSafetyData(null)
      }
      setIsLoading(false)
    }
    fetchWeatherData()
  }, [])

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true)
    // Get user profile from localStorage
    const getUserProfile = () => {
      try {
        const savedProfile = localStorage.getItem("protestCopilot_userProfile")
        if (savedProfile) {
          return JSON.parse(savedProfile)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
      return null
    }
    let lat = -6.1751 // Default: Jakarta
    let lon = 106.8650
    let locationLabel = "Unknown"
    const profile = getUserProfile()
    if (profile && profile.location) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.location)}`)
        const geo = await geoRes.json()
        if (geo && geo.length > 0) {
          lat = parseFloat(geo[0].lat)
          lon = parseFloat(geo[0].lon)
          locationLabel = profile.location
        }
      } catch (err) {
        console.error("Error fetching location geocode:", err)
      }
    }
    try {
      const [weatherData, trafficData] = await Promise.all([
        getWeather(lat, lon),
        getTraffic(lat, lon),
      ])
      // Weather mapping
      let condition: SafetyData["weather"]["condition"] = "sunny"
      const main = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].main.toLowerCase() : ""
      if (main.includes("cloud")) condition = "cloudy"
      else if (main.includes("rain")) condition = "rainy"
      else if (main.includes("storm")) condition = "stormy"
      else if (main.includes("sun") || main.includes("clear")) condition = "sunny"
      const temp = weatherData.main ? weatherData.main.temp : 22
      const desc = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].description : "No data"
      // Traffic mapping (TomTom API)
      let trafficDensity: SafetyData["traffic"]["density"] = "medium"
      let trafficDesc = "No traffic data"
      let avgDelay = 0
      if (trafficData && trafficData.flowSegmentData) {
        const speed = trafficData.flowSegmentData.currentSpeed
        const freeFlow = trafficData.flowSegmentData.freeFlowSpeed
        avgDelay = Math.round(
          ((freeFlow - speed) / freeFlow) * 10
        ) // 0-10 scale
        if (avgDelay <= 2) trafficDensity = "low"
        else if (avgDelay <= 6) trafficDensity = "medium"
        else trafficDensity = "high"
        trafficDesc = `Current speed: ${speed} km/h, Free flow: ${freeFlow} km/h, Delay: ${avgDelay} min`
      } else {
        trafficDesc = "Traffic data not available"
      }
      const newData: SafetyData = {
        weather: {
          condition,
          temperature: temp,
          description: desc,
        },
        traffic: {
          density: trafficDensity,
          description: trafficDesc,
          avgDelay,
        },
        riskScore: 3,
        lastUpdated: new Date().toISOString(),
        location: locationLabel,
        recommendations: [
          "Stay hydrated and wear appropriate clothing",
          "Keep emergency contacts readily available",
          "Plan multiple exit routes from event areas",
        ],
        trends: {
          weather: "stable",
          traffic: "stable",
          safety: "stable",
        },
      }
      setSafetyData(newData)
    } catch (err) {
      setSafetyData(null)
    }
    setIsRefreshing(false)
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return { color: "text-green-600", bg: "bg-green-50", label: "Low Risk" }
    if (score <= 6) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Medium Risk" }
    return { color: "text-red-600", bg: "bg-red-50", label: "High Risk" }
  }

  const getTrendIcon = (trend: "improving" | "stable" | "worsening") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "worsening":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  if (isLoading || !safetyData) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading safety forecast...</p>
        </div>
      </div>
    )
  }

  const weatherInfo = weatherConditions.find((w) => w.condition === safetyData.weather.condition)
  const trafficInfo = trafficLevels.find((t) => t.level === safetyData.traffic.density)
  const riskInfo = getRiskColor(safetyData.riskScore)
  const WeatherIcon = weatherInfo?.icon || Sun
  const TrafficIcon = Car

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Safety Forecast</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {safetyData.location}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Risk Score Card */}
      <Card className={`${riskInfo.bg} border-2`}>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${riskInfo.color}`}>{safetyData.riskScore}/10</div>
            <Badge variant="outline" className={`${riskInfo.color} border-current`}>
              {riskInfo.label}
            </Badge>
            <p className="text-sm text-muted-foreground">Overall Safety Assessment</p>
          </div>
        </CardContent>
      </Card>

      {/* Weather & Traffic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <WeatherIcon className={`h-5 w-5 ${weatherInfo?.color}`} />
              Weather
              {getTrendIcon(safetyData.trends.weather)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-3 rounded-lg ${weatherInfo?.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold capitalize">{safetyData.weather.condition}</span>
                <span className="text-lg font-bold">{safetyData.weather.temperature}°C</span>
              </div>
              <p className="text-sm text-muted-foreground">{safetyData.weather.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrafficIcon className="h-5 w-5 text-gray-600" />
              Traffic
              {getTrendIcon(safetyData.trends.traffic)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-3 rounded-lg ${trafficInfo?.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold capitalize">{safetyData.traffic.density} Density</span>
                <span className="text-sm font-medium">+{safetyData.traffic.avgDelay}min</span>
              </div>
              <p className="text-sm text-muted-foreground">{safetyData.traffic.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Safety Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {safetyData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1">
                <WeatherIcon className="h-4 w-4 text-muted-foreground" />
                {getTrendIcon(safetyData.trends.weather)}
              </div>
              <p className="text-xs text-muted-foreground">Weather</p>
              <p className="text-sm font-medium capitalize">{safetyData.trends.weather}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1">
                <Car className="h-4 w-4 text-muted-foreground" />
                {getTrendIcon(safetyData.trends.traffic)}
              </div>
              <p className="text-xs text-muted-foreground">Traffic</p>
              <p className="text-sm font-medium capitalize">{safetyData.trends.traffic}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                {getTrendIcon(safetyData.trends.safety)}
              </div>
              <p className="text-xs text-muted-foreground">Safety</p>
              <p className="text-sm font-medium capitalize">{safetyData.trends.safety}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date(safetyData.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

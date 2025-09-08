
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Bell, Users, User, ClipboardList, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import ProtestMap from "@/components/protest-map"
import Notifications from "@/components/notifications"
import Community from "@/components/community"
import UserProfile from "@/components/user-profile"
import ActionPlan from "@/components/action-plan"
import SafetyForecast from "@/components/safety-forecast"

type NavItem = "map" | "notifications" | "community" | "profile" | "action-plan" | "forecast"

// New nav order: safety, plan, map (center, larger), community, profile
const navItems = [
  { id: "forecast" as NavItem, icon: Shield, label: "Safety" },
  { id: "action-plan" as NavItem, icon: ClipboardList, label: "Plan" },
  { id: "map" as NavItem, icon: MapPin, label: "Map", center: true },
  { id: "community" as NavItem, icon: Users, label: "Community" },
  { id: "profile" as NavItem, icon: User, label: "Profile" },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>("map")
  const router = useRouter()

  useEffect(() => {
    console.log("App mounted")
  }, [])

  useEffect(() => {
    // Only run on main page, not login/signup
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated") === "true"
      const path = window.location.pathname
      if (!isAuth && path === "/") {
        router.replace("/login")
      }
    }
  }, [router])

  const renderContent = () => {
    switch (activeTab) {
      case "map":
        return <ProtestMap />
      case "notifications":
        return <Notifications />
      case "community":
        return <Community />
      case "profile":
        return <UserProfile />
      case "action-plan":
        return <ActionPlan />
      case "forecast":
        return <SafetyForecast />
      default:
        return <ProtestMap />
    }
  }

  // Get unread notification count from Notifications component
  // For simplicity, use mockNotifications here (ideally use context or global state)
  const mockNotifications = [
    { dismissed: false },
    { dismissed: false },
    { dismissed: true },
    { dismissed: false },
    { dismissed: true },
  ]
  const unreadCount = mockNotifications.filter(n => !n.dismissed).length

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">AWaS</h1>
          <button
            className="relative ml-auto flex items-center justify-center p-2 rounded-full hover:bg-muted"
            onClick={() => setActiveTab("notifications")}
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-50 bg-card border-t border-border">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            // Make map button larger, always circular, white when not selected, blue when selected
            const isMap = item.id === "map"
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 transition-colors",
                  isMap
                    ? `min-h-[70px] min-w-[70px] rounded-full ${isActive ? "bg-primary text-primary-foreground shadow-lg" : "bg-white text-primary border-2 border-primary"}`
                    : "min-h-[60px] text-xs font-medium rounded-lg",
                  !isMap && (isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"),
                )}
              >
                <Icon className={isMap ? "h-7 w-7 mb-1" : "h-5 w-5 mb-1"} />
                <span className="leading-tight">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

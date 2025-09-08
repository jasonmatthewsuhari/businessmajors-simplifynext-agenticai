"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, AlertTriangle, Info, MapPin, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "alert" | "info" | "warning" | "success"
  timestamp: string
  location?: string
  dismissed: boolean
  priority: "high" | "medium" | "low"
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Protest Alert",
    message: "Large demonstration planned near City Hall tomorrow at 2 PM. Expected 500+ attendees.",
    type: "alert",
    timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    location: "City Hall, Manhattan",
    dismissed: false,
    priority: "high",
  },
  {
    id: "2",
    title: "Safety Update",
    message: "Police presence increased in downtown area. Plan alternate routes if attending events.",
    type: "warning",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    location: "Downtown District",
    dismissed: false,
    priority: "medium",
  },
  {
    id: "3",
    title: "Community Alert",
    message: "Weather advisory: Rain expected during evening protests. Bring waterproof gear.",
    type: "info",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    dismissed: false,
    priority: "medium",
  },
  {
    id: "4",
    title: "Event Update",
    message: "Climate march route changed due to construction. New meeting point: Washington Square Park.",
    type: "info",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    location: "Washington Square Park",
    dismissed: false,
    priority: "high",
  },
  {
    id: "5",
    title: "Safety Reminder",
    message: "Remember to stay hydrated and keep emergency contacts handy during events.",
    type: "success",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    dismissed: false,
    priority: "low",
  },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load notifications from localStorage and merge with mock data
  useEffect(() => {
    try {
      const savedDismissed = localStorage.getItem("protestCopilot_dismissedNotifications")
      const dismissedIds = savedDismissed ? JSON.parse(savedDismissed) : []

      // Mark notifications as dismissed based on localStorage
      const updatedNotifications = mockNotifications.map((notification) => ({
        ...notification,
        dismissed: dismissedIds.includes(notification.id),
      }))

      setNotifications(updatedNotifications)
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications(mockNotifications)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Dismiss notification
  const dismissNotification = (id: string) => {
    try {
      const savedDismissed = localStorage.getItem("protestCopilot_dismissedNotifications")
      const dismissedIds = savedDismissed ? JSON.parse(savedDismissed) : []

      if (!dismissedIds.includes(id)) {
        dismissedIds.push(id)
        localStorage.setItem("protestCopilot_dismissedNotifications", JSON.stringify(dismissedIds))
      }

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, dismissed: true } : notification)),
      )

      toast({
        title: "Notification dismissed",
        description: "You won't see this notification again.",
      })
    } catch (error) {
      console.error("Error dismissing notification:", error)
    }
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    try {
      const allIds = notifications.map((n) => n.id)
      localStorage.setItem("protestCopilot_dismissedNotifications", JSON.stringify(allIds))

      setNotifications((prev) => prev.map((notification) => ({ ...notification, dismissed: true })))

      toast({
        title: "All notifications cleared",
        description: "Your notification list has been cleared.",
      })
    } catch (error) {
      console.error("Error clearing notifications:", error)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const activeNotifications = notifications.filter((n) => !n.dismissed)
  const unreadCount = activeNotifications.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-muted-foreground text-sm">
              {unreadCount} {unreadCount === 1 ? "alert" : "alerts"} requiring attention
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllNotifications}>
            Clear All
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {activeNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground max-w-sm">
              No new notifications. We'll alert you about important protests and safety updates in your area.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeNotifications
            .sort((a, b) => {
              // Sort by priority first, then by timestamp
              const priorityOrder = { high: 3, medium: 2, low: 1 }
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              }
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            })
            .map((notification) => (
              <Card key={notification.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                        {notification.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{notification.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Protest alerts</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Safety updates</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Community messages</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

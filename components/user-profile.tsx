"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { User, MapPin, Bell, Save, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  name: string
  location: string
  alertRadius: number
}

const defaultProfile: UserProfile = {
  name: "",
  location: "",
  alertRadius: 5,
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  // Load profile from localStorage on component mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("protestCopilot_userProfile")
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile({ ...defaultProfile, ...parsedProfile })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save profile to localStorage
  const saveProfile = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("protestCopilot_userProfile", JSON.stringify(profile))
      setLastSaved(new Date())
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Your Profile</h2>
        <p className="text-muted-foreground text-sm">Keep your information updated for better safety alerts</p>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={profile.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location (City)
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., New York, NY"
              value={profile.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Alert Radius</Label>
              <span className="text-sm font-medium text-primary">{profile.alertRadius} km</span>
            </div>
            <div className="px-2">
              <Slider
                value={[profile.alertRadius]}
                onValueChange={(value) => handleInputChange("alertRadius", value[0])}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive alerts for protests within this radius of your location
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="space-y-3">
        <Button onClick={saveProfile} disabled={isSaving} className="w-full" size="lg">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>

        {lastSaved && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-600" />
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Profile Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{profile.name ? "✓" : "○"}</p>
              <p className="text-xs text-muted-foreground">Name Set</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{profile.location ? "✓" : "○"}</p>
              <p className="text-xs text-muted-foreground">Location Set</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

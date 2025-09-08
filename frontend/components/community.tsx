"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, MapPin, Trash2, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommunityMember {
  id: string
  name: string
  relationship: string
  location: string
  coordinates?: [number, number]
  lastSeen: string
  status: "online" | "offline" | "unknown"
}

const relationshipOptions = ["Family Member", "Friend", "Partner", "Colleague", "Neighbor", "Team Member", "Other"]

// Mock locations for demonstration
const mockLocations = [
  { city: "Manhattan, NY", coords: [40.7831, -73.9712] as [number, number] },
  { city: "Brooklyn, NY", coords: [40.6782, -73.9442] as [number, number] },
  { city: "Queens, NY", coords: [40.7282, -73.7949] as [number, number] },
  { city: "Bronx, NY", coords: [40.8448, -73.8648] as [number, number] },
  { city: "Staten Island, NY", coords: [40.5795, -74.1502] as [number, number] },
]

export default function Community() {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    location: "",
  })
  const { toast } = useToast()

  // Load members from localStorage on component mount
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem("protestCopilot_communityMembers")
      if (savedMembers) {
        const parsedMembers = JSON.parse(savedMembers)
        setMembers(parsedMembers)
      }
    } catch (error) {
      console.error("Error loading community members:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save members to localStorage
  const saveMembers = (updatedMembers: CommunityMember[]) => {
    try {
      localStorage.setItem("protestCopilot_communityMembers", JSON.stringify(updatedMembers))
      setMembers(updatedMembers)
    } catch (error) {
      console.error("Error saving community members:", error)
      toast({
        title: "Error",
        description: "Failed to save member. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add new member
  const addMember = () => {
    if (!newMember.name.trim() || !newMember.relationship) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Generate mock location if not provided
    const mockLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)]
    const location = newMember.location.trim() || mockLocation.city

    const member: CommunityMember = {
      id: Date.now().toString(),
      name: newMember.name.trim(),
      relationship: newMember.relationship,
      location,
      coordinates: mockLocation.coords,
      lastSeen: new Date().toISOString(),
      status: Math.random() > 0.3 ? "online" : "offline",
    }

    const updatedMembers = [...members, member]
    saveMembers(updatedMembers)

    // Reset form
    setNewMember({ name: "", relationship: "", location: "" })
    setIsDialogOpen(false)

    toast({
      title: "Member added",
      description: `${member.name} has been added to your community.`,
    })
  }

  // Remove member
  const removeMember = (id: string) => {
    const updatedMembers = members.filter((member) => member.id !== id)
    saveMembers(updatedMembers)

    toast({
      title: "Member removed",
      description: "Member has been removed from your community.",
    })
  }

  const getStatusColor = (status: CommunityMember["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-yellow-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Community</h2>
          <p className="text-muted-foreground text-sm">
            {members.length} {members.length === 1 ? "member" : "members"} in your network
          </p>
        </div>

        {/* Add Member Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Community Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Name *</Label>
                <Input
                  id="member-name"
                  placeholder="Enter member's name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-relationship">Relationship *</Label>
                <Select
                  value={newMember.relationship}
                  onValueChange={(value) => setNewMember({ ...newMember, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-location">Location (Optional)</Label>
                <Input
                  id="member-location"
                  placeholder="e.g., Brooklyn, NY (auto-generated if empty)"
                  value={newMember.location}
                  onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addMember} className="flex-1">
                  Add Member
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No community members yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add family, friends, or team members to keep track of your community during events.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Avatar with status indicator */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(
                          member.status,
                        )}`}
                      />
                    </div>

                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {member.relationship}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{member.location}</span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Last seen: {new Date(member.lastSeen).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Community Stats */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {members.filter((m) => m.status === "online").length}
                </p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">
                  {members.filter((m) => m.status === "offline").length}
                </p>
                <p className="text-xs text-muted-foreground">Offline</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{members.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { getWeather } from "@/lib/getWeather"
import { getActionPlanWithChatGPT } from "@/lib/getActionPlanWithChatGPT"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClipboardList, CheckCircle, AlertTriangle, Shield, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ActionPlan() {
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
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weather, setWeather] = useState<any>(null)
  const [chatChecklist, setChatChecklist] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [gptChecklistState, setGptChecklistState] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  // Load checklist state from localStorage
  useEffect(() => {
    try {
      const savedChecklist = localStorage.getItem("protestCopilot_actionPlan")
      if (savedChecklist) {
        const savedItems = JSON.parse(savedChecklist)
        // Merge saved state with mock data (in case new items were added)
        const mergedItems = mockChecklistItems.map((item) => {
          const savedItem = savedItems.find((saved: ChecklistItem) => saved.id === item.id)
          return savedItem ? { ...item, completed: savedItem.completed } : item
        })
        setChecklistItems(mergedItems)
      } else {
        setChecklistItems(mockChecklistItems)
      }
    } catch (error) {
      console.error("Error loading action plan:", error)
      setChecklistItems(mockChecklistItems)
    }
    // Fetch weather and generate action plan via ChatGPT
    const profile = getUserProfile()
    if (profile && profile.location) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.location)}`)
        .then((res) => res.json())
        .then((geo) => {
          if (geo && geo.length > 0) {
            const lat = parseFloat(geo[0].lat)
            const lon = parseFloat(geo[0].lon)
            getWeather(lat, lon)
              .then((weatherData) => {
                setWeather(weatherData)
                const weatherSummary = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].main : "Unknown"
                const temp = weatherData.main ? weatherData.main.temp : "Unknown"
                // Situation can be extended with more context (e.g., protest type, risk)
                const situation = "Protest planned. Please advise on safety and preparation."
                getActionPlanWithChatGPT({
                  location: profile.location,
                  weather: `${weatherSummary}, ${temp}°C`,
                  situation,
                })
                  .then((plan) => {
                    setChatChecklist(plan)
                  })
                  .catch((err) => {
                    setChatChecklist("Unable to generate action plan. Please try again later.")
                  })
              })
              .catch((err) => {
                setChatChecklist("Unable to fetch weather data.")
              })
          }
        })
        .catch((err) => {
          setChatChecklist("Unable to fetch location data.")
        })
    }
    setIsLoading(false)
  }, [])

  // Save checklist state to localStorage
  const saveChecklist = (items: ChecklistItem[]) => {
    try {
      localStorage.setItem("protestCopilot_actionPlan", JSON.stringify(items))
    } catch (error) {
      console.error("Error saving action plan:", error)
    }
  }

  // Toggle item completion
  const toggleItem = (id: string) => {
    const updatedItems = checklistItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    setChecklistItems(updatedItems)
    saveChecklist(updatedItems)

    const item = checklistItems.find((item) => item.id === id)
    if (item) {
      toast({
        title: item.completed ? "Item unchecked" : "Item completed",
        description: item.text,
      })
    }
  }

  // Reset all items
  const resetChecklist = () => {
    const resetItems = checklistItems.map((item) => ({ ...item, completed: false }))
    setChecklistItems(resetItems)
    saveChecklist(resetItems)
    toast({
      title: "Checklist reset",
      description: "All items have been unchecked.",
    })
  }

  const categories = [
    { id: "all", label: "All Items", icon: ClipboardList },
    { id: "bring", label: "Bring", icon: CheckCircle },
    { id: "avoid", label: "Avoid", icon: AlertTriangle },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "legal", label: "Legal", icon: Shield },
  ]

  // Show ChatGPT-generated checklist if available
  const showChatChecklist = chatChecklist && chatChecklist.length > 0

  // Parse ChatGPT checklist into structured items
  function parseChatChecklist(text: string) {
    // Simple parser for sections and bullet points
    const sections = []
    const lines = text.split(/\r?\n/)
    let currentSection = null
    let currentItems = []
    for (let line of lines) {
      // Section header (bolded)
      const sectionMatch = line.match(/^\*\*(.+)\*\*$/)
      if (sectionMatch) {
        if (currentSection) {
          sections.push({ section: currentSection, items: currentItems })
        }
        currentSection = sectionMatch[1]
        currentItems = []
        continue
      }
      // Bullet point (numbered or dash)
      const bulletMatch = line.match(/^\s*(?:\d+\.|-)\s+(.*)$/)
      if (bulletMatch) {
        currentItems.push(bulletMatch[1])
      }
    }
    if (currentSection) {
      sections.push({ section: currentSection, items: currentItems })
    }
    // Add unique keys for each item for tick state
    return sections.map((section, sIdx) => ({
      ...section,
      items: section.items.map((item, iIdx) => ({
        text: item,
        key: `gpt-${sIdx}-${iIdx}`,
      })),
    }))
  }

  const parsedChecklist = showChatChecklist ? parseChatChecklist(chatChecklist) : []

  const filteredItems =
    selectedCategory === "all" ? checklistItems : checklistItems.filter((item) => item.category === selectedCategory)

  const completedCount = checklistItems.filter((item) => item.completed).length
  const totalCount = checklistItems.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const getCategoryColor = (category: ChecklistItem["category"]) => {
    switch (category) {
      case "bring":
        return "bg-green-100 text-green-800 border-green-200"
      case "avoid":
        return "bg-red-100 text-red-800 border-red-200"
      case "safety":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "legal":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: ChecklistItem["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading action plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Action Plan</h2>
            <p className="text-muted-foreground text-sm">Prepare safely for protests and demonstrations</p>
          </div>
          <Button variant="outline" size="sm" onClick={resetChecklist}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">
                  {completedCount} of {totalCount} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = selectedCategory === category.id
          const categoryCount =
            category.id === "all"
              ? checklistItems.length
              : checklistItems.filter((item) => item.category === category.id).length

          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              {category.label}
              <Badge variant="secondary" className="ml-1">
                {categoryCount}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {/* Show GPT checklist if available, otherwise fallback to mock items */}
        {parsedChecklist.length > 0 ? (
          parsedChecklist.map((section, idx) => (
            <div key={idx} className="mb-4">
              <div className="font-bold text-base mb-2">{section.section}</div>
              {section.items.map((item, i) => (
                <Card key={item.key} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={item.key}
                        checked={!!gptChecklistState[item.key]}
                        onCheckedChange={() => {
                          setGptChecklistState((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={item.key}
                          className={`font-medium cursor-pointer text-foreground ${gptChecklistState[item.key] ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.text}
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        ) : (
          filteredItems && filteredItems.map((item) => (
            <Card key={item.id} className={`border-l-4 ${getPriorityColor(item.priority)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <label
                        htmlFor={item.id}
                        className={`font-medium cursor-pointer ${
                          item.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {item.text}
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </Badge>
                        {item.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className={`text-sm ${item.completed ? "text-muted-foreground" : "text-muted-foreground"}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items in this category</h3>
            <p className="text-muted-foreground">Try selecting a different category to see more items.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {completedCount === totalCount && totalCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">All set!</h3>
            <p className="text-sm text-green-700">You've completed your action plan. Stay safe out there!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ChecklistItem {
  id: string
  text: string
  category: "bring" | "avoid" | "safety" | "legal"
  priority: "high" | "medium" | "low"
  completed: boolean
  description?: string
}

const mockChecklistItems: ChecklistItem[] = [
  // Things to bring
  {
    id: "1",
    text: "Water bottle",
    category: "bring",
    priority: "high",
    completed: false,
    description: "Stay hydrated, especially during long events",
  },
  {
    id: "2",
    text: "Face mask",
    category: "bring",
    priority: "high",
    completed: false,
    description: "Protect against tear gas and illness",
  },
  {
    id: "3",
    text: "First aid kit",
    category: "bring",
    priority: "medium",
    completed: false,
    description: "Basic supplies for minor injuries",
  },
  {
    id: "4",
    text: "ID card (if safe)",
    category: "bring",
    priority: "low",
    completed: false,
    description: "Only if necessary for emergencies",
  },
  {
    id: "5",
    text: "Emergency contact info",
    category: "bring",
    priority: "high",
    completed: false,
    description: "Written on paper, not just phone",
  },
  {
    id: "6",
    text: "Sturdy shoes",
    category: "bring",
    priority: "high",
    completed: false,
    description: "Closed-toe shoes for walking and protection",
  },
  {
    id: "7",
    text: "Snacks",
    category: "bring",
    priority: "low",
    completed: false,
    description: "Energy bars or non-perishable food",
  },
  {
    id: "8",
    text: "Portable phone charger",
    category: "bring",
    priority: "medium",
    completed: false,
    description: "Keep your phone charged for communication",
  },
  // Things to avoid
  {
    id: "9",
    text: "Avoid wearing identifiable clothing",
    category: "avoid",
    priority: "high",
    completed: false,
    description: "No logos, unique patterns, or personal identifiers",
  },
  {
    id: "10",
    text: "Don't bring valuable items",
    category: "avoid",
    priority: "medium",
    completed: false,
    description: "Leave jewelry, expensive electronics at home",
  },
  {
    id: "11",
    text: "Avoid bringing large bags",
    category: "avoid",
    priority: "medium",
    completed: false,
    description: "May be searched or seen as suspicious",
  },
  {
    id: "12",
    text: "Don't share location on social media",
    category: "avoid",
    priority: "high",
    completed: false,
    description: "Protect your privacy and safety",
  },
  // Safety measures
  {
    id: "13",
    text: "Know your legal rights",
    category: "legal",
    priority: "high",
    completed: false,
    description: "Understand what to do if approached by police",
  },
  {
    id: "14",
    text: "Plan exit routes",
    category: "safety",
    priority: "high",
    completed: false,
    description: "Know multiple ways to leave the area safely",
  },
  {
    id: "15",
    text: "Stay with your group",
    category: "safety",
    priority: "high",
    completed: false,
    description: "Use the buddy system for safety",
  },
  {
    id: "16",
    text: "Keep phone on airplane mode",
    category: "safety",
    priority: "medium",
    completed: false,
    description: "Prevent location tracking while keeping emergency access",
  },
]


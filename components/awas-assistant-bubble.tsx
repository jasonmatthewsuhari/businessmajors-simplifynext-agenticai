import React, { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Example civic event API (replace with real API)
async function fetchProtestInfo(location: string, date: string) {
  // Replace with a real civic events API (e.g., GDELT, local government, news)
  // For demo, return mock data
  return {
    summary: `Protest in ${location} on ${date}. Organized by local civic group. Main demand: government transparency.`,
    safetyAdvice: `Check weather and traffic before attending. Stay with groups, avoid high-risk areas, and follow local authorities' guidance.`,
    suggestedActions: `Participate peacefully, share verified info, or support the cause online if you can't attend.`,
    uncertainty: false,
  }
}

export default function AWaSAssistantBubble() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    setLoading(true)
    // Simple parsing for location/date (replace with NLP or context)
    let location = "your city"
    let date = "today"
    // TODO: Use NLP or context to extract location/date/type from question
    const info = await fetchProtestInfo(location, date)
    setResponse(info)
    setLoading(false)
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Button variant="ghost" size="icon" aria-label="Ask AWaS Assistant" onClick={() => setOpen((o) => !o)}>
  <MessageCircle className="h-7 w-7" />
      </Button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "2.5rem", zIndex: 100 }}>
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4 space-y-3">
              <div className="font-bold text-lg mb-2">AWaS Assistant</div>
              <input
                type="text"
                className="w-full border rounded p-2 mb-2"
                placeholder="Ask about a protest..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                aria-label="Ask about a protest"
              />
              <Button onClick={handleAsk} disabled={loading || !question} className="w-full mb-2">
                {loading ? "Loading..." : "Ask"}
              </Button>
              {response && (
                <div className="space-y-2 text-sm">
                  <div><strong>Summary:</strong> {response.summary}</div>
                  <div><strong>Safety Advice:</strong> {response.safetyAdvice}</div>
                  <div><strong>Suggested Actions:</strong> {response.suggestedActions}</div>
                  {response.uncertainty && (
                    <div className="text-xs text-muted-foreground">Some details are unavailable. Please check local news or official sources for updates.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

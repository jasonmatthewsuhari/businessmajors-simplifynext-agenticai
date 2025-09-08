import React, { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAWaSChatGPTResponse } from "@/lib/getAWaSChatGPTResponse"
import { getWebSearchResults } from "@/lib/getWebSearchResults"
export default function AWaSAssistantBubble() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // TODO: Use a secure method for API key (env, serverless, etc.)
  const GPT_API_KEY = "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"
  const GOOGLE_API_KEY = "AIzaSyAixy7j9MiXLNBQhNcJxnap1_uen-VF4M8"
  const GOOGLE_CSE_ID = "66ea76eb35b1c49f7" // <-- Using provided CSE ID
  const handleAsk = async () => {
    setLoading(true)
    try {
      // Step 1: Get web search results
      const webResults = await getWebSearchResults(question, GOOGLE_API_KEY, GOOGLE_CSE_ID)
      // Step 2: Pass results to GPT
      const gptResponse = await getAWaSChatGPTResponse(question, GPT_API_KEY, webResults)
      setResponse(gptResponse)
    } catch (err) {
      setResponse("Unable to get response. Please try again later.")
    }
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
                  {/* Replace **Summary** etc. with <strong> for bold rendering */}
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: response
                        .replace(/\*\*Summary\*\*/g, '<strong>Summary</strong>')
                        .replace(/\*\*Safety Advice\*\*/g, '<strong>Safety Advice</strong>')
                        .replace(/\*\*Suggested Actions\*\*/g, '<strong>Suggested Actions</strong>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        // Add a single <br> after each bullet or paragraph
                        .replace(/(\n- [^\n]+)(?=\n)/g, '$1<br>')
                        .replace(/([^\n])\n(?=[^\n])/g, '$1<br>'),
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

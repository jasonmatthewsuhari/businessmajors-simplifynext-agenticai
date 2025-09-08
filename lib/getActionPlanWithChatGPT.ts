// Use native fetch (browser or node >=18)

export async function getActionPlanWithChatGPT({ location, weather, situation }: { location: string; weather: string; situation: string }) {
  // Use a mock API key for demonstration
  const OPENAI_API_KEY = "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"
  const endpoint = "https://api.openai.com/v1/chat/completions"

  // Build prompt for ChatGPT
  const prompt = `You are a civic safety assistant. Create a protest action plan for the following:
Location: ${location}
Weather: ${weather}
Situation: ${situation}
List items to bring, precautions, and safety tips. Format as a checklist.`

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a civic safety assistant." },
      { role: "user", content: prompt },
    ],
    max_tokens: 300,
    temperature: 0.7,
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error("ChatGPT API error")
  const data = await res.json()
  return data.choices[0].message.content
}

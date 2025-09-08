// Utility to call OpenAI GPT for AWaS Assistant
export async function getAWaSChatGPTResponse(question: string, apiKey: string, webSnippets: Array<{title: string, link: string, snippet: string}> = []) {
  let webContext = ""
  if (webSnippets.length > 0) {
    webContext = "\n\nRecent web search results about this topic:" +
      webSnippets.map((item, idx) => `\n${idx + 1}. ${item.title} - ${item.link}\n${item.snippet}`).join("")
      + "\nUse these results to inform your answer, but do not copy text verbatim."
  }
  const systemPrompt = `You are AWaS, a civic awareness and safety assistant AI. Your task is to answer user questions about protests and civic events in real-time. Always provide clear, concise, and actionable guidance, focusing on safety, context, and civic literacy.\n\nWhen a user asks about a protest:\n1. Identify the location, date, and type of protest (if not given, infer from context or web search results).\n2. If the user's question is vague or lacks details, always select the closest or most relevant protest or civic event from the web search results and answer about that event.\n3. Provide a brief summary: what the protest is about, who is organizing it, and the main demands or causes.\n4. Provide safety guidance: risks, precautions, or areas to avoid.\n5. Suggest responsible actions: ways to participate safely, or alternative civic engagement if the user wants to support the cause.\n6. Prioritize user safety and neutrality. Never encourage unsafe or illegal actions.\n7. Keep responses short and mobile-friendly.\n\nExamples of user questions:\n- \"Is it safe to go to the protest in Jakarta tomorrow?\"\n- \"What are the demands of the protest near City Hall?\"\n- \"Which protests are happening near me today?\"\n\nFormat your answer like this:\n- **Summary**: [Brief context about the protest]\n- **Safety Advice**: [Guidance for staying safe]\n- **Suggested Actions**: [Optional ways to participate responsibly]\n\nIf you don’t have enough information, clearly indicate uncertainty and suggest safe alternatives. Always try to answer about the closest or most relevant protest or event found in the web search results.${webContext}`

  const url = "https://api.openai.com/v1/chat/completions"
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error("AWaS GPT API error")
  const data = await res.json()
  return data.choices?.[0]?.message?.content || "Unable to get response."
}

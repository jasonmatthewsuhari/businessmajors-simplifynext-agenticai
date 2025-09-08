// Google Custom Search API utility for web search
// Requires a valid API key and a Custom Search Engine (CSE) ID
export async function getWebSearchResults(query: string, apiKey: string, cseId: string) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cseId}&num=5`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Web search API error")
  const data = await res.json()
  // Return top 5 results as snippets
  return (data.items || []).map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
  }))
}

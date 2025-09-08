export async function getTraffic(lat: number, lon: number) {
  // Example using TomTom Traffic API (replace with your API key)
  const API_KEY = "MQgHPQRggCZlgqQH0pVoEtotdt4tPkGP"
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Traffic API error")
  return await res.json()
}

// You can swap TomTom for HERE, Google, or other traffic APIs as needed.

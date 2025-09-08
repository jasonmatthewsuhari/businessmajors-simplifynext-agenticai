export async function getWeather(lat: number, lon: number) {
  // Replace with your OpenWeatherMap API key
  const API_KEY = "f02c8284fedae9096c4ba540e787a996"
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Weather API error")
  return await res.json()
}

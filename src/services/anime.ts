const API_BASE = 'http://localhost:3001/api/anime'

export async function fetchCurrentSeason() {
  const response = await fetch(`${API_BASE}/season`)
  if (!response.ok) throw new Error('Failed to fetch season data')
  const data = await response.json()
  return data.shows
}

export async function fetchShow(id: number) {
  const response = await fetch(`${API_BASE}/show/${id}`)
  if (!response.ok) throw new Error('Failed to fetch show data')
  return response.json()
}

export async function searchAnime(query: string) {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Search failed')
  return response.json()
}

export function proxyImage(url: string | null): string {
  if (!url) return ''
  return `http://localhost:3001/api/anime/image?url=${encodeURIComponent(url)}`
}
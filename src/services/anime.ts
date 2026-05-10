import API from './api'
const API_BASE = `${API}/api/anime`

export async function fetchCurrentSeason() {
  const response = await fetch(`${API_BASE}/season`)
  if (!response.ok) throw new Error('Failed to fetch season data')
  const data = await response.json()
  return data.shows
}

export async function fetchSeasonalOnly() {
  const response = await fetch(`${API_BASE}/seasonal`)
  if (!response.ok) throw new Error('Failed to fetch seasonal data')
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
  return `${API}/api/anime/image?url=${encodeURIComponent(url)}`
}


export async function fetchTopAnime() {
  const response = await fetch(`${API_BASE}/top`)
  if (!response.ok) throw new Error('Failed to fetch top anime')
  const data = await response.json()
  return data.results
}

export async function fetchPopularAnime() {
  const response = await fetch(`${API_BASE}/popular`)
  if (!response.ok) throw new Error('Failed to fetch popular anime')
  const data = await response.json()
  return data.results
}
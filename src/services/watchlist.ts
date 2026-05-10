import API from './api'
const API_BASE = `${API}/api/watchlist`

const getToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token')

export async function addToWatchlist(show: {
  showId: number
  showName: string
  image: string | null
  totalEpisodes: number | null
  airingEpisode: number | null
  genres: string[]
}) {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ...show, status: 'planToWatch' }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message || 'Failed to add to watchlist')
  }

  return response.json()
}

export async function fetchWatchlist() {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(API_BASE, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Failed to fetch watchlist')
  return response.json()
}

export async function updateWatchlistEntry(showId: number, updates: {
  status?: string
  currentEpisode?: number
  airingEpisode?: number
  rating?: number
}) {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(`${API_BASE}/${showId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) throw new Error('Failed to update watchlist')
  return response.json()
}

export async function removeFromWatchlist(showId: number) {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(`${API_BASE}/${showId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Failed to remove from watchlist')
  return response.json()
}
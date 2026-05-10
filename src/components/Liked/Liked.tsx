import API from '../../services/api'
import { useState, useEffect } from 'react'
import { proxyImage } from '../../services/anime'

type WatchlistEntry = {
  showId: number
  showName: string
  image: string | null
  rating: number | null
  genres: string[]
}

type FriendWithWatchlist = {
  _id: string
  username: string
  displayName: string
  watchlist: WatchlistEntry[]
}

type RatedShow = {
  showId: number
  showName: string
  image: string | null
  rating: number
  friendNames: string[]
}

function Liked() {
  const [ratedShows, setRatedShows] = useState<RatedShow[]>([])
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchData = async () => {
      try {
        const friendsRes = await fetch(`${API}/api/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const friendsData = await friendsRes.json()

        if (!Array.isArray(friendsData) || friendsData.length === 0) {
          setLoading(false)
          return
        }

        const friendsWithWatchlists: FriendWithWatchlist[] = await Promise.all(
          friendsData.map(async (friend: FriendWithWatchlist) => {
            try {
              const res = await fetch(`${API}/api/watchlist/user/${friend._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              const watchlist = res.ok ? await res.json() : []
              return { ...friend, watchlist: Array.isArray(watchlist) ? watchlist : [] }
            } catch {
              return { ...friend, watchlist: [] }
            }
          })
        )

        const showMap: Record<number, RatedShow> = {}

        for (const friend of friendsWithWatchlists) {
          const friendName = friend.displayName || friend.username
          for (const entry of friend.watchlist) {
            if (!entry.rating || entry.rating < 7) continue
            if (!showMap[entry.showId]) {
              showMap[entry.showId] = {
                showId: entry.showId,
                showName: entry.showName,
                image: entry.image,
                rating: entry.rating,
                friendNames: [],
              }
            }
            showMap[entry.showId].friendNames.push(friendName)
            if (entry.rating > showMap[entry.showId].rating) {
              showMap[entry.showId].rating = entry.rating
            }
          }
        }

        const sorted = Object.values(showMap)
          .sort((a, b) => b.friendNames.length - a.friendNames.length || b.rating - a.rating)
          .slice(0, 5)

        setRatedShows(sorted)
      } catch (err) {
        console.error('Failed to load liked shows:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null
  if (ratedShows.length === 0) return null

  return (
    <div className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">What your nakama are loving</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">Rated highly by your friends</p>
          </div>
          <span
            onClick={() => window.location.href = '/friends'}
            className="text-[11px] text-[#D13924] cursor-pointer hover:underline"
          >
            See more
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ratedShows.map((show) => (
            <div
              key={show.showId}
              onClick={() => window.location.href = `/show/${show.showId}`}
              className="rounded-xl border border-white/7 overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all"
            >
              <div className="h-[120px] bg-[#0f0e0d] overflow-hidden">
                {show.image ? (
                  <img
                    src={proxyImage(show.image)}
                    alt={show.showName}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#5a5650] text-[11px]">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#1a1815]">
                <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.showName}</div>
                <div className="text-[10px] text-[#9a9590] mb-1 truncate">
                  Loved by{' '}
                  <span className="text-[#D13924]">
                    {show.friendNames.slice(0, 2).join(', ')}
                    {show.friendNames.length > 2 ? ` +${show.friendNames.length - 2}` : ''}
                  </span>
                </div>
                <div className="text-[10px] text-[#9a9590]">
                  ♥ {show.rating}/10 · {show.friendNames.length} {show.friendNames.length === 1 ? 'friend' : 'friends'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Liked
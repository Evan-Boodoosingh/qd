import { useState, useEffect } from 'react'
import { proxyImage } from '../../services/anime'

type WatchlistEntry = {
  showId: number
  showName: string
  image: string | null
  status: string
}

type Friend = {
  _id: string
  username: string
  displayName: string
  watchlist: WatchlistEntry[]
}

const getInitials = (displayName: string, username: string) => {
  const name = displayName || username
  return name.slice(0, 2).toUpperCase()
}

const colors = ['#c4622d', '#1D9E75', '#7F77DD', '#dcb43c', '#D13924', '#4A90D9']
const getColor = (id: string) => colors[id.charCodeAt(0) % colors.length]

function Friends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [myWatchlist, setMyWatchlist] = useState<WatchlistEntry[]>([])
 
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
   const [loading, setLoading] = useState(!!token)


  useEffect(() => {
  if (!token) return

    const fetchData = async () => {
      try {
        const [friendsRes, myListRes] = await Promise.all([
          fetch('http://localhost:3001/api/friends', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/watchlist', { headers: { Authorization: `Bearer ${token}` } }),
        ])

        const [friendsData, myListData] = await Promise.all([
          friendsRes.json(),
          myListRes.json(),
        ])

        setMyWatchlist(Array.isArray(myListData) ? myListData : [])

        if (Array.isArray(friendsData) && friendsData.length > 0) {
          const friendsWithWatchlists = await Promise.all(
            friendsData.map(async (friend: Friend) => {
              try {
                const res = await fetch(`http://localhost:3001/api/watchlist/user/${friend._id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                const watchlist = res.ok ? await res.json() : []
                return { ...friend, watchlist: Array.isArray(watchlist) ? watchlist : [] }
              } catch {
                return { ...friend, watchlist: [] }
              }
            })
          )
          setFriends(friendsWithWatchlists)
        } else {
          setFriends([])
        }
      } catch (err) {
        console.error('Failed to load friends component:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) return null

  if (friends.length === 0) return null

  const myShowIds = new Set(myWatchlist.map(e => e.showId))

  const friendsWithShared = friends
    .map(friend => ({
      ...friend,
      sharedShows: friend.watchlist.filter(e => myShowIds.has(e.showId)),
      watchingShows: friend.watchlist.filter(e => e.status === 'watching').slice(0, 3),
    }))
    .filter(friend => friend.watchlist.length > 0)
    .slice(0, 4)

  if (friendsWithShared.length === 0) return null

  return (
    <div className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">Your nakama are watching</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">Orange border means you both watch it</p>
          </div>
          <span
            onClick={() => window.location.href = '/friends'}
            className="text-[11px] text-[#D13924] cursor-pointer hover:underline"
          >
            See all friends
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {friendsWithShared.map((friend) => {
            const hasMatch = friend.sharedShows.length > 0
            const color = getColor(friend._id)
            const displayShows = friend.watchingShows.length > 0
              ? friend.watchingShows
              : friend.watchlist.slice(0, 3)

            return (
              <div
                key={friend._id}
                onClick={() => window.location.href = `/profile/${friend.username}`}
                className={`rounded-xl p-5 border flex flex-col gap-5 cursor-pointer transition-all ${
                  hasMatch
                    ? 'border-[#D13924]/35 bg-[#D13924]/04 hover:border-[#D13924]/60'
                    : 'border-white/7 bg-[#1a1815] hover:border-white/15'
                }`}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: `${color}35`, color }}
                  >
                    {getInitials(friend.displayName, friend.username)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#f0ede8] truncate">
                      {friend.displayName || friend.username}
                    </div>
                    <div className="text-[10px] text-[#9a9590]">@{friend.username}</div>
                  </div>
                </div>

                {/* Show cards */}
                <div className="flex gap-2 w-full">
                  {displayShows.map((show) => {
                    const isMatch = myShowIds.has(show.showId)
                    return (
                      <div
                        key={show.showId}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/show/${show.showId}`
                        }}
                        className={`flex-1 min-w-0 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center overflow-hidden h-[80px] ${
                          isMatch
                            ? 'border-[#D13924] bg-[#D13924]/09'
                            : 'border-white/7 bg-[#0f0e0d]'
                        }`}
                      >
                        {show.image ? (
                          <img
                            src={proxyImage(show.image)}
                            alt={show.showName}
                            className="w-full h-full object-cover opacity-70"
                          />
                        ) : (
                          <div className="text-[9px] text-[#c8c4be] leading-tight line-clamp-2 px-1">
                            {show.showName}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Action button */}
                {hasMatch ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/thread/new?showId=${friend.sharedShows[0].showId}&showName=${encodeURIComponent(friend.sharedShows[0].showName)}`
                    }}
                    className="w-full bg-[#D13924]/12 border border-[#D13924]/28 rounded-lg text-[#D13924] text-xs font-medium py-2.5 cursor-pointer hover:bg-[#D13924]/20"
                  >
                    Start a thread ›
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = '/schedule'
                    }}
                    className="w-full bg-white/4 border border-white/8 rounded-lg text-[#9a9590] text-xs py-2.5 cursor-pointer hover:bg-white/8"
                  >
                    + Add a show to your list
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Friends
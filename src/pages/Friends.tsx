import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import { toast } from '../components/Toast/toastService'

type WatchlistEntry = {
  showId: number
  showName: string
  status: string
  image: string | null
}

type Friend = {
  _id: string
  username: string
  displayName: string
}

type FriendRequest = {
  _id: string
  from: {
    _id: string
    username: string
    displayName: string
  }
  status: string
  createdAt: string
}

type SuggestedFriend = {
  _id: string
  username: string
  displayName: string
  sharedShows: number
}

type FriendWithWatchlist = Friend & {
  watchlist: WatchlistEntry[]
}

const getInitials = (displayName: string, username: string) => {
  const name = displayName || username
  return name.slice(0, 2).toUpperCase()
}

const colors = ['#c4622d', '#1D9E75', '#7F77DD', '#dcb43c', '#D13924', '#4A90D9']
const getColor = (id: string) => colors[id.charCodeAt(0) % colors.length]

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 1000 / 60 / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Friends() {
  const [friends, setFriends] = useState<FriendWithWatchlist[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [suggested, setSuggested] = useState<SuggestedFriend[]>([])
  const [myWatchlist, setMyWatchlist] = useState<WatchlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sentRequests, setSentRequests] = useState<string[]>([])
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  useEffect(() => {
    if (!token) return

    const fetchAll = async () => {
      try {
        const [friendsRes, requestsRes, suggestedRes, myListRes] = await Promise.all([
          fetch('http://localhost:3001/api/friends', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/friends/requests', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/friends/suggested', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/watchlist', { headers: { Authorization: `Bearer ${token}` } }),
        ])

        const [friendsData, requestsData, suggestedData, myListData] = await Promise.all([
          friendsRes.json(),
          requestsRes.json(),
          suggestedRes.json(),
          myListRes.json(),
        ])

        setMyWatchlist(Array.isArray(myListData) ? myListData : [])
        setRequests(Array.isArray(requestsData) ? requestsData : [])
        setSuggested(Array.isArray(suggestedData) ? suggestedData : [])

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
        console.error('Failed to load friends data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [token])

  const handleAccept = async (requestId: string) => {
  setRequests(prev => prev.filter(r => r._id !== requestId))
  try {
    await fetch(`http://localhost:3001/api/friends/request/${requestId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Friend request accepted')
  } catch {
    toast.error('Failed to accept request')
  }
}

const handleDecline = async (requestId: string) => {
  setRequests(prev => prev.filter(r => r._id !== requestId))
  try {
    await fetch(`http://localhost:3001/api/friends/request/${requestId}/decline`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Request declined')
  } catch {
    toast.error('Failed to decline request')
  }
}

  const handleRemoveFriend = async (friendId: string, name: string) => {
  if (!confirm(`Remove ${name} from friends?`)) return
  setFriends(prev => prev.filter(f => f._id !== friendId))
  try {
    await fetch(`http://localhost:3001/api/friends/${friendId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success(`Removed ${name}`)
  } catch {
    toast.error('Failed to remove friend')
  }
}

const handleAddSuggested = async (username: string, id: string) => {
  setSentRequests(prev => [...prev, id])
  try {
    await fetch(`http://localhost:3001/api/friends/request/${username}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Friend request sent')
  } catch {
    toast.error('Failed to send request')
  }
}

  const myShowIds = new Set(myWatchlist.map(e => e.showId))

  const watchingTogether = friends.filter(friend =>
    friend.watchlist.some(e => myShowIds.has(e.showId))
  )

  const getSharedShows = (friend: FriendWithWatchlist) =>
    friend.watchlist.filter(e => myShowIds.has(e.showId))

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading friends...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-6 py-8 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Friends</h1>
            <p className="text-[13px] text-[#9a9590]">Your nakama — the people you watch with</p>
          </div>
          <div className="flex items-center gap-4">
            {requests.length > 0 && (
              <div className="flex items-center gap-2 text-[12px] text-[#D13924]">
                <div className="w-2 h-2 rounded-full bg-[#D13924] animate-pulse" />
                {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
              </div>
            )}
            <div className="text-[12px] text-[#9a9590]">
              <span className="text-[#f0ede8] font-medium">{friends.length}</span> friends
            </div>
          </div>
        </div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-[#f0ede8]">Friend requests</h2>
              <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded-full border border-[#D13924]/25">
                {requests.length}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex flex-col gap-3">
              {requests.map((req) => {
                const color = getColor(req.from._id)
                return (
                  <div
                    key={req._id}
                    className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                      style={{ backgroundColor: `${color}25`, color }}
                    >
                      {getInitials(req.from.displayName, req.from.username)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-[#f0ede8]">{req.from.displayName || req.from.username}</div>
                      <div className="text-[11px] text-[#9a9590] mt-0.5">@{req.from.username} · {timeAgo(req.createdAt)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="text-[12px] text-white px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all font-medium"
                        style={{ backgroundColor: '#D13924' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req._id)}
                        className="text-[12px] text-[#9a9590] px-5 py-2 rounded-full cursor-pointer border border-white/10 hover:bg-white/5 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Watching Together — 3 column grid, max 3 shows per card */}
        {watchingTogether.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-[#f0ede8]">Watching together</h2>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[11px] text-[#9a9590]">{watchingTogether.length} nakama</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {watchingTogether.map((friend) => {
                const shared = getSharedShows(friend)
                const color = getColor(friend._id)
                const visibleShows = shared.slice(0, 3)
                const remaining = shared.length - 3
                return (
                  <div
                    key={friend._id}
                    onClick={() => window.location.href = `/profile/${friend.username}`}
                    className="bg-[#1a1815] border border-[#D13924]/20 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/50 transition-all flex flex-col gap-4"
                  >
                    {/* Friend info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: `${color}25`, color }}
                      >
                        {getInitials(friend.displayName, friend.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#f0ede8] truncate">{friend.displayName || friend.username}</div>
                        <div className="text-[11px] text-[#9a9590]">@{friend.username}</div>
                      </div>
                      <div className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {shared.length} shared
                      </div>
                    </div>

                    {/* Shared shows — max 3 */}
                    <div className="flex flex-col gap-1.5">
                      {visibleShows.map((show) => (
                        <div
                          key={show.showId}
                          className="flex items-center gap-2 bg-[#D13924]/06 border border-[#D13924]/15 rounded-lg px-3 py-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D13924] flex-shrink-0" />
                          <span className="text-[11px] text-[#c8c4be] truncate">{show.showName}</span>
                        </div>
                      ))}
                      {remaining > 0 && (
                        <div className="text-[10px] text-[#9a9590] text-center py-1">
                          +{remaining} more in common
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/thread/new?showName=${encodeURIComponent(visibleShows[0]?.showName || '')}`
                      }}
                      className="w-full text-[11px] font-medium py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-all mt-auto"
                      style={{ backgroundColor: '#D13924', color: '#fff' }}
                    >
                      Start a thread ›
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Friends */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-[#f0ede8]">All friends</h2>
            <span className="text-[11px] text-[#9a9590]">{friends.length} total</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {friends.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1815] border border-white/7 rounded-xl">
              <p className="text-[#9a9590] text-sm mb-1">No friends yet</p>
              <p className="text-[#5a5650] text-[12px]">Add people from the suggestions below</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map((friend) => {
                const color = getColor(friend._id)
                const shared = getSharedShows(friend)
                return (
                  <div
                    key={friend._id}
                    onClick={() => window.location.href = `/profile/${friend.username}`}
                    className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#D13924]/30 transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                      style={{ backgroundColor: `${color}25`, color }}
                    >
                      {getInitials(friend.displayName, friend.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#f0ede8]">{friend.displayName || friend.username}</div>
                      <div className="text-[11px] text-[#9a9590] mt-0.5">
                        @{friend.username}
                        {shared.length > 0 && (
                          <span className="text-[#D13924]"> · {shared.length} shows in common</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFriend(friend._id, friend.displayName || friend.username)
                        }}
                        className="text-[11px] text-[#5a5650] hover:text-red-400 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                      <span className="text-[11px] text-[#D13924]">View profile ›</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Suggested Friends — horizontal scroll */}
        {suggested.filter(s => !dismissedSuggestions.includes(s._id)).length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-[#f0ede8]">People you might know</h2>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[11px] text-[#9a9590]">Based on shared shows</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {suggested
                .filter(s => !dismissedSuggestions.includes(s._id))
                .map((person) => {
                  const color = getColor(person._id)
                  const sent = sentRequests.includes(person._id)
                  return (
                    <div
                      key={person._id}
                      className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex-shrink-0 w-[180px] hover:border-[#D13924]/30 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          {getInitials(person.displayName, person.username)}
                        </div>
                        {sent && (
                          <button
                            onClick={() => setDismissedSuggestions(prev => [...prev, person._id])}
                            className="text-[#5a5650] hover:text-[#9a9590] transition-all cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="text-[13px] font-medium text-[#f0ede8] truncate">{person.displayName || person.username}</div>
                        <div className="text-[11px] text-[#9a9590] truncate">@{person.username}</div>
                        <div className="text-[11px] text-[#9a9590] mt-1">
                          <span className="text-[#D13924]">{person.sharedShows}</span> in common
                        </div>
                      </div>

                      <button
                        onClick={() => !sent && handleAddSuggested(person.username, person._id)}
                        className="w-full text-[11px] font-medium py-2 rounded-full transition-all mt-auto"
                        style={{
                          backgroundColor: sent ? 'rgba(209,57,36,0.15)' : '#D13924',
                          color: sent ? '#D13924' : '#fff',
                          border: sent ? '1px solid rgba(209,57,36,0.3)' : 'none',
                          cursor: sent ? 'default' : 'pointer',
                        }}
                      >
                        {sent ? '✓ Sent' : '+ Add'}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Friends
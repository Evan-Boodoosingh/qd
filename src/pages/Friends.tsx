import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import { proxyImage } from '../services/anime'
import { toast } from '../components/Toast/toastService'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Settings } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

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

type FriendWithWatchlist = Friend & {
  watchlist: WatchlistEntry[]
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

type SentRequest = {
  _id: string
  username: string
  displayName: string
}

type Reply = {
  _id: string
  user: string
}

type Thread = {
  _id: string
  show: string
  showId: number
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  originalPost: string
  replies: Reply[]
  likes: string[]
  hasSpoiler: boolean
  username: string
  createdBy: string
  createdAt: string
}

type FriendThread = Thread & {
  participationType: 'created' | 'replied' | 'liked'
  friend: Friend
}

type MobileTab = 'watching' | 'threads' | 'people'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (displayName: string, username: string) => {
  const name = displayName || username
  return name.slice(0, 2).toUpperCase()
}

const colors = ['#c4622d', '#1D9E75', '#7F77DD', '#dcb43c', '#D13924', '#4A90D9']
const getColor = (id: string) => colors[id.charCodeAt(0) % colors.length]

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 1000 / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const participationLabel = (type: string, name: string) => {
  if (type === 'created') return `${name} started a thread`
  if (type === 'replied') return `${name} replied to this thread`
  if (type === 'liked') return `${name} liked this thread`
  return `${name} interacted with this thread`
}

// ─── SlidePanel ───────────────────────────────────────────────────────────────

type SlidePanelProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function SlidePanel({ open, onClose, title, children }: SlidePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#1a1815] border-l border-white/10 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <h2 className="text-[15px] font-medium text-[#f0ede8]">{title}</h2>
              <button
                onClick={onClose}
                className="text-[#9a9590] hover:text-[#f0ede8] transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── ThreadCard ───────────────────────────────────────────────────────────────

function ThreadCard({ thread }: { thread: FriendThread }) {
  const color = getColor(thread.friend._id)
  const name = thread.friend.displayName || thread.friend.username

  return (
    <div
      onClick={() => window.location.href = `/thread/${thread._id}`}
      className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0"
          style={{ backgroundColor: `${color}35`, color }}
        >
          {getInitials(thread.friend.displayName, thread.friend.username)}
        </div>
        <span className="text-[11px] text-[#9a9590]">{participationLabel(thread.participationType, name)}</span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full shrink-0 border ml-auto ${
          thread.threadType === 'episode'
            ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
            : thread.threadType === 'season'
            ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
            : 'bg-white/5 text-[#9a9590] border-white/10'
        }`}>
          {thread.threadType === 'episode' ? 'Episode' : thread.threadType === 'season' ? 'Season' : 'Show'}
        </span>
      </div>

      <div className="mb-2">
        <div className="text-[12px] text-[#D13924] font-medium truncate">
          {thread.show}
          {thread.threadType === 'episode' && ` — S${thread.season} Ep ${thread.episode}`}
          {thread.threadType === 'season' && ` — Season ${thread.season}`}
        </div>
        <div className="text-[13px] font-medium text-[#f0ede8] truncate">{thread.threadTitle}</div>
      </div>

      <div className={`text-[12px] text-[#9a9590] leading-relaxed bg-white/3 rounded-lg px-3 py-2 mb-3 line-clamp-2 ${
        thread.hasSpoiler ? 'blur-sm select-none' : ''
      }`}>
        {thread.originalPost}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#9a9590]">
            <span className="text-[#D13924]">{thread.replies.length}</span> replies
          </span>
          <span className="text-[11px] text-[#9a9590]">
            <span className="text-[#D13924]">{thread.likes.length}</span> likes
          </span>
          <span className="text-[10px] text-[#5a5650]">{timeAgo(thread.createdAt)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = `/thread/${thread._id}`
          }}
          className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
        >
          Join ›
        </button>
      </div>
    </div>
  )
}

// ─── WatchingCard ─────────────────────────────────────────────────────────────

function WatchingCard({ friend, myShowIds }: { friend: FriendWithWatchlist, myShowIds: Set<number> }) {
  const color = getColor(friend._id)
  const watching = friend.watchlist.filter(e => e.status === 'watching').slice(0, 3)
  if (watching.length === 0) return null

  return (
    <div
      onClick={() => window.location.href = `/profile/${friend.username}`}
      className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ backgroundColor: `${color}35`, color }}
        >
          {getInitials(friend.displayName, friend.username)}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#f0ede8] truncate">
            {friend.displayName || friend.username}
          </div>
          <div className="text-[11px] text-[#9a9590]">@{friend.username}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {watching.map((show) => {
          const isShared = myShowIds.has(show.showId)
          return (
            <div
              key={show.showId}
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `/show/${show.showId}`
              }}
              className={`flex-1 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                isShared ? 'border-[#D13924]' : 'border-white/10'
              }`}
              style={{ aspectRatio: '3/4' }}
            >
              {show.image ? (
                <img
                  src={proxyImage(show.image)}
                  alt={show.showName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#0f0e0d] flex items-center justify-center p-1">
                  <span className="text-[9px] text-[#9a9590] text-center leading-tight">{show.showName}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {watching.some(s => myShowIds.has(s.showId)) && (
        <div className="mt-2 text-[10px] text-[#D13924]">● Orange border = you both watch it</div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function Friends() {
  const [friends, setFriends] = useState<FriendWithWatchlist[]>([])
  const [friendThreads, setFriendThreads] = useState<FriendThread[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [sentRequestsList, setSentRequestsList] = useState<SentRequest[]>([])
  const [suggested, setSuggested] = useState<SuggestedFriend[]>([])
  const [myWatchlist, setMyWatchlist] = useState<WatchlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileTab, setMobileTab] = useState<MobileTab>('watching')
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [sentRequests, setSentRequests] = useState<string[]>([])
  const [requestsTab, setRequestsTab] = useState<'received' | 'sent'>('received')

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  useEffect(() => {
    if (!token) return

    const fetchAll = async () => {
      try {
        const [friendsRes, requestsRes, sentRequestsRes, suggestedRes, myListRes, threadsRes] = await Promise.all([
          fetch('http://localhost:3001/api/friends', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/friends/requests', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/friends/requests/sent', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/friends/suggested', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/watchlist', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/threads'),
        ])

        const [friendsData, requestsData, sentRequestsData, suggestedData, myListData, threadsData] = await Promise.all([
          friendsRes.json(),
          requestsRes.json(),
          sentRequestsRes.json(),
          suggestedRes.json(),
          myListRes.json(),
          threadsRes.json(),
        ])

        const myList = Array.isArray(myListData) ? myListData : []
        setMyWatchlist(myList)
        setRequests(Array.isArray(requestsData) ? requestsData : [])
        setSentRequestsList(Array.isArray(sentRequestsData) ? sentRequestsData : [])
        setSuggested(Array.isArray(suggestedData) ? suggestedData : [])

        const friendsList: Friend[] = Array.isArray(friendsData) ? friendsData : []

        const friendsWithWatchlists = await Promise.all(
          friendsList.map(async (friend) => {
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

        if (Array.isArray(threadsData) && friendsList.length > 0) {
          const friendMap: Record<string, Friend> = {}
          for (const f of friendsList) friendMap[f._id] = f

          const enriched: FriendThread[] = []

          for (const thread of threadsData) {
            const creator = friendMap[thread.createdBy]
            if (creator) {
              enriched.push({ ...thread, participationType: 'created', friend: creator })
              continue
            }

            const replierFriend = thread.replies?.find((r: Reply) => friendMap[r.user])
            if (replierFriend) {
              enriched.push({ ...thread, participationType: 'replied', friend: friendMap[replierFriend.user] })
              continue
            }

            const likerFriend = thread.likes?.find((id: string) => friendMap[id])
            if (likerFriend) {
              enriched.push({ ...thread, participationType: 'liked', friend: friendMap[likerFriend] })
            }
          }

          setFriendThreads(
            enriched
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 20)
          )
        }
      } catch (err) {
        console.error('Failed to load friends:', err)
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
      const res = await fetch(`http://localhost:3001/api/friends/request/${username}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok && data.message !== 'Already friends' && data.message !== 'Request already sent') {
        setSentRequests(prev => prev.filter(i => i !== id))
      }
    } catch {
      setSentRequests(prev => prev.filter(i => i !== id))
    }
  }

  const myShowIds = new Set(myWatchlist.map(e => e.showId))
  const friendsWithWatching = friends.filter(f => f.watchlist.some(e => e.status === 'watching'))
  const totalPending = requests.length

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

      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Friends</h1>
            <p className="text-[13px] text-[#9a9590]">
              {friends.length} nakama · {friendsWithWatching.length} currently watching
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRequestsOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a1815] border border-white/7 hover:border-white/15 transition-all cursor-pointer"
            >
              <Users size={16} className="text-[#9a9590]" />
              {totalPending > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D13924] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalPending}
                </span>
              )}
            </button>
            <button
              onClick={() => setManageOpen(true)}
              className="flex items-center px-3 py-2 rounded-xl bg-[#1a1815] border border-white/7 hover:border-white/15 transition-all cursor-pointer"
            >
              <Settings size={16} className="text-[#9a9590]" />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex lg:hidden gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 mb-6 w-fit">
          {(['watching', 'threads', 'people'] as MobileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`px-4 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all capitalize ${
                mobileTab === tab ? 'text-white' : 'text-[#9a9590]'
              }`}
              style={mobileTab === tab ? { backgroundColor: '#D13924' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Desktop two-column / Mobile tabs */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Left — Threads */}
          <div className={`flex flex-col gap-4 ${mobileTab !== 'threads' ? 'hidden lg:flex' : ''}`}>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-sm font-medium text-[#f0ede8]">Friend activity</h2>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[11px] text-[#9a9590]">{friendThreads.length} threads</span>
            </div>

            {friendThreads.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1815] border border-white/7 rounded-xl">
                <p className="text-[#9a9590] text-sm mb-1">No activity yet</p>
                <p className="text-[#5a5650] text-[12px]">When your friends post or engage with threads you'll see it here</p>
                <button
                  onClick={() => window.location.href = '/community'}
                  className="mt-4 text-[12px] text-[#D13924] cursor-pointer hover:underline"
                >
                  Browse community threads ›
                </button>
              </div>
            ) : (
              friendThreads.map(thread => (
                <ThreadCard key={`${thread._id}-${thread.participationType}`} thread={thread} />
              ))
            )}
          </div>

          {/* Right — Watching */}
          <div className={`flex flex-col gap-4 ${mobileTab !== 'watching' ? 'hidden lg:flex' : ''}`}>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-sm font-medium text-[#f0ede8]">Currently watching</h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {friendsWithWatching.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1815] border border-white/7 rounded-xl">
                <p className="text-[#9a9590] text-sm">None of your friends are watching anything right now</p>
              </div>
            ) : (
              friendsWithWatching.map(friend => (
                <WatchingCard key={friend._id} friend={friend} myShowIds={myShowIds} />
              ))
            )}
          </div>

          {/* People — mobile only */}
          <div className={`lg:hidden flex flex-col gap-3 ${mobileTab !== 'people' ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-sm font-medium text-[#f0ede8]">All friends</h2>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[11px] text-[#9a9590]">{friends.length} total</span>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1815] border border-white/7 rounded-xl">
                <p className="text-[#9a9590] text-sm mb-1">No friends yet</p>
                <p className="text-[#5a5650] text-[12px]">Use the ⚙️ button to find people</p>
              </div>
            ) : (
              friends.map(friend => {
                const color = getColor(friend._id)
                const shared = friend.watchlist.filter(e => myShowIds.has(e.showId))
                return (
                  <div
                    key={friend._id}
                    onClick={() => window.location.href = `/profile/${friend.username}`}
                    className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#D13924]/30 transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ backgroundColor: `${color}35`, color }}
                    >
                      {getInitials(friend.displayName, friend.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#f0ede8] truncate">{friend.displayName || friend.username}</div>
                      <div className="text-[11px] text-[#9a9590] truncate">
                        @{friend.username}
                        {shared.length > 0 && <span className="text-[#D13924]"> · {shared.length} in common</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#D13924] shrink-0">View ›</span>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>

      {/* Friend Requests Panel */}
     <SlidePanel open={requestsOpen} onClose={() => setRequestsOpen(false)} title="Requests">

  {/* Toggle */}
  <div className="flex gap-1 bg-[#0f0e0d] border border-white/7 rounded-xl p-1 mb-6">
    <button
      onClick={() => setRequestsTab('received')}
      className={`flex-1 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
        requestsTab === 'received' ? 'text-white' : 'text-[#9a9590]'
      }`}
      style={requestsTab === 'received' ? { backgroundColor: '#D13924' } : {}}
    >
      Received
      {requests.length > 0 && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${requestsTab === 'received' ? 'bg-white/20' : 'bg-white/10'}`}>
          {requests.length}
        </span>
      )}
    </button>
    <button
      onClick={() => setRequestsTab('sent')}
      className={`flex-1 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
        requestsTab === 'sent' ? 'text-white' : 'text-[#9a9590]'
      }`}
      style={requestsTab === 'sent' ? { backgroundColor: '#D13924' } : {}}
    >
      Sent
      {sentRequestsList.length > 0 && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${requestsTab === 'sent' ? 'bg-white/20' : 'bg-white/10'}`}>
          {sentRequestsList.length}
        </span>
      )}
    </button>
  </div>

  {/* Received tab */}
  {requestsTab === 'received' && (
    <>
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#9a9590] text-sm">No pending requests</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => {
            const color = getColor(req.from._id)
            return (
              <div key={req._id} className="bg-[#0f0e0d] border border-white/7 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {getInitials(req.from.displayName, req.from.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#f0ede8]">{req.from.displayName || req.from.username}</div>
                    <div className="text-[11px] text-[#9a9590]">@{req.from.username}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="flex-1 text-[12px] text-white py-2 rounded-full cursor-pointer hover:opacity-90 transition-all font-medium"
                    style={{ backgroundColor: '#D13924' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req._id)}
                    className="flex-1 text-[12px] text-[#9a9590] py-2 rounded-full cursor-pointer border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )}

  {/* Sent tab */}
  {requestsTab === 'sent' && (
    <>
      {sentRequestsList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#9a9590] text-sm">No sent requests</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sentRequestsList.map(person => {
            const color = getColor(person._id)
            return (
              <div key={person._id} className="flex items-center gap-3 py-2 border-b border-white/5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ backgroundColor: `${color}25`, color }}
                >
                  {getInitials(person.displayName, person.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#f0ede8] truncate">{person.displayName || person.username}</div>
                  <div className="text-[11px] text-[#9a9590]">@{person.username}</div>
                </div>
                <span className="text-[11px] text-[#9a9590] border border-white/10 px-2.5 py-1 rounded-full shrink-0">
                  Pending
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )}

</SlidePanel>

      {/* Manage Friends Panel */}
      <SlidePanel open={manageOpen} onClose={() => setManageOpen(false)} title="Manage Friends">
        <div className="mb-8">
          <h3 className="text-[12px] text-[#9a9590] uppercase tracking-wider mb-3">Your friends</h3>
          {friends.length === 0 ? (
            <p className="text-[#5a5650] text-sm">No friends yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map(friend => {
                const color = getColor(friend._id)
                return (
                  <div key={friend._id} className="flex items-center gap-3 py-2 border-b border-white/5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ backgroundColor: `${color}25`, color }}
                    >
                      {getInitials(friend.displayName, friend.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#f0ede8] truncate">{friend.displayName || friend.username}</div>
                      <div className="text-[11px] text-[#9a9590]">@{friend.username}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend._id, friend.displayName || friend.username)}
                      className="text-[11px] text-[#5a5650] hover:text-red-400 transition-all cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Suggested */}
        {suggested.filter(s => !friends.some(f => f._id === s._id)).length > 0 && (
          <div>
            <h3 className="text-[12px] text-[#9a9590] uppercase tracking-wider mb-3">People you might know</h3>
            <div className="flex flex-col gap-3">
              {suggested
                .filter(s => !friends.some(f => f._id === s._id))
                .map(person => {
                  const color = getColor(person._id)
                  const sent = sentRequests.includes(person._id)
                  return (
                    <div key={person._id} className="flex items-center gap-3 py-2 border-b border-white/5">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                        style={{ backgroundColor: `${color}25`, color }}
                      >
                        {getInitials(person.displayName, person.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-[#f0ede8] truncate">{person.displayName || person.username}</div>
                        <div className="text-[11px] text-[#9a9590]">
                          <span className="text-[#D13924]">{person.sharedShows}</span> in common
                        </div>
                      </div>
                      <button
                        onClick={() => !sent && handleAddSuggested(person.username, person._id)}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-full shrink-0 transition-all"
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
      </SlidePanel>

    </div>
  )
}

export default Friends
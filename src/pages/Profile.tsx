import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav/Nav'
import { proxyImage } from '../services/anime'

type WatchlistEntry = {
  _id: string
  showId: number
  showName: string
  image: string | null
  status: string
  currentEpisode: number
  totalEpisodes: number | null
  rating: number | null
  genres: string[]
}

type Thread = {
  _id: string
  show: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  replies: { _id: string }[]
  createdAt: string
}

type ProfileUser = {
  _id: string
  username: string
  displayName: string
  bio: string
  avatar: string
  friends: string[]
  createdAt: string
}

type ProfileData = {
  user: ProfileUser
  stats: {
    showsWatched: number
    episodesWatched: number
    daysWatched: number
    discussionsStarted: number
  }
  watchlist: WatchlistEntry[]
  threads: Thread[]
}

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 1000 / 60 / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

function Profile() {
  const { username } = useParams<{ username: string }>()
  const [activeTab, setActiveTab] = useState<'watching' | 'favorites' | 'discussions'>('watching')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [compatibility, setCompatibility] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'requested'>('none')
  const [friendRequestLoading, setFriendRequestLoading] = useState(false)

  const stored = localStorage.getItem('user') || sessionStorage.getItem('user')
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const loggedInUser = stored ? JSON.parse(stored) : null
  const isOwnProfile = loggedInUser?.username === username
  const isLoggedIn = !!loggedInUser

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`http://localhost:3001/api/users/profile/${username}`)
        if (!res.ok) throw new Error('User not found')
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  useEffect(() => {
    if (!profile || isOwnProfile || !isLoggedIn || !token) return

    const checkFriendStatus = async () => {
      try {
        const friendsRes = await fetch('http://localhost:3001/api/friends', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const friendsData = await friendsRes.json()
        if (Array.isArray(friendsData)) {
          const isFriend = friendsData.some((f: { _id: string }) => f._id === profile.user._id)
          if (isFriend) {
            setFriendStatus('friends')
            return
          }
        }

        const compatRes = await fetch(`http://localhost:3001/api/friends/compatibility/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const compatData = await compatRes.json()
        setCompatibility(compatData.compatibility)
      } catch {
        // non-critical, fail silently
      }
    }

    checkFriendStatus()
  }, [profile, username, isOwnProfile, isLoggedIn, token])

  const handleAddFriend = async () => {
    if (!token) return
    try {
      setFriendRequestLoading(true)
      const res = await fetch(`http://localhost:3001/api/friends/request/${username}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok || data.message === 'Request already sent') {
        setFriendStatus('requested')
      }
    } catch {
      // fail silently
    } finally {
      setFriendRequestLoading(false)
    }
  }

  const watching = profile?.watchlist.filter(e => e.status === 'watching') || []
  const favorites = profile?.watchlist
    .filter(e => e.rating && e.rating >= 8)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0)) || []

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto">
          <div className="bg-[#1a1815] border border-white/7 rounded-2xl p-6 md:p-8 animate-pulse">
            <div className="flex gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-white/5 rounded w-1/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="px-4 py-8 max-w-5xl mx-auto text-center">
          <div className="text-[#9a9590] text-[13px]">User not found.</div>
        </div>
      </div>
    )
  }

  const initials = (profile.user.displayName || profile.user.username).slice(0, 2).toUpperCase()

  const actionButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={() => window.location.href = '/profile/edit'}
          className="text-[13px] text-[#f0ede8] border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 cursor-pointer transition-all"
        >
          Edit profile
        </button>
      )
    }
    if (!isLoggedIn) return null
    if (friendStatus === 'friends') {
      return (
        <span className="text-[12px] text-[#9a9590] border border-white/10 px-4 py-1.5 rounded-full">
          ✓ Friends
        </span>
      )
    }
    if (friendStatus === 'requested') {
      return (
        <span className="text-[12px] text-[#9a9590] border border-white/10 px-4 py-1.5 rounded-full">
          Request sent
        </span>
      )
    }
    return (
      <button
        onClick={handleAddFriend}
        disabled={friendRequestLoading}
        className="text-[12px] text-white px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
        style={{ backgroundColor: '#D13924' }}
      >
        {friendRequestLoading ? 'Sending...' : '+ Add friend'}
      </button>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-4 md:px-6 py-6 md:py-8 max-w-5xl mx-auto">

        {/* Profile Header */}
        <div className="bg-[#1a1815] border border-white/7 rounded-2xl p-5 md:p-8 mb-6">

          {/* Top row */}
          <div className="flex items-start gap-4 md:gap-6">

            {/* Avatar */}
            <div
              className="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-lg md:text-2xl font-semibold shrink-0"
              style={{ backgroundColor: '#D13924', color: '#fff' }}
            >
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg md:text-xl font-medium text-[#f0ede8]">
                  {profile.user.displayName || profile.user.username}
                </h1>
                <span className="text-[12px] md:text-[13px] text-[#9a9590]">@{profile.user.username}</span>
              </div>
              {profile.user.bio && (
                <p className="text-[12px] md:text-[13px] text-[#c8c4be] mb-2 leading-relaxed">{profile.user.bio}</p>
              )}
              <span className="text-[11px] text-[#5a5650]">
                Member since {formatDate(profile.user.createdAt)}
              </span>
            </div>

            {/* Action — desktop */}
            <div className="hidden md:flex flex-col items-center gap-2 shrink-0">
              {compatibility !== null && friendStatus === 'none' && !isOwnProfile && (
                <div className="text-center mb-1">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-1"
                    style={{ backgroundColor: '#D13924', color: '#fff' }}
                  >
                    {compatibility}%
                  </div>
                  <span className="text-[10px] text-[#9a9590]">compatible</span>
                </div>
              )}
              {actionButton()}
            </div>

          </div>

          {/* Action — mobile */}
          <div className="flex md:hidden items-center gap-3 mt-4">
            {compatibility !== null && friendStatus === 'none' && !isOwnProfile && (
              <div className="flex items-center gap-2 text-[12px] text-[#9a9590]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  style={{ backgroundColor: '#D13924', color: '#fff' }}
                >
                  {compatibility}%
                </div>
                <span>compatible</span>
              </div>
            )}
            {actionButton()}
          </div>

        {/* Stats — single row all screen sizes */}
          <div className="grid grid-cols-5 gap-2 mt-5 md:mt-6 pt-5 md:pt-6 border-t border-white/5">
            {[
              { label: 'Shows', value: profile.stats.showsWatched },
              { label: 'Episodes', value: profile.stats.episodesWatched.toLocaleString() },
              { label: 'Days', value: profile.stats.daysWatched },
              { label: 'Threads', value: profile.stats.discussionsStarted },
              { label: 'Friends', value: profile.user.friends?.length || 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-sm md:text-lg font-medium text-[#f0ede8]">{stat.value}</div>
                <div className="text-[8px] md:text-[10px] text-[#9a9590] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 mb-6 w-fit">
          {[
            { label: 'Watching', value: 'watching' },
            { label: 'Favorites', value: 'favorites' },
            { label: 'Discussions', value: 'discussions' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as 'watching' | 'favorites' | 'discussions')}
              className={`px-4 md:px-5 py-2 rounded-lg text-[12px] md:text-sm font-medium cursor-pointer transition-all ${
                activeTab === tab.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
              }`}
              style={activeTab === tab.value ? { backgroundColor: '#D13924' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Watching tab */}
        {activeTab === 'watching' && (
          watching.length === 0 ? (
            <div className="text-center py-16 text-[#9a9590] text-[13px]">
              {isOwnProfile
                ? "You're not watching anything right now."
                : `${profile.user.username} isn't watching anything right now.`}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {watching.map((show) => (
                <div
                  key={show._id}
                  onClick={() => window.location.href = `/show/${show.showId}`}
                  className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden hover:border-[#D13924]/30 transition-all cursor-pointer flex"
                >
                  {/* Poster */}
                  <div className="w-20 h-28 bg-[#0f0e0d] overflow-hidden shrink-0">
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

                  {/* Content */}
                  <div className="p-3 flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-[#f0ede8] mb-0.5 truncate">{show.showName}</div>
                      <div className="text-[11px] text-[#9a9590] truncate">{show.genres.slice(0, 2).join(' · ')}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#9a9590]">Progress</span>
                        <span className="text-[10px] text-[#f0ede8]">
                          {show.currentEpisode} / {show.totalEpisodes || '?'}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: show.totalEpisodes
                              ? `${(show.currentEpisode / show.totalEpisodes) * 100}%`
                              : '0%',
                            backgroundColor: '#D13924'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Favorites tab */}
        {activeTab === 'favorites' && (
          favorites.length === 0 ? (
            <div className="text-center py-16 text-[#9a9590] text-[13px]">
              {isOwnProfile
                ? "Rate shows 8 or higher to see them here."
                : `${profile.user.username} hasn't rated any shows yet.`}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((show, index) => (
                <div
                  key={show._id}
                  onClick={() => window.location.href = `/show/${show.showId}`}
                  className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden hover:border-[#D13924]/30 transition-all cursor-pointer"
                >
                  <div className="relative bg-[#0f0e0d] overflow-hidden" style={{ height: '120px' }}>
                    {show.image ? (
                      <img
                        src={proxyImage(show.image)}
                        alt={show.showName}
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0f0e0d]" />
                    )}
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#D13924] flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-white">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.showName}</div>
                    <div className="text-[9px] text-[#9a9590]">{show.genres.slice(0, 2).join(' · ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Discussions tab */}
        {activeTab === 'discussions' && (
          profile.threads.length === 0 ? (
            <div className="text-center py-16 text-[#9a9590] text-[13px]">
              {isOwnProfile
                ? "You haven't started any discussions yet."
                : `${profile.user.username} hasn't started any discussions yet.`}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {profile.threads.map((thread) => (
                <div
                  key={thread._id}
                  onClick={() => window.location.href = `/thread/${thread._id}`}
                  className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#9a9590]">Thread about</div>
                      <div className="text-[13px] text-[#D13924] font-medium truncate">
                        {thread.show} — {thread.threadTitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                     <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                        thread.threadType === 'episode'
                          ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                          : 'bg-white/5 text-[#9a9590] border-white/10'
                      }`}>
                        {thread.threadType === 'episode' ? 'Episode' : 'Show'}
                      </span>
                      <span className="text-[10px] text-[#5a5650]">{timeAgo(thread.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#9a9590]">
                    <span className="text-[#D13924]">{thread.replies.length}</span> replies
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  )
}

export default Profile
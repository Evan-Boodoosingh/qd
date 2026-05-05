import { useState, useEffect } from 'react'

type Friend = {
  _id: string
  username: string
  displayName: string
}

type Thread = {
  _id: string
  show: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  originalPost: string
  replies: any[]
  createdBy: string
  username: string
  createdAt: string
  hasSpoiler: boolean
}

type ThreadWithFriends = Thread & {
  friendParticipants: Friend[]
}

const colors = ['#c4622d', '#1D9E75', '#7F77DD', '#dcb43c', '#D13924', '#4A90D9']
const getColor = (id: string) => colors[id.charCodeAt(0) % colors.length]

const getInitials = (displayName: string, username: string) => {
  const name = displayName || username
  return name.slice(0, 2).toUpperCase()
}

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 1000 / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Discussions() {
  const [threads, setThreads] = useState<ThreadWithFriends[]>([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [friendsRes, threadsRes] = await Promise.all([
          fetch('http://localhost:3001/api/friends', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/threads'),
        ])

        const [friendsData, threadsData] = await Promise.all([
          friendsRes.json(),
          threadsRes.json(),
        ])

        if (!Array.isArray(friendsData) || friendsData.length === 0) {
          setLoading(false)
          return
        }

        if (!Array.isArray(threadsData)) {
          setLoading(false)
          return
        }

        const friendIds = new Set(friendsData.map((f: Friend) => f._id))
        const friendMap: Record<string, Friend> = {}
        for (const f of friendsData) friendMap[f._id] = f

        // Filter threads created by friends
        const friendThreads: ThreadWithFriends[] = threadsData
          .filter((t: Thread) => friendIds.has(t.createdBy))
          .map((t: Thread) => ({
            ...t,
            friendParticipants: [friendMap[t.createdBy]].filter(Boolean),
          }))
          .sort((a: Thread, b: Thread) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3)

        setThreads(friendThreads)
      } catch (err) {
        console.error('Failed to load discussions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) return null

if (threads.length === 0) {
  return (
    <div className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">Active discussions in your circle</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">Threads your mutuals are already talking in</p>
          </div>
          <span
            onClick={() => window.location.href = '/community'}
            className="text-[11px] text-[#D13924] cursor-pointer hover:underline"
          >
            See all threads
          </span>
        </div>
        <div className="text-center py-12 bg-[#1a1815] border border-white/7 rounded-xl">
          <p className="text-[#9a9590] text-sm mb-1">No active discussions yet</p>
          <p className="text-[#5a5650] text-[12px]">When your friends start threads you'll see them here</p>
        </div>
      </div>
    </div>
  )
}
  return (
    <div className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">Active discussions in your circle</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">Threads your mutuals are already talking in</p>
          </div>
          <span
            onClick={() => window.location.href = '/community'}
            className="text-[11px] text-[#D13924] cursor-pointer hover:underline"
          >
            See all threads
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <div
              key={thread._id}
              onClick={() => window.location.href = `/thread/${thread._id}`}
              className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Friend avatars */}
                <div className="flex">
                  {thread.friendParticipants.map((p, j) => {
                    const color = getColor(p._id)
                    return (
                      <div
                        key={p._id}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-[#1a1815]"
                        style={{
                          backgroundColor: `${color}35`,
                          color,
                          marginLeft: j === 0 ? 0 : '-8px',
                          zIndex: thread.friendParticipants.length - j,
                          position: 'relative',
                        }}
                      >
                        {getInitials(p.displayName, p.username)}
                      </div>
                    )
                  })}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#9a9590]">
                    {thread.friendParticipants.length === 1
                      ? `${thread.friendParticipants[0].displayName || thread.friendParticipants[0].username} started a thread`
                      : `${thread.friendParticipants.length} friends talking about`}
                  </div>
                  <div className="text-[12px] text-[#D13924] font-medium truncate">
                    {thread.show} —{' '}
                    {thread.threadType === 'episode' && `S${thread.season} Ep ${thread.episode} · `}
                    {thread.threadType === 'season' && `Season ${thread.season} · `}
                    {thread.threadTitle}
                  </div>
                </div>

                <span className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 border ${
                  thread.threadType === 'episode'
                    ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                    : thread.threadType === 'season'
                    ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
                    : 'bg-white/5 text-[#9a9590] border-white/10'
                }`}>
                  {thread.threadType === 'episode' ? 'Episode' : thread.threadType === 'season' ? 'Season' : 'Show'}
                </span>

                <span className="text-[10px] text-[#5a5650] flex-shrink-0">{timeAgo(thread.createdAt)}</span>
              </div>

              <div className={`text-[12px] text-[#c8c4be] leading-relaxed bg-white/3 rounded-lg px-3 py-2.5 mb-3 line-clamp-2 ${
                thread.hasSpoiler ? 'blur-sm select-none' : ''
              }`}>
                {thread.originalPost}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9a9590]">
                  <span className="text-[#D13924]">{thread.replies.length} replies</span> · {thread.friendParticipants.length} of your friends
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/thread/${thread._id}`
                  }}
                  className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
                >
                  Join thread ›
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Discussions
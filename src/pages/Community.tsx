import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'

type ThreadType = 'episode' | 'season' | 'show'
type SortType = 'mostActive' | 'newest' | 'mostLiked'

type Reply = {
  _id: string
}

type Thread = {
  _id: string
  show: string
  showId: number
  genres: string[]
  threadTitle: string
  threadType: ThreadType
  season?: number
  episode?: number
  originalPost: string
  replies: Reply[]
  likes: string[]
  hasSpoiler: boolean
  spoilerReports: number
  username: string
  createdAt: string
}

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 1000 / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Community() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('mostActive')
  const [threadFilter, setThreadFilter] = useState<ThreadType | 'all'>('all')
  const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([])
  const [reportedSpoilers, setReportedSpoilers] = useState<string[]>([])

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    fetch('http://localhost:3001/api/threads')
      .then(res => res.json())
      .then(data => {
        setThreads(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const isSpoiler = (thread: Thread) =>
    thread.hasSpoiler || thread.spoilerReports >= 5 || reportedSpoilers.includes(thread._id)

  const isRevealed = (id: string) => revealedSpoilers.includes(id)

  const sortedAndFiltered = threads
    .filter(t => threadFilter === 'all' || t.threadType === threadFilter)
    .sort((a, b) => {
      if (sortBy === 'mostActive') return b.replies.length - a.replies.length
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'mostLiked') return b.likes.length - a.likes.length
      return 0
    })

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading discussions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-4 md:px-6 py-6 md:py-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Community</h1>
            <p className="text-[13px] text-[#9a9590]">What the anime community is talking about</p>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => window.location.href = '/thread/new'}
              className="text-[12px] md:text-[13px] text-white font-medium px-4 md:px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all shrink-0"
              style={{ backgroundColor: '#D13924' }}
            >
              + New thread
            </button>
          )}
        </div>

        {/* Filters — stack on mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-5 md:mb-6">

          {/* Sort */}
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-full sm:w-auto">
            {([
              { label: 'Active', value: 'mostActive' },
              { label: 'Newest', value: 'newest' },
              { label: 'Liked', value: 'mostLiked' },
            ] as { label: string; value: SortType }[]).map((s) => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all whitespace-nowrap ${
                  sortBy === s.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={sortBy === s.value ? { backgroundColor: '#D13924' } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-full sm:w-auto">
            {([
              { label: 'All', value: 'all' },
              { label: 'Episode', value: 'episode' },
              { label: 'Season', value: 'season' },
              { label: 'Show', value: 'show' },
            ] as { label: string; value: ThreadType | 'all' }[]).map((t) => (
              <button
                key={t.value}
                onClick={() => setThreadFilter(t.value)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all whitespace-nowrap ${
                  threadFilter === t.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={threadFilter === t.value ? { backgroundColor: '#D13924' } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

        {/* Thread count */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[12px] text-[#9a9590]">{sortedAndFiltered.length} threads</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Empty state */}
        {sortedAndFiltered.length === 0 && (
          <div className="text-center py-20 bg-[#1a1815] border border-white/7 rounded-xl">
            <p className="text-[#9a9590] text-sm mb-2">No threads yet</p>
            <p className="text-[#5a5650] text-[12px]">Be the first to start a discussion</p>
          </div>
        )}

        {/* Threads */}
        <div className="flex flex-col gap-3">
          {sortedAndFiltered.map((thread) => {
            const spoiler = isSpoiler(thread)
            const revealed = isRevealed(thread._id)
            const alreadyReported = reportedSpoilers.includes(thread._id)

            return (
              <div
                key={thread._id}
                onClick={() => window.location.href = `/thread/${thread._id}`}
                className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
              >
                {/* Thread header */}
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#9a9590] mb-0.5 truncate">
                      {thread.threadType === 'episode' && `${thread.show} — S${thread.season} Ep ${thread.episode}`}
                      {thread.threadType === 'season' && `${thread.show} — Season ${thread.season}`}
                      {thread.threadType === 'show' && thread.show}
                    </div>
                    <div className="text-[13px] font-medium text-[#f0ede8] truncate">{thread.threadTitle}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {spoiler && (
                      <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full hidden sm:inline">
                        ⚠ Spoiler
                      </span>
                    )}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                      thread.threadType === 'episode'
                        ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                        : thread.threadType === 'season'
                        ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
                        : 'bg-white/5 text-[#9a9590] border-white/10'
                    }`}>
                      {thread.threadType === 'episode' ? 'Ep' : thread.threadType === 'season' ? 'Season' : 'Show'}
                    </span>
                    <span className="text-[10px] text-[#5a5650]">{timeAgo(thread.createdAt)}</span>
                  </div>
                </div>

                {/* Post preview */}
                <div className="relative mb-3">
                  <div className={`text-[12px] text-[#c8c4be] leading-relaxed bg-white/3 rounded-lg px-3 py-2.5 line-clamp-2 transition-all ${
                    spoiler && !revealed ? 'blur-sm select-none' : ''
                  }`}>
                    {thread.originalPost}
                  </div>
                  {spoiler && !revealed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setRevealedSpoilers([...revealedSpoilers, thread._id])
                        }}
                        className="text-[11px] text-yellow-400 bg-[#1a1815] border border-yellow-400/25 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-yellow-400/10 transition-all"
                      >
                        ⚠ Show spoiler
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <span className="text-[11px] text-[#9a9590] shrink-0">
                      <span className="text-[#D13924]">{thread.replies.length}</span> replies
                    </span>
                    <span className="text-[11px] text-[#9a9590] shrink-0">
                      <span className="text-[#D13924]">{thread.likes.length}</span> likes
                    </span>
                    <span className="text-[11px] text-[#9a9590] truncate hidden sm:block">
                      by @{thread.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isLoggedIn && !alreadyReported && !thread.hasSpoiler && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setReportedSpoilers([...reportedSpoilers, thread._id])
                        }}
                        className="text-[10px] text-yellow-400/70 hover:text-yellow-400 cursor-pointer transition-all px-2 py-1 rounded border border-transparent hover:border-yellow-400/20 hidden sm:block"
                      >
                        ⚠ Flag
                      </button>
                    )}
                    {alreadyReported && (
                      <span className="text-[10px] text-[#5a5650] hidden sm:inline">Flagged</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = isLoggedIn ? `/thread/${thread._id}` : '/register'
                      }}
                      className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-2.5 sm:px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer whitespace-nowrap"
                    >
                      {isLoggedIn ? 'Join ›' : 'Sign up ›'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Community
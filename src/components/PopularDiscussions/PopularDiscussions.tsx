import { useState, useEffect } from 'react'

type Thread = {
  _id: string
  show: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  originalPost: string
  replies: any[]
  likes: string[]
  hasSpoiler: boolean
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

function PopularDiscussions() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')

  useEffect(() => {
    fetch('http://localhost:3001/api/threads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data
            .sort((a, b) => b.replies.length - a.replies.length)
            .slice(0, 3)
          setThreads(sorted)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (threads.length === 0) return null

  return (
    <div className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">Popular discussions</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">What the community is talking about right now</p>
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
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#9a9590]">Discussion about</div>
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
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-[#9a9590]">
                    <span className="text-[#D13924]">{thread.replies.length}</span> replies
                  </span>
                  <span className="text-[11px] text-[#9a9590]">
                    <span className="text-[#D13924]">{thread.likes.length}</span> likes
                  </span>
                  <span className="text-[11px] text-[#9a9590]">by @{thread.username}</span>
                </div>

                {user ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/thread/${thread._id}`
                    }}
                    className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
                  >
                    Join thread ›
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = '/register'
                    }}
                    className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
                  >
                    Sign up to reply ›
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default PopularDiscussions
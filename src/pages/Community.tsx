import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type ThreadType = 'episode' | 'season' | 'show'
type SortType = 'mostActive' | 'newest' | 'mostLiked'

type Thread = {
  id: string
  show: string
  emoji: string
  threadTitle: string
  threadType: ThreadType
  season?: number
  episode?: number
  preview: string
  replies: number
  likes: number
  participants: number
  timeAgo: string
  hasSpoiler: boolean
  spoilerReports: number
  genre: string
}

const threads: Thread[] = [
  {
    id: '1',
    show: 'Frieren S2',
    emoji: '🌸',
    threadTitle: 'The writing in this show is on another level',
    threadType: 'show',
    preview: 'I\'ve watched a lot of anime but nothing hits quite like Frieren. The way it handles grief, time, and connection without ever being heavy handed is just masterful storytelling.',
    replies: 847,
    likes: 3200,
    participants: 412,
    timeAgo: '2h ago',
    hasSpoiler: false,
    spoilerReports: 0,
    genre: 'Fantasy',
  },
  {
    id: '2',
    show: 'Solo Leveling S3',
    emoji: '🌙',
    threadTitle: 'Ep 6 had the best animation of the entire season',
    threadType: 'episode',
    season: 3,
    episode: 6,
    preview: 'The fight sequence at the 14 minute mark is some of the best sakuga I\'ve seen in years. A-1 Pictures absolutely went all out for this one.',
    replies: 1203,
    likes: 5800,
    participants: 891,
    timeAgo: '4h ago',
    hasSpoiler: true,
    spoilerReports: 0,
    genre: 'Action',
  },
  {
    id: '3',
    show: 'Demon Slayer S5',
    emoji: '⛩',
    threadTitle: 'Is this the best season Ufotable has ever produced?',
    threadType: 'season',
    season: 5,
    preview: 'Every episode this season has been a visual masterpiece. The breathing technique animations have evolved so much from Season 1.',
    replies: 2104,
    likes: 8900,
    participants: 1247,
    timeAgo: '6h ago',
    hasSpoiler: false,
    spoilerReports: 2,
    genre: 'Action',
  },
  {
    id: '4',
    show: 'Vinland Saga S3',
    emoji: '⚔️',
    threadTitle: 'Thorfinn\'s character arc is one of the best in anime history',
    threadType: 'show',
    preview: 'From a revenge-driven child soldier to a man genuinely seeking peace — I can\'t think of another anime that handles character growth this realistically.',
    replies: 634,
    likes: 2900,
    participants: 318,
    timeAgo: '8h ago',
    hasSpoiler: false,
    spoilerReports: 0,
    genre: 'Drama',
  },
  {
    id: '5',
    show: 'JJK Season 3',
    emoji: '🔥',
    threadTitle: 'The Culling Game arc explained — no spoilers',
    threadType: 'season',
    season: 3,
    preview: 'For anyone confused about what\'s happening this season, here\'s a breakdown of the rules, the players, and what\'s at stake — written carefully with no spoilers for upcoming episodes.',
    replies: 423,
    likes: 1800,
    participants: 267,
    timeAgo: '12h ago',
    hasSpoiler: false,
    spoilerReports: 0,
    genre: 'Action',
  },
  {
    id: '6',
    show: 'Mushishi Returns',
    emoji: '🌿',
    threadTitle: 'Why Mushishi is the most underrated anime of all time',
    threadType: 'show',
    preview: 'Nobody talks about Mushishi enough. It\'s been decades and nothing has come close to the atmosphere, the storytelling, or the emotional impact of a single episode.',
    replies: 289,
    likes: 1400,
    participants: 156,
    timeAgo: '1d ago',
    hasSpoiler: false,
    spoilerReports: 0,
    genre: 'Mystery',
  },
]

const genres = ['All', 'Action', 'Fantasy', 'Drama', 'Mystery', 'Romance', 'Comedy', 'Horror']

function Community() {
  const [sortBy, setSortBy] = useState<SortType>('mostActive')
  const [threadFilter, setThreadFilter] = useState<ThreadType | 'all'>('all')
  const [genreFilter, setGenreFilter] = useState('All')
  const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([])
  const [reportedSpoilers, setReportedSpoilers] = useState<string[]>([])

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  const sortedAndFiltered = threads
    .filter((t) => threadFilter === 'all' || t.threadType === threadFilter)
    .filter((t) => genreFilter === 'All' || t.genre === genreFilter)
    .sort((a, b) => {
      if (sortBy === 'mostActive') return b.replies - a.replies
      if (sortBy === 'newest') return a.timeAgo.localeCompare(b.timeAgo)
      if (sortBy === 'mostLiked') return b.likes - a.likes
      return 0
    })

  const isSpoiler = (thread: Thread) =>
    thread.hasSpoiler || thread.spoilerReports >= 5 || reportedSpoilers.includes(thread.id)

  const isRevealed = (id: string) => revealedSpoilers.includes(id)

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Community</h1>
            <p className="text-[13px] text-[#9a9590]">What the anime community is talking about right now</p>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => window.location.href = '/community/new'}
              className="text-[13px] text-white font-medium px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
              style={{ backgroundColor: '#D13924' }}
            >
              + Start a thread
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1">
            {([
              { label: 'Most Active', value: 'mostActive' },
              { label: 'Newest', value: 'newest' },
              { label: 'Most Liked', value: 'mostLiked' },
            ] as { label: string; value: SortType }[]).map((s) => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all ${
                  sortBy === s.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={sortBy === s.value ? { backgroundColor: '#D13924' } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1">
            {([
              { label: 'All', value: 'all' },
              { label: 'Episode', value: 'episode' },
              { label: 'Season', value: 'season' },
              { label: 'Show', value: 'show' },
            ] as { label: string; value: ThreadType | 'all' }[]).map((t) => (
              <button
                key={t.value}
                onClick={() => setThreadFilter(t.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all ${
                  threadFilter === t.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={threadFilter === t.value ? { backgroundColor: '#D13924' } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 flex-wrap">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all ${
                  genreFilter === g ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={genreFilter === g ? { backgroundColor: '#D13924' } : {}}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Thread count */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[12px] text-[#9a9590]">{sortedAndFiltered.length} threads</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Threads */}
        <div className="flex flex-col gap-3">
          {sortedAndFiltered.map((thread) => {
            const spoiler = isSpoiler(thread)
            const revealed = isRevealed(thread.id)
            const alreadyReported = reportedSpoilers.includes(thread.id)

            return (
              <div
                key={thread.id}
                onClick={() => window.location.href = `/thread/${thread.id}`}
                className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-xl flex-shrink-0">{thread.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#9a9590] mb-0.5">
                      {thread.threadType === 'episode' && `${thread.show} — S${thread.season} Ep ${thread.episode}`}
                      {thread.threadType === 'season' && `${thread.show} — Season ${thread.season}`}
                      {thread.threadType === 'show' && thread.show}
                    </div>
                    <div className="text-[13px] font-medium text-[#f0ede8] truncate">{thread.threadTitle}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {spoiler && (
                      <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">
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
                      {thread.threadType === 'episode' ? 'Episode' : thread.threadType === 'season' ? 'Season' : 'Show'}
                    </span>
                    <span className="text-[10px] text-[#5a5650]">{thread.timeAgo}</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="relative mb-3">
                  <div className={`text-[12px] text-[#c8c4be] leading-relaxed bg-white/3 rounded-lg px-3 py-2.5 line-clamp-2 transition-all ${
                    spoiler && !revealed ? 'blur-sm select-none' : ''
                  }`}>
                    {thread.preview}
                  </div>
                  {spoiler && !revealed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setRevealedSpoilers([...revealedSpoilers, thread.id])
                        }}
                        className="text-[11px] text-yellow-400 bg-[#1a1815] border border-yellow-400/25 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-yellow-400/10 transition-all"
                      >
                        ⚠ Show spoiler
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-[#9a9590]">
                      <span className="text-[#D13924]">{thread.replies.toLocaleString()}</span> replies
                    </span>
                    <span className="text-[11px] text-[#9a9590]">
                      <span className="text-[#D13924]">{thread.likes.toLocaleString()}</span> likes
                    </span>
                    <span className="text-[11px] text-[#9a9590]">
                      {thread.participants.toLocaleString()} participants
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLoggedIn && !alreadyReported && !thread.hasSpoiler && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setReportedSpoilers([...reportedSpoilers, thread.id])
                        }}
                        className="text-[10px] text-yellow-400/70 hover:text-yellow-400 cursor-pointer transition-all px-2 py-1 rounded border border-transparent hover:border-yellow-400/20"
                      >
                        ⚠ Flag spoiler
                      </button>
                    )}
                    {alreadyReported && (
                      <span className="text-[10px] text-[#5a5650]">Spoiler flagged</span>
                    )}
                    {isLoggedIn ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/thread/${thread.id}`
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Community
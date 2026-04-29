import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type SortType = 'top' | 'new' | 'old'

type Reply = {
  id: string
  username: string
  initials: string
  color: string
  timeAgo: string
  content: string
  likes: number
  hasSpoiler: boolean
  isLiked: boolean
  replies?: Reply[]
}

type Thread = {
  id: string
  show: string
  emoji: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  hasSpoiler: boolean
  startedBy: string
  starterInitials: string
  starterColor: string
  timeAgo: string
  participants: number
  originalPost: string
  replies: Reply[]
}

const mockThread: Thread = {
  id: '1',
  show: 'Solo Leveling S3',
  emoji: '🌙',
  threadTitle: 'Ep 6 had the best animation of the entire season',
  threadType: 'episode',
  season: 3,
  episode: 6,
  hasSpoiler: true,
  startedBy: 'jordan_r',
  starterInitials: 'JR',
  starterColor: '#c4622d',
  timeAgo: '4h ago',
  participants: 891,
  originalPost: 'I\'ve been watching anime for over a decade and the fight sequence at the 14 minute mark in Episode 6 is some of the best sakuga I have ever seen. A-1 Pictures absolutely went all out for this one. The way they animated Sung Jin-Woo\'s shadow abilities evolving mid-fight — the fluidity, the weight, the impact of every movement — it felt like watching a movie. I had to rewatch it three times before I could continue. Anyone else completely floored by this episode?',
  replies: [
    {
      id: '1',
      username: 'mia_k',
      initials: 'MK',
      color: '#1D9E75',
      timeAgo: '3h ago',
      content: 'The 14 minute mark absolutely destroyed me. I genuinely paused and just sat there for a second. That\'s the kind of animation you remember years later.',
      likes: 847,
      hasSpoiler: false,
      isLiked: false,
      replies: [
        {
          id: '1a',
          username: 'dev_t',
          initials: 'DT',
          color: '#7F77DD',
          timeAgo: '2h ago',
          content: 'Same. I actually went back and watched the Season 1 opening fight just to compare. The growth is insane.',
          likes: 234,
          hasSpoiler: false,
          isLiked: false,
        }
      ]
    },
    {
      id: '2',
      username: 'alex_l',
      initials: 'AL',
      color: '#dcb43c',
      timeAgo: '3h ago',
      content: 'Unpopular opinion but I think the OST carried this scene just as much as the animation. That track that drops right when he unleashes — perfect.',
      likes: 612,
      hasSpoiler: false,
      isLiked: false,
    },
    {
      id: '3',
      username: 'frieren_fan',
      initials: 'FF',
      color: '#9B59B6',
      timeAgo: '2h ago',
      content: 'What happens at the end of the episode though completely changes everything going forward. I won\'t say more but wow.',
      likes: 389,
      hasSpoiler: true,
      isLiked: false,
    },
    {
      id: '4',
      username: 'shonen_king',
      initials: 'SK',
      color: '#E67E22',
      timeAgo: '1h ago',
      content: 'Objectively the best animated fight of 2026 so far. Nothing else comes close. A-1 was cooking.',
      likes: 521,
      hasSpoiler: false,
      isLiked: false,
    },
    {
      id: '5',
      username: 'slice_queen',
      initials: 'SQ',
      color: '#1ABC9C',
      timeAgo: '45m ago',
      content: 'For anyone who hasn\'t read the manhwa — you are completely unprepared for what\'s coming. Just enjoy the ride.',
      likes: 298,
      hasSpoiler: false,
      isLiked: false,
    },
  ]
}

function Thread() {
  const [sortBy, setSortBy] = useState<SortType>('top')
  const [replyText, setReplyText] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([])
  const [likedReplies, setLikedReplies] = useState<string[]>([])
  const [flaggedSpoilers, setFlaggedSpoilers] = useState<string[]>([])
  const [reportedReplies, setReportedReplies] = useState<string[]>([])
  const [showOriginal, setShowOriginal] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const parsedUser = user ? JSON.parse(user) : null
  const isLoggedIn = !!user

  const sortedReplies = [...mockThread.replies].sort((a, b) => {
    if (sortBy === 'top') return b.likes - a.likes
    if (sortBy === 'new') return a.timeAgo.localeCompare(b.timeAgo)
    if (sortBy === 'old') return b.timeAgo.localeCompare(a.timeAgo)
    return 0
  })

  const isRevealed = (id: string) => revealedSpoilers.includes(id)
  const isLiked = (id: string) => likedReplies.includes(id)
  const isFlagged = (id: string) => flaggedSpoilers.includes(id)
  const isReported = (id: string) => reportedReplies.includes(id)

  const toggleLike = (id: string) => {
    setLikedReplies(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const renderReply = (reply: Reply, isNested = false) => {
    const spoilerActive = reply.hasSpoiler && !isRevealed(reply.id)

    return (
      <div key={reply.id} className={`${isNested ? 'ml-10 border-l border-white/5 pl-4' : ''}`}>
        <div className="flex gap-3">

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${reply.color}35`, color: reply.color }}
          >
            {reply.initials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[12px] font-medium text-[#f0ede8]">@{reply.username}</span>
              <span className="text-[10px] text-[#5a5650]">{reply.timeAgo}</span>
              {reply.hasSpoiler && (
                <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">
                  ⚠ Spoiler
                </span>
              )}
              {isFlagged(reply.id) && !reply.hasSpoiler && (
                <span className="text-[9px] text-yellow-400/60 bg-yellow-400/5 border border-yellow-400/15 px-2 py-0.5 rounded-full">
                  Spoiler flagged
                </span>
              )}
              {isReported(reply.id) && (
                <span className="text-[9px] text-red-400/60 bg-red-400/5 border border-red-400/15 px-2 py-0.5 rounded-full">
                  Reported
                </span>
              )}
            </div>

            {/* Reply content — blur if spoiler */}
            <div className="relative mb-2">
              <p className={`text-[13px] text-[#c8c4be] leading-relaxed transition-all duration-200 ${
                spoilerActive ? 'blur-sm select-none pointer-events-none' : ''
              }`}>
                {reply.content}
              </p>
              {spoilerActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setRevealedSpoilers(prev => [...prev, reply.id])}
                    className="text-[11px] text-yellow-400 bg-[#1a1815] border border-yellow-400/25 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-yellow-400/10 transition-all"
                  >
                    ⚠ Show spoiler
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => toggleLike(reply.id)}
                className={`flex items-center gap-1.5 text-[11px] cursor-pointer transition-all ${
                  isLiked(reply.id) ? 'text-[#D13924]' : 'text-[#9a9590] hover:text-[#D13924]'
                }`}
              >
                ♥ {reply.likes + (isLiked(reply.id) ? 1 : 0)}
              </button>

              {isLoggedIn && (
                <button className="text-[11px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all">
                  Reply
                </button>
              )}

              {/* Flag spoiler — only show if not already marked as spoiler */}
              {isLoggedIn && !reply.hasSpoiler && !isFlagged(reply.id) && (
                <button
                  onClick={() => setFlaggedSpoilers(prev => [...prev, reply.id])}
                  className="text-[11px] text-[#9a9590]/60 hover:text-yellow-400 cursor-pointer transition-all"
                >
                  ⚠ Flag spoiler
                </button>
              )}

              {/* Report — only show if not already reported */}
              {isLoggedIn && !isReported(reply.id) && (
                <button
                  onClick={() => setReportedReplies(prev => [...prev, reply.id])}
                  className="text-[11px] text-[#9a9590]/60 hover:text-red-400 cursor-pointer transition-all"
                >
                  🚩 Report
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {reply.replies.map((r) => renderReply(r, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Thread header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xl">{mockThread.emoji}</span>
            <span className="text-[12px] text-[#9a9590]">{mockThread.show}</span>
            <span className="text-[#5a5650]">·</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
              mockThread.threadType === 'episode'
                ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                : mockThread.threadType === 'season'
                ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
                : 'bg-white/5 text-[#9a9590] border-white/10'
            }`}>
              {mockThread.threadType === 'episode'
                ? `S${mockThread.season} Ep ${mockThread.episode}`
                : mockThread.threadType === 'season'
                ? `Season ${mockThread.season}`
                : 'Show'}
            </span>
            {mockThread.hasSpoiler && (
              <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">
                ⚠ Spoiler thread
              </span>
            )}
          </div>

          <h1 className="text-2xl font-medium text-[#f0ede8] mb-3">{mockThread.threadTitle}</h1>

          <div className="flex items-center gap-3 text-[11px] text-[#9a9590] flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold"
                style={{ backgroundColor: `${mockThread.starterColor}35`, color: mockThread.starterColor }}
              >
                {mockThread.starterInitials}
              </div>
              <span>@{mockThread.startedBy}</span>
            </div>
            <span>·</span>
            <span>{mockThread.timeAgo}</span>
            <span>·</span>
            <span>{mockThread.participants.toLocaleString()} participants</span>
          </div>
        </div>

        {/* Original post */}
        <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: `${mockThread.starterColor}35`, color: mockThread.starterColor }}
              >
                {mockThread.starterInitials}
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#f0ede8]">@{mockThread.startedBy}</div>
                <div className="text-[10px] text-[#5a5650]">{mockThread.timeAgo}</div>
              </div>
            </div>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-[11px] text-[#9a9590] cursor-pointer hover:text-[#f0ede8] transition-all"
            >
              {showOriginal ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {showOriginal && (
            <p className="text-[13px] text-[#c8c4be] leading-relaxed">{mockThread.originalPost}</p>
          )}
        </div>

        {/* Sort + reply count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] text-[#9a9590]">
            <span className="text-[#f0ede8] font-medium">{mockThread.replies.length}</span> replies
          </span>
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1">
            {([
              { label: 'Top', value: 'top' },
              { label: 'New', value: 'new' },
              { label: 'Old', value: 'old' },
            ] as { label: string; value: SortType }[]).map((s) => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all ${
                  sortBy === s.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={sortBy === s.value ? { backgroundColor: '#D13924' } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Replies */}
        <div className="flex flex-col gap-5 mb-24">
          {sortedReplies.map((reply) => renderReply(reply))}
        </div>

        {/* Reply box */}
        {isLoggedIn ? (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0f0e0d]/95 backdrop-blur-md border-t border-white/8 px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1"
                  style={{ backgroundColor: '#D13924', color: '#fff' }}
                >
                  {parsedUser?.username?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    maxLength={500}
                    rows={2}
                    className="w-full bg-[#1a1815] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSpoiler}
                          onChange={(e) => setIsSpoiler(e.target.checked)}
                          className="accent-[#D13924] cursor-pointer"
                        />
                        <span className="text-[11px] text-[#9a9590]">Contains spoiler</span>
                      </label>
                      <span className="text-[10px] text-[#5a5650]">{replyText.length}/500</span>
                    </div>
                    <button
                      disabled={replyText.trim().length === 0}
                      className="text-[12px] text-white font-medium px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#D13924' }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0f0e0d]/95 backdrop-blur-md border-t border-white/8 px-6 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <p className="text-[13px] text-[#9a9590]">Join the conversation</p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="text-[12px] text-[#f0ede8] border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/5 transition-all"
                >
                  Sign in
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="text-[12px] text-white font-medium px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#D13924' }}
                >
                  Create account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Thread
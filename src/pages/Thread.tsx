import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav/Nav'

type SortType = 'top' | 'new' | 'old'

type Reply = {
  _id: string
  username: string
  content: string
  hasSpoiler: boolean
  likes: string[]
  spoilerFlags: string[]
  createdAt: string
  replies?: Reply[]
}

type Thread = {
  _id: string
  show: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  hasSpoiler: boolean
  username: string
  originalPost: string
  replies: Reply[]
  likes: string[]
  createdAt: string
}

const getInitials = (username: string) => username.slice(0, 2).toUpperCase()

const getColor = (username: string) => {
  const colors = ['#c4622d', '#1D9E75', '#7F77DD', '#dcb43c', '#9B59B6', '#E67E22']
  return colors[username.charCodeAt(0) % colors.length]
}

const timeAgo = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function Thread() {
  const { id } = useParams<{ id: string }>()
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('new')
  const [replyText, setReplyText] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [revealedSpoilers, setRevealedSpoilers] = useState<string[]>([])
  const [showOriginal, setShowOriginal] = useState(true)
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set())
  const [flaggedReplies, setFlaggedReplies] = useState<Set<string>>(new Set())
  const [reportedReplies, setReportedReplies] = useState<Set<string>>(new Set())
  const [threadLiked, setThreadLiked] = useState(false)
  const [threadLikeCount, setThreadLikeCount] = useState(0)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const parsedUser = user ? JSON.parse(user) : null
  const isLoggedIn = !!user

  useEffect(() => {
    if (!id) return
    fetch(`http://localhost:3001/api/threads/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setThread(data)
        setThreadLikeCount(data.likes?.length || 0)
        if (parsedUser) {
          setThreadLiked(data.likes?.includes(parsedUser.id) || false)
          if (data.replies) {
            const liked = new Set<string>(
              data.replies
                .filter((r: Reply) => r.likes.includes(parsedUser.id))
                .map((r: Reply) => r._id)
            )
            setLikedReplies(liked)
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const sortedReplies = thread ? [...thread.replies].sort((a, b) => {
    if (sortBy === 'top') return b.likes.length - a.likes.length
    if (sortBy === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'old') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return 0
  }) : []

  const handleThreadLike = async () => {
    if (!token || !id) return
    const alreadyLiked = threadLiked

    // Optimistic update
    setThreadLiked(!alreadyLiked)
    setThreadLikeCount(prev => alreadyLiked ? prev - 1 : prev + 1)

    try {
      await fetch(`http://localhost:3001/api/threads/${id}/like`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {
      // Revert on failure
      setThreadLiked(alreadyLiked)
      setThreadLikeCount(prev => alreadyLiked ? prev + 1 : prev - 1)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !token || !id) return
    setSubmitting(true)
    try {
      const response = await fetch(`http://localhost:3001/api/threads/${id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyText, hasSpoiler: isSpoiler }),
      })
      const updatedThread = await response.json()
      setThread(updatedThread)
      setReplyText('')
      setIsSpoiler(false)
    } catch (err) {
      console.error('Failed to post reply', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (replyId: string) => {
    if (!token || !id) return
    const alreadyLiked = likedReplies.has(replyId)

    setLikedReplies(prev => {
      const next = new Set(prev)
      alreadyLiked ? next.delete(replyId) : next.add(replyId)
      return next
    })
    setThread(prev => {
      if (!prev) return prev
      return {
        ...prev,
        replies: prev.replies.map(r =>
          r._id === replyId
            ? {
                ...r,
                likes: alreadyLiked
                  ? r.likes.filter(l => l !== parsedUser?.id)
                  : [...r.likes, parsedUser?.id]
              }
            : r
        )
      }
    })

    try {
      await fetch(`http://localhost:3001/api/threads/${id}/replies/${replyId}/like`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {
      setLikedReplies(prev => {
        const next = new Set(prev)
        alreadyLiked ? next.add(replyId) : next.delete(replyId)
        return next
      })
    }
  }

  const handleFlag = async (replyId: string) => {
    if (!token || !id || flaggedReplies.has(replyId)) return
    setFlaggedReplies(prev => new Set(prev).add(replyId))
    try {
      await fetch(`http://localhost:3001/api/threads/${id}/replies/${replyId}/flag`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
  }

  const handleReport = async (replyId: string) => {
    if (!token || !id || reportedReplies.has(replyId)) return
    setReportedReplies(prev => new Set(prev).add(replyId))
    try {
      await fetch(`http://localhost:3001/api/threads/${id}/replies/${replyId}/report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
  }

  const isRevealed = (replyId: string) => revealedSpoilers.includes(replyId)

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading thread...</p>
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm">Thread not found</p>
        </div>
      </div>
    )
  }

  const starterColor = getColor(thread.username)

  const renderReply = (reply: Reply, isNested = false) => {
    const spoilerActive = reply.hasSpoiler && !isRevealed(reply._id)
    const color = getColor(reply.username)
    const liked = likedReplies.has(reply._id)
    const flagged = flaggedReplies.has(reply._id)
    const reported = reportedReplies.has(reply._id)

    return (
      <div key={reply._id} className={`${isNested ? 'ml-10 border-l border-white/5 pl-4' : ''}`}>
        <div className="flex gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}35`, color }}
          >
            {getInitials(reply.username)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[12px] font-medium text-[#f0ede8]">@{reply.username}</span>
              <span className="text-[10px] text-[#5a5650]">{timeAgo(reply.createdAt)}</span>
              {reply.hasSpoiler && (
                <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">
                  ⚠ Spoiler
                </span>
              )}
            </div>

            <div className="relative mb-2">
              <p className={`text-[13px] text-[#c8c4be] leading-relaxed transition-all duration-200 ${
                spoilerActive ? 'blur-sm select-none pointer-events-none' : ''
              }`}>
                {reply.content}
              </p>
              {spoilerActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setRevealedSpoilers(prev => [...prev, reply._id])}
                    className="text-[11px] text-yellow-400 bg-[#1a1815] border border-yellow-400/25 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-yellow-400/10 transition-all"
                  >
                    ⚠ Show spoiler
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => isLoggedIn && handleLike(reply._id)}
                className={`flex items-center gap-1 text-[11px] transition-all ${
                  liked
                    ? 'text-[#D13924] cursor-pointer'
                    : isLoggedIn
                    ? 'text-[#9a9590] hover:text-[#D13924] cursor-pointer'
                    : 'text-[#9a9590] cursor-default'
                }`}
              >
                <span>{liked ? '♥' : '♡'}</span>
                <span>{reply.likes.length}</span>
              </button>

              {isLoggedIn && !reply.hasSpoiler && (
                <button
                  onClick={() => handleFlag(reply._id)}
                  className={`text-[11px] transition-all cursor-pointer ${
                    flagged
                      ? 'text-yellow-400'
                      : 'text-[#9a9590]/60 hover:text-yellow-400'
                  }`}
                >
                  {flagged ? '⚠ Flagged' : '⚠ Flag spoiler'}
                </button>
              )}

              {isLoggedIn && (
                <button
                  onClick={() => handleReport(reply._id)}
                  className={`text-[11px] transition-all cursor-pointer ${
                    reported
                      ? 'text-[#5a5650]'
                      : 'text-[#9a9590]/60 hover:text-red-400'
                  }`}
                >
                  {reported ? 'Reported' : '🚩 Report'}
                </button>
              )}
            </div>
          </div>
        </div>

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
            <span className="text-[12px] text-[#9a9590]">{thread.show}</span>
            <span className="text-[#5a5650]">·</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
              thread.threadType === 'episode'
                ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                : thread.threadType === 'season'
                ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
                : 'bg-white/5 text-[#9a9590] border-white/10'
            }`}>
              {thread.threadType === 'episode'
                ? `S${thread.season} Ep ${thread.episode}`
                : thread.threadType === 'season'
                ? `Season ${thread.season}`
                : 'Show'}
            </span>
            {thread.hasSpoiler && (
              <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">
                ⚠ Spoiler thread
              </span>
            )}
          </div>

          <h1 className="text-2xl font-medium text-[#f0ede8] mb-3">{thread.threadTitle}</h1>

          <div className="flex items-center gap-3 text-[11px] text-[#9a9590]">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold"
                style={{ backgroundColor: `${starterColor}35`, color: starterColor }}
              >
                {getInitials(thread.username)}
              </div>
              <span>@{thread.username}</span>
            </div>
            <span>·</span>
            <span>{timeAgo(thread.createdAt)}</span>
            <span>·</span>
            <span>{thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}</span>
            <span>·</span>
            <span>{threadLikeCount} {threadLikeCount === 1 ? 'like' : 'likes'}</span>
          </div>
        </div>

        {/* Original post */}
        <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: `${starterColor}35`, color: starterColor }}
              >
                {getInitials(thread.username)}
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#f0ede8]">@{thread.username}</div>
                <div className="text-[10px] text-[#5a5650]">{timeAgo(thread.createdAt)}</div>
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
            <p className="text-[13px] text-[#c8c4be] leading-relaxed mb-4">{thread.originalPost}</p>
          )}

          {/* Thread like button */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <button
              onClick={() => isLoggedIn && handleThreadLike()}
              className={`flex items-center gap-1.5 text-[12px] transition-all ${
                threadLiked
                  ? 'text-[#D13924] cursor-pointer'
                  : isLoggedIn
                  ? 'text-[#9a9590] hover:text-[#D13924] cursor-pointer'
                  : 'text-[#9a9590] cursor-default'
              }`}
            >
              <span>{threadLiked ? '♥' : '♡'}</span>
              <span>{threadLikeCount} {threadLikeCount === 1 ? 'like' : 'likes'}</span>
            </button>
          </div>
        </div>

        {/* Sort + reply count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] text-[#9a9590]">
            <span className="text-[#f0ede8] font-medium">{thread.replies.length}</span> replies
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
          {sortedReplies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9a9590] text-sm">No replies yet</p>
              <p className="text-[#5a5650] text-[12px] mt-1">Be the first to join the conversation</p>
            </div>
          ) : (
            sortedReplies.map((reply) => renderReply(reply))
          )}
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
                      onClick={handleReply}
                      disabled={replyText.trim().length === 0 || submitting}
                      className="text-[12px] text-white font-medium px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#D13924' }}
                    >
                      {submitting ? 'Posting...' : 'Reply'}
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
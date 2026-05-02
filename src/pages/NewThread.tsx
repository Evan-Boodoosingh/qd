import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav/Nav'

function NewThread() {
  const [searchParams] = useSearchParams()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [threadType, setThreadType] = useState<'episode' | 'season' | 'show'>(
    (searchParams.get('threadType') as any) || 'show'
  )
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const showId = searchParams.get('showId')
  const showName = searchParams.get('showName')
  const episode = searchParams.get('episode')

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError('Title and post body are required')
      return
    }
    if (!showId || !showName) {
      setError('No show selected')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          show: showName,
          showId: Number(showId),
          threadTitle: title,
          threadType,
          episode: episode ? Number(episode) : undefined,
          hasSpoiler,
          originalPost: body,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      window.location.href = `/thread/${data._id}`
    } catch (err: any) {
      setError(err.message || 'Failed to create thread')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Start a thread</h1>
          {showName && (
            <p className="text-[13px] text-[#9a9590]">
              About <span className="text-[#D13924]">{showName}</span>
              {episode && threadType === 'episode' && ` · Episode ${episode}`}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">

          {/* Thread type */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-3 block">Thread type</label>
            <div className="flex gap-1 bg-[#0f0e0d] border border-white/7 rounded-lg p-1 w-fit">
              {(['episode', 'season', 'show'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setThreadType(t)}
                  className={`px-4 py-1.5 rounded-md text-[12px] cursor-pointer transition-all capitalize ${
                    threadType === t ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                  }`}
                  style={threadType === t ? { backgroundColor: '#D13924' } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-2 block">Thread title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this thread about?"
              maxLength={150}
              className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
            />
            <div className="text-[10px] text-[#5a5650] mt-2 text-right">{title.length}/150</div>
          </div>

          {/* Body */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-2 block">Your post</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={2000}
              rows={6}
              className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] resize-none transition-all"
            />
            <div className="text-[10px] text-[#5a5650] mt-2 text-right">{body.length}/2000</div>
          </div>

          {/* Spoiler toggle */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpoiler}
                onChange={(e) => setHasSpoiler(e.target.checked)}
                className="accent-[#D13924] cursor-pointer w-4 h-4"
              />
              <div>
                <div className="text-[13px] text-[#f0ede8]">Contains spoilers</div>
                <div className="text-[11px] text-[#9a9590] mt-0.5">Your post will be blurred for users who haven't caught up</div>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-[13px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !body.trim()}
              className="text-[13px] text-white font-medium px-6 py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#D13924' }}
            >
              {submitting ? 'Posting...' : 'Post thread'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default NewThread
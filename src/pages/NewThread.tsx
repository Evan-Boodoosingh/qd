import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav/Nav'
import { toast } from '../components/Toast/toastService'

type SearchResult = {
  id: number
  title: string
  year: number | null
  genres: string[]
  episodes: number | null
}

function NewThread() {
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const isPreFilled = !!searchParams.get('showId')

  const [step, setStep] = useState<1 | 2 | 3>(isPreFilled ? 2 : 1)

  const [selectedShowId, setSelectedShowId] = useState<number | null>(
    searchParams.get('showId') ? Number(searchParams.get('showId')) : null
  )
  const [selectedShowName, setSelectedShowName] = useState(searchParams.get('showName') || '')
  const [selectedShowEpisodes, setSelectedShowEpisodes] = useState<number | null>(null)
  const [genres, setGenres] = useState<string[]>([])
  const [showSearch, setShowSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const [threadType, setThreadType] = useState<'episode' | 'season' | 'show'>(
    (searchParams.get('threadType') as 'episode' | 'season' | 'show') || 'show'
  )
  const [seasonNumber, setSeasonNumber] = useState('')
  const [episodeNumber, setEpisodeNumber] = useState(searchParams.get('episode') || '')

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedShowId) return
    fetch(`http://localhost:3001/api/anime/show/${selectedShowId}`)
      .then(res => res.json())
      .then(data => {
        if (data.genres) setGenres(data.genres)
        if (data.episodes) setSelectedShowEpisodes(data.episodes)
      })
      .catch(() => {})
  }, [selectedShowId])

  useEffect(() => {
    if (!showSearch.trim()) return
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`http://localhost:3001/api/anime/search?q=${encodeURIComponent(showSearch)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
        setShowDropdown(true)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [showSearch])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelectShow = (result: SearchResult) => {
    setSelectedShowId(result.id)
    setSelectedShowName(result.title)
    setGenres(result.genres)
    setSelectedShowEpisodes(result.episodes)
    setShowSearch('')
    setShowDropdown(false)
  }

  const handleStep1Continue = () => {
    if (!selectedShowId) { setError('Please select a show'); return }
    setError('')
    setStep(2)
  }

  const handleStep2Continue = () => {
    if (threadType === 'episode' && !episodeNumber) { setError('Please enter an episode number'); return }
    setError('')
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) { setError('Title and post body are required'); return }
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
          show: selectedShowName,
          showId: selectedShowId,
          genres,
          threadTitle: title,
          threadType,
          episode: threadType === 'episode' ? Number(episodeNumber) : undefined,
          season: threadType === 'episode' || threadType === 'season' ? Number(seasonNumber) || undefined : undefined,
          hasSpoiler,
          originalPost: body,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      toast.success('Thread posted')
      window.location.href = `/thread/${data._id}`
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create thread'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="max-w-xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Start a thread</h1>
          <p className="text-[13px] text-[#9a9590]">Share your thoughts with the community</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all ${
                step === s ? 'bg-[#D13924] text-white' : step > s ? 'bg-[#D13924]/30 text-[#D13924]' : 'bg-white/5 text-[#5a5650]'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-[11px] ${step === s ? 'text-[#f0ede8]' : 'text-[#5a5650]'}`}>
                {s === 1 ? 'Show' : s === 2 ? 'Type' : 'Post'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        {/* STEP 1 — Select show */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <label className="text-[13px] font-medium text-[#f0ede8] mb-1 block">Which show is this about?</label>
              <p className="text-[11px] text-[#9a9590] mb-4">Search for the anime you want to discuss</p>

              {selectedShowName ? (
                <div className="flex items-center justify-between bg-[#0f0e0d] border border-[#D13924]/40 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#f0ede8]">{selectedShowName}</div>
                    <div className="text-[11px] text-[#9a9590] mt-0.5">{genres.slice(0, 3).join(' · ')}</div>
                  </div>
                  <button
                    onClick={() => { setSelectedShowId(null); setSelectedShowName(''); setGenres([]); setSelectedShowEpisodes(null) }}
                    className="text-[11px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all ml-4 shrink-0"
                  >
                    ✕ Change
                  </button>
                </div>
              ) : (
                <div className="relative" ref={searchRef}>
                  <input
                    type="text"
                    value={showSearch}
                    onChange={(e) => setShowSearch(e.target.value)}
                    placeholder="Search anime..."
                    autoFocus
                    className="w-full bg-[#0f0e0d] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
                  />
                  {searching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 border border-[#D13924] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1815] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                      {searchResults.slice(0, 6).map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectShow(result)}
                          className="w-full px-4 py-3 hover:bg-white/5 transition-all cursor-pointer text-left border-b border-white/5 last:border-0"
                        >
                          <div className="text-[13px] text-[#f0ede8]">{result.title}</div>
                          <div className="text-[11px] text-[#9a9590] mt-0.5">
                            {result.year && `${result.year} · `}{result.genres.slice(0, 2).join(', ')}
                            {result.episodes && ` · ${result.episodes} eps`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-[12px] text-red-400 px-1">{error}</p>}

            <button
              onClick={handleStep1Continue}
              disabled={!selectedShowId}
              className="w-full py-3 rounded-xl text-[13px] font-medium text-white cursor-pointer hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#D13924' }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Thread type */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <div className="mb-4">
                <span className="text-[11px] text-[#D13924]">{selectedShowName}</span>
              </div>
              <label className="text-[13px] font-medium text-[#f0ede8] mb-1 block">What kind of thread is this?</label>
              <p className="text-[11px] text-[#9a9590] mb-5">Pick a type and fill in the details</p>

              <div className="flex flex-col gap-3">

                {/* Episode */}
                <div
                  onClick={() => setThreadType('episode')}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    threadType === 'episode' ? 'border-[#D13924] bg-[#D13924]/05' : 'border-white/7 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      threadType === 'episode' ? 'border-[#D13924]' : 'border-white/20'
                    }`}>
                      {threadType === 'episode' && <div className="w-2 h-2 rounded-full bg-[#D13924]" />}
                    </div>
                    <span className="text-[13px] font-medium text-[#f0ede8]">Episode</span>
                  </div>
                  <p className="text-[11px] text-[#9a9590] ml-7 mb-3">Discuss a specific episode</p>

                  {threadType === 'episode' && (
                    <div className="flex gap-3 ml-7" onClick={(e) => e.stopPropagation()}>
                      <div className="flex-1">
                        <label className="text-[11px] text-[#9a9590] mb-1.5 block">Season # <span className="text-[#5a5650]">(optional)</span></label>
                        <input
                          autoFocus
                          type="number"
                          min={1}
                          value={seasonNumber}
                          onChange={(e) => setSeasonNumber(e.target.value)}
                          placeholder="1"
                          className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] text-[#9a9590] mb-1.5 block">
                          Episode #{selectedShowEpisodes && <span className="text-[#5a5650] ml-1">max {selectedShowEpisodes}</span>}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={selectedShowEpisodes || undefined}
                          value={episodeNumber}
                          onChange={(e) => setEpisodeNumber(e.target.value)}
                          placeholder="12"
                          className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Season */}
                <div
                  onClick={() => setThreadType('season')}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    threadType === 'season' ? 'border-[#D13924] bg-[#D13924]/05' : 'border-white/7 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      threadType === 'season' ? 'border-[#D13924]' : 'border-white/20'
                    }`}>
                      {threadType === 'season' && <div className="w-2 h-2 rounded-full bg-[#D13924]" />}
                    </div>
                    <span className="text-[13px] font-medium text-[#f0ede8]">Season</span>
                  </div>
                  <p className="text-[11px] text-[#9a9590] ml-7 mb-3">Discuss an entire season</p>

                  {threadType === 'season' && (
                    <div className="ml-7" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[11px] text-[#9a9590] mb-1.5 block">Season # <span className="text-[#5a5650]">(optional)</span></label>
                      <input
                        autoFocus
                        type="number"
                        min={1}
                        value={seasonNumber}
                        onChange={(e) => setSeasonNumber(e.target.value)}
                        placeholder="1"
                        className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Show */}
                <div
                  onClick={() => setThreadType('show')}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    threadType === 'show' ? 'border-[#D13924] bg-[#D13924]/05' : 'border-white/7 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      threadType === 'show' ? 'border-[#D13924]' : 'border-white/20'
                    }`}>
                      {threadType === 'show' && <div className="w-2 h-2 rounded-full bg-[#D13924]" />}
                    </div>
                    <span className="text-[13px] font-medium text-[#f0ede8]">Show</span>
                  </div>
                  <p className="text-[11px] text-[#9a9590] ml-7">General discussion about the show</p>
                </div>

              </div>
            </div>

            {error && <p className="text-[12px] text-red-400 px-1">{error}</p>}

            <div className="flex gap-3">
              {!isPreFilled && (
                <button
                  onClick={() => { setStep(1); setError('') }}
                  className="flex-1 py-3 rounded-xl text-[13px] text-[#9a9590] border border-white/10 hover:bg-white/5 cursor-pointer transition-all"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleStep2Continue}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium text-white cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: '#D13924' }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Write the post */}
        {step === 3 && (
          <div className="flex flex-col gap-4">

            {/* Summary */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#D13924]">{selectedShowName}</span>
                <span className="text-[11px] text-[#5a5650] mx-2">·</span>
                <span className="text-[11px] text-[#9a9590] capitalize">
                  {threadType === 'episode'
                    ? `${seasonNumber ? `S${seasonNumber} ` : ''}Ep ${episodeNumber}`
                    : threadType === 'season'
                    ? seasonNumber ? `Season ${seasonNumber}` : 'Season'
                    : 'Show'}
                </span>
              </div>
              <button
                onClick={() => { setStep(2); setError('') }}
                className="text-[11px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all shrink-0"
              >
                Edit
              </button>
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
                autoFocus
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

            {/* Spoiler */}
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

            {error && <p className="text-[12px] text-red-400 px-1">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(2); setError('') }}
                className="flex-1 py-3 rounded-xl text-[13px] text-[#9a9590] border border-white/10 hover:bg-white/5 cursor-pointer transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !body.trim()}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium text-white cursor-pointer hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#D13924' }}
              >
                {submitting ? 'Posting...' : 'Post thread'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default NewThread
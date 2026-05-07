import { useState, useEffect, useRef } from 'react'
import Nav from '../components/Nav/Nav'
import { proxyImage } from '../services/anime'
import { fetchWatchlist, updateWatchlistEntry, removeFromWatchlist } from '../services/watchlist'
import { toast } from '../components/Toast/toastService'

type WatchStatus = 'watching' | 'planToWatch' | 'completed' | 'dropped'

type WatchlistEntry = {
  _id: string
  showId: number
  showName: string
  image: string | null
  status: WatchStatus
  currentEpisode: number
  totalEpisodes: number | null
  airingEpisode: number | null
  rating: number | null
  genres: string[]
}

const tabs: { label: string; value: WatchStatus }[] = [
  { label: 'Watching', value: 'watching' },
  { label: 'Plan to Watch', value: 'planToWatch' },
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped', value: 'dropped' },
]

const statusLabels: Record<WatchStatus, string> = {
  watching: 'Watching',
  planToWatch: 'Plan to Watch',
  completed: 'Completed',
  dropped: 'Dropped',
}

const emptyMessages: Record<WatchStatus, { heading: string; sub: string }> = {
  watching: { heading: "You're not watching anything right now.", sub: "Browse the schedule and add something to your list." },
  planToWatch: { heading: "Nothing queued up yet.", sub: "Find something on the schedule and add it to your queue." },
  completed: { heading: "No completed shows yet.", sub: "Finish a show and it'll appear here." },
  dropped: { heading: "Nothing dropped.", sub: "Hopefully it stays that way." },
}

function MyList() {
  const [activeTab, setActiveTab] = useState<WatchStatus>('watching')
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openRating, setOpenRating] = useState<string | null>(null)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWatchlist()
        setWatchlist(data)
      } catch (err) {
        console.error('Failed to load watchlist:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredShows = watchlist.filter((e) => e.status === activeTab)

  const handleStatusChange = async (showId: number, newStatus: WatchStatus, totalEpisodes: number | null) => {
    const updates: { status: WatchStatus; currentEpisode?: number } = { status: newStatus }
    if (newStatus === 'completed' && totalEpisodes) {
      updates.currentEpisode = totalEpisodes
    }
    setWatchlist(prev => prev.map(e => e.showId === showId ? { ...e, ...updates } : e))
    setOpenDropdown(null)
    try {
      await updateWatchlistEntry(showId, updates)
      toast.success(`Marked as ${statusLabels[newStatus]}`)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update status')
    }
  }

  const handleEpisodeChange = (showId: number, delta: number, current: number, total: number | null, airing: number | null) => {
    const cap = airing ?? total ?? Infinity
    const next = Math.max(0, Math.min(current + delta, cap))
    setWatchlist(prev => prev.map(e => e.showId === showId ? { ...e, currentEpisode: next } : e))
    if (debounceTimers.current[showId]) clearTimeout(debounceTimers.current[showId])
    debounceTimers.current[showId] = setTimeout(async () => {
      try {
        await updateWatchlistEntry(showId, { currentEpisode: next })
      } catch (err) {
        console.error('Failed to update episode:', err)
      }
    }, 600)
  }

  const handleRating = async (showId: number, rating: number) => {
    setWatchlist(prev => prev.map(e => e.showId === showId ? { ...e, rating } : e))
    setOpenRating(null)
    try {
      await updateWatchlistEntry(showId, { rating })
      toast.success(`Rated ${rating}/10`)
    } catch (err) {
      console.error('Failed to save rating:', err)
      toast.error('Failed to save rating')
    }
  }

  const handleRemove = async (showId: number) => {
    try {
      await removeFromWatchlist(showId)
      setWatchlist(prev => prev.filter(e => e.showId !== showId))
      setConfirmDelete(null)
      toast.success('Removed from list')
    } catch (err) {
      console.error('Failed to remove show:', err)
      toast.error('Failed to remove show')
    }
  }

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="px-6 py-8 max-w-5xl mx-auto flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1815] border border-white/7 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-[#0f0e0d] min-h-screen text-white"
      onClick={() => { setOpenDropdown(null); setOpenRating(null) }}
    >
      <Nav />

      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">My List</h1>
          <p className="text-[13px] text-[#9a9590]">
            {watchlist.length} {watchlist.length === 1 ? 'show' : 'shows'} total
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((tab) => {
            const count = watchlist.filter(e => e.status === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === tab.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={activeTab === tab.value ? { backgroundColor: '#D13924' } : {}}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Empty state */}
        {filteredShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#9a9590] text-sm mb-2">{emptyMessages[activeTab].heading}</p>
            <p className="text-[#5a5650] text-[12px]">{emptyMessages[activeTab].sub}</p>
          </div>
        )}

        {/* Column headers */}
        {filteredShows.length > 0 && (
          <>
         <div className="grid items-center gap-4 px-4 mb-2"
  style={{ gridTemplateColumns: '56px 1fr 160px 160px 100px 32px' }}
>
  <div />
  <div className="text-[10px] text-[#5a5650] uppercase tracking-wider">Title</div>
  <div className="text-[10px] text-[#5a5650] uppercase tracking-wider pl-3">Status</div>
  <div className="text-[10px] text-[#5a5650] uppercase tracking-wider text-center">Progress</div>
  <div className="text-[10px] text-[#5a5650] uppercase tracking-wider text-center">Score</div>
  <div />
</div>

            <div className="flex flex-col gap-2">
              {filteredShows.map((show) => (
                <div
                  key={show._id}
                  className="bg-[#1a1815] border border-white/7 rounded-xl hover:border-white/15 transition-all group"
                >
                  <div
                    className="grid items-center gap-4 px-4 py-3"
                    style={{ gridTemplateColumns: '56px 1fr 180px 160px 100px 32px' }}
                  >

                    {/* Poster */}
                    <div
                      onClick={() => window.location.href = `/show/${show.showId}`}
                      className="w-14 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-all"
                    >
                      {show.image ? (
                        <img
                          src={proxyImage(show.image)}
                          alt={show.showName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-[#5a5650] text-[9px]">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Title + genres */}
                    <div
                      onClick={() => window.location.href = `/show/${show.showId}`}
                      className="min-w-0 cursor-pointer"
                    >
                      <div className="text-[13px] font-medium text-[#f0ede8] truncate mb-1 hover:text-[#D13924] transition-all">
                        {show.showName}
                      </div>
                      <div className="text-[11px] text-[#5a5650] truncate">
                        {show.genres.slice(0, 2).join(' · ') || 'Anime'}
                      </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="relative" style={{ zIndex: openDropdown === show._id ? 30 : 1 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenDropdown(openDropdown === show._id ? null : show._id)
                          setOpenRating(null)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[12px] text-[#f0ede8] hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <span>{statusLabels[show.status]}</span>
                        <span className="text-[#5a5650] ml-2 text-[10px]">▾</span>
                      </button>

                      {openDropdown === show._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 right-0 mt-1 bg-[#1a1815] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                          style={{ zIndex: 50 }}
                        >
                          {tabs.map((tab) => (
                            <button
                              key={tab.value}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(show.showId, tab.value, show.totalEpisodes)
                              }}
                              className={`w-full text-left px-3 py-2.5 text-[12px] transition-all cursor-pointer ${
                                show.status === tab.value
                                  ? 'text-white bg-[#D13924]'
                                  : 'text-[#9a9590] hover:text-[#f0ede8] hover:bg-white/5'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div>
                      {(show.status === 'watching' || show.status === 'completed') ? (
                    <div className="flex items-center gap-2 justify-center">
                          {show.status === 'watching' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEpisodeChange(show.showId, -1, show.currentEpisode, show.totalEpisodes, show.airingEpisode)
                              }}
                              className="text-[#5a5650] hover:text-[#f0ede8] transition-all cursor-pointer text-[16px] leading-none w-5 text-center"
                            >
                              −
                            </button>
                          )}
                          <span className="text-[12px] text-[#f0ede8] tabular-nums">
                            {show.currentEpisode}
                            <span className="text-[#5a5650]"> / {show.airingEpisode ?? show.totalEpisodes ?? '?'}</span>
                          </span>
                          {show.status === 'watching' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEpisodeChange(show.showId, 1, show.currentEpisode, show.totalEpisodes, show.airingEpisode)
                              }}
                              className="text-[#5a5650] hover:text-[#f0ede8] transition-all cursor-pointer text-[16px] leading-none w-5 text-center"
                            >
                              +
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#5a5650] text-center w-full block">—</span>
                      )}
                    </div>

                    {/* Score */}
                    <div className="relative" style={{ zIndex: openRating === show._id ? 30 : 1 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenRating(openRating === show._id ? null : show._id)
                          setOpenDropdown(null)
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer w-full"
                      >
                        <span className={`text-[12px] font-medium ${show.rating ? 'text-[#f0ede8]' : 'text-[#5a5650]'}`}>
                          {show.rating ? show.rating : '—'}
                        </span>
                        {show.rating && <span className="text-[10px] text-[#5a5650]">/10</span>}
                      </button>

                      {openRating === show._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 mt-1 bg-[#1a1815] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                          style={{ zIndex: 50, minWidth: '80px' }}
                        >
                          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                            <button
                              key={n}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRating(show.showId, n)
                              }}
                              className={`w-full text-left px-3 py-2 text-[12px] transition-all cursor-pointer ${
                                show.rating === n
                                  ? 'text-white bg-[#D13924]'
                                  : 'text-[#9a9590] hover:text-[#f0ede8] hover:bg-white/5'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                          {show.rating && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRating(show.showId, 0)
                              }}
                              className="w-full text-left px-3 py-2 text-[11px] text-[#5a5650] hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer border-t border-white/5"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(show._id)
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#5a5650] hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1815] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-[15px] font-medium text-[#f0ede8] mb-2">Remove from list?</h3>
            <p className="text-[13px] text-[#9a9590] mb-6">
              This will delete your progress and rating for this show.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-full text-[13px] text-[#f0ede8] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const entry = watchlist.find(e => e._id === confirmDelete)
                  if (entry) handleRemove(entry.showId)
                }}
                className="flex-1 py-2.5 rounded-full text-[13px] text-white hover:opacity-90 transition-all cursor-pointer"
                style={{ backgroundColor: '#D13924' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyList
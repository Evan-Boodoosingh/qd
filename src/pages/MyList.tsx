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
  setWatchlist(prev =>
    prev.map(e => e.showId === showId ? { ...e, ...updates } : e)
  )
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
    setWatchlist(prev =>
      prev.map(e => e.showId === showId ? { ...e, currentEpisode: next } : e)
    )
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
  setWatchlist(prev =>
    prev.map(e => e.showId === showId ? { ...e, rating } : e)
  )
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

  const getProgressPercent = (show: WatchlistEntry) => {
    const ceiling = show.airingEpisode ?? show.totalEpisodes
    if (!ceiling) return 0
    return Math.min((show.currentEpisode / ceiling) * 100, 100)
  }

  const getEpisodesLeft = (show: WatchlistEntry) => {
    const ceiling = show.airingEpisode ?? show.totalEpisodes
    if (!ceiling) return null
    return ceiling - show.currentEpisode
  }

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="px-6 py-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden animate-pulse">
                <div className="h-[120px] bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-[#0f0e0d] min-h-screen text-white"
      onClick={() => setOpenDropdown(null)}
    >
      <Nav />

      <div className="px-6 py-8 max-w-6xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">My List</h1>
          <p className="text-[13px] text-[#9a9590]">
            {watchlist.length} {watchlist.length === 1 ? 'show' : 'shows'} total
          </p>
        </div>

        <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 mb-8 w-fit">
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

        {filteredShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#9a9590] text-sm mb-2">{emptyMessages[activeTab].heading}</p>
            <p className="text-[#5a5650] text-[12px]">{emptyMessages[activeTab].sub}</p>
          </div>
        )}

        {filteredShows.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filteredShows.map((show) => (
              <div
                key={show._id}
                onClick={() => window.location.href = `/show/${show.showId}`}
                className="bg-[#1a1815] border border-white/7 rounded-xl hover:border-[#D13924]/30 transition-all cursor-pointer relative"
              >
                {/* Image — rounded top corners, overflow hidden only on image */}
                <div className="h-[120px] bg-[#0f0e0d] overflow-hidden rounded-t-xl">
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

                <div className="p-4">
                  <div className="text-[13px] font-medium text-[#f0ede8] mb-1 truncate">{show.showName}</div>
                  <div className="text-[11px] text-[#9a9590] mb-3">
                    {show.genres.slice(0, 2).join(' · ') || 'Anime'}
                  </div>

                  {/* Status dropdown */}
                  <div className="relative mb-3" style={{ zIndex: openDropdown === show._id ? 30 : 1 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDropdown(openDropdown === show._id ? null : show._id)
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-[#f0ede8] hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <span>{statusLabels[show.status]}</span>
                      <span className="text-[#9a9590]">▾</span>
                    </button>

                    {openDropdown === show._id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 right-0 mt-1 bg-[#1a1815] border border-white/10 rounded-lg overflow-hidden shadow-xl"
                        style={{ zIndex: 50 }}
                      >
                        {tabs.map((tab) => (
                          <button
                            key={tab.value}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(show.showId, tab.value, show.totalEpisodes)
                            }}
                            className={`w-full text-left px-3 py-2 text-[11px] transition-all cursor-pointer ${
                              show.status === tab.value
                                ? 'text-white'
                                : 'text-[#9a9590] hover:text-[#f0ede8] hover:bg-white/5'
                            }`}
                            style={show.status === tab.value ? { backgroundColor: '#D13924' } : {}}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Episode progress */}
                  {(show.status === 'watching' || show.status === 'completed') && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-[#9a9590]">Progress</span>
                        <span className="text-[10px] text-[#f0ede8]">
                          {show.currentEpisode} / {show.airingEpisode ?? show.totalEpisodes ?? '?'}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${getProgressPercent(show)}%`,
                            backgroundColor: '#D13924'
                          }}
                        />
                      </div>

                      {show.status === 'watching' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEpisodeChange(show.showId, -1, show.currentEpisode, show.totalEpisodes, show.airingEpisode)
                            }}
                            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9a9590] hover:text-white hover:bg-white/10 transition-all text-xs cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-[10px] text-[#9a9590] flex-1 text-center">
                            Ep {show.currentEpisode}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEpisodeChange(show.showId, 1, show.currentEpisode, show.totalEpisodes, show.airingEpisode)
                            }}
                            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9a9590] hover:text-white hover:bg-white/10 transition-all text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rating */}
                  {(show.status === 'completed' || show.status === 'dropped') && (
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <div
                          key={n}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRating(show.showId, n)
                          }}
                          className="w-4 h-1.5 rounded-full cursor-pointer transition-all hover:opacity-80"
                          style={{
                            backgroundColor: show.rating && n <= show.rating
                              ? '#D13924'
                              : 'rgba(255,255,255,0.1)'
                          }}
                        />
                      ))}
                      <span className="text-[10px] text-[#9a9590] ml-1">
                        {show.rating ? `${show.rating}/10` : 'Rate'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9a9590]">
                      {show.status === 'watching' && getEpisodesLeft(show) !== null
                        ? `${getEpisodesLeft(show)} ep left`
                        : show.genres[0] || ''}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDelete(show._id)
                      }}
                      className="text-[10px] text-[#5a5650] hover:text-red-400 transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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